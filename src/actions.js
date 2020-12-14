import {
    baseApiUrl, graphql, formatQuery, formatPageQuery, formatPageQueryWithCount,
    formatMutation, decodeId, openBlob, formatJsonField
} from "@openimis/fe-core";
import _ from "lodash";
import _uuid from "lodash-uuid";

export function fetchPoliciesPremiums(mm, filters) {
    let payload = formatPageQueryWithCount("premiumsByPolicies",
        filters,
        [
            "id", "uuid", "payDate",
            `payer${mm.getProjection("payer.PayerPicker.projection")}`,
            "amount", "payType", "receipt", "isPhotoFee"]
    );
    return graphql(payload, 'CONTRIBUTION_POLICES_PREMIUMS');
}

export function fetchContributionsSummaries(mm, filters) {
    let projections = [
      "id", "uuid","payDate","amount", "payType", "receipt", "isPhotoFee",
      `payer${mm.getProjection("payer.PayerPicker.projection")}`,
      "policy{id,uuid,family{id,headInsuree{id,uuid,chfId,lastName,otherNames,email,phone,dob,gender{code}}}}"
    ]
    const payload = formatPageQueryWithCount("premiums",
      filters,
      projections
    );
    return graphql(payload, 'CONTRIBUTION_CONTRIBUTIONS');
  }
  

export function selectPremium(premium) {
    return dispatch => {
      dispatch({ type: 'CONTRIBUTION_PREMIUM', payload: premium })
    }
  }