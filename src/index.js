import messages_en from "./translations/en.json";

import FamilyContributionsOverview from "./components/FamilyContributionsOverview";
import FamilyPaymentsOverview from "./components/FamilyPaymentsOverview";

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }],
  "insuree.FamilyOverview.panels": [FamilyContributionsOverview, FamilyPaymentsOverview],
}

export const ContributionModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}