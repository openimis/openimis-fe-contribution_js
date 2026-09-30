import React from "react";
import {
  describe, expect, it, vi,
} from "vitest";

vi.mock("@openimis/fe-core", async () => ({
  FormattedMessage: (await vi.importActual("@openimis/fe-core/components/generics/FormattedMessage")).default,
}));

const { default: SaveContributionDialog } = await import("./SaveContributionDialog");
const { renderWithProviders, screen, userEvent } = await import("@openimis/fe-core/testing");
const { default: en } = await import("../translations/en.json");

const messages = { ...en, "core.cancel": "Cancel" };

const LOWER = "The contribution is lower than the policy value";
const EQUAL = "The contribution matches the value of the policy";
const CONFIRM = "Should the policy come into force?";
const LIMIT = "Adding another 'contribution' will exceed the installment limit";

const contributionFor = (amount, policy) => ({
  amount,
  policy: { value: "100.00", sumPremiums: "0.00", product: { maxInstallments: null }, ...policy },
});

const renderDialog = (contribution, props = {}) => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  renderWithProviders(
    <SaveContributionDialog contribution={contribution} onConfirm={onConfirm} onCancel={onCancel} {...props} />,
    { messages },
  );
  return { onConfirm, onCancel };
};

const button = (name) => screen.getByRole("button", { name });

describe("SaveContributionDialog", () => {
  it("renders nothing until the policy value is known", () => {
    renderDialog({ amount: 10, policy: { uuid: "policy-1" } });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  describe("when the contribution pays the policy off", () => {
    it("says so, counting what was paid before", () => {
      renderDialog(contributionFor(60, { sumPremiums: "40.00" }));

      expect(screen.getByText(EQUAL)).toBeInTheDocument();
      expect(screen.queryByText(LOWER)).not.toBeInTheDocument();
    });

    it("saves without asking about the policy status", async () => {
      const { onConfirm } = renderDialog(contributionFor(100));

      await userEvent.click(button("OK"));

      expect(onConfirm).toHaveBeenCalledWith();
    });
  });

  describe("when the contribution is lower than the policy value", () => {
    it("warns first, then asks whether the policy should come into force", async () => {
      const { onConfirm } = renderDialog(contributionFor(40, { sumPremiums: "20.00" }));

      expect(screen.getByText(LOWER)).toBeInTheDocument();
      await userEvent.click(button("OK"));

      expect(screen.getByText(CONFIRM)).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it.each([
      ["Yes", "ENFORCE"],
      ["No", "WAIT"],
    ])("answering %s saves with %s", async (answer, action) => {
      const { onConfirm } = renderDialog(contributionFor(40));

      await userEvent.click(button("OK"));
      await userEvent.click(button(answer));

      expect(onConfirm).toHaveBeenCalledWith(action);
    });

    it("treats a missing previous total as nothing paid", () => {
      renderDialog(contributionFor(40, { sumPremiums: null }));

      expect(screen.getByText(LOWER)).toBeInTheDocument();
    });
  });

  it("cancels from the first step", async () => {
    const { onCancel, onConfirm } = renderDialog(contributionFor(40));

    await userEvent.click(button("Cancel"));

    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  describe("installment limit", () => {
    const limited = (maxInstallments) => contributionFor(100, { product: { maxInstallments } });

    it("warns once the product's installments are used up", () => {
      renderDialog(limited(3), { installmentsNumber: 3 });

      expect(screen.getByText(LIMIT)).toBeInTheDocument();
    });

    it.each([
      ["installments remain", 3, 2],
      ["the product has no limit", null, 7],
    ])("stays quiet while %s", (_label, maxInstallments, installmentsNumber) => {
      renderDialog(limited(maxInstallments), { installmentsNumber });

      expect(screen.queryByText(LIMIT)).not.toBeInTheDocument();
    });
  });

  describe("amounts with cents", () => {
    // Currently fails: every amount is cut to whole units with parseInt before comparing,
    // so 99.50 already paid plus 0.50 now counts as 99 against 100 and the exact final
    // payment is reported as lower than the policy value.
    it.fails("treats a final payment of cents as paying the policy off", () => {
      renderDialog(contributionFor(0.5, { sumPremiums: "99.50" }));

      expect(screen.getByText(EQUAL)).toBeInTheDocument();
    });

    // Currently fails: parseInt turns both 100.40 and 100.90 into 100, so a payment half a
    // unit short is reported as matching the policy value and saved without asking.
    it.fails("notices a payment that is short by less than one unit", () => {
      renderDialog(contributionFor(100.4, { value: "100.90" }));

      expect(screen.getByText(LOWER)).toBeInTheDocument();
    });
  });
});
