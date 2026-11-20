import React, { Component } from 'react';
import _debounce from 'lodash/debounce';

import { Grid, Checkbox, FormControlLabel } from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';
import {
  GRID_RESPONSIVE_STANDARD,
  GRID_RESPONSIVE_SMALL,
  GRID_RESPONSIVE_LARGE,
  GRID_RESPONSIVE_FULL,
  GRID_RESPONSIVE_HALF,
  injectIntl,
} from '@openimis/fe-core';

import {
  withModulesManager,
  AmountInput,
  PublishedComponent,
  ControlledField,
  TextInput,
  formatMessage,
  decodeId,
} from '@openimis/fe-core';

const StyledSection = styled('section')(({ theme }) => ({
  '& .form': {
    padding: 0,
  },
  '& .item': {
    padding: theme?.spacing?.(1),
  },
  '& .dialogTitle': theme?.dialog?.title ?? {},
  '& .dialogContent': theme?.dialog?.content ?? {},
  '& .paperDivider': theme?.paper?.divider ?? {},
}));

class ContributionFilter extends Component {
  debouncedOnChangeFilter = _debounce(
    this.props.onChangeFilters,
    this.props.modulesManager.getConf('fe-contribution', 'debounceTime', 200),
  );

  _filterValue = (k) => {
    const { filters } = this.props;
    return !!filters && !!filters[k] ? filters[k].value : null;
  };

  _filterTextFieldValue = (k) => {
    const { filters } = this.props;
    return !!filters && !!filters[k] ? filters[k].value : '';
  };

  _onChangeCheckbox = (key, value) => {
    let filters = [
      {
        id: key,
        value: value,
        filter: `${key}: ${value}`,
      },
    ];
    this.props.onChangeFilters(filters);
  };

  render() {
    const { filters, onChangeFilters, intl } = this.props;
    return (
      <StyledSection className='form'>
        <Grid container>
          <ControlledField
            module='contribution'
            id='ContributionFilter.location'
            field={
              <Grid size={GRID_RESPONSIVE_FULL}>
                <PublishedComponent
                  pubRef='location.DetailedLocationFilter'
                  withNull={true}
                  filters={filters}
                  onChangeFilters={onChangeFilters}
                  anchor='parentLocation'
                  split
                />
              </Grid>
            }
          />
          <ControlledField
            module='contribution'
            id='ContributionFilter.payDate'
            field={
              <Grid size={GRID_RESPONSIVE_STANDARD}>
                <Grid container>
                  <Grid size={6} className='item'>
                    <PublishedComponent
                      pubRef='core.DatePicker'
                      value={this._filterValue('payDateFrom')}
                      module='contribution'
                      label='contribution.payDateFrom'
                      onChange={(d) =>
                        onChangeFilters([
                          {
                            id: 'payDateFrom',
                            value: d,
                            filter: `payDate_Gte: "${d}"`,
                          },
                        ])
                      }
                    />
                  </Grid>
                  <Grid size={6} className='item'>
                    <PublishedComponent
                      pubRef='core.DatePicker'
                      value={this._filterValue('payDateTo')}
                      module='contribution'
                      label='contribution.payDateTo'
                      onChange={(d) =>
                        onChangeFilters([
                          {
                            id: 'payDateTo',
                            value: d,
                            filter: `payDate_Lte: "${d}"`,
                          },
                        ])
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
            }
          />
          <ControlledField
            module='contribution'
            id='ContributionFilter.payer'
            field={
              <Grid size={GRID_RESPONSIVE_STANDARD} className='item'>
                <PublishedComponent
                  pubRef='payer.PayerPicker'
                  withNull={true}
                  value={this._filterValue('payer')}
                  onChange={(v) =>
                    onChangeFilters([
                      {
                        id: 'payer',
                        value: v,
                        filter: `payerId: "${
                          v && v.id ? decodeId(v.id) : null
                        }"`,
                      },
                    ])
                  }
                />
              </Grid>
            }
          />
          {['amount_Gte', 'amount_Lte'].map((a) => (
            <ControlledField
              module='contribution'
              id='ContributionFilter.amountUnder'
              key={a}
              field={
                <Grid size={GRID_RESPONSIVE_STANDARD} className='item'>
                  <AmountInput
                    module='contribution'
                    label={`contribution.${a}`}
                    value={filters[a] && filters[a]['value']}
                    onChange={(v) =>
                      this.debouncedOnChangeFilter([
                        {
                          id: a,
                          value: !v ? null : v,
                          filter: !!v ? `${a}: "${v}"` : null,
                        },
                      ])
                    }
                  />
                </Grid>
              }
            />
          ))}
        </Grid>
        <Grid container>
          <ControlledField
            module='contribution'
            id='ContributionFilter.payType'
            field={
              <Grid size={GRID_RESPONSIVE_STANDARD} className='item'>
                <PublishedComponent
                  pubRef='contribution.PremiumPaymentTypePicker'
                  withNull={true}
                  value={this._filterValue('payType')}
                  onChange={(v) =>
                    onChangeFilters([
                      {
                        id: 'payType',
                        value: v,
                        filter: !!v ? `payType: "${v}"` : null,
                      },
                    ])
                  }
                />
              </Grid>
            }
          />
          <ControlledField
            module='contribution'
            id='contribution.category'
            field={
              <Grid size={GRID_RESPONSIVE_STANDARD} className='item'>
                <PublishedComponent
                  pubRef='contribution.PremiumCategoryPicker'
                  withNull={true}
                  value={this._filterValue('isPhotoFee')}
                  onChange={(c) =>
                    onChangeFilters([
                      {
                        id: 'isPhotoFee',
                        value: c,
                        filter: `isPhotoFee: ${c !== 'contribution'}`,
                      },
                    ])
                  }
                />
              </Grid>
            }
          />
          <ControlledField
            module='contribution'
            id='ContributionFilter.receipt'
            field={
              <Grid size={GRID_RESPONSIVE_STANDARD} className='item'>
                <TextInput
                  module='contribution'
                  label='contribution.receipt'
                  name='receipt'
                  value={this._filterTextFieldValue('receipt')}
                  onChange={(v) =>
                    this.debouncedOnChangeFilter([
                      {
                        id: 'receipt',
                        value: v,
                        filter: `receipt_Icontains: "${v}"`,
                      },
                    ])
                  }
                />
              </Grid>
            }
          />
          <ControlledField
            module='contribution'
            id='ContributionFilter.showHistory'
            field={
              <Grid size={GRID_RESPONSIVE_SMALL} className='item'>
                <FormControlLabel
                  control={
                    <Checkbox
                      color='primary'
                      checked={!!this._filterValue('showHistory')}
                      onChange={(event) =>
                        this._onChangeCheckbox(
                          'showHistory',
                          event.target.checked,
                        )
                      }
                    />
                  }
                  label={formatMessage(intl, 'contribution', 'showHistory')}
                />
              </Grid>
            }
          />
        </Grid>
      </StyledSection>
    );
  }
}

export { ContributionFilter };

export { StyledSection };
export default withModulesManager(injectIntl(ContributionFilter));
