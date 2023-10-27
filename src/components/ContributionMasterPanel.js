import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

import { withTheme, withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';

import {
  withHistory,
  withModulesManager,
  AmountInput,
  TextInput,
  ValidatedTextInput,
  PublishedComponent,
  formatMessageWithValues,
  FormPanel,
} from '@openimis/fe-core';
import {
  validateReceipt,
  clearReceiptValidation,
  setReceiptValid,
} from '../actions';
import { DEFAULT } from '../constants';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
});

class ContributionMasterPanel extends FormPanel {
  constructor(props) {
    super();
    this.isMultiplePaymentsAllowed = props.modulesManager.getConf(
      'fe-contribution',
      'isMultiplePaymentsAllowed',
      DEFAULT.MULTIPLE_PAYMENTS_ALLOWED
    );
  }

  shouldValidate = (inputValue) => {
    const { savedCode } = this.props;
    const shouldValidate = inputValue !== savedCode;
    return shouldValidate;
  };

  render() {
    const {
      intl,
      classes,
      edited,
      readOnly,
      isReceiptValid,
      isReceiptValidating,
      receiptValidationError,
    } = this.props;
    const productCode = edited?.policy?.product?.code;

    let balance =
      Number(edited?.policy?.value) -
      edited?.policy?.sumPremiums -
      (edited?.amount || 0);
    return (
      <Fragment>
        {!!edited && !!edited.policy && !!edited.policy.value && (
          <Grid container className={classes.item}>
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module='contribution'
                label='contribution.policy.name'
                readOnly={true}
                value={edited.policy?.product?.name || ''}
              />
            </Grid>
            <Grid item xs={3} className={classes.item}>
              <AmountInput
                module='contribution'
                label='contribution.policy.value'
                required
                readOnly={true}
                value={edited.policy.value || ''}
              />
            </Grid>
            <Grid item xs={3} className={classes.item}>
              <PublishedComponent
                pubRef='core.DatePicker'
                value={edited.policy.startDate || ''}
                module='contribution'
                label='contribution.policy.startDate'
                readOnly={true}
              />
            </Grid>
            <Grid item xs={3} className={classes.item}>
              <PublishedComponent
                pubRef='core.DatePicker'
                value={edited.policy.expiryDate || ''}
                module='contribution'
                label='contribution.policy.expiryDate'
                readOnly={true}
              />
            </Grid>
          </Grid>
        )}
        <Grid container className={classes.item}>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef='core.DatePicker'
              value={!edited ? '' : edited.payDate}
              module='contribution'
              required
              label='contribution.payDate'
              readOnly={readOnly}
              onChange={(c) => this.updateAttribute('payDate', c)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef='payer.PayerPicker'
              withNull={true}
              readOnly={readOnly}
              value={!edited ? '' : edited.payer}
              onChange={(p) => this.updateAttribute('payer', p)}
            />
          </Grid>

          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef='contribution.PremiumPaymentTypePicker'
              withNull={true}
              required
              readOnly={readOnly}
              value={!edited ? '' : edited.payType}
              onChange={(c) => this.updateAttribute('payType', c)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef='contribution.PremiumCategoryPicker'
              withNull={false}
              readOnly={readOnly}
              value={edited?.isPhotoFee ? 'photoFee' : 'contribution'}
              onChange={(c) => {
                return this.updateAttribute('isPhotoFee', c === 'photoFee');
              }}
            />
          </Grid>

          <Grid item xs={3} className={classes.item}>
            <ValidatedTextInput
              action={validateReceipt}
              clearAction={clearReceiptValidation}
              setValidAction={setReceiptValid}
              codeTakenLabel={formatMessageWithValues(
                intl,
                'contribution',
                'alreadyUsed',
                { productCode }
              )}
              isValid={isReceiptValid}
              isValidating={isReceiptValidating}
              itemQueryIdentifier='code'
              label='contribution.receipt'
              module='contribution'
              onChange={(receipt) => this.updateAttribute('receipt', receipt)}
              readOnly={readOnly}
              required={true}
              additionalQueryArgs={{ policyUuid: edited?.policy?.uuid }}
              shouldValidate={this.shouldValidate}
              validationError={receiptValidationError}
              value={edited?.receipt ?? ''}
            />
          </Grid>

          <Grid item xs={3} className={classes.item}>
            <AmountInput
              module='contribution'
              label='contribution.amount'
              required
              readOnly={readOnly || !this.isMultiplePaymentsAllowed}
              value={edited?.amount ?? 0}
              max={edited.policy?.value}
              displayZero={true}
              onChange={(c) => this.updateAttribute('amount', c)}
            />
          </Grid>

          <Grid item xs={3} className={classes.item}>
            <AmountInput
              module='policy'
              label='Policy.sumPremiums'
              readOnly={true}
              value={edited?.policy?.sumPremiums || 0}
              displayZero={true}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <AmountInput
              name='balance'
              module='policy'
              label='policies.balance'
              readOnly={true}
              value={balance || 0}
              displayZero={true}
            />
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

const mapStateToProps = (store) => ({
  isReceiptValidating:
    store.contribution?.validationFields?.contributionReceipt.isValidating,
  isReceiptValid:
    store.contribution?.validationFields?.contributionReceipt.isValid,
  receiptValidationError:
    store.contribution?.validationFields?.contributionReceipt.validationError,
  savedCode: store.contribution.contribution?.receipt,
});

export default withModulesManager(
  withHistory(
    injectIntl(
      connect(mapStateToProps)(
        withTheme(withStyles(styles)(ContributionMasterPanel))
      )
    )
  )
);
