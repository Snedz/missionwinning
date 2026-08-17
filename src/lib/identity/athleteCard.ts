/**
 * The Athlete Card — web side: storage for the picks, and the card's data.
 *
 * `.610`. The rules live in `packages/mw-core/src/identity/athleteCard.ts` because
 * Android needs the identical mapping; this file is the browser's half — reading the
 * athlete's picks out of local storage and turning rank, tier and badges into the
 * same `ShareCardData` shape the victory and recap cards already use.
 *
 * **Nothing here talks to a server, and that is the design, not a limitation.**
 * `shareCard.ts`'s header states the product's position: *"the set-table logger's loop is an in-app
 * social feed; ours is share OUT."* A card that syncs would need a table, a policy
 * change, a consent re-prompt, and a moderation surface. A card that renders on the
 * device and leaves as a PNG needs none of those and is the thing an athlete
 * actually wants — something to put in the group chat.
 *
 * The picks are also deliberately *not* published to the leaderboard row. What the
 * board carries is name, scores and coarse region; a cosmetic choice is nobody
 * else's business.
 */

import {
  DEFAULT_CARD_CONFIG,
  formatAthleteCardTitle,
  resolveCardCosmetics,
  type AthleteCardConfig,
} from '../../../packages/mw-core/src/identity/athleteCard';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';
import type { RewardsSummary } from '@/lib/rewards/summary';
import { ownedBadgeDefs } from '@/lib/rewards/summary';
import type { ShareCardData } from '@/lib/share/shareCard';
import { cardCosmetics } from '@/lib/share/cardCosmetics';

export type { AthleteCardConfig };
export {
  DEFAULT_CARD_CONFIG,
  tierForLevel,
  formatAthleteCardTitle,
  formatCallSignNumber,
  clampCallSignNumber,
} from '../../../packages/mw-core/src/identity/athleteCard';

/** Raw picks as stored. Always run through `resolveAthleteCard` before rendering. */
export function loadAthleteCardConfig(): AthleteCardConfig {
  return readJson<AthleteCardConfig>(STORAGE_KEYS.athleteCard, DEFAULT_CARD_CONFIG);
}

/** Fired after a card pick write so sibling editors on `/profile` stay in step. */
export const ATHLETE_CARD_CHANGED = 'mw-athlete-card';

export function saveAthleteCardConfig(config: AthleteCardConfig): void {
  writeJson(STORAGE_KEYS.athleteCard, config);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ATHLETE_CARD_CHANGED));
  }
}

/**
 * The picks the card will actually honour, clamped to what this athlete earned.
 *
 * Every read goes through here rather than through `loadAthleteCardConfig`, so a
 * stored pick that outruns the athlete's tier cannot reach a painter. See the note
 * on `resolveCardCosmetics` for why that matters more than it looks.
 */
export function resolveAthleteCard(summary: RewardsSummary): AthleteCardConfig {
  return resolveCardCosmetics(loadAthleteCardConfig(), summary.level, summary.badges);
}

/**
 * The card's data — rank first, because rank is the thing the athlete earned over
 * months and the thing no other logger gives them.
 *
 * No `prLine`: that field means "a genuine personal record from this session" and
 * this card is not about a session. Inventing one here would be exactly the lie
 * `pickHeadlinePr` was written to prevent.
 */
export function buildAthleteCardData(
  summary: RewardsSummary,
  operatorName: string
): ShareCardData {
  const resolved = resolveAthleteCard(summary);
  const shown = ownedBadgeDefs(summary.badges).filter((b) => resolved.badges.includes(b.id));

  const stats = [
    { label: 'Rank', value: summary.rankTitleDefault },
    { label: 'Level', value: String(summary.level) },
  ];
  // Only claim a streak that exists — a "0 days" stat reads as failure (`ScoreNumeral`).
  if (summary.weeklyTrainCurrent > 0) {
    stats.push({ label: 'This week', value: `${summary.weeklyTrainCurrent} sessions` });
  }
  if (summary.badges.length > 0) {
    stats.push({ label: 'Badges', value: String(summary.badges.length) });
  }

  return {
    kicker: 'ON THE PATH',
    title: formatAthleteCardTitle(operatorName, resolved.callSignNumber),
    stats,
    prLine: shown.length > 0 ? shown.map((b) => b.titleDefault).join(' · ') : null,
    footer: 'missionwinning.com — free logger, no account',
    // Bound to painters here rather than in the renderer, so the frame and
    // backdrop catalog stays out of every other share surface's bundle (`.612`).
    cosmetics: cardCosmetics(resolved.frame, resolved.backdrop),
  };
}
