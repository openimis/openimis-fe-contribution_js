import { describe, expect, it } from "vitest";

import { ContributionModule } from "../src/index";

const modulesManagerWith = (productsOrContributions) => ({
  getConf: (module, key, defaultValue) =>
    module === "fe-policy" && key === "productsOrContributions"
      ? productsOrContributions
      : defaultValue,
});

describe("ContributionModule configuration", () => {
  it("hides the contributions entry of the insuree menu when the invoice payment mode is enabled", () => {
    const config = ContributionModule({});

    expect(
      config["insuree.MainMenu"](modulesManagerWith("contributions"))
    ).toEqual([{ route: "contribution/contributions", hide: true }]);
  });

  it("keeps the contributions entry of the insuree menu when the invoice payment mode is disabled", () => {
    const config = ContributionModule({});

    expect(config["insuree.MainMenu"](modulesManagerWith("products"))).toEqual([
      { route: "contribution/contributions", hide: false },
    ]);
  });

  it("defaults the invoice payment mode to disabled when the config is not set", () => {
    const config = ContributionModule({});

    expect(
      config["insuree.MainMenu"]({
        getConf: (module, key, defaultValue) => defaultValue,
      })
    ).toEqual([{ route: "contribution/contributions", hide: false }]);
  });

  it("keeps the menu entry when the configuration holds an unexpected value", () => {
    const config = ContributionModule({});

    expect(
      config["insuree.MainMenu"](modulesManagerWith("contribution_plans"))
    ).toEqual([{ route: "contribution/contributions", hide: false }]);
  });

  it("lets the host application override the default menu entry", () => {
    const customConfig = { "insuree.MainMenu": () => [] };

    expect(ContributionModule(customConfig)["insuree.MainMenu"]()).toEqual([]);
  });
});
