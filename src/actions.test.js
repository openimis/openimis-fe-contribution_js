import {
  describe, expect, it, vi,
} from "vitest";

const core = vi.hoisted(() => ({
  graphql: vi.fn((payload, type, meta) => ({ payload, type, meta })),
  graphqlWithVariables: vi.fn((operation, variables, type, meta) => ({
    operation, variables, type, meta,
  })),
}));

vi.mock("@openimis/fe-core", async () => ({
  ...(await vi.importActual("@openimis/fe-core/helpers/api")),
  ...(await vi.importActual("@openimis/fe-core/helpers/jsonExt")),
  ...core,
}));

const actions = await import("./actions");

const mm = { getProjection: (key) => `{${key}}` };

const query = (result) => result.payload.replace(/\s+/g, " ");
const input = (contribution) => actions.formatContributionGQL(mm, contribution).replace(/\s+/g, " ").trim();

const CONTRIBUTION = {
  uuid: "c-1",
  receipt: "R-001",
  payDate: "2026-09-01",
  payType: "C",
  isPhotoFee: false,
  amount: 125.5,
  payer: { uuid: "payer-1" },
  policy: { uuid: "policy-1" },
};

const thunk = (creator) => {
  const dispatch = vi.fn();
  creator(dispatch);
  return dispatch.mock.calls.map(([action]) => action);
};

describe("contribution actions", () => {
  describe("searches", () => {
    it.each([
      ["fetchPoliciesPremiums", "premiumsByPolicies", "CONTRIBUTION_POLICES_PREMIUMS"],
      ["fetchContributionsSummaries", "premiums", "CONTRIBUTION_CONTRIBUTIONS"],
    ])("%s asks for a counted page with the payer projection", (creator, entity, type) => {
      const result = actions[creator](mm, ['policyUuids: ["policy-1"]', "first: 10"]);

      expect(result.type).toBe(type);
      expect(query(result)).toContain(`${entity}(policyUuids: ["policy-1"],first: 10) { totalCount`);
      expect(query(result)).toContain("payer{payer.PayerPicker.projection}");
      expect(query(result)).toContain("amount");
    });

    it("filters the policy premiums by policy uuid only when one is given", () => {
      expect(query(actions.fetchPoliciesPremiums2(mm, "policy-1"))).toContain('premiumsByPolicies(uuid: "policy-1")');
      expect(query(actions.fetchPoliciesPremiums2(mm, null))).toContain("premiumsByPolicies {");
    });

    it("asks for the policy value and what has been paid towards it", () => {
      const result = actions.fetchPolicySummary(mm, "policy-1");

      expect(result.type).toBe("CONTRIBUTION_POLICY_SUMMARY");
      expect(query(result)).toContain('policies(uuid: "policy-1")');
      expect(query(result)).toContain("product{name, code, maxInstallments}");
      expect(query(result)).toContain("value");
      expect(query(result)).toContain("sumPremiums");
    });

    it("loads one contribution by uuid with its payer and policy", () => {
      const result = actions.fetchContribution(mm, "c-1", "cmid-1");

      expect(result.type).toBe("CONTRIBUTION_OVERVIEW");
      expect(query(result)).toContain('premiums(uuid: "c-1")');
      expect(query(result)).toContain("payer{payer.PayerPicker.projection}");
      expect(query(result)).toContain("policy{policy.PolicyPicker.projection.withFamily}");
      expect(result.meta.clientMutationId).toBeFalsy();
    });

    it("falls back to the mutation id when the contribution has no uuid yet", () => {
      const result = actions.fetchContribution(mm, null, "cmid-1");

      expect(query(result)).toContain('premiums(clientMutationId: "cmid-1")');
      expect(result.meta).toEqual({ clientMutationId: "cmid-1" });
    });
  });

  describe("formatContributionGQL", () => {
    it("sends every field of a complete contribution", () => {
      expect(input(CONTRIBUTION)).toBe([
        'uuid: "c-1"',
        'receipt: "R-001"',
        'payDate: "2026-09-01"',
        'payType: "C"',
        "isPhotoFee: false",
        'amount: "125.5"',
        'payerUuid: "payer-1"',
        'policyUuid: "policy-1"',
      ].join(" "));
    });

    it("keeps the amount exactly as entered", () => {
      expect(input({ ...CONTRIBUTION, amount: "0.10" })).toContain('amount: "0.10"');
      expect(input({ ...CONTRIBUTION, amount: 1234567.89 })).toContain('amount: "1234567.89"');
    });

    it("omits the fields a new contribution does not have", () => {
      expect(input({ isPhotoFee: true, amount: 10 })).toBe('isPhotoFee: true amount: "10"');
    });

    it("passes the underpayment decision on", () => {
      expect(input({ ...CONTRIBUTION, action: "ENFORCE" })).toContain('action: "ENFORCE"');
    });

    it("sends the extension fields as JSON", () => {
      expect(input({ ...CONTRIBUTION, jsonExt: { note: "x" } })).toContain('jsonExt: "{\\"note\\":\\"x\\"}"');
    });

    // Currently fails: formatGQLString escapes the quote first and the backslash second,
    // so the server receives receipt: "R-\\"7\\"" — a syntax error, not the typed receipt.
    it.fails("keeps a quote in the receipt inside the string", () => {
      expect(input({ ...CONTRIBUTION, receipt: 'R-"7"' })).toContain('receipt: "R-\\"7\\""');
    });
  });

  describe("mutations", () => {
    it.each([
      ["createContribution", "createPremium", "CONTRIBUTION_CREATE_RESP"],
      ["updateContribution", "updatePremium", "CONTRIBUTION_UPDATE_RESP"],
    ])("%s sends the formatted contribution to %s", (creator, operation, respType) => {
      const result = actions[creator](mm, CONTRIBUTION, "Save contribution");

      expect(result.type).toEqual(["CONTRIBUTION_MUTATION_REQ", respType, "CONTRIBUTION_MUTATION_ERR"]);
      expect(query(result)).toContain(`mutation ${operation} { ${operation}( input: {`);
      expect(query(result)).toContain('clientMutationLabel: "Save contribution"');
      expect(query(result)).toContain('amount: "125.5" payerUuid: "payer-1" policyUuid: "policy-1"');
      expect(query(result)).toContain(`clientMutationId: "${result.meta.clientMutationId}"`);
      expect(result.meta).toMatchObject({ clientMutationLabel: "Save contribution" });
      expect(result.meta.requestedDateTime).toBeInstanceOf(Date);
    });

    it("records which contribution an update is for", () => {
      expect(actions.updateContribution(mm, CONTRIBUTION, "Save").meta.contributionUuid).toBe("c-1");
    });

    it("deletes a contribution by its uuid", () => {
      const result = actions.deleteContribution(mm, CONTRIBUTION, "Delete contribution");

      expect(result.type).toEqual([
        "CONTRIBUTION_MUTATION_REQ",
        "CONTRIBUTION_DELETE_RESP",
        "CONTRIBUTION_MUTATION_ERR",
      ]);
      expect(query(result)).toContain('uuids: ["c-1"]');
      expect(query(result)).not.toContain("amount");
      expect(result.meta).toMatchObject({ clientMutationLabel: "Delete contribution", contributionUuid: "c-1" });
    });
  });

  it("checks a receipt against the policy with variables", () => {
    const variables = { code: "R-001", policyUuid: "policy-1" };
    const result = actions.validateReceipt(mm, variables);

    expect(result.type).toBe("CONTRIBUTION_FIELDS_VALIDATION");
    expect(result.variables).toBe(variables);
    expect(result.operation.replace(/\s+/g, " "))
      .toContain("isValid: validatePremiumCode(code: $code, policyUuid: $policyUuid)");
  });

  it.each([
    ["selectPremium", () => actions.selectPremium({ id: "p1" }), { type: "CONTRIBUTION_PREMIUM", payload: { id: "p1" } }],
    ["newContribution", () => actions.newContribution(), { type: "CONTRIBUTION_NEW" }],
    ["clearContribution", () => actions.clearContribution(), { type: "CONTRIBUTION_OVERVIEW_CLEAR" }],
    ["setReceiptValid", () => actions.setReceiptValid(mm), { type: "CONTRIBUTION_FIELDS_VALIDATION_SET_VALID" }],
    ["clearReceiptValidation", () => actions.clearReceiptValidation(mm),
      { type: "CONTRIBUTION_FIELDS_VALIDATION_CLEAR" }],
  ])("%s dispatches its plain action", (_label, creator, expected) => {
    expect(thunk(creator())).toEqual([expected]);
  });
});
