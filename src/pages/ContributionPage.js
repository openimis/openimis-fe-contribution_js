import React, { Component } from "react";
import { injectIntl } from 'react-intl';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
    formatMessageWithValues, withModulesManager, withHistory, historyPush,
} from "@openimis/fe-core";
import ContributionForm from "../components/ContributionForm";
import { createContribution, updateContribution } from "../actions";
import { RIGHT_CONTRIBUTION_ADD, RIGHT_CONTRIBUTION_EDIT } from "../constants";

const styles = theme => ({
    page: theme.page,
});

class ContributionPage extends Component {

    // add = () => {
    //     historyPush(this.props.modulesManager, this.props.history, "contribution.contributionNew")
    // }

    save = (contribution) => {
        if (!contribution.uuid) {
            this.props.createContribution(
                this.props.modulesManager,
                contribution,
                formatMessageWithValues(
                    this.props.intl,
                    "contribution",
                    "CreateContribution.mutationLabel",
                )
            );
        } else {
            this.props.updateContribution(
                this.props.modulesManager,
                contribution,
                formatMessageWithValues(
                    this.props.intl,
                    "contribution",
                    "UpdateContribution.mutationLabel",
                )
            );

        }
    }

    render() {
        const { classes, modulesManager, history, rights, contribution_uuid,policy_uuid, overview } = this.props;
        if (!rights.includes(RIGHT_CONTRIBUTION_EDIT)) return null;

        return (
            <div className={classes.page}>
                <ContributionForm
                    overview={overview}
                    contribution_uuid={contribution_uuid}
                    policy_uuid={policy_uuid}
                    back={e => {
                        // historyPush(modulesManager, history, "contribution.contributions")
                        window.history.back();
                    }}
                    // add={rights.includes(RIGHT_CONTRIBUTION_ADD) ? this.add : null}
                    save={rights.includes(RIGHT_CONTRIBUTION_EDIT) ? this.save : null}
                />
            </div>
        )
    }
}

const mapStateToProps = (state, props) => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
    contribution_uuid: props.match.params.contribution_uuid,
    policy_uuid: props.match.params.policy_uuid,
})

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ createContribution, updateContribution }, dispatch);
};

export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
    injectIntl(withTheme(withStyles(styles)(ContributionPage))
    ))));