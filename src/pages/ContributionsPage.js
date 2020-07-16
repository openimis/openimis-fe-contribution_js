import React, { Component } from "react";
import { ProxyPage } from "@openimis/fe-core";


class ContributionsPage extends Component {
    render() {
        return <ProxyPage url="/FindPremium.aspx" />
    }
}

export { ContributionsPage };