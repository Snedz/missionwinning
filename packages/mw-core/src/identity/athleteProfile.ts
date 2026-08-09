/**
 * Athlete Page authored config — table picks + page kit (S3 local).
 *
 * Separate from Athlete Card cosmetics (frames/backdrops/badges/number): the card
 * is the share artifact; this is the page you live on. Both are picks-from-sets
 * and both clamp through pure functions before UI or share paint.
 */

import { type CardTier, tierForLevel } from './athleteCard';
import {
  resolveAthleteTablePicks,
  type AthleteTablePicks,
} from './athleteTable';
import {
  DEFAULT_PAGE_KIT_ID,
  resolvePageKitId,
} from './pageKits';

export interface AthletePageConfig {
  /** Page kit id from the C6 manifest. */
  kitId: string;
  /** Interests-table picks (MySpace move). */
  table: AthleteTablePicks;
}

export const DEFAULT_ATHLETE_PAGE_CONFIG: AthletePageConfig = {
  kitId: DEFAULT_PAGE_KIT_ID,
  table: {},
};

/**
 * Clamp a stored page config. Level maps to tier for kit unlocks the same way
 * card frames do — one ladder, not a second.
 */
export function resolveAthletePageConfig(
  raw: Partial<AthletePageConfig> | null | undefined,
  level: number = 1
): AthletePageConfig {
  const tier: CardTier = tierForLevel(level);
  return {
    kitId: resolvePageKitId(raw?.kitId, tier),
    table: resolveAthleteTablePicks(raw?.table ?? {}),
  };
}
