/**
 * Athlete Page → share-out PNG data (S4 share half, still no public URL).
 *
 * Built only from the C5 public projection + optional derived career counts.
 * Never accepts free text or workout log rows. Stats are career counts (and a
 * kit pick) — Rank/Tier stay off this PNG so share-out is not a scoreboard.
 * Cosmetics are injected as painters (`.612`) so this module can stay off the
 * `/active` graph unless a profile surface imports it.
 */

import { formatAthleteCardTitle } from '../../../packages/mw-core/src/identity/athleteCard';
import type { AthletePublicProjection } from '../../../packages/mw-core/src/identity/publicProjection';
import type { ShareCardData, ShareCardCosmetics, ShareCardStat } from '@/lib/share/shareCard';

export interface AthletePageShareOptions {
  /** Derived career sessions — omitted when 0 so the card does not claim a zero. */
  sessions?: number;
  daysTrained?: number;
  cosmetics?: ShareCardCosmetics;
}

/** Humanize a pick id for the EN-only share surface (no i18n on canvas). */
export function humanizePickId(id: string): string {
  return id.replace(/-/g, ' ');
}

/**
 * Table picks as a single provenance line — only answered rows, never free text.
 */
export function tablePicksLine(table: AthletePublicProjection['table']): string | null {
  const bits: string[] = [];
  for (const value of Object.values(table)) {
    if (typeof value === 'string' && value.length > 0) {
      bits.push(humanizePickId(value));
    }
  }
  if (bits.length === 0) return null;
  return bits.slice(0, 4).join(' · ');
}

/**
 * Share card for the Athlete Page. Input is the public projection so free-text
 * fields cannot reach the PNG without first surviving C5 (they cannot).
 */
export function buildAthletePageShareData(
  projection: AthletePublicProjection,
  options: AthletePageShareOptions = {}
): ShareCardData {
  const name = projection.callSign.trim() || 'Athlete';
  const title = formatAthleteCardTitle(name, projection.callSignNumber);

  const stats: ShareCardStat[] = [];
  if (typeof options.sessions === 'number' && options.sessions > 0) {
    stats.push({ label: 'Sessions', value: String(options.sessions) });
  }
  if (typeof options.daysTrained === 'number' && options.daysTrained > 0) {
    stats.push({ label: 'Days', value: String(options.daysTrained) });
  }
  // Kit id is a pick, not free text — useful when table is empty.
  if (stats.length < 4 && projection.kitId && projection.kitId !== 'default') {
    stats.push({ label: 'Kit', value: humanizePickId(projection.kitId) });
  }

  const tableLine = tablePicksLine(projection.table);
  const badgeLine =
    projection.badgeIds.length > 0
      ? projection.badgeIds.slice(0, 3).map(humanizePickId).join(' · ')
      : null;
  const prLine = tableLine ?? badgeLine;

  return {
    kicker: 'ATHLETE PAGE',
    title,
    stats: stats.slice(0, 4),
    prLine,
    footer: 'missionwinning.com — free logger, no account',
    cosmetics: options.cosmetics,
  };
}
