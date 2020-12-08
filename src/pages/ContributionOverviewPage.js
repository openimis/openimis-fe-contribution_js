import React, { Component } from "react";
import { connect } from "react-redux";
import { Edit as EditIcon } from "@material-ui/icons";
import { historyPush, withModulesManager, withHistory } from "@openimis/fe-core";
// import FamilyPage from "./FamilyPage";


class ContributionOverviewPage extends Component {
    render() {
        const { history, modulesManager, contribution_uuid } = this.props;
        var actions = [{
            doIt: e => historyPush(modulesManager, history, "insuree.route.family", [contribution_uuid]),
            icon: <EditIcon />,
            onlyIfDirty: false
        }]
        return <div>OVERVIEW {contribution_uuid}</div>
        // return <FamilyPage {...this.props} readOnly={true} overview={true} actions={actions} />
    }
}

const mapStateToProps = (state, props) => ({
    contribution_uuid: props.match.params.contribution_uuid,
})

export default withHistory(withModulesManager(connect(mapStateToProps)(ContributionOverviewPage)));