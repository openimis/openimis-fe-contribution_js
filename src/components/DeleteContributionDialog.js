import React, { Component } from "react";
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from "@material-ui/core/styles";

const styles = theme => ({
    primaryButton: theme.dialog.primaryButton,
    secondaryButton: theme.dialog.secondaryButton,
})

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@material-ui/core';

import { FormattedMessage } from "@openimis/fe-core";


class DeleteContributionDialog extends Component {

    render() {
        const { classes, contribution, onCancel, onConfirm } = this.props;
        return (
            <Dialog
                open={!!contribution}
                onClose={onCancel}
            >
                <DialogTitle>
                    <FormattedMessage
                        module="contribution"
                        id="deleteContributionDialog.title"
                    />
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <FormattedMessage
                            module="contribution"
                            id="deleteContributionDialog.message"
                        />
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={e => onConfirm()} className={classes.primaryButton} autoFocus>
                        <FormattedMessage module="contribution" id="deleteContributionDialog.yes.button" />
                    </Button>
                    <Button onClick={onCancel} className={classes.secondaryButton} >
                        <FormattedMessage module="core" id="cancel"/>
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }
}

export default injectIntl(withTheme(withStyles(styles)(DeleteContributionDialog)));