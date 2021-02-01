import React, { Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import {
    Grid,
} from "@material-ui/core";
import {
    withHistory,
    withModulesManager,
    AmountInput,
    TextInput,
    PublishedComponent,
    FormPanel
} from "@openimis/fe-core";


const styles = theme => ({
    tableTitle: theme.table.title,
    item: theme.paper.item,
    fullHeight: {
        height: "100%"
    },
});

class ContributionMasterPanel extends FormPanel {
    render() {
        const {
            classes,
            edited,
            readOnly,
        } = this.props;
        return (
            <Fragment>
                <Grid container className={classes.item}>
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent pubRef="core.DatePicker"
                            value={!edited ? "" : edited.payDate}
                            module="contribution"
                            required
                            label="contribution.payDate"
                            readOnly={readOnly}
                            onChange={c => this.updateAttribute('payDate', c)}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent
                            pubRef="payer.PayerPicker"
                            withNull={true}
                            readOnly={readOnly}
                            value={!edited ? "" : edited.payer}
                            onChange={p => this.updateAttribute('payer', p)}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <AmountInput
                            module="contribution"
                            label="contribution.amount"
                            required
                            readOnly={readOnly}
                            value={!edited ? "" : edited.amount}
                            onChange={c => this.updateAttribute('amount', c)}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent
                            pubRef="contribution.PremiumPaymentTypePicker"
                            withNull={true}
                            required
                            readOnly={readOnly}
                            value={!edited ? "" : edited.payType}
                            onChange={c => this.updateAttribute('payType', c)}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <TextInput
                            module="contribution"
                            label="contribution.receipt"
                            required
                            readOnly={readOnly}
                            value={!edited ? "" : edited.receipt}
                            onChange={c => this.updateAttribute('receipt', c)}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent
                            pubRef="contribution.PremiumCategoryPicker"
                            withNull={false}
                            readOnly={readOnly}
                            value={edited && edited.isPhotoFee ? 'photoFee' : 'contribution'}
                            onChange={c => {
                                return this.updateAttribute('isPhotoFee', c === 'photoFee');
                            }}
                        />
                    </Grid>
                </Grid>
            </Fragment>
        );
    }
}

export default withModulesManager(withHistory(injectIntl(withTheme(
    withStyles(styles)(ContributionMasterPanel)
))));