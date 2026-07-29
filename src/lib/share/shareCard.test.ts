import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRecapCardData,
  buildVictoryCardData,
  pickHeadlinePr,
} from '@/lib/share/shareCard';
import type { PersonalRecord } from '@/lib/coach/progress';
import type { WorkoutVictorySummary } from '@/lib/workout/workoutVictory';
import type { WeeklyDebrief } from '@/lib/weeklyDebrief';

const SUMMARY: WorkoutVictorySummary = {
  workoutName: 'Push Day',
  totalVolume: 5200,
  durationSeconds: 3900,
  setCount: 18,
  exerciseCount: 5,
  streak: 4,
};

const DEBRIEF: WeeklyDebrief = {
  weekStart: '2026-07-27',
  isFullDebrief: true,
  train: { sessions: 4, sets: 62, volume: 21000, prs: 2 },
  fuel: { logDays: 5, proteinDays: 4 },
  moveMind: { flows: 1, sessions: 2 },
  focusKey: 'focusKeepGoing',
};

describe('shareCard data builders', () => {
  it('a card never invents a PR — no records means no line', () => {
    // The `.179` counter bug wearing a nicer shirt: a share image claiming a record
    // that did not happen. No records → null, and a first-ever entry (previous:
    // null) is not a "record broken" — the same rule the debrief enforces.
    assert.equal(pickHeadlinePr([], 'kg'), null);
    const firstEver: PersonalRecord[] = [
      { exerciseId: 'bench-press', kind: 'weight', value: 100, date: '2026-07-29', previous: null },
    ];
    assert.equal(pickHeadlinePr(firstEver, 'kg'), null);
    assert.equal(buildVictoryCardData(SUMMARY, [], 'kg').prLine, null);
  });

  it('leads with the heaviest-weight record over other kinds', () => {
    const records: PersonalRecord[] = [
      { exerciseId: 'bench-press', kind: 'e1rm', value: 124, date: '2026-07-29', previous: 120 },
      { exerciseId: 'squats', kind: 'weight', value: 142.5, date: '2026-07-29', previous: 140 },
    ];
    assert.equal(pickHeadlinePr(records, 'kg'), 'New best: squats 142.5 kg');
  });

  it('victory card states only what the summary knows', () => {
    const card = buildVictoryCardData(SUMMARY, [], 'kg');
    assert.equal(card.title, 'Push Day');
    assert.deepEqual(
      card.stats.map((s) => s.value),
      ['5,200 kg', '18', '1h 5m', '4 days']
    );
  });

  it('a one-day streak is not a streak worth printing', () => {
    const card = buildVictoryCardData({ ...SUMMARY, streak: 1 }, [], 'kg');
    assert.ok(!card.stats.some((s) => s.label === 'Streak'));
  });

  it('recap card uses the debrief PR count, and zero is silence', () => {
    assert.equal(buildRecapCardData(DEBRIEF, 'kg').prLine, '2 personal records');
    const quiet = buildRecapCardData(
      { ...DEBRIEF, train: { ...DEBRIEF.train, prs: 0 } },
      'kg'
    );
    assert.equal(quiet.prLine, null, 'zero PRs is silence, not "0 PRs!"');
  });
});
