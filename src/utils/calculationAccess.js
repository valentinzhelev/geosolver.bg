/** Pro subscription or admin role — no shared calculation cap. */
export function hasUnlimitedCalculations(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return (
    user.plan === 'pro' ||
    ['active', 'trialing'].includes(user.subscriptionStatus)
  );
}
