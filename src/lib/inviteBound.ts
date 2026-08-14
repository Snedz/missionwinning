/**
 * Whether a profile is invite-bound — the closed-beta gate key.
 *
 * A verified Supabase session is not an invite. Password mint and
 * `?access=` stay separate doors.
 */
export function inviteRedeemed(invitedVia: string | null | undefined): boolean {
  return Boolean(invitedVia?.trim());
}

/** Cookie mint while PRIVATE_MODE is on requires {@link inviteRedeemed}. */
export function sessionMintEligible(input: {
  privateModeEnabled: boolean;
  inviteRedeemed: boolean;
}): boolean {
  if (!input.privateModeEnabled) return true;
  return input.inviteRedeemed;
}
