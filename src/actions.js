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

export function selectPremium(premium) {
    return dispatch => {
      dispatch({ type: 'CONTRIBUTION_PREMIUM', payload: premium })
    }
  }