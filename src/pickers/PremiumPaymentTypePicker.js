import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { PREMIUM_PAYMENT_TYPES } from "../constants";

class PremiumPaymentTypePicker extends Component {

    render() {
        return <ConstantBasedPicker
            module="contribution"
            label="contribution.payType"
            constants={PREMIUM_PAYMENT_TYPES}
            {...this.props}
        />
    }
}

export default PremiumPaymentTypePicker;