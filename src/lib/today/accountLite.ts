/**
 * F-017 account-lite — first offline set-log, defer signup.
 *
 * Invited / local first session reaches a loggable set with no account wall.
 * Account is offered after the first completed workout (or explicit backup),
 * never forced, never mid-set. PRIVATE_MODE / FREE_BETA / Stripe stay out.
 *
 * Absorbs Day-1 acceptance from F-020 (no device-link), F-028 (no plan wall),
 * F-030 (no re-login mid-log — path already fail-open in `.697`), F-033
 * (defer OS permissions until after first log or explicit feature use).
 */

export const ACCOUNT_LITE_COPY = {
  /** Quiet status on Today / Train before any account CTA. */
  localBadge: 'Offline · on this device',
  deferAccountTitle: 'Keep this diary?',
  deferAccountBody:
    'Create an account to sync. You can keep logging offline either way.',
  createAccount: 'Create account',
  notNow: 'Not now',
} as const;

export type AccountLiteCopyKey = keyof typeof ACCOUNT_LITE_COPY;

/**
 * Same string as `STORAGE_KEYS.accountLiteDismissed` — listed here so the
 * dismiss helper can stay free of the full key registry at test time.
 */
export const ACCOUNT_LITE_DISMISS_KEY = 'mw_account_lite_dismissed';

export type AccountLiteInput = {
  signedIn: boolean;
  /** `workoutHistory.length` — same signal as `basic.workout`. */
  completedWorkouts: number;
  dismissed: boolean;
};

/** What the Today/Train hero may show for account chrome. */
export type AccountLiteHeroChrome = 'local-badge' | 'offer' | 'quiet';

/**
 * First session: quiet local badge, no account CTA.
 * After first completed workout: secondary offer, unless dismissed or signed in.
 */
export function accountLiteHeroChrome(input: AccountLiteInput): AccountLiteHeroChrome {
  if (input.signedIn) return 'quiet';
  if (input.completedWorkouts < 1) return 'local-badge';
  if (input.dismissed) return 'local-badge';
  return 'offer';
}

/**
 * Mid-session SignInPrompt would sit above Log set. Persistence bar: the first
 * set is never lost because signup chrome appeared. Live sessions stay clean.
 */
export function mayShowActiveSignInPrompt(
  input: AccountLiteInput & { hasActiveWorkout: boolean }
): boolean {
  if (input.hasActiveWorkout) return false;
  return accountLiteHeroChrome(input) === 'offer';
}

/** F-020 — no BLE / third-party connect before the first log. */
export function mayOfferDeviceLink(completedWorkouts: number): boolean {
  return completedWorkouts >= 1;
}

/** F-033 — no notification / health permission prompt before the first log. */
export function mayRequestOsPermission(completedWorkouts: number): boolean {
  return completedWorkouts >= 1;
}

const FORBIDDEN_ACCOUNT_LITE = [
  /invite-?only/i,
  /paywall/i,
  /subscription required/i,
  /sign in required/i,
  /waiting for sync/i,
  /save(?:s|d)? to (?:the )?cloud/i,
] as const;

export function accountLiteCopyIsHonest(
  copy: Record<string, string> = ACCOUNT_LITE_COPY
): { ok: true } | { ok: false; key: string; hit: string } {
  for (const [key, value] of Object.entries(copy)) {
    for (const re of FORBIDDEN_ACCOUNT_LITE) {
      if (re.test(value)) {
        return { ok: false, key, hit: re.source };
      }
    }
  }
  return { ok: true };
}
