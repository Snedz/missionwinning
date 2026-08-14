/**
 * Mission ID — a monotonic integer for signed-in accounts.
 *
 * Prestige of *early*, not a rank, not XP, not a board. Call-sign 00–99 stays
 * a separate cosmetic (`clampCallSignNumber`). Guests and the offline logger
 * have no id. The mint is server-side; this module is display + claim *decision*
 * only — it never writes.
 *
 * ID 1 is reserved for the founder. The public GitHub login already in this
 * repo (`Snedz`) is the identity; `BETA_ADMIN_EMAILS` is the existing env
 * allowlist. Do not invent a new public email here.
 */

/** Public GitHub login for the founder — already in README / legal footer. */
export const FOUNDER_GITHUB_LOGIN = 'Snedz';

/** Fixture: founder as the current user in tests. Not product copy. */
export const FOUNDER_TEST_PROFILE = {
  githubLogin: FOUNDER_GITHUB_LOGIN,
} as const;

type IdentityLike = {
  provider?: string | null;
  identity_data?: Record<string, unknown> | null;
};

function loginFromMeta(meta: Record<string, unknown> | null | undefined): string | null {
  if (!meta) return null;
  for (const key of ['user_name', 'preferred_username', 'login'] as const) {
    const v = meta[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

/** GitHub login from a Supabase auth user, or null. Never invents one. */
export function githubLoginFromAuthUser(user: {
  identities?: IdentityLike[] | null;
  user_metadata?: Record<string, unknown> | null;
} | null | undefined): string | null {
  if (!user) return null;
  for (const identity of user.identities ?? []) {
    if ((identity.provider ?? '').toLowerCase() !== 'github') continue;
    const login = loginFromMeta(identity.identity_data);
    if (login) return login;
  }
  return loginFromMeta(user.user_metadata);
}

export function isFounderGithubLogin(login: string | null | undefined): boolean {
  return (login ?? '').toLowerCase() === FOUNDER_GITHUB_LOGIN.toLowerCase();
}

/** Who may claim Mission ID 1. Email path is the existing beta-admin allowlist. */
export function isFounderForMissionId1(input: {
  githubLogin?: string | null;
  emailIsBetaAdmin?: boolean;
}): boolean {
  return isFounderGithubLogin(input.githubLogin) || input.emailIsBetaAdmin === true;
}

export type MissionIdClaimDecision =
  | { kind: 'none' }
  | { kind: 'keep'; missionId: number }
  | { kind: 'founder-1' }
  | { kind: 'next' };

/**
 * Pure claim decision. The server executes it; the client never chooses an id.
 *
 * `id1TakenByOther` is how ID 1 cannot be issued twice: a second founder
 * (or a retry after someone else holds 1) falls through to sequential ≥ 2.
 */
export function decideMissionIdClaim(opts: {
  signedIn: boolean;
  existing: number | null;
  isFounder: boolean;
  id1TakenByOther: boolean;
}): MissionIdClaimDecision {
  if (!opts.signedIn) return { kind: 'none' };
  if (opts.existing != null && Number.isInteger(opts.existing) && opts.existing >= 1) {
    return { kind: 'keep', missionId: opts.existing };
  }
  if (opts.isFounder && !opts.id1TakenByOther) return { kind: 'founder-1' };
  return { kind: 'next' };
}

/** Display form: `#1`. Not zero-padded — that padding is the call-sign. */
export function formatMissionId(n: number): string {
  return `#${n}`;
}

/** Athlete Page / Account line. Guest → null (show nothing). */
export function athleteMissionIdForCurrentUser(opts: {
  signedIn: boolean;
  missionId: number | null;
}): string | null {
  if (!opts.signedIn || opts.missionId == null) return null;
  if (!Number.isInteger(opts.missionId) || opts.missionId < 1) return null;
  return formatMissionId(opts.missionId);
}
