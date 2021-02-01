import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from "@material-ui/core/styles";
import _ from "lodash";
import { Paper, IconButton, Grid, Divider, Typography } from "@material-ui/core";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
} from '@material-ui/icons';

import {
    formatMessage, formatMessageWithValues,
    formatAmount, formatDateFromISO, withModulesManager, withTooltip,
    formatSorter, sort,
    PublishedComponent, Table, PagedDataHandler, journalize, historyPush
} from "@openimis/fe-core";

import { fetchPoliciesPremiums, selectPremium, deleteContribution } from "../actions";
import DeleteContributionDialog from "./DeleteContributionDialog";

const styles = theme => ({
    paper: theme.paper.paper,
    paperHeader: theme.paper.header,
    paperHeaderAction: theme.paper.action,
    tableTitle: theme.table.title,
    fab: theme.fab,
});

class PoliciesPremiumsOverview extends PagedDataHandler {

    constructor(props) {
        super(props);
        this.state = {
            deleteContribution: null,
        }
        this.rowsPerPageOptions = props.modulesManager.getConf("fe-contribution", "familyPremiumsOverview.rowsPerPageOptions", [2, 5, 10, 20]);
        this.defaultPageSize = props.modulesManager.getConf("fe-contribution", "familyPremiumsOverview.defaultPageSize", 2);
    }

    componentDidMount() {
        this.setState({ orderBy: "-payDate" }, e => this.query())
    }

    addNewPremium = () =>  {
        const {
            policy,
            modulesManager,
            history,
        } = this.props;
        historyPush(modulesManager, history, "contribution.contributionNew", [policy.policyUuid]);
    }

    onDoubleClick = (i, newTab = false) => {
        historyPush(modulesManager, history, "contribution.contributionOverview", [i.uuid], newTab);
    }

    policiesChanged = (prevProps) =>
        (!_.isEqual(prevProps.policies, this.props.policies) && !!this.props.policies && !!this.props.policies.length) ||
        (!_.isEqual(prevProps.policy, this.props.policy))

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.policiesChanged(prevProps)) {
            this.query();
        }
        if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
            this.setState({ reset: this.state.reset + 1 });
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
        "contribution.payDate",
        "contribution.payer",
        "contribution.amount",
        "contribution.payType",
        "contribution.receipt",
        "contribution.category",
        "",
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


    confirmDelete = deleteContribution => {
        this.setState({ deleteContribution,})
    }

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
        p => formatMessage(this.props.intl, "contribution", `premium.category.${!!p.isPhotoFee ? "photoFee" : "contribution"}`),
        p => withTooltip(<IconButton onClick={this.confirmDelete}><DeleteIcon /></IconButton>, formatMessage(this.props.intl, "contribution", "deletePremium.tooltip"))
    ];

    deleteContribution = () => {
        let contribution = this.state.deleteContribution;
        this.setState(
            { deleteContribution: null },
            (e) => {
                this.props.deleteContribution(
                    this.props.modulesManager,
                    contribution,
                    formatMessage(this.props.intl, "contribution", "deleteContributionDialog.title"))
            })
    }

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
        const {
            intl,
            family,
            classes,
            policiesPremiums,
            errorPoliciesPremiums,
            pageInfo,
            reset,
            readOnly,
            policies,
            policy,
        } = this.props;
        if (!family.uuid) return null;
        let actions = !!readOnly || !policy ? [] : [
            {
                button: <IconButton onClick={this.addNewPremium}><AddIcon /></IconButton>,
                tooltip: formatMessage(intl, "contribution", "addNewPremium.tooltip")
            }
        ];

        return (
            <>
            <DeleteContributionDialog
                    contribution={this.state.deleteContribution}
                    onConfirm={this.deleteContribution}
                    onCancel={e => this.setState({ deleteContribution: null })} />
            <Paper className={classes.paper}>
                <Grid container alignItems="center" direction="row" className={classes.paperHeader}>
                    <Grid item xs={8}>
                        <Typography className={classes.tableTitle}>
                            {this.header()}
                        </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Grid container direction="row" justify="flex-end">
                            {actions.map((a, idx) => {
                                return (
                                    <Grid item key={`form-action-${idx}`} className={classes.paperHeaderAction}>
                                        {withTooltip(a.button, a.tooltip)}
                                    </Grid>
                                )
                            })}
                        </Grid>
                    </Grid>
                </Grid>
                <Divider />
                <Table
                    module="contribution"
                    headerActions={this.headerActions}
                    headers={this.headers}
                    itemFormatters={this.formatters}
                    items={policiesPremiums || []}
                    error={errorPoliciesPremiums}
                    onDoubleClick={this.onDoubleClick}
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
            </>
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
    errorContributions: state.contribution.errorContributions,
    submittingMutation: state.contribution.submittingMutation,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({
        fetch: fetchPoliciesPremiums,
        selectPremium,
        deleteContribution,
        journalize,
    }, dispatch);
};

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(PoliciesPremiumsOverview)))));