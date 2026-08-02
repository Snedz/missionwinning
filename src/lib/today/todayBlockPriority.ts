/**
 * What Today shows first — one price list, both shells.
 *
 * `HomeTodayDashboard` and `HomeTodayLean` are two screens for one product, and
 * every card that lives in both was declaring its own cost twice. That is the
 * shape `todayGuidanceMount.ts` was written about ("a card in one shell is a
 * card half the athletes cannot see"), applied to ordering rather than mounting:
 * two lists of numbers that must agree, kept in two files, with nothing checking.
 *
 * **The rule the numbers encode: what to do outranks how you did.**
 *
 * Before `.224` the prices were `dashboard` 10, `day-review` 15, `intent` 20,
 * `coach-invite` 25, `week-recap` 30, `coach-today` 35, `coach-week` 45 — and
 * replaying `planTodayBlocks` over the blocks a real athlete mounts showed a
 * readiness evening screen carrying `coach-invite`, a card asking them to go and
 * get a weekly plan, while `coach-week` — the plan — sat in the disclosure. At
 * `commissioned` with the beta banner up, the session and the week were hidden
 * together. Horizon W criterion 2 is "one clear next session on Today".
 *
 * Gaps of 2 are deliberate: a new block can be priced between two existing ones
 * without renumbering the list, and a renumber is how an ordering silently
 * inverts.
 */

/** Blocks that can appear on either Today shell. */
export type TodayBlockKey =
  | 'beta'
  | 'header'
  | 'reentry'
  | 'coach-today'
  | 'coach-week'
  | 'day-review'
  | 'intent'
  | 'dashboard'
  | 'week-recap'
  | 'coach-invite'
  | 'encourage'
  | 'freshness'
  | 'guidebook';

export const TODAY_BLOCK_PRIORITY: Record<TodayBlockKey, number> = {
  // Pinned chrome — priced anyway so the ordering reads top to bottom here.
  beta: 0,
  header: 1,
  reentry: 2,

  // What to do now.
  'coach-today': 12,
  'coach-week': 14,
  'day-review': 15,

  // What it is for.
  intent: 20,

  // How it went.
  dashboard: 22,
  'week-recap': 30,

  // Invitations and depth — always behind the thing they point at.
  'coach-invite': 40,
  encourage: 50,
  freshness: 60,
  guidebook: 70,
};
