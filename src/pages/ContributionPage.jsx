import React, { Component } from "react";
import { injectIntl } from 'react-intl';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { useTheme, styled } from "@mui/material/styles";
import {
    formatMessageWithValues, withModulesManager, withHistory,
} from "@openimis/fe-core";
import ContributionForm from "../components/ContributionForm";
import { createContribution, updateContribution } from "../actions";
import { RIGHT_CONTRIBUTION_EDIT } from "../constants";

const StyledDiv = styled("div")(({ theme }) => ({
  ...theme?.page ?? {},
}));

class ContributionPage extends Component {


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
        const { rights, contribution_uuid,policy_uuid, overview} = this.props;
        if (!rights.includes(RIGHT_CONTRIBUTION_EDIT)) return null;

        return (
            <StyledDiv className="page">
                <ContributionForm
                    overview={overview}
                    contribution_uuid={contribution_uuid}
                    policy_uuid={policy_uuid}
                    back={e => {
                        window.history.back();
                    }}
                    save={rights.includes(RIGHT_CONTRIBUTION_EDIT) ? this.save : null}
                />
            </StyledDiv>
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

export { StyledDiv };
export { ContributionPage };
export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
    injectIntl(ContributionPage)
    )));