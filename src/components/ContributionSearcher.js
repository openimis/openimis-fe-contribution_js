
import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from 'react-intl';
import { Checkbox, IconButton, Tooltip } from "@material-ui/core";
import TabIcon from "@material-ui/icons/Tab";
import {
    withModulesManager, formatMessageWithValues, formatDateFromISO, formatMessage,
    Searcher, journalize
} from "@openimis/fe-core";

import { fetchContributionsSummaries } from "../actions";
import {
    Delete as DeleteIcon,
} from '@material-ui/icons';
// import FamilyFilter from "./FamilyFilter";
import { RIGHT_CONTRIBUTION_DELETE } from "../constants";
// import { familyLabel } from "../utils/utils";
// import DeleteFamilyDialog from "./DeleteFamilyDialog";

const FAMILY_SEARCHER_CONTRIBUTION_KEY = "contribution.ContributionSearcher";

class ContributionSearcher extends Component {

    state = {
        deleteContribution: null,
        reset: 0,
    }

    constructor(props) {
        super(props);
        this.rowsPerPageOptions = [10, 20, 50, 100];
        this.defaultPageSize = 10;
        this.locationLevels = 4;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
            this.setState({ reset: this.state.reset + 1 });
        }
    }

    fetch = (prms) => {
        this.props.fetchContributionsSummaries(
            this.props.modulesManager,
            prms
        )
    }

    rowIdentifier = (r) => r.uuid

    filtersToQueryParams = (state) => {
        let prms = Object.keys(state.filters)
            .filter(contrib => !!state.filters[contrib]['filter'])
            .map(contrib => state.filters[contrib]['filter']);
        prms.push(`first: ${state.pageSize}`);
        if (!!state.afterCursor) {
            prms.push(`after: "${state.afterCursor}"`)
        }
        if (!!state.beforeCursor) {
            prms.push(`before: "${state.beforeCursor}"`)
        }
        if (!!state.orderBy) {
            prms.push(`orderBy: ["${state.orderBy}"]`);
        }
        return prms;
    }

    // headers = (filters) => {
    //     var h = [
    //         "insuree.familySummaries.insuranceNo",
    //         "insuree.familySummaries.lastName",
    //         "insuree.familySummaries.otherNames",
    //         "insuree.familySummaries.email",
    //         "insuree.familySummaries.phone",
    //         "insuree.familySummaries.dob",
    //     ]
    //     for (var i = 0; i < this.locationLevels; i++) {
    //         h.push(`location.locationType.${i}`)
    //     }
    //     h.push(
    //         "insuree.familySummaries.poverty",
    //         "insuree.familySummaries.confirmationNo",
    //         "insuree.familySummaries.validityFrom",
    //         "insuree.familySummaries.validityTo",
    //         "insuree.familySummaries.openNewTab"
    //     );
    //     if (!!this.props.rights.includes(RIGHT_FAMILY_DELETE)) {
    //         h.push("insuree.familySummaries.delete")
    //     }
    //     return h;
    // }

    // sorts = (filters) => {
    //     var results = [
    //         ['headInsuree__chfId', true],
    //         ['headInsuree__lastName', true],
    //         ['headInsuree__otherNames', true],
    //         ['headInsuree__email', true],
    //         ['headInsuree__phone', true],
    //         ['headInsuree__dob', true]
    //     ];
    //     _.times(this.locationLevels, () => results.push(null));
    //     results.push(
    //         null,
    //         ['confirmationNo', true],
    //         ['validityFrom', false],
    //         ['validityTo', false]
    //     );
    //     return results;
    // }

    // parentLocation = (location, level) => {
    //     if (!location) return "";
    //     let loc = location
    //     for (var i = 1; i < this.locationLevels - level; i++) {
    //         if (!loc.parent) return ""
    //         loc = loc.parent
    //     }
    //     return !!loc ? loc.name : "";
    // }

    // deleteFamilyAction = (i) => (
    //     !!i.validityTo ? null :
    //         <Tooltip title={formatMessage(this.props.intl, "insuree", "familySummaries.deleteContribution.tooltip")}>
    //             <IconButton onClick={e => !i.clientMutationId && this.setState({ deleteContribution: i })}><DeleteIcon /></IconButton>
    //         </Tooltip>
    // )

    // deleteContribution = (deleteMembers) => {
    //     let family = this.state.deleteContribution;
    //     this.setState(
    //         { deleteContribution: null },
    //         (e) => {
    //             this.props.deleteContribution(
    //                 this.props.modulesManager,
    //                 family,
    //                 deleteMembers,
    //                 formatMessageWithValues(this.props.intl, "insuree", "deleteContribution.mutationLabel", { label: familyLabel(family) }))
    //         })
    // }

    // itemFormatters = (filters) => {
    //     var formatters = [
    //         family => !!family.headInsuree ? family.headInsuree.chfId : "",
    //         family => !!family.headInsuree ? family.headInsuree.lastName : "",
    //         family => !!family.headInsuree ? family.headInsuree.otherNames : "",
    //         family => !!family.headInsuree ? family.headInsuree.email : "",
    //         family => !!family.headInsuree ? family.headInsuree.phone : "",
    //         family => !!family.headInsuree ? formatDateFromISO(this.props.modulesManager, this.props.intl, family.headInsuree.dob) : "",
    //     ]
    //     for (var i = 0; i < this.locationLevels; i++) {
    //         // need a fixed variable to refer to as parentLocation argument
    //         let j = i + 0;
    //         formatters.push(family => this.parentLocation(family.location, j))
    //     }
    //     formatters.push(
    //         family => <Checkbox
    //             color="primary"
    //             checked={family.poverty}
    //             readOnly
    //         />,
    //         family => family.confirmationNo,
    //         family => formatDateFromISO(
    //             this.props.modulesManager,
    //             this.props.intl,
    //             family.validityFrom),
    //         family => formatDateFromISO(
    //             this.props.modulesManager,
    //             this.props.intl,
    //             family.validityTo),
    //         family => (
    //             <Tooltip title={formatMessage(this.props.intl, "insuree", "familySummaries.openNewTabButton.tooltip")}>
    //                 <IconButton onClick={e => !family.clientMutationId && this.props.onDoubleClick(family, true)} > <TabIcon /></IconButton >
    //             </Tooltip>
    //         )
    //     )
    //     if (!!this.props.rights.includes(RIGHT_FAMILY_DELETE)) {
    //         formatters.push(this.deleteFamilyAction)
    //     }
    //     return formatters;
    // }

    // rowDisabled = (selection, i) => !!i.validityTo
    // rowLocked = (selection, i) => !!i.clientMutationId

    render() {
        console.log('render search', this.props)
        const { intl,
            contributions, contributionsPageInfo, fetchingContributions, fetchedContributions, errorContributions,
            filterPaneContributionsKey, cacheFiltersKey, onDoubleClick
        } = this.props;
        let count = contributionsPageInfo.totalCount;
        // return <span>"SEARCH"</span>;
        return (
            <Fragment>
                {/* <DeleteFamilyDialog
                    family={this.state.deleteContribution}
                    onConfirm={this.deleteContribution}
                    onCancel={e => this.setState({ deleteContribution: null })} /> */}
                <Searcher
                    module="contribution"
                    cacheFiltersKey={cacheFiltersKey}
                    FilterPane={null}
                    filterPaneContributionsKey={filterPaneContributionsKey}
                    items={contributions}
                    itemsPageInfo={contributionsPageInfo}
                    fetchingItems={fetchingContributions}
                    fetchedItems={fetchedContributions}
                    errorItems={errorContributions}
                    contributionKey={FAMILY_SEARCHER_CONTRIBUTION_KEY}
                    tableTitle={formatMessageWithValues(intl, "contribution", "contributionSummaries", { count })}
                    rowsPerPageOptions={this.rowsPerPageOptions}
                    defaultPageSize={this.defaultPageSize}
                    fetch={this.fetch}
                    rowIdentifier={this.rowIdentifier}
                    filtersToQueryParams={this.filtersToQueryParams}
                    defaultOrderBy="uuid"
                    headers={[]}
                    // itemFormatters={this.itemFormatters}
                    // sorts={this.sorts}
                    // rowDisabled={this.rowDisabled}
                    // rowLocked={this.rowLocked}
                    onDoubleClick={f => !f.clientMutationId && onDoubleClick(f)}
                    reset={this.state.reset}
                />
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
    contributions: state.contribution.contributions,
    contributionsPageInfo: state.contribution.contributionsPageInfo,
    fetchingContributions: state.contribution.fetchingContributions,
    fetchedContributions: state.contribution.fetchedContributions,
    errorContributions: state.contribution.errorContributions,
    submittingMutation: state.contribution.submittingMutation,
    mutation: state.contribution.mutation,
});


const mapDispatchToProps = dispatch => {
    return bindActionCreators(
        { fetchContributionsSummaries },
        dispatch);
};

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(injectIntl(ContributionSearcher)));