/**
 * Athlete Page authored config — web storage half of S3.
 *
 * Pure resolve lives in `packages/mw-core/src/identity/athleteProfile.ts`. This
 * file is localStorage only: no server, no public projection (S4), no free text.
 */

import {
  DEFAULT_ATHLETE_PAGE_CONFIG,
  resolveAthletePageConfig,
  type AthletePageConfig,
} from '../../../packages/mw-core/src/identity/athleteProfile';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';

export type { AthletePageConfig };
export {
  DEFAULT_ATHLETE_PAGE_CONFIG,
  resolveAthletePageConfig,
} from '../../../packages/mw-core/src/identity/athleteProfile';
export {
  ATHLETE_TABLE_ROWS,
  athleteTableFilledCount,
  picksForRow,
  resolveAthleteTablePicks,
  type AthleteTablePicks,
  type AthleteTableRowId,
} from '../../../packages/mw-core/src/identity/athleteTable';
export {
  DEFAULT_PAGE_KIT_ID,
  PAGE_KITS,
  pageKitById,
  resolvePageKitId,
  unlockedPageKits,
  type PageKit,
} from '../../../packages/mw-core/src/identity/pageKits';
export {
  buildAthletePublicProjection,
  ATHLETE_PUBLIC_PROJECTION_KEYS,
  type AthletePublicProjection,
} from '../../../packages/mw-core/src/identity/publicProjection';

/** Fired when table/kit picks change so the page can re-read without a reload. */
export const ATHLETE_PAGE_CHANGED = 'mw-athlete-page';

export function loadAthletePageConfig(): AthletePageConfig {
  return readJson<AthletePageConfig>(STORAGE_KEYS.athletePage, DEFAULT_ATHLETE_PAGE_CONFIG);
}

export function saveAthletePageConfig(config: AthletePageConfig): void {
  writeJson(STORAGE_KEYS.athletePage, config);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ATHLETE_PAGE_CHANGED));
  }
}

/** Load + clamp against the athlete's reward level (kit unlocks). */
export function resolveStoredAthletePage(level: number): AthletePageConfig {
  return resolveAthletePageConfig(loadAthletePageConfig(), level);
}
