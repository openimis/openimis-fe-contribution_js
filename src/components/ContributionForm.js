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

import { fetchContribution, newContribution, createContribution } from "../actions";
import ContributionMasterPanel from "./ContributionMasterPanel";

const styles = theme => ({
    lockedPage: theme.page.locked
});

const CONTRIBUTION_OVERVIEW_MUTATIONS_KEY = "contribution.ContributionOverview.mutations"

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

    componentDidUpdate(prevProps) {
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

    reload = () => {
        this.props.fetchContribution(
            this.props.modulesManager,
            this.state.contribution_uuid,
            !!this.state.contribution.headInsuree ? this.state.contribution.headInsuree.chfId : null
        );
    }

    canSave = () => {
        if (!this.state.contribution.payType) return false;
        return true;
    }

    _save = (contribution_uuid) => {
        this.setState(
            { lockNew: !contribution_uuid.uuid }, // avoid duplicates
            e => this.props.save(contribution_uuid))
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
        const { contribution } = this.state;
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
                        overview={overview}
                        HeadPanel={ContributionMasterPanel}
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