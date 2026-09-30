import {
  describe, expect, it, vi,
} from "vitest";

vi.mock("@openimis/fe-core", async () => vi.importActual("@openimis/fe-core/helpers/api"));

const { default: reducer } = await import("./reducer");
const { graphqlErrors, relayPage, serverError } = await import("@openimis/fe-core/testing");

const initial = () => reducer(undefined, { type: "@@INIT" });
const dispatch = (state, type, { payload, meta } = {}) => reducer(state, { type, payload, meta });
const respond = (state, type, data, meta) => dispatch(state, type, { payload: { data }, meta });

const SERVER_ERROR = { code: 500, message: "Internal Server Error", detail: "boom" };
const DATA_ERROR = { code: "Data error", message: "Server returned data error status", detail: "bad filter" };

describe("contribution reducer", () => {
  describe("initialisation", () => {
    it("starts with nothing loaded and nothing in flight", () => {
      const state = initial();

      expect(state.submittingMutation).toBe(false);
      expect(state.contributions).toEqual([]);
      expect(state.policiesPremiums).toBeNull();
      expect(state.contribution).toBeNull();
      expect(state.policySummary).toBeNull();
      expect(state.premium).toBeNull();
    });

    it("returns the same state object for an unrelated action", () => {
      const state = initial();

      expect(reducer(state, { type: "SOMETHING_ELSE" })).toBe(state);
    });
  });

  describe("pages", () => {
    const PAGES = [
      ["policies premiums", "CONTRIBUTION_POLICES_PREMIUMS", "premiumsByPolicies", "PoliciesPremiums",
        "policiesPremiums"],
      ["contributions", "CONTRIBUTION_CONTRIBUTIONS", "premiums", "Contributions", "contributions"],
    ];

    it.each(PAGES)("empties the %s and marks them in flight when a search starts", (
      _label,
      prefix,
      _entity,
      suffix,
      field,
    ) => {
      const stale = {
        ...initial(),
        [field]: [{ id: "stale" }],
        [`${field}PageInfo`]: { totalCount: 3 },
        [`error${suffix}`]: SERVER_ERROR,
      };
      const state = dispatch(stale, `${prefix}_REQ`);

      expect(state[`fetching${suffix}`]).toBe(true);
      expect(state[`fetched${suffix}`]).toBe(false);
      expect(state[field]).toBeNull();
      expect(state[`${field}PageInfo`]).toEqual({ totalCount: 0 });
      expect(state[`error${suffix}`]).toBeNull();
    });

    it.each(PAGES)("stores the %s page and its counts", (_label, prefix, entity, suffix, field) => {
      const state = respond(dispatch(initial(), `${prefix}_REQ`), `${prefix}_RESP`, {
        [entity]: relayPage([{ id: "p1", amount: "10.00" }, { id: "p2", amount: "5.50" }], {
          totalCount: 7,
          pageInfo: { hasNextPage: true },
        }),
      });

      expect(state[`fetching${suffix}`]).toBe(false);
      expect(state[`fetched${suffix}`]).toBe(true);
      expect(state[field]).toEqual([{ id: "p1", amount: "10.00" }, { id: "p2", amount: "5.50" }]);
      expect(state[`${field}PageInfo`]).toMatchObject({ totalCount: 7, hasNextPage: true });
      expect(state[`error${suffix}`]).toBeNull();
    });

    it.each(PAGES)("reports GraphQL errors returned alongside the %s", (_label, prefix, entity, suffix) => {
      const state = dispatch(initial(), `${prefix}_RESP`, {
        payload: { data: { [entity]: relayPage([]) }, ...graphqlErrors("bad filter") },
      });

      expect(state[`error${suffix}`]).toEqual(DATA_ERROR);
    });

    it.each(PAGES)("stops fetching and formats the server error when the %s search fails", (
      _label,
      prefix,
      _entity,
      suffix,
    ) => {
      const state = dispatch(dispatch(initial(), `${prefix}_REQ`), `${prefix}_ERR`, {
        payload: serverError(500, "Internal Server Error", "boom"),
      });

      expect(state[`fetching${suffix}`]).toBe(false);
      expect(state[`error${suffix}`]).toEqual(SERVER_ERROR);
    });

    it("forgets the selected premium when the policies premiums are searched again", () => {
      const selected = { ...initial(), premium: { id: "p1" } };

      expect(dispatch(selected, "CONTRIBUTION_POLICES_PREMIUMS_REQ").premium).toBeNull();
    });
  });

  describe("resets driven by other modules", () => {
    it.each([
      ["INSUREE_FAMILY_OVERVIEW_REQ"],
      ["POLICY_INSUREE_POLICIES_REQ"],
      ["POLICY_FAMILY_POLICIES_REQ"],
    ])("drops the premiums of the previous family or policy on %s", (type) => {
      const stale = {
        ...initial(),
        policiesPremiums: [{ id: "p1" }],
        policiesPremiumsPageInfo: { totalCount: 1 },
        errorPoliciesPremiums: SERVER_ERROR,
        premium: { id: "p1" },
      };
      const state = dispatch(stale, type);

      expect(state.policiesPremiums).toBeNull();
      expect(state.policiesPremiumsPageInfo).toEqual({ totalCount: 0 });
      expect(state.errorPoliciesPremiums).toBeNull();
      expect(state.premium).toBeNull();
    });

    it("also clears the fetched flag when a new family is opened", () => {
      const stale = { ...initial(), fetchedPoliciesPremiums: true };

      expect(dispatch(stale, "INSUREE_FAMILY_OVERVIEW_REQ").fetchedPoliciesPremiums).toBe(false);
    });
  });

  it("remembers the premium the user selected", () => {
    const premium = { id: "p1", amount: "10.00" };

    expect(dispatch(initial(), "CONTRIBUTION_PREMIUM", { payload: premium }).premium).toBe(premium);
  });

  describe("single records", () => {
    const SINGLES = [
      ["policy summary", "CONTRIBUTION_POLICY_SUMMARY", "policies", "PolicySummary", "policySummary"],
      ["contribution", "CONTRIBUTION_OVERVIEW", "premiums", "Contribution", "contribution"],
    ];

    it.each(SINGLES)("clears the %s and marks it in flight when it is requested", (
      _label,
      prefix,
      _entity,
      suffix,
      field,
    ) => {
      const stale = { ...initial(), [field]: { id: "stale" }, [`error${suffix}`]: SERVER_ERROR };
      const state = dispatch(stale, `${prefix}_REQ`);

      expect(state[`fetching${suffix}`]).toBe(true);
      expect(state[`fetched${suffix}`]).toBe(false);
      expect(state[field]).toBeNull();
      expect(state[`error${suffix}`]).toBeNull();
    });

    it.each(SINGLES)("keeps the first row of the %s response", (_label, prefix, entity, suffix, field) => {
      const state = respond(initial(), `${prefix}_RESP`, {
        [entity]: relayPage([{ id: "first", value: "100.00" }, { id: "second" }]),
      });

      expect(state[field]).toEqual({ id: "first", value: "100.00" });
      expect(state[`fetching${suffix}`]).toBe(false);
      expect(state[`fetched${suffix}`]).toBe(true);
      expect(state[`error${suffix}`]).toBeNull();
    });

    it.each(SINGLES)("leaves the %s empty when nothing matched", (_label, prefix, entity, _suffix, field) => {
      expect(respond(initial(), `${prefix}_RESP`, { [entity]: relayPage([]) })[field]).toBeNull();
      expect(respond(initial(), `${prefix}_RESP`, { [entity]: null })[field]).toBeNull();
    });

    it.each(SINGLES)("stops fetching and formats the server error when the %s fails", (
      _label,
      prefix,
      _entity,
      suffix,
    ) => {
      const state = dispatch(dispatch(initial(), `${prefix}_REQ`), `${prefix}_ERR`, {
        payload: serverError(500, "Internal Server Error", "boom"),
      });

      expect(state[`fetching${suffix}`]).toBe(false);
      expect(state[`error${suffix}`]).toEqual(SERVER_ERROR);
    });

    it("drops the loaded contribution when a new one is started", () => {
      const loaded = { ...initial(), contribution: { id: "c1" }, contributionsPageInfo: { totalCount: 4 } };
      const state = dispatch(loaded, "CONTRIBUTION_NEW");

      expect(state.contribution).toBeNull();
      expect(state.contributionsPageInfo).toEqual({ totalCount: 0 });
    });

    it("forgets the loaded contribution entirely when the page is left", () => {
      const loaded = {
        ...initial(),
        contribution: { id: "c1" },
        fetchingContribution: true,
        fetchedContribution: true,
        errorContribution: SERVER_ERROR,
      };

      expect(dispatch(loaded, "CONTRIBUTION_OVERVIEW_CLEAR")).toMatchObject({
        contribution: null,
        fetchingContribution: false,
        fetchedContribution: false,
        errorContribution: null,
      });
    });
  });

  describe("receipt validation", () => {
    const receipt = (state) => state.validationFields.contributionReceipt;

    it("marks the receipt as being checked when validation starts", () => {
      expect(receipt(dispatch(initial(), "CONTRIBUTION_FIELDS_VALIDATION_REQ"))).toEqual({
        isValidating: true,
        isValid: false,
        validationError: null,
      });
    });

    it.each([
      ["accepts", true],
      ["rejects", false],
    ])("%s the receipt as the server decided", (_label, isValid) => {
      const state = respond(dispatch(initial(), "CONTRIBUTION_FIELDS_VALIDATION_REQ"),
        "CONTRIBUTION_FIELDS_VALIDATION_RESP", { isValid });

      expect(receipt(state)).toEqual({ isValidating: false, isValid, validationError: null });
    });

    it("treats a failed check as an invalid receipt", () => {
      const state = dispatch(dispatch(initial(), "CONTRIBUTION_FIELDS_VALIDATION_REQ"),
        "CONTRIBUTION_FIELDS_VALIDATION_ERR", { payload: serverError(500, "Internal Server Error", "boom") });

      expect(receipt(state)).toEqual({ isValidating: false, isValid: false, validationError: SERVER_ERROR });
    });

    it("accepts the receipt without asking when it is the saved one", () => {
      expect(receipt(dispatch(initial(), "CONTRIBUTION_FIELDS_VALIDATION_SET_VALID"))).toEqual({
        isValidating: false,
        isValid: true,
        validationError: null,
      });
    });

    it("keeps other validated fields when the receipt is checked", () => {
      const other = { ...initial(), validationFields: { other: { isValid: true } } };

      expect(dispatch(other, "CONTRIBUTION_FIELDS_VALIDATION_REQ").validationFields.other).toEqual({ isValid: true });
    });

    // Currently fails: the clear case copies the request case, so clearing the receipt
    // leaves it flagged as being validated although no check is running.
    it.fails("stops validating on clear", () => {
      const checked = dispatch(initial(), "CONTRIBUTION_FIELDS_VALIDATION_SET_VALID");

      expect(receipt(dispatch(checked, "CONTRIBUTION_FIELDS_VALIDATION_CLEAR"))).toEqual({
        isValidating: false,
        isValid: false,
        validationError: null,
      });
    });
  });

  describe("mutations", () => {
    const submitting = () => dispatch(initial(), "CONTRIBUTION_MUTATION_REQ", {
      meta: { clientMutationId: "cmid-1", clientMutationLabel: "Create contribution" },
    });

    it("records the request metadata while a mutation is in flight", () => {
      expect(submitting()).toMatchObject({
        submittingMutation: true,
        mutation: { id: "cmid-1", clientMutationLabel: "Create contribution" },
      });
    });

    it.each([
      ["CONTRIBUTION_CREATE_RESP", "createPremium"],
      ["CONTRIBUTION_UPDATE_RESP", "updatePremium"],
      ["CONTRIBUTION_DELETE_RESP", "deletePremium"],
    ])("clears the in-flight flag and keeps the internal id on %s", (type, service) => {
      const state = respond(submitting(), type, { [service]: { internalId: "internal-1" } });

      expect(state.submittingMutation).toBe(false);
      expect(state.mutation.id).toBe("internal-1");
    });

    it("raises an alert when a mutation fails", () => {
      const state = dispatch(submitting(), "CONTRIBUTION_MUTATION_ERR", {
        payload: { status: 500, statusText: "Internal Server Error" },
      });

      expect(JSON.parse(state.alert)).toEqual({ status: 500, statusText: "Internal Server Error" });
    });

    // Currently fails: fe-core's dispatchMutationErr only sets the alert, so the flag the
    // request raised stays true and the form never journals or resets after a failed save.
    it.fails("stops submitting once a mutation has failed", () => {
      const state = dispatch(submitting(), "CONTRIBUTION_MUTATION_ERR", {
        payload: { status: 500, statusText: "Internal Server Error" },
      });

      expect(state.submittingMutation).toBe(false);
    });
  });
});
