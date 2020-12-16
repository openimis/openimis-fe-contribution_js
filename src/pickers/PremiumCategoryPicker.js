import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { PREMIUM_CATEGORIES } from "../constants";

class PremiumCategoryPicker extends Component {

    render() {
        return <ConstantBasedPicker
            module="contribution"
            label="contribution.category"
            constants={PREMIUM_CATEGORIES}
            {...this.props}
        />
    }
}

export default PremiumCategoryPicker;