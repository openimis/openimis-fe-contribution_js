import { parseData, pageInfo, formatServerError, formatGraphQLError } from '@openimis/fe-core';

function reducer(
    state = {
        fetchingPoliciesPremiums: false,
        fetchedPoliciesPremiums: false,
        errorPoliciesPremiums: null,
        policiesPremiumsPageInfo: { totalCount: 0 },
        policiesPremiums: null,
    },
    action,
) {
    switch (action.type) {
        case 'POLICY_INSUREE_POLICIES_REQ':
        case 'POLICY_FAMILY_POLICIES_REQ':
        case 'CONTRIBUTION_POLICES_PREMIUMS_REQ':
            return {
                ...state,
                fetchingPoliciesPremiums: true,
                fetchedPoliciesPremiums: false,
                policiesPremiums: null,
                policiesPremiumsPageInfo: { totalCount: 0 },
                errorPoliciesPremiums: null,
            };
        case 'CONTRIBUTION_POLICES_PREMIUMS_RESP':
            return {
                ...state,
                fetchingPoliciesPremiums: false,
                fetchedPoliciesPremiums: true,
                policiesPremiums: parseData(action.payload.data.premiumsByPolicies),
                policiesPremiumsPageInfo: pageInfo(action.payload.data.premiumsByPolicies),
                errorPoliciesPremiums: formatGraphQLError(action.payload)
            };
        case 'CONTRIBUTION_POLICES_PREMIUMS_ERR':
            return {
                ...state,
                fetchingPoliciesPremiums: false,
                errorPoliciesPremiums: formatServerError(action.payload)
            };
        default:
            return state;
    }
}

export default reducer;
