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
  /** Active mid-session SignInPrompt title — device owns the log. */
  activeSignInTitle: 'Sets save on this device',
  /**
   * Active mid-session SignInPrompt body — sign-in is optional backup only.
   * Must not say auto-save / required / cloud-first.
   */
  activeSignInDesc:
    'Logging and rest work offline. Sign in only if you want the same log on another device.',
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
