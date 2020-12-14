import React, { Component } from "react";
import _debounce from "lodash/debounce";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { Grid } from "@material-ui/core";
import {
    withModulesManager,
    AmountInput,
    PublishedComponent,
    ControlledField,
    TextInput
} from "@openimis/fe-core";

const styles = theme => ({
    dialogTitle: theme.dialog.title,
    dialogContent: theme.dialog.content,
    form: {
        padding: 0
    },
    item: {
        padding: theme.spacing(1)
    },
    paperDivider: theme.paper.divider,
});

const INSUREE_FILTER_CONTRIBUTION_KEY = "insuree.Filter";

class ContributionFilter extends Component {

    state = {
        showHistory: false,
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (
            prevProps.filters["showHistory"] !== this.props.filters["showHistory"] &&
            !!this.props.filters["showHistory"] &&
            this.state.showHistory !== this.props.filters["showHistory"]["value"]
        ) {
            this.setState((state, props) => ({ showHistory: props.filters["showHistory"]["value"] }))
        }
    }

    debouncedOnChangeFilter = _debounce(
        this.props.onChangeFilters,
        this.props.modulesManager.getConf("fe-insuree", "debounceTime", 800)
    )

    _filterValue = k => {
        const { filters } = this.props;
        return !!filters && !!filters[k] ? filters[k].value : null
    }

    _onChangeShowHistory = () => {
        let filters = [
            {
                id: "showHistory",
                value: !this.state.showHistory,
                filter: `showHistory: ${!this.state.showHistory}`
            }
        ];
        this.props.onChangeFilters(filters);
        this.setState((state) => ({
            showHistory: !state.showHistory
        }));
    }

    render() {
        const { intl, classes, filters, onChangeFilters } = this.props;
        return (
            <Grid container className={classes.form}>
                <ControlledField module="contribution" id="ContributionFilter.payDate" field={
                    <Grid item xs={3}>
                        <Grid container>
                            <Grid item xs={6} className={classes.item}>
                                <PublishedComponent pubRef="core.DatePicker"
                                    value={this._filterValue("payDateFrom")}
                                    module="contribution"
                                    label="contribution.premium.payDateFrom"
                                    onChange={d => onChangeFilters([
                                        {
                                            id: "payDateFrom",
                                            value: d,
                                            filter: `payDate_Gte: "${d}"`
                                        }
                                    ])}
                                />
                            </Grid>
                            <Grid item xs={6} className={classes.item}>
                                <PublishedComponent pubRef="core.DatePicker"
                                    value={this._filterValue("payDateTo")}
                                    module="contribution"
                                    label="contribution.premium.payDateTo"
                                    onChange={d => onChangeFilters([
                                        {
                                            id: "payDateTo",
                                            value: d,
                                            filter: `payDate_Lte: "${d}"`
                                        }
                                    ])}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                } />
                <ControlledField module="contribution" id="ContributionFilter.payer" field={
                    <Grid item xs={2} className={classes.item}>
                        <TextInput
                            module="contribution"
                            label="contribution.premium.payer"
                            name="payer"
                            value={this._filterValue("payer")}
                            onChange={v => this.debouncedOnChangeFilter([
                                {
                                    id: "payer",
                                    value: v,
                                    filter: `payer_Name_Icontains: "${v}"`
                                }
                            ])}
                        />
                    </Grid>
                } />
                {["amount_Gte", "amount_Lte"].map(a => (
                    <ControlledField module="contribution" id="ContributionFilter.amountUnder" key={a} field={
                        <Grid item xs={1} className={classes.item}>
                            <AmountInput
                                module="contribution" label={`contribution.premium.${a}`}
                                value={(filters[a] && filters[a]['value'])}
                                onChange={v => this.debouncedOnChangeFilter([

                                    {
                                        id: a,
                                        value: (!v ? null : v),
                                        filter: !!v ? `${a}: ${v}` : null
                                    }
                                ])}
                            />
                        </Grid>
                    } />
                ))}
                <ControlledField module="contribution" id="ContributionFilter.payType" field={
                    <Grid item xs={2} className={classes.item}>
                        <PublishedComponent
                            pubRef="contribution.PremiumPaymentTypePicker"
                            withNull={true}
                            value={this._filterValue("payType")}
                            onChange={v => onChangeFilters([
                                {
                                    id: "payType",
                                    value: v,
                                    filter: !!v ? `payType: "${v}"` : null
                                }
                            ])}
                        />
                    </Grid>
                } />
                <ControlledField module="contribution" id="contribution.premium.category" field={
                    <Grid item xs={2} className={classes.item}>
                        <PublishedComponent
                            pubRef="contribution.PremiumCategoryPicker"
                            withNull={true}
                            value={this._filterValue("isPhotoFee")}
                            onChange={c => onChangeFilters([
                                {
                                    id: "isPhotoFee",
                                    value: c,
                                    filter: `isPhotoFee: ${c !== 'contribution'}`
                                }
                            ])}
                        />
                    </Grid>
                } />
                <ControlledField module="contribution" id="ContributionFilter.receipt" field={
                    <Grid item xs={1} className={classes.item}>
                        <TextInput
                            module="contribution"
                            label="contribution.premium.receipt"
                            name="receipt"
                            value={this._filterValue("receipt")}
                            onChange={v => this.debouncedOnChangeFilter([
                                {
                                    id: "receipt",
                                    value: v,
                                    filter: `receipt_Icontains: "${v}"`
                                }
                            ])}
                        />
                    </Grid>
                } />
            </Grid>
        )
    }
}

export default withModulesManager(injectIntl((withTheme(withStyles(styles)(ContributionFilter)))));