/**
 * How many things Today is allowed to say at once.
 *
 * Every feature since `.170` added a permanent `+1` to this screen — behavior
 * strip, sleep line, day review, week recap, coach strip, guidebook, freshness —
 * and none of them removed anything, because no PR is ever the one that made the
 * screen long. By `.196` a commissioned athlete on a Sunday evening with a
 * re-entry card saw eleven top-level blocks, which is not a dashboard, it is a
 * feed.
 *
 * So the budget is a number in a file rather than a habit. `TODAY_MAX_TOP_LEVEL_BLOCKS`
 * is a **judgement, not a measurement** — it lives alone here precisely so it can
 * be argued with in one place instead of relitigated per card.
 *
 * Overflow is not deletion. Blocks past the budget move into the existing
 * "Today details" disclosure, so nothing is lost and the athlete who wants the
 * long version is one tap away. Ordering is by declared priority, so the screen
 * degrades predictably rather than by whichever `push()` happened to run first.
 */

/**
 * Kaizen K1 (`.294`): 7 → 6. One fewer spillable slot so Mission Score /
 * guidebook chrome yield to session + week on the densest evening screen.
 * Overflow still lands in "Today details" — nothing is deleted.
 */
export const TODAY_MAX_TOP_LEVEL_BLOCKS = 6;

export interface TodayBlockCandidate<T = unknown> {
  key: string;
  /** Lower sorts earlier and survives the budget. */
  priority: number;
  /**
   * Structural blocks that must never move — the header, the re-entry ask, the
   * mission chrome an athlete navigates by. Spilling these would hide the page
   * inside a disclosure on the page.
   */
  pinned?: boolean;
  node: T;
}

export interface TodayBlockPlan<T = unknown> {
  top: TodayBlockCandidate<T>[];
  inMore: TodayBlockCandidate<T>[];
}

/**
 * Never reorders what the caller declared — sorting the visible screen by
 * priority would make cards jump between renders as their conditions flip.
 * Priority decides *what spills*, not *what order things read in*.
 */
export function planTodayBlocks<T>(
  candidates: TodayBlockCandidate<T>[],
  max: number = TODAY_MAX_TOP_LEVEL_BLOCKS
): TodayBlockPlan<T> {
  const pinned = candidates.filter((c) => c.pinned);
  const spillable = candidates.filter((c) => !c.pinned);

  // Pinned blocks are never spilled, even when they alone exceed the budget —
  // a budget that can hide the page header is a bug wearing a constraint's hat.
  const room = Math.max(0, max - pinned.length);

  // Lowest priority number wins a top-level slot; the rest spill.
  const keep = new Set(
    [...spillable]
      .sort((a, b) => a.priority - b.priority)
      .slice(0, room)
      .map((c) => c.key)
  );

  const top: TodayBlockCandidate<T>[] = [];
  const inMore: TodayBlockCandidate<T>[] = [];
  for (const c of candidates) {
    if (c.pinned || keep.has(c.key)) top.push(c);
    else inMore.push(c);
  }
  return { top, inMore };
}
