import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";

import { PoliciesPremiumsOverview } from "../../src/components/PoliciesPremiumsOverview";

const intl = { formatMessage: ({ id }) => id };

const buildProps = ({ mode = "products", overrides = {} } = {}) => ({
  modulesManager: {
    getConf: (module, key, defaultValue) =>
      module === "fe-policy" && key === "productsOrContributions"
        ? mode
        : defaultValue,
  },
  intl,
  history: { push: vi.fn() },
  family: { uuid: "family-1" },
  edited: null,
  policy: null,
  policySummary: null,
  rights: [],
  readOnly: false,
  policiesPremiums: [],
  fetchingPoliciesPremiums: false,
  errorPoliciesPremiums: null,
  pageInfo: { totalCount: 0 },
  fetchPolicySummary: vi.fn(),
  selectPremium: vi.fn(),
  deleteContribution: vi.fn(),
  ...overrides,
});

const renderPanel = (props) =>
  render(
    <IntlProvider locale="en" messages={{}}>
      <PoliciesPremiumsOverview {...props} />
    </IntlProvider>
  );

describe("PoliciesPremiumsOverview", () => {
  it("renders nothing when the contribution plans (invoice payment) mode is enabled", () => {
    const { container } = renderPanel(buildProps({ mode: "contributions" }));

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the premiums panel in products mode", () => {
    renderPanel(buildProps({ mode: "products" }));

    expect(screen.getByText("PoliciesPremiums")).toBeInTheDocument();
    expect(document.querySelector("table")).toBeInTheDocument();
  });

  it("renders the panel when the configuration holds an unexpected value", () => {
    renderPanel(buildProps({ mode: "contribution_plans" }));

    expect(screen.getByText("PoliciesPremiums")).toBeInTheDocument();
  });

  it("renders nothing when the family has no uuid", () => {
    const { container } = renderPanel(
      buildProps({ overrides: { family: {} } })
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for a polygamous family", () => {
    const { container } = renderPanel(
      buildProps({
        overrides: { family: { uuid: "family-1", familyType: { code: "P" } } },
      })
    );

    expect(container).toBeEmptyDOMElement();
  });
});
