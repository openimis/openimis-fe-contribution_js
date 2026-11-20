import React, { useState } from "react";
import { useTheme, styled } from "@mui/material/styles";

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';

import { FormattedMessage, injectIntl } from "@openimis/fe-core";

const StyledButton = styled(Button)(({ theme }) => ({
  '& .primaryButton': theme?.dialog?.primaryButton ?? {},
  '& .secondaryButton': theme?.dialog?.secondaryButton ?? {},
}));

const SaveContributionDialog = ({
    contribution, onCancel, onConfirm, installmentsNumber
}) => {
    if (!contribution.policy || !contribution.policy.value) return null;
    const [step, setStep] = useState(1);
    const sumPremiums = parseInt(contribution.policy.sumPremiums || 0, 10);
    const amount = parseInt(contribution.amount, 10) + sumPremiums;
    const policyValue = parseInt(contribution.policy.value, 10);
    const max_installments = contribution?.policy?.product?.maxInstallments;

    return (
        <Dialog
            open={!!contribution}
            onClose={onCancel}
        >
            <DialogTitle>
                <FormattedMessage
                    module="contribution"
                    id="saveContributionDialog.title"
                />
            </DialogTitle>
            <DialogContent>
                {
                    amount < policyValue && (
                        <>
                            {
                                step === 1 && (
                                    <DialogContentText>
                                        <FormattedMessage
                                            module="contribution"
                                            id="saveContributionDialog.messageLower"
                                        />
                                    </DialogContentText>
                                )
                            }
                            {
                                step === 2 && (
                                    <DialogContentText>
                                        <FormattedMessage
                                            module="contribution"
                                            id="saveContributionDialog.messageLowerConfirm"
                                        />
                                    </DialogContentText>
                                )
                            }
                        </>
                    )
                }
                {
                    amount === policyValue && (
                        <DialogContentText>
                            {
                                <FormattedMessage
                                    module="contribution"
                                    id="saveContributionDialog.messageEqual"
                                />
                            }
                        </DialogContentText>
                    )
                }
                {
                    installmentsNumber >= max_installments && max_installments !== null && (
                        <DialogContentText>
                            <FormattedMessage
                                module="contribution"
                                id="contribution.saveContributionDialog.maxINstallments.message"
                            />
                        </DialogContentText>
                    )
                }
            </DialogContent>
            <DialogActions>

                {
                    amount === policyValue && (
                        <StyledButton onClick={e => onConfirm()} className="primaryButton" autoFocus>
                            <FormattedMessage module="contribution" id="saveContributionDialog.ok.button" />
                        </StyledButton>
                    )
                }

                {
                    amount < policyValue && (
                        <>
                            {
                                step === 1 && (
                                    <StyledButton onClick={e => setStep(2)} className="primaryButton" autoFocus>
                                        <FormattedMessage module="contribution" id="saveContributionDialog.ok.button" />
                                    </StyledButton>
                                )
                            }
                            {
                                step === 2 && (
                                    <>
                                        <StyledButton onClick={e => onConfirm('ENFORCE')} className="primaryButton" autoFocus>
                                            <FormattedMessage module="contribution" id="saveContributionDialog.yes.button" />
                                        </StyledButton>
                                        <StyledButton onClick={e => onConfirm('WAIT')} className="primaryButton" autoFocus>
                                            <FormattedMessage module="contribution" id="saveContributionDialog.no.button" />
                                        </StyledButton>
                                    </>
                                )
                            }
                        </>
                    )
                }
                {
                    step === 1 && (
                        <StyledButton onClick={onCancel} className="secondaryButton" >
                            <FormattedMessage module="core" id="cancel" />
                        </StyledButton>
                    )
                }
            </DialogActions>
        </Dialog>
    );
}

export { StyledButton };
export default injectIntl(SaveContributionDialog);
