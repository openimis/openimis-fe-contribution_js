import messages_en from "./translations/en.json";

import PoliciesPremiumsOverview from "./components/PoliciesPremiumsOverview";
import PremiumPaymentTypePicker from "./pickers/PremiumPaymentTypePicker";
import reducer from "./reducer";

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }],
  "reducers": [{ key: 'contribution', reducer }],

  "refs": [
    { key: "contribution.PremiumPaymentTypePicker", ref: PremiumPaymentTypePicker },
  ],

  "insuree.FamilyOverview.panels": [PoliciesPremiumsOverview],
}

export const ContributionModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}