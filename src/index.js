import React from "react";
import { MonetizationOn } from "@material-ui/icons";
import { FormattedMessage } from "@openimis/fe-core";
import { ContributionsPage } from "./pages/ContributionsPage";
import PoliciesPremiumsOverview from "./components/PoliciesPremiumsOverview";
import PremiumPaymentTypePicker from "./pickers/PremiumPaymentTypePicker";
import messages_en from "./translations/en.json";
import reducer from "./reducer";

import { RIGHT_CONTRIBUTION } from "./constants";

const ROUTE_CONTRIBUTION_CONTRIBUTIONS = "contribution/contributions";

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }],
  "reducers": [{ key: 'contribution', reducer }],

  "refs": [
    { key: "contribution.PremiumPaymentTypePicker", ref: PremiumPaymentTypePicker },
  ],
  "core.Router": [
    { path: ROUTE_CONTRIBUTION_CONTRIBUTIONS, component: ContributionsPage },
  ],
  "insuree.MainMenu": [
    {
      text: <FormattedMessage module="contribution" id="menu.contributions" />,
      icon: <MonetizationOn />,
      route: "/" + ROUTE_CONTRIBUTION_CONTRIBUTIONS,
      filter: rights => rights.includes(RIGHT_CONTRIBUTION)
    }
  ],
  "insuree.FamilyOverview.panels": [PoliciesPremiumsOverview],
}

export const ContributionModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}