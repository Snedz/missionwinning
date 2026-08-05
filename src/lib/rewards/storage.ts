import { emptyRewardState, rollWeekIfNeeded } from '@/lib/rewards/engine';
import type { ApplyResult, RewardState } from '@/lib/rewards/types';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';

const KEY = STORAGE_KEYS.rewards;

function isRewardState(v: unknown): v is RewardState {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.xpTotal === 'number' &&
    typeof o.weekStart === 'string' &&
    typeof o.weekXp === 'number' &&
    Array.isArray(o.badges) &&
    Array.isArray(o.claimedEventIds)
  );
}

export function loadRewardState(): RewardState {
  const raw = readJson<unknown>(KEY, null);
  if (!isRewardState(raw)) return emptyRewardState();
  return rollWeekIfNeeded({
    xpTotal: raw.xpTotal,
    weekStart: raw.weekStart,
    weekXp: raw.weekXp,
    badges: raw.badges.filter((b): b is RewardState['badges'][number] => typeof b === 'string'),
    claimedEventIds: raw.claimedEventIds.filter((id): id is string => typeof id === 'string'),
    challengeMedals: Array.isArray(raw.challengeMedals) ? raw.challengeMedals : [],
    lastTrainDateKey: typeof raw.lastTrainDateKey === 'string' ? raw.lastTrainDateKey : undefined,
    weeklyGoalWeeksHit:
      typeof raw.weeklyGoalWeeksHit === 'number' && Number.isFinite(raw.weeklyGoalWeeksHit)
        ? Math.max(0, raw.weeklyGoalWeeksHit)
        : 0,
    pillarWins: normalizePillarWins(raw.pillarWins),
  });
}

function normalizePillarWins(
  v: unknown
): Partial<Record<'move' | 'mind' | 'track' | 'learn', number>> {
  if (!v || typeof v !== 'object') return {};
  const o = v as Record<string, unknown>;
  const out: Partial<Record<'move' | 'mind' | 'track' | 'learn', number>> = {};
  for (const k of ['move', 'mind', 'track', 'learn'] as const) {
    const n = o[k];
    if (typeof n === 'number' && Number.isFinite(n) && n > 0) out[k] = Math.floor(n);
  }
  return out;
}

export function saveRewardState(state: RewardState): void {
  writeJson(KEY, state);
}

/** Last awards for Victory / toast — session-scoped, not part of durable state. */
const LAST_AWARDS_KEY = 'mw_rewards_last_awards';

export type LastAwardsSnapshot = {
  xpGained: number;
  badgeIds: string[];
  levelBefore: number;
  levelAfter: number;
  at: string;
};

export function rememberLastAwards(result: ApplyResult): void {
  if (result.xpGained <= 0 && result.badgeAwards.length === 0) return;
  const snap: LastAwardsSnapshot = {
    xpGained: result.xpGained,
    badgeIds: result.badgeAwards.map((b) => b.id),
    levelBefore: result.levelBefore,
    levelAfter: result.levelAfter,
    at: new Date().toISOString(),
  };
  writeJson(LAST_AWARDS_KEY, snap);
}

export function peekLastAwards(): LastAwardsSnapshot | null {
  return readJson<LastAwardsSnapshot | null>(LAST_AWARDS_KEY, null);
}

export function consumeLastAwards(): LastAwardsSnapshot | null {
  const snap = peekLastAwards();
  if (!snap) return null;
  writeJson(LAST_AWARDS_KEY, null);
  return snap;
}
