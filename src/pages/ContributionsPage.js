import React, { Component } from "react";
import { connect } from "react-redux";
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { historyPush, withModulesManager, withHistory, withTooltip, formatMessage } from "@openimis/fe-core"
import ContributionSearcher from "../components/ContributionSearcher";

import { RIGHT_CONTRIBUTION_ADD } from "../constants";

const styles = theme => ({
    page: theme.page,
    fab: theme.fab
});


class ContributionsPage extends Component {

    onDoubleClick = (f, newTab = false) => {
        historyPush(this.props.modulesManager, this.props.history, "contribution.contributionOverview", [f.uuid], newTab)
    }

    onAdd = () => {
        historyPush(this.props.modulesManager, this.props.history, "contribution.contribution");
    }

    render() {
        const { intl, classes, rights } = this.props;
        return (
            <div className={classes.page}>
                <ContributionSearcher
                    cacheFiltersKey="contributionsPageFiltersCache"
                    onDoubleClick={this.onDoubleClick}
                />
                {rights.includes(RIGHT_CONTRIBUTION_ADD) &&
                    withTooltip(
                        <div className={classes.fab}>
                            <Fab color="primary" onClick={this.onAdd}>
                                <AddIcon />
                            </Fab>
                        </div>,
                        formatMessage(intl, "contribution", "addNewContributionTooltip")
                    )
                }
            </div>
        )
    }
}

const mapStateToProps = state => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
})

export default injectIntl(withModulesManager(
    withHistory(connect(mapStateToProps)(withTheme(withStyles(styles)(ContributionsPage))))
));