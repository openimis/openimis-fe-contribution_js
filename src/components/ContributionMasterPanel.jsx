import React from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";

import { useTheme, styled } from "@mui/material/styles";
import { Grid } from "@mui/material";

import {
  withHistory,
  withModulesManager,
  AmountInput,
  TextInput,
  ValidatedTextInput,
  PublishedComponent,
  formatMessageWithValues,
  formatMessage,
  FormPanel,
  WarningBox,
  GRID_RESPONSIVE_STANDARD,
  GRID_RESPONSIVE_FULL,
} from "@openimis/fe-core";
import {
  validateReceipt,
  clearReceiptValidation,
  setReceiptValid,
} from "../actions";
import { policyRemainingValue } from "../utils";

const StyledGrid = styled(Grid)(({ theme }) => ({
  '& .tableTitle': theme?.table?.title ?? {},
  '& .item': theme?.paper?.item ?? {},
  '& .fullHeight': {
    height: "100%",
  },
}));

class ContributionMasterPanel extends FormPanel {
  shouldValidate = (inputValue) => {
    const { savedCode } = this.props;
    const shouldValidate = inputValue !== savedCode;
    return shouldValidate;
  };

  renderWarning = () => {
    const { intl, edited } = this.props;

    if (edited.id) {
      return null;
    }

    const remaining = policyRemainingValue(edited.policy);

    if (remaining !== null && edited.amount > remaining) {
      return (
        <WarningBox
          title={formatMessage(intl, 'contribution', 'warning.header')}
          description={formatMessage(
            intl,
            'contribution',
            'warning.paid.exceedsPolicyValue'
          )}
          size={12}
        />
      );
    }

    if (remaining === 0) {
      return (
        <WarningBox
          title={formatMessage(intl, 'contribution', 'warning.header')}
          description={formatMessage(
            intl,
            'contribution',
            'warning.paid.description'
          )}
          size={12}
        />
      );
    }

    return null;
  };

  render() {
    const {
      intl,
      edited,
      readOnly,
      isReceiptValid,
      isReceiptValidating,
      receiptValidationError,
      contributionTotalCount,
    } = this.props;
    const productCode = edited?.policy?.product?.code;

    const maxInstallments = edited?.policy?.product?.maxInstallments;
    const remainingValue = policyRemainingValue(edited?.policy);
    const balance =
      remainingValue === null ? null : remainingValue - (edited?.amount || 0);
      return (
        <StyledGrid container className="item" spacing={2}>
          {!!edited && !!edited.policy && !!edited.policy.value && (
            <>
              {this.renderWarning()}
              <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
                <TextInput
                  module='contribution'
                  label='contribution.policy.name'
                  readOnly={true}
                  value={
                    (edited.policy.product && edited.policy.product.name) || ''
                  }
                />
              </Grid>
              <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
                <AmountInput
                  module='contribution'
                  label='contribution.policy.value'
                  required
                  readOnly={true}
                  value={edited.policy.value || ''}
                />
              </Grid>
              <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
                <PublishedComponent
                  pubRef='core.DatePicker'
                  value={edited.policy.startDate || ''}
                  module='contribution'
                  label='contribution.policy.startDate'
                  readOnly={true}
                />
              </Grid>
              <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
                <PublishedComponent
                  pubRef='core.DatePicker'
                  value={edited.policy.expiryDate || ''}
                  module='contribution'
                  label='contribution.policy.expiryDate'
                  readOnly={true}
                />
              </Grid>
              {edited.policy?.family?.uuid && (
                <>
                  <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
                    <TextInput
                      module='contribution'
                      label='contribution.familySummaries.insuranceNo'
                      readOnly={true}
                      value={edited.policy.family?.headInsuree?.chfId}
                    />
                  </Grid>
                  <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
                    <TextInput
                      module='contribution'
                      label='contribution.familySummaries.lastName'
                      readOnly={true}
                      value={edited.policy.family?.headInsuree?.lastName}
                    />
                  </Grid>
                  <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
                    <TextInput
                      module='contribution'
                      label='contribution.familySummaries.otherNames'
                      readOnly={true}
                      value={edited.policy.family?.headInsuree?.otherNames}
                    />
                  </Grid>
                  <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
                    <PublishedComponent
                      pubRef='core.DatePicker'
                      value={edited.policy.family?.headInsuree?.dob}
                      module='contribution'
                      label='contribution.familySummaries.dob'
                      readOnly={true}
                    />
                  </Grid>
                </>
              )}
            </>
          )}
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <PublishedComponent
              pubRef='core.DatePicker'
              value={edited?.payDate}
              module='contribution'
              label='contribution.payDate'
              required
              readOnly={readOnly}
              onChange={(payDate) => this.updateAttribute('payDate', payDate)}
            />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <PublishedComponent
              pubRef='contribution.PremiumPaymentTypePicker'
              withNull={false}
              value={edited?.payType}
              module='contribution'
              label='contribution.payType'
              required
              readOnly={readOnly}
              onChange={(payType) => this.updateAttribute('payType', payType)}
            />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <PublishedComponent
              pubRef='payer.PayerPicker'
              withNull
              value={edited?.payer}
              module='contribution'
              label='contribution.payer'
              readOnly={readOnly}
              onChange={(payer) => this.updateAttribute('payer', payer)}
            />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
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
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <AmountInput
              module='contribution'
              label='contribution.amount'
              required
              readOnly={
                readOnly ||
                maxInstallments === 0 ||
                maxInstallments === 1 ||
                (!edited.id &&
                  maxInstallments > 1 &&
                  contributionTotalCount === maxInstallments - 1)
              }
              value={edited.amount}
              max={
                !edited.id && remainingValue !== null ? remainingValue : null
              }
              displayZero={true}
              onChange={(c) => this.updateAttribute('amount', c)}
            />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <AmountInput
              module='policy'
              label='Policy.sumPremiums'
              readOnly={true}
              value={edited?.policy?.sumPremiums || 0}
              displayZero={true}
            />
          </Grid>
          <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
            <AmountInput
              name='balance'
              module='policy'
              label='policies.balance'
              readOnly={true}
              value={balance || 0}
              displayZero={true}
            />
          </Grid>
        </StyledGrid>
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
  contributionTotalCount: store.contribution.policiesPremiumsPageInfo?.totalCount ?? 0,
});

export { ContributionMasterPanel };

export { StyledGrid };
export default withModulesManager(
  withHistory(
    injectIntl(
      connect(mapStateToProps)(ContributionMasterPanel)
    )
  )
);
