/**
 * Mission Economy — pure types for points/inventory interoperability.
 *
 * Product XP tables live in `src/lib/rewards/catalog.ts`. This package only
 * defines shapes future modules (Club ledger, games) must share so a second
 * implementation cannot invent a parallel currency.
 *
 * Invariants: docs/contracts/ECONOMY.md · docs/CLUB_PLAN.md
 */

/** High-level earn kinds — map 1:1 to product action ids where possible. */
export type EconomyEventKind =
  | 'workout_finish'
  | 'weekly_train_goal'
  | 'fuel_day'
  | 'pillar_win'
  | 'challenge_complete'
  | 'journey_milestone'
  | 'perfect_week'
  | 'personal_record'
  | 'game_participation'; // reserved — never grants health rank by default

/** Cap how often a kind can mint in a calendar window. */
export interface EarnCap {
  kind: EconomyEventKind;
  /** Max successful grants in the window. */
  max: number;
  /** Window length in whole days (1 = calendar day). */
  windowDays: number;
}

/**
 * An earned cosmetic or collectible. Never client-minted for public standing —
 * server recompute (future) or local engine (today) is the authority for "you".
 */
export interface InventoryItem {
  itemId: string;
  /** Module id that granted, e.g. health.train, economy.rewards */
  source: string;
  /** ISO-8601 timestamp */
  earnedAt: string;
  /** Owning module namespace */
  module: string;
}

/** Snapshot a host or game may read without touching workout logs. */
export interface EconomySummary {
  /** Lifetime odometer (points or XP — product names the unit in i18n). */
  lifetimePoints: number;
  /** Progressive level if the product uses levels; otherwise 0. */
  level: number;
  /** Inventory the athlete may equip (already owned). */
  inventory: readonly InventoryItem[];
}

export function isEconomyEventKind(value: string): value is EconomyEventKind {
  return (
    value === 'workout_finish' ||
    value === 'weekly_train_goal' ||
    value === 'fuel_day' ||
    value === 'pillar_win' ||
    value === 'challenge_complete' ||
    value === 'journey_milestone' ||
    value === 'perfect_week' ||
    value === 'personal_record' ||
    value === 'game_participation'
  );
}
