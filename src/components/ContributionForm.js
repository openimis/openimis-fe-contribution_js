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
import { RIGHT_CONTRIBUTION } from "../constants";

import { fetchContribution, newContribution, createContribution, fetchPolicySummary } from "../actions";
import ContributionMasterPanel from "./ContributionMasterPanel";
import SaveContributionDialog from "./SaveContributionDialog";

const styles = theme => ({
    lockedPage: theme.page.locked
});

const CONTRIBUTION_OVERVIEW_MUTATIONS_KEY = "contribution.ContributionOverview.mutations"

class ContributionForm extends Component {
    _newContribution = () => ({
        isPhotoFee: false
    });

    state = {
        lockNew: false,
        reset: 0,
        update: false,
        contribution: this._newContribution(),
        newContribution: true,
        saveContribution: false,
    }

    componentDidMount() {
        document.title = formatMessageWithValues(
            this.props.intl,
            "contribution",
            "ContributionOverview.title",
            { label: "" }
        );
        const {
            contribution_uuid,
            policy_uuid,
            modulesManager,
            fetchContribution,
            fetchPolicySummary,
        } = this.props;

        if (contribution_uuid) {
            this.setState(
                (state, props) => (
                    { contribution_uuid: props.contribution_uuid }
                ),
                e => fetchContribution(
                    modulesManager,
                    contribution_uuid
                )
            )
        }
        if (policy_uuid) {
            fetchPolicySummary(modulesManager, policy_uuid);
            this.setState({
                contribution: {
                    ... this._newContribution(),
                    policy: {
                        uuid: policy_uuid,
                        value: undefined,
                    },
                },
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.fetchedContribution && !!this.props.fetchedContribution) {
            const { contribution } = this.props;
            this.setState(
            {
                contribution,
                contribution_uuid: contribution.uuid,
                lockNew: false,
                newContribution: false
            });
        } else if (prevProps.contribution_uuid && !this.props.contribution_uuid) {
            this.setState({ contribution: this._newContribution(), newContribution: true, lockNew: false, contribution_uuid: null });
        } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
            this.setState((state, props) => ({
                contribution: { ...state.contribution, clientMutationId: props.mutation.clientMutationId }
            }));
        } else if (prevProps.confirmed !== this.props.confirmed && !!this.props.confirmed && !!this.state.confirmedAction) {
            this.state.confirmedAction();
        }

        if (!prevProps.policySummary && !!this.props.policySummary) {
            this.setState({
                contribution: {
                    ... this.state.contribution,
                    policy: this.props.policySummary,
                },
            });
        }
    }



    // _add = () => {
    //     const { policy_uuid } = this.props;
    //     this.setState((state) => ({
    //         contribution: {
    //             ... this._newContribution(),
    //             policy: {
    //                 uuid: policy_uuid
    //             },
    //         },
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

    reload = () => {
        const { contribution } = this.state;
        this.props.fetchContribution(
            this.props.modulesManager,
            this.state.contribution_uuid,
            contribution.clientMutationId
        );
    }

    canSave = () => {
        const { contribution } = this.state;
        if (!contribution ||
            (contribution && (
                !contribution.payDate ||
                !contribution.payType ||
                !contribution.amount ||
                !contribution.receipt ||
                !contribution.policy ||
                (contribution.policy && !contribution.policy.uuid)
            ))) return false;
        return true;
    }

    confirmSave = () => {
        this.setState(
            { saveContribution: true },
        );
    }

    _save = (action) => {
        const { contribution } = this.state;
        if (!!action) {
            contribution.action = action;
        }
        this.setState(
            {
                lockNew: !contribution.uuid,
                saveContribution: false,
            }, // avoid duplicates
            e => this.props.save(contribution))
    }

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

    _cancelSave() {
        const { update } = this.state;
        this.setState(
            {
                saveContribution: false,
                update: !update,
            },
        );
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
            overview = false,
            readOnly = false,
            add, save, back, mutation } = this.props;
        const { contribution, saveContribution, newContribution, reset, update } = this.state;
        if (!rights.includes(RIGHT_CONTRIBUTION)) return null;
        const runningMutation = !!contribution && !!contribution.clientMutationId
        let contributedMutations = modulesManager.getContribs(CONTRIBUTION_OVERVIEW_MUTATIONS_KEY);
        for (let i = 0; i < contributedMutations.length && !runningMutation; i++) {
            runningMutation = contributedMutations[i](state)
        }
        const actions = [{
            doIt: this.reload,
            icon: <ReplayIcon />,
            onlyIfDirty: !readOnly && !runningMutation
        }];
        return (
            <div className={!!runningMutation ? classes.lockedPage : null}>
                <SaveContributionDialog
                    contribution={saveContribution && contribution}
                    onConfirm={this._save}
                    onCancel={() => this._cancelSave()} />
                <ProgressOrError progress={fetchingContribution} error={errorContribution} />
                {((!!fetchedContribution && !!contribution && contribution.uuid === contribution_uuid) || !contribution_uuid) && (
                    <Form
                        module="contribution"
                        title={!!newContribution ? "ContributionOverview.newTitle" : "ContributionOverview.title"}
                        edited_id={contribution_uuid}
                        edited={contribution}
                        reset={reset}
                        back={back}
                        // add={!!add && !newContribution ? this._add : null}
                        readOnly={readOnly || runningMutation || contribution && !!contribution.validityTo}
                        actions={actions}
                        overview={overview}
                        HeadPanel={ContributionMasterPanel}
                        contribution={contribution}
                        onEditedChanged={this.onEditedChanged}
                        canSave={this.canSave}
                        save={!!save ? this.confirmSave : null}
                        update={update}
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
    policySummary: state.contribution.policySummary,
    mutation: state.contribution.mutation,
    contribution: state.contribution.contribution,
    confirmed: state.core.confirmed,
    state: state,
})

const mapDispatchToProps = dispatch => {
    return bindActionCreators({
        fetchContribution,
        fetchPolicySummary,
        newContribution,
        createContribution,
        journalize,
        coreConfirm,
    }, dispatch);
};

export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
    injectIntl(withTheme(withStyles(styles)(ContributionForm))
    ))));