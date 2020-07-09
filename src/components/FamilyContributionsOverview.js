import React, { Component, Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import _ from "lodash";
import { Paper } from "@material-ui/core";
import {
    formatMessage, Table
} from "@openimis/fe-core";


const styles = theme => ({
    paper: theme.paper.paper,
    paperHeader: theme.paper.header,
    paperHeaderAction: theme.paper.action,
    fab: theme.fab,
});

class FamilyContributionsOverview extends Component {

    headers = [];

    formatters = [];

    render() {
        const { intl, classes, edited, readOnly = false } = this.props;
        return (
            <Paper className={classes.paper}>
                <Table
                    module="contribution"
                    header={formatMessage(intl, "contribution", "FamilyContributions")}
                    headers={this.headers}
                    itemFormatters={this.formatters}
                    items={[]}
                />
            </Paper>
        )
    }
}

export default injectIntl(withTheme(withStyles(styles)(FamilyContributionsOverview)));