import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from "@material-ui/core/styles";
import _ from "lodash";
import { Paper } from "@material-ui/core";
import {
    formatMessage, formatAmount, formatDateFromISO, withModulesManager,
    PublishedComponent, Table
} from "@openimis/fe-core";

import { fetchPoliciesPremiums } from "../actions";

const styles = theme => ({
    paper: theme.paper.paper,
    paperHeader: theme.paper.header,
    paperHeaderAction: theme.paper.action,
    fab: theme.fab,
});

class PoliciesPremiumsOverview extends Component {

    componentDidMount() {
        if (!!this.props.policies && !!this.props.policies.length) {
            this.props.fetchPoliciesPremiums(this.props.modulesManager, this.props.policies.map(p => p.policyUuid));
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!prevProps.policies && !!this.props.policies && !!this.props.policies.length) {
            this.props.fetchPoliciesPremiums(this.props.modulesManager, this.props.policies.map(p => p.policyUuid));
        }
    }


    headers = [
        "contribution.premium.payDate",
        "contribution.premium.payer",
        "contribution.premium.amount",
        "contribution.premium.payType",
        "contribution.premium.receipt",
        "contribution.premium.category",
    ];

    formatters = [
        p => formatDateFromISO(this.props.modulesManager, this.props.intl, p.payDate),
        p => <PublishedComponent
            readOnly={true}
            pubRef="payer.PayerPicker" withLabel={false} value={p.payer}
        />,
        p => formatAmount(this.props.intl, p.amount),
        p => <PublishedComponent
            readOnly={true}
            pubRef="contribution.PremiumPaymentTypePicker" withLabel={false} value={p.payType}
        />,
        p => p.receipt,
        p => formatMessage(this.props.intl, "contribution", `premium.category.${!!p.isPhotoFee ? "photoFee" : "contribution"}`)
    ];

    render() {
        const { intl, classes, policiesPremiums } = this.props;
        return (
            <Paper className={classes.paper}>
                <Table
                    module="contribution"
                    header={formatMessage(intl, "contribution", "PoliciesPremiums")}
                    headers={this.headers}
                    itemFormatters={this.formatters}
                    items={policiesPremiums || []}
                />
            </Paper>
        )
    }
}

const mapStateToProps = state => ({
    policies: state.policy.policies,
    fetchingPoliciesPremiums: state.contribution.fetchingPoliciesPremiums,
    fetchedPoliciesPremiums: state.contribution.fetchedPoliciesPremiums,
    policiesPremiums: state.contribution.policiesPremiums,
    errorPoliciesPremiums: state.contribution.errorPoliciesPremiums,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchPoliciesPremiums }, dispatch);
};

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(PoliciesPremiumsOverview)))));