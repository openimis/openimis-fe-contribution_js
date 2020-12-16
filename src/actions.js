import {
    baseApiUrl, graphql, formatQuery, formatPageQuery, formatPageQueryWithCount,
    formatMutation, decodeId, openBlob, formatJsonField
} from "@openimis/fe-core";
import _ from "lodash";
import _uuid from "lodash-uuid";


const POLICY_SUMMARY_PROJECTION = mm => [
  "uuid",
  `product{${mm.getRef("product.ProductPicker.projection")}}`,
  `officer{${mm.getRef("policy.PolicyOfficerPicker.projection")}}`,
  `family{${mm.getRef("insuree.FamilyPicker.projection").concat([`location{${mm.getRef("location.Location.FlatProjection")}}`])}}`,
  "enrollDate", "effectiveDate", "startDate", "expiryDate",
  "stage", "status",
  "value",
  "validityFrom", "validityTo"
]

const CONTRIBUTION_FULL_PROJECTION = mm => [
  "id", "uuid","payDate","amount", "payType", "receipt", "isPhotoFee",
  `payer${mm.getProjection("payer.PayerPicker.projection")}`,
  `policy{${POLICY_SUMMARY_PROJECTION(mm).join(",")}}`,
];

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
    ];
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

export function formatContributionGQL(mm, contribution) {
  let headInsuree = contribution.headInsuree;
  headInsuree["head"] = true;
  return `  
    ${contribution.uuid !== undefined && contribution.uuid !== null ? `uuid: "${contribution.uuid}"` : ''}
    headInsuree: {${formatInsureeGQL(mm, headInsuree)}}
    ${!!contribution.location ? `locationId: ${decodeId(contribution.location.id)}` : ""}
    poverty: ${!!contribution.poverty}
    ${!!contribution.familyType && !!contribution.familyType.code ? `familyTypeId: "${contribution.familyType.code}"` : ""}
    ${!!contribution.address ? `address: "${formatGQLString(contribution.address)}"` : ""}
    ${!!contribution.confirmationType && !!contribution.confirmationType.code ? `confirmationTypeId: "${contribution.confirmationType.code}"` : ""}
    ${!!contribution.confirmationNo ? `confirmationNo: "${formatGQLString(contribution.confirmationNo)}"` : ""}
    ${!!contribution.jsonExt ? `jsonExt: ${formatJsonField(contribution.jsonExt)}` : ""}
  `
}

export function fetchContribution(mm, contributionUuid) {
  let filters = []
  if (!!contributionUuid) {
    filters.push(`uuid: "${contributionUuid}"`)
  }
  const payload = formatPageQuery("premiums",
    filters,
    CONTRIBUTION_FULL_PROJECTION(mm)
  );
  return graphql(payload, 'CONTRIBUTION_OVERVIEW');
}

export function newContribution() {
  return dispatch => {
    dispatch({ type: 'CONTRIBUTION_NEW' })
  }
}

export function createContribution(mm, contribution, clientMutationLabel) {
  let mutation = formatMutation("createContribution", formatContributionGQL(mm, contribution), clientMutationLabel);
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ['CONTRIBUTION_MUTATION_REQ', 'CONTRIBUTION_CREATE_RESP', 'CONTRIBUTION_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime
    }
  )
}

export function updateContribution(mm, contribution, clientMutationLabel) {
  let mutation = formatMutation("updateContribution", formatContributionGQL(mm, contribution), clientMutationLabel);
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ['CONTRIBUTION_MUTATION_REQ', 'CONTRIBUTION_UPDATE_RESP', 'CONTRIBUTION_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      fcontributionUuid: contribution.uuid,
    }
  )
}

