import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from "@material-ui/core/styles";
import _ from "lodash";
import { Paper } from "@material-ui/core";
import {
    formatMessage, formatMessageWithValues,
    formatAmount, formatDateFromISO, withModulesManager,
    formatSorter, sort,
    PublishedComponent, Table, PagedDataHandler
} from "@openimis/fe-core";

import { fetchPoliciesPremiums, selectPremium } from "../actions";

const styles = theme => ({
    paper: theme.paper.paper,
    paperHeader: theme.paper.header,
    paperHeaderAction: theme.paper.action,
    fab: theme.fab,
});

class PoliciesPremiumsOverview extends PagedDataHandler {

    constructor(props) {
        super(props);
        this.rowsPerPageOptions = props.modulesManager.getConf("fe-insuree", "familyPremiumsOverview.rowsPerPageOptions", [2, 5, 10, 20]);
        this.defaultPageSize = props.modulesManager.getConf("fe-insuree", "familyPremiumsOverview.defaultPageSize", 2);
    }

    componentDidMount() {
        this.setState({ orderBy: "-payDate" }, e => this.query())
    }

    policiesChanged = (prevProps) =>
        (!_.isEqual(prevProps.policies, this.props.policies) && !!this.props.policies && !!this.props.policies.length) ||
        (!_.isEqual(prevProps.policy, this.props.policy))

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.policiesChanged(prevProps)) {
            this.query();
        }
    }

    queryPrms = () => {
        let prms = [`orderBy: "${this.state.orderBy}"`];
        if (!!this.props.policy) {
            prms.push(`policyUuids: ${JSON.stringify([this.props.policy.policyUuid])}`);
            return prms;
        } else if (!!this.props.policies && !!this.props.policies.length) {
            prms.push(`policyUuids: ${JSON.stringify((this.props.policies || []).map(p => p.policyUuid))}`);
            return prms;
        }
        return null;
    }

    onChangeSelection = (i) => {
        this.props.selectPremium(i[0] || null)
    }

    headers = [
        "contribution.premium.payDate",
        "contribution.premium.payer",
        "contribution.premium.amount",
        "contribution.premium.payType",
        "contribution.premium.receipt",
        "contribution.premium.category",
    ];

    sorter = (attr, asc = true) => [
        () => this.setState((state, props) => ({ orderBy: sort(state.orderBy, attr, asc) }), e => this.query()),
        () => formatSorter(this.state.orderBy, attr, asc)
    ]

    headerActions = [
        this.sorter("payDate"),
        this.sorter("payer"),
        this.sorter("amount"),
        this.sorter("payType"),
        this.sorter("receipt"),
        this.sorter("category"),
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

    header = () => {
        const { modulesManager, intl, pageInfo, policy } = this.props;
        if (!!policy && !!policy.policyUuid) {
            return formatMessageWithValues(
                intl, "contribution", "PoliciesPremiumsOfPolicy",
                {
                    count: pageInfo.totalCount,
                    policy: `${policy.productCode}(${formatDateFromISO(modulesManager, intl, policy.effectiveDate)} - ${formatDateFromISO(modulesManager, intl, policy.expiryDate)})`
                }
            )
        } else {
            return formatMessageWithValues(
                intl, "contribution", "PoliciesPremiums",
                { count: pageInfo.totalCount }
            )
        }
    }

    render() {
        const { intl, family, classes, policiesPremiums, errorPoliciesPremiums, pageInfo, reset } = this.props;
        if (!family.uuid) return null;
        return (
            <Paper className={classes.paper}>
                <Table
                    module="contribution"
                    header={this.header()}
                    headerActions={this.headerActions}
                    headers={this.headers}
                    itemFormatters={this.formatters}
                    items={policiesPremiums || []}
                    error={errorPoliciesPremiums}
                    withSelection={"single"}
                    onChangeSelection={this.onChangeSelection}
                    withPagination={true}
                    rowsPerPageOptions={this.rowsPerPageOptions}
                    defaultPageSize={this.defaultPageSize}
                    page={this.currentPage()}
                    pageSize={this.currentPageSize()}
                    count={pageInfo.totalCount}
                    onChangePage={this.onChangePage}
                    onChangeRowsPerPage={this.onChangeRowsPerPage}
                />
            </Paper>
        )
    }
}

const mapStateToProps = state => ({
    family: state.insuree.family || {},
    policy: state.policy.policy,
    policies: state.policy.policies,
    fetchingPoliciesPremiums: state.contribution.fetchingPoliciesPremiums,
    fetchedPoliciesPremiums: state.contribution.fetchedPoliciesPremiums,
    policiesPremiums: state.contribution.policiesPremiums,
    pageInfo: state.contribution.policiesPremiumsPageInfo,
    errorPoliciesPremiums: state.contribution.errorPoliciesPremiums,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetch: fetchPoliciesPremiums, selectPremium }, dispatch);
};

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(PoliciesPremiumsOverview)))));