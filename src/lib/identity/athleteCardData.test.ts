/**
 * What the Athlete Card is allowed to claim (`.610`).
 *
 * This card leaves the device as a PNG with the athlete's name on it and lands in a
 * group chat. Every other share surface in this repo already has an honesty rule
 * enforced by a test — `pickHeadlinePr` returns `null` rather than invent a record,
 * the recap card's `prLine` is hard-`null` because the field it read was never
 * written, `ScoreNumeral` renders an em-dash because "a 0 reads as failure on day
 * one". This is that rule for identity.
 *
 * Two specific lies are guarded: claiming a week that did not happen, and wearing a
 * medallion that was not earned. The second matters most, because a badge is the one
 * thing on the card another person cannot check.
 */

import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import type { RewardsSummary } from '@/lib/rewards/summary';

let originalLocalStorage: Storage | undefined;
let hadWindow = false;

beforeEach(() => {
  const store = new Map<string, string>();
  const memStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    get length() {
      return store.size;
    },
  } as Storage;
  hadWindow = typeof globalThis.window !== 'undefined';
  if (!hadWindow) {
    (globalThis as unknown as { window: unknown }).window = Object.assign(
      Object.create(globalThis),
      { dispatchEvent: () => true, addEventListener: () => {}, removeEventListener: () => {} }
    );
  }
  originalLocalStorage = globalThis.localStorage;
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: memStorage,
  });
});

afterEach(() => {
  if (originalLocalStorage !== undefined) {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      writable: true,
      value: originalLocalStorage,
    });
  }
  if (!hadWindow) delete (globalThis as unknown as { window?: unknown }).window;
});

function summary(over: Partial<RewardsSummary> = {}): RewardsSummary {
  return {
    xpTotal: 0,
    weekXp: 0,
    level: 1,
    rankTitleDefault: 'Pathfinder',
    rankTitleKey: 'rewardRankPathfinder',
    levelInto: 0,
    levelNeed: 100,
    levelRatio: 0,
    badges: [],
    weeklyTrainGoal: 3,
    weeklyTrainCurrent: 0,
    challengesComplete: 0,
    challengesTotal: 8,
    ...over,
  } as RewardsSummary;
}

test('a quiet week is not claimed as sessions', async () => {
  const { buildAthleteCardData } = await import('@/lib/identity/athleteCard');
  const card = buildAthleteCardData(summary({ weeklyTrainCurrent: 0 }), 'Sam');
  assert.ok(
    !card.stats.some((s) => s.label === 'This week'),
    'a "0 sessions" stat reads as failure — the card must omit the row, not print a zero'
  );
});

test('a real week is claimed', async () => {
  const { buildAthleteCardData } = await import('@/lib/identity/athleteCard');
  const card = buildAthleteCardData(summary({ weeklyTrainCurrent: 3 }), 'Sam');
  const row = card.stats.find((s) => s.label === 'This week');
  assert.ok(row, 'the omission above must be conditional, not permanent');
  assert.match(row.value, /3/);
});

test('the card never wears a badge the athlete does not own', async () => {
  const { buildAthleteCardData, saveAthleteCardConfig } = await import('@/lib/identity/athleteCard');
  // A hand-edited store claiming an honor badge that was never earned.
  saveAthleteCardConfig({ frame: 'hairline', backdrop: 'paper', badges: ['iron_100'] });
  const card = buildAthleteCardData(summary({ level: 10, badges: [] }), 'Sam');
  assert.equal(
    card.prLine,
    null,
    'an unowned medallion reached a PNG the athlete hands to other people'
  );
});

test('an owned, picked badge is shown — the guard above is not just "always null"', async () => {
  const { buildAthleteCardData, saveAthleteCardConfig } = await import('@/lib/identity/athleteCard');
  saveAthleteCardConfig({ frame: 'hairline', backdrop: 'paper', badges: ['first_blood'] });
  const card = buildAthleteCardData(
    summary({ level: 10, badges: ['first_blood'] as RewardsSummary['badges'] }),
    'Sam'
  );
  assert.ok(card.prLine && card.prLine.length > 0, 'an earned, chosen badge must appear');
});

test('cosmetics on the card are the clamped ones, not the raw picks', async () => {
  const { buildAthleteCardData, saveAthleteCardConfig } = await import('@/lib/identity/athleteCard');
  saveAthleteCardConfig({ frame: 'poster', backdrop: 'poster-block', badges: [] });
  const card = buildAthleteCardData(summary({ level: 1 }), 'Sam');
  assert.equal(card.cosmetics?.frame, 'hairline', 'a tier-1 card rendered a tier-4 frame');
  assert.equal(card.cosmetics?.backdrop, 'paper');
});

test('the name is the title, and the card carries no session claim', async () => {
  const { buildAthleteCardData } = await import('@/lib/identity/athleteCard');
  const card = buildAthleteCardData(summary({ level: 4, rankTitleDefault: 'Steady Hand' }), 'Ada');
  assert.equal(card.title, 'Ada');
  assert.ok(card.stats.some((s) => s.value === 'Steady Hand'), 'rank leads — it is what was earned');
  assert.match(card.footer, /free logger/);
});
