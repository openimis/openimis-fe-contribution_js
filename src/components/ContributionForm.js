import React, { Component, Fragment } from "react";
import { injectIntl } from 'react-intl';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import ReplayIcon from "@material-ui/icons/Replay"
import {
    formatMessageWithValues, withModulesManager, withHistory, historyPush,
    Form, ProgressOrError, journalize, coreConfirm
} from "@openimis/fe-core";
import { RIGHT_CONTRIBUTION, RIGHT_CONTRIBUTION_EDIT } from "../constants";
// import FamilyMasterPanel from "./FamilyMasterPanel";

import { fetchContribution, newContribution, createContribution } from "../actions";
// import FamilyInsureesOverview from "./FamilyInsureesOverview";
import ContributionMasterPanel from "./ContributionMasterPanel";

// import { insureeLabel } from "../utils/utils";

const styles = theme => ({
    lockedPage: theme.page.locked
});

const INSUREE_FAMILY_PANELS_CONTRIBUTION_KEY = "insuree.Family.panels"
const INSUREE_FAMILY_OVERVIEW_PANELS_CONTRIBUTION_KEY = "insuree.FamilyOverview.panels"
const INSUREE_FAMILY_OVERVIEW_CONTRIBUTED_MUTATIONS_KEY = "insuree.FamilyOverview.mutations"

class ContributionForm extends Component {

    state = {
        lockNew: false,
        reset: 0,
        constribution: this._newContribution(),
        newContribution: true,
        consirmedAction: null,
    }

    _newContribution() {
        return {
            jsonExt: {},
        };
    }

    componentDidMount() {
        document.title = formatMessageWithValues(
            this.props.intl,
            "contribution",
            "ContributionOverview.title",
            { label: "" }
        );
        if (this.props.contribution_uuid) {
            this.setState(
                (state, props) => ({ contribution_uuid: props.contribution_uuid }),
                e => this.props.fetchContribution(
                    this.props.modulesManager,
                    this.props.contribution_uuid
                )
            )
        }
    }

    componentDidUpdate(prevProps, prevState) {
        // if ((prevState.contribution && prevState.contribution.headInsuree && prevState.contribution.headInsuree.chfId)
        //     !== (this.state.contribution && this.state.contribution.headInsuree && this.state.contribution.headInsuree.chfId)) {
        //     document.title = formatMessageWithValues(this.props.intl, "insuree", !!this.props.overview ? "FamilyOverview.title" : "Family.title", { label: insureeLabel(this.state.contribution.headInsuree) })
        // }
        if (!prevProps.fetchedContribution && !!this.props.fetchedContribution) {
            const { contribution } = this.props;
            contribution.ext = !!contribution.jsonExt ? JSON.parse(contribution.jsonExt) : {};
            this.setState(
            {
                contribution,
                contribution_uuid: contribution.uuid,
                lockNew: false,
                newContribution: false
            });
        } else if (prevProps.contribution_uuid && !this.props.contribution_uuid) {
            // document.title = formatMessageWithValues(this.props.intl, "insuree", !!this.props.overview ? "FamilyOverview.title" : "Family.title", { label: insureeLabel(this.state.contribution.headInsuree) })
            this.setState({ contribution: this._newContribution(), newContribution: true, lockNew: false, contribution_uuid: null });
        } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
            this.setState((state, props) => ({
                contribution: { ...state.contribution, clientMutationId: props.mutation.clientMutationId }
            }));
        } else if (prevProps.confirmed !== this.props.confirmed && !!this.props.confirmed && !!this.state.confirmedAction) {
            this.state.confirmedAction();
        }
    }

    // _add = () => {
    //     this.setState((state) => ({
    //         family: this._newFamily(),
    //         newContribution: true,
    //         lockNew: false,
    //         reset: state.reset + 1,
    //     }),
    //         e => {
    //             this.props.add();
    //             this.forceUpdate();
    //         }
    //     )
    // }

    // reload = () => {
    //     this.props.fetchContribution(
    //         this.props.modulesManager,
    //         this.state.family_uuid,
    //         !!this.state.family.headInsuree ? this.state.family.headInsuree.chfId : null
    //     );
    // }

    canSave = () => {
        if (!this.state.contribution.payType) return false;
        return true;
    }

    // _save = (family) => {
    //     this.setState(
    //         { lockNew: !family.uuid }, // avoid duplicates
    //         e => this.props.save(family))
    // }

    onEditedChanged = contribution => {
        this.setState({ contribution, newContribution: false })
    }

    onActionToConfirm = (title, message, confirmedAction) => {
        this.setState(
            { confirmedAction },
            this.props.coreConfirm(
                title,
                message
            )
        )
    }

    render() {
        const {
            modulesManager,
            classes,
            state,
            rights,
            contribution_uuid,
            fetchingContribution,
            fetchedContribution,
            errorContribution,
            insuree,
            overview = false, openFamilyButton, readOnly = false,
            add, save, back, mutation } = this.props;
        const { contribution } = this.state;
        console.log('contribution', contribution)
        if (!rights.includes(RIGHT_CONTRIBUTION)) return null;
        const runningMutation = !!contribution && !!contribution.clientMutationId
        // let contributedMutations = modulesManager.getContribs(INSUREE_FAMILY_OVERVIEW_CONTRIBUTED_MUTATIONS_KEY);
        // for (let i = 0; i < contributedMutations.length && !runningMutation; i++) {
        //     runningMutation = contributedMutations[i](state)
        // }
        const actions = [{
            doIt: this.reload,
            icon: <ReplayIcon />,
            onlyIfDirty: !readOnly && !runningMutation
        }];
        return (
            <div className={!!runningMutation ? classes.lockedPage : null}>
                <ProgressOrError progress={fetchingContribution} error={errorContribution} />
                {((!!fetchedContribution && !!contribution && contribution.uuid === contribution_uuid) || !contribution_uuid) && (
                    <Form
                        module="contribution"
                        title="ContributionOverview.title"
                        edited_id={contribution_uuid}
                        edited={contribution}
                        reset={this.state.reset}
                        back={back}
                        add={!!add && !this.state.newContribution ? this._add : null}
                        readOnly={readOnly || runningMutation || !!contribution.validityTo}
                        actions={actions}
                        // openFamilyButton={openFamilyButton}
                        overview={overview}
                        HeadPanel={ContributionMasterPanel}
                        // Panels={overview ? [FamilyInsureesOverview] : [HeadInsureeMasterPanel]}
                        // contributedPanelsKey={overview ? INSUREE_FAMILY_OVERVIEW_PANELS_CONTRIBUTION_KEY : INSUREE_FAMILY_PANELS_CONTRIBUTION_KEY}
                        contribution={contribution}
                        onEditedChanged={this.onEditedChanged}
                        canSave={this.canSave}
                        save={!!save ? this._save : null}
                        onActionToConfirm={this.onActionToConfirm}
                    />
                )}
            </div>
        )
    }
}

const mapStateToProps = (state, props) => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
    fetchingContribution: state.contribution.fetchingContribution,
    errorContribution: state.contribution.errorContribution,
    fetchedContribution: state.contribution.fetchedContribution,
    submittingMutation: state.contribution.submittingMutation,
    mutation: state.contribution.mutation,
    contribution: state.contribution.contribution,
    confirmed: state.core.confirmed,
    state: state,
})

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchContribution, newContribution, createContribution, journalize, coreConfirm }, dispatch);
};

export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
    injectIntl(withTheme(withStyles(styles)(ContributionForm))
    ))));