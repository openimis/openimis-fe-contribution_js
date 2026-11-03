import React, { Component } from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";

import { Paper, Grid, Typography, Divider, Button } from "@mui/material";
import { styled } from "@mui/material/styles";

import {
    formatMessage,
    historyPush,
    withModulesManager,
    withHistory,
    withTooltip,
    GetIconComponent,
    GRID_RESPONSIVE_FULL,
} from "@openimis/fe-core";

import { RIGHT_CONTRIBUTION_ADD } from "../constants";

const AddIcon = GetIconComponent("Add");

const StyledPaper = styled(Paper)(({ theme }) => ({
    ...theme?.paper?.paper ?? {},
    '& .paperHeader': theme?.paper?.header ?? {},
    '& .paperHeaderAction': theme?.paper?.action ?? {},
    '& .tableTitle': theme?.table?.title ?? {},
    '& .item': theme?.paper?.item ?? {},
}));

/**
 * Panel contributed to `policy.Policy.panels`: offers a shortcut from the policy
 * page to the contribution creation page for that policy.
 */
class PolicyContributionsPanel extends Component {

    addNewPremium = () => {
        const { modulesManager, history, edited } = this.props;
        historyPush(modulesManager, history, "contribution.contributionNew", [edited.uuid]);
    };

    render() {
        const { intl, edited, rights } = this.props;
        // only on a saved, non-deleted policy, for users allowed to add contributions
        if (!edited?.uuid || !!edited.validityTo) return null;
        if (!rights.includes(RIGHT_CONTRIBUTION_ADD)) return null;

        const button = (
            <Button
                onClick={this.addNewPremium}
                startIcon={<AddIcon />}
            >
                {formatMessage(intl, "contribution", "addNewPremium.buttonText")}
            </Button>
        );

        return (
            <Grid size={GRID_RESPONSIVE_FULL}>
                <StyledPaper>
                    <Grid container alignItems="center" direction="row" className="paperHeader">
                        <Grid size={8}>
                            <Typography className="tableTitle">
                                {formatMessage(intl, "contribution", "PolicyContributionsPanel.title")}
                            </Typography>
                        </Grid>
                        <Grid size={4}>
                            <Grid container direction="row" justifyContent="flex-end">
                                <Grid className="paperHeaderAction">
                                    {withTooltip(
                                        button,
                                        formatMessage(intl, "contribution", "addNewPremium.tooltip")
                                    )}
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Divider />
                </StyledPaper>
            </Grid>
        );
    }
}

const mapStateToProps = state => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export { PolicyContributionsPanel };

export default withModulesManager(
    withHistory(
        injectIntl(
            connect(mapStateToProps)(PolicyContributionsPanel)
        )
    )
);
