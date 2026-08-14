/**
 * Local-first copy constants for Today / Active first-session surfaces.
 *
 * MatrAIx F-001: offline/cloud bounce in survey N=5 came from first-session
 * chrome that framed sync/cloud as required for core logging. These strings are
 * the single EN source for empty states + status honesty; UI wires them via
 * `t(key, { defaultValue })` so packs stay the schema and EN cannot drift.
 *
 * Rest timer is out of scope for *wording* here — it must stay pure local
 * (see `localFirstRestGuard.test.ts`). This module only owns athlete-facing
 * copy that must not imply network for set-log + rest.
 */

export const LOCAL_FIRST_COPY = {
  /**
   * First paint of the two public entries (`/private`, `/welcome`).
   *
   * East Asia shard (mission-ops #13): CN/HK respondents rated the offline
   * *claim* 3.97 and disbelieved the *implementation* — "forced cloud sync /
   * data opacity". `.696` fixed the framing inside the app; the two screens a
   * sceptic actually sees first still said only the adjective, "offline", which
   * is exactly the word an app with forced sync would also use.
   *
   * So these name the **mechanism** instead: no account, written to this device,
   * nothing uploaded unless you sign in. A mechanism is checkable — turn off the
   * radio and log a set — and an adjective is not.
   */
  gateLocalFirst:
    'No account needed: the logger writes sets to your device, and nothing is uploaded unless you sign in.',
  welcomeLocalFirst:
    'A few questions, then log your first session. No account — sets are written to this device, and nothing is uploaded unless you sign in.',
  /*
   * `activeSignInTitle` / `activeSignInDesc` retired here at `.767`.
   *
   * `.696` wrote them for the Active mid-session sign-in prompt; master's `.746`
   * ("F-017 first set without an account") removed that prompt outright, which
   * is the same axis pushed further — no sign-in surface at all during the first
   * session. The constants were left behind and rendered nowhere, which the
   * "every local-first constant is actually on a screen" guard found. Their
   * strings stay in `activeWorkoutLocales` so fifteen translations are not
   * thrown away, and this note is here so the next author knows they are
   * unmounted rather than missing. If a sign-in prompt ever returns to Active,
   * bring them back **into this file** so the honesty screen sees them again.
   */
  /** Today header when unsigned — full line; sign-in is optional, not the save path. */
  todaySignInOptional: 'Sign in optional — progress stays on this device.',
  /**
   * Today header when signed in — backup is quiet; must not hero "Cloud sync on".
   */
  todayBackupWhenOnline: 'Sets save on this device — backup when online.',
  /** Today pillar-wins empty — no cloud-as-save-path clause. */
  todayPillarWinEmpty: 'Log wins from Move or Mind — they stay on this device.',
  /** Active empty title (hydrated). */
  activeNoWorkout: 'No session running',
  /** Active empty / dock body (hydrated). */
  activeNoWorkoutDesc:
    'Start here, or open Today for the session already planned for you. Sets and rest save on this device.',
} as const;

export type LocalFirstCopyKey = keyof typeof LOCAL_FIRST_COPY;

/** Phrases that must not appear in F-001 local-first EN copy. */
const FORBIDDEN_CLOUD_REQUIRED = [
  /auto-?save to the cloud/i,
  /save(?:s|d)? to cloud/i,
  /cloud sync on/i,
  /sign in (?:required|to (?:sync|load|save))/i,
  /saves to the cloud when/i,
] as const;

/**
 * True when every LOCAL_FIRST_COPY value is free of cloud-required framing.
 * Used by the colocated guard; keep the list closed and name why.
 */
export function localFirstCopyIsHonest(
  copy: Record<string, string> = LOCAL_FIRST_COPY
): { ok: true } | { ok: false; key: string; hit: string } {
  for (const [key, value] of Object.entries(copy)) {
    for (const re of FORBIDDEN_CLOUD_REQUIRED) {
      if (re.test(value)) {
        return { ok: false, key, hit: re.source };
      }
    }
  }
  return { ok: true };
}
