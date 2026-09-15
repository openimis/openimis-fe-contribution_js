/**
 * Remaining amount a policy can still take in contributions, or `null` when the
 * policy carries no value at all.
 *
 * Guards against `null - null === 0` in JS: a policy with no PolicyValue would
 * otherwise look like a fully-paid policy with a 0 balance, silently capping
 * every contribution at 0.
 */
export function policyRemainingValue(policy) {
  const value = Number(policy?.value);
  if (policy?.value == null || Number.isNaN(value)) return null;
  return value - Number(policy?.sumPremiums ?? 0);
}
