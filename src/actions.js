import {
    baseApiUrl, graphql, formatQuery, formatPageQuery, formatPageQueryWithCount,
    formatMutation, decodeId, openBlob, formatJsonField
} from "@openimis/fe-core";
import _ from "lodash";
import _uuid from "lodash-uuid";

export function fetchPoliciesPremiums(mm, policyUuids) {
    let payload = formatPageQuery("premiumsByPolicies",
        [`policyUuids: ${JSON.stringify(policyUuids)}`],
        [
            "id", "uuid", "payDate",
            `payer${mm.getProjection("payer.PayerPicker.projection")}`,
            "amount", "payType", "receipt", "isPhotoFee"]
    );
    return graphql(payload, 'CONTRIBUTION_POLICES_PREMIUMS');
}