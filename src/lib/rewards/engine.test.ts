/**
 * Mission Rewards engine — pure rules.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { levelForXp, levelProgress, XP_BY_ACTION, DAILY_XP_SOFT_CAP } from '@/lib/rewards/catalog';
import { applyRewardEvent, applyRewardEvents, emptyRewardState } from '@/lib/rewards/engine';
import type { RewardEventKind } from '@/lib/rewards/types';

function workout(id: string, daysAgo = 0, totalAfter = 1): RewardEventKind {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(12, 0, 0, 0);
  return {
    type: 'workout_finish',
    workoutId: id,
    finishedAt: d.toISOString(),
    totalWorkoutsAfter: totalAfter,
  };
}

describe('applyRewardEvent — workout', () => {
  it('awards workout XP once per workout id', () => {
    const s0 = emptyRewardState();
    const r1 = applyRewardEvent(s0, workout('w1', 0, 1));
    assert.equal(r1.xpGained, XP_BY_ACTION.workout_finish);
    assert.ok(r1.badgeAwards.some((b) => b.id === 'first_blood'));
    const r2 = applyRewardEvent(r1.state, workout('w1', 0, 1));
    assert.equal(r2.xpGained, 0);
    assert.equal(r2.badgeAwards.length, 0);
  });

  it('caps workout finishes at 2 per day', () => {
    let state = emptyRewardState();
    const a = applyRewardEvent(state, workout('a', 0, 1));
    state = a.state;
    const b = applyRewardEvent(state, workout('b', 0, 2));
    state = b.state;
    const c = applyRewardEvent(state, workout('c', 0, 3));
    assert.equal(a.xpGained, 45);
    assert.equal(b.xpGained, 45);
    assert.equal(c.xpGained, 0);
    assert.ok(c.xpAwards.some((x) => x.capped));
  });

  it('grants iron_25 at 25 workouts', () => {
    const r = applyRewardEvent(emptyRewardState(), workout('w25', 0, 25));
    assert.ok(r.badgeAwards.some((b) => b.id === 'iron_25'));
  });

  it('grants comeback after ≥7 day gap without shame-only path', () => {
    let state = emptyRewardState();
    state = applyRewardEvent(state, workout('old', 10, 1)).state;
    const r = applyRewardEvent(state, workout('new', 0, 2));
    assert.ok(r.badgeAwards.some((b) => b.id === 'comeback'));
  });
});

describe('applyRewardEvent — weekly goal', () => {
  it('awards when sessions meet goal', () => {
    const weekStart = emptyRewardState().weekStart;
    const r = applyRewardEvent(emptyRewardState(), {
      type: 'weekly_train_goal',
      weekStart,
      sessionsThisWeek: 3,
      goal: 3,
    });
    assert.equal(r.xpGained, XP_BY_ACTION.weekly_train_goal);
    assert.equal(r.state.weeklyGoalWeeksHit, 1);
  });

  it('under goal does not claim — later met goal still awards', () => {
    const weekStart = emptyRewardState().weekStart;
    const under = applyRewardEvent(emptyRewardState(), {
      type: 'weekly_train_goal',
      weekStart,
      sessionsThisWeek: 1,
      goal: 3,
    });
    assert.equal(under.xpGained, 0);
    assert.ok(!under.state.claimedEventIds.some((id) => id.startsWith('weekly_goal:')));
    const met = applyRewardEvent(under.state, {
      type: 'weekly_train_goal',
      weekStart,
      sessionsThisWeek: 3,
      goal: 3,
    });
    assert.equal(met.xpGained, XP_BY_ACTION.weekly_train_goal);
  });
});

describe('applyRewardEvent — challenges & journey', () => {
  it('challenge complete is idempotent and grants badge', () => {
    const weekStart = emptyRewardState().weekStart;
    const ev: RewardEventKind = {
      type: 'challenge_complete',
      challengeId: 'train-7',
      weekStart,
    };
    const r1 = applyRewardEvent(emptyRewardState(), ev);
    assert.equal(r1.xpGained, XP_BY_ACTION.challenge_complete);
    assert.ok(r1.badgeAwards.some((b) => b.id === 'challenge_cleared'));
    const r2 = applyRewardEvent(r1.state, ev);
    assert.equal(r2.xpGained, 0);
  });

  it('commissioned grants honor badge + XP', () => {
    const r = applyRewardEvent(emptyRewardState(), { type: 'journey_commissioned' });
    assert.equal(r.xpGained, XP_BY_ACTION.journey_commissioned);
    assert.ok(r.badgeAwards.some((b) => b.id === 'commissioned' && b.rarity === 'honor'));
  });
});

describe('applyRewardEvents batch', () => {
  it('stacks workout + first journey without double first_blood issues', () => {
    const r = applyRewardEvents(emptyRewardState(), [
      workout('w1', 0, 1),
      { type: 'journey_first_workout' },
    ]);
    assert.ok(r.xpGained >= XP_BY_ACTION.workout_finish);
    assert.equal(r.state.badges.filter((b) => b === 'first_blood').length, 1);
  });
});

describe('milestone badges — fuel + pillars', () => {
  it('grants fuel_steady after 7 distinct fuel days', () => {
    let state = emptyRewardState();
    for (let i = 1; i <= 6; i++) {
      const d = `2026-07-${String(i).padStart(2, '0')}`;
      state = applyRewardEvent(state, { type: 'fuel_day', dateKey: d }, new Date(`${d}T12:00:00`)).state;
      assert.ok(!state.badges.includes('fuel_steady'));
    }
    const r = applyRewardEvent(
      state,
      { type: 'fuel_day', dateKey: '2026-07-07' },
      new Date('2026-07-07T12:00:00')
    );
    assert.ok(r.badgeAwards.some((b) => b.id === 'fuel_steady'));
  });

  it('grants mobility_kept after 8 move wins', () => {
    let state = emptyRewardState();
    for (let i = 0; i < 7; i++) {
      state = applyRewardEvent(state, {
        type: 'pillar_win',
        winId: `m${i}`,
        pillar: 'move',
      }).state;
    }
    assert.ok(!state.badges.includes('mobility_kept'));
    const r = applyRewardEvent(state, { type: 'pillar_win', winId: 'm7', pillar: 'move' });
    assert.ok(r.badgeAwards.some((b) => b.id === 'mobility_kept'));
    assert.equal(r.state.pillarWins.move, 8);
  });

  it('grants student after 10 learn wins', () => {
    let state = emptyRewardState();
    for (let i = 0; i < 10; i++) {
      state = applyRewardEvent(state, {
        type: 'pillar_win',
        winId: `l${i}`,
        pillar: 'learn',
      }).state;
    }
    assert.ok(state.badges.includes('student'));
  });

  it('grants still_mind after 8 mind wins', () => {
    let state = emptyRewardState();
    for (let i = 0; i < 8; i++) {
      state = applyRewardEvent(state, {
        type: 'pillar_win',
        winId: `mind${i}`,
        pillar: 'mind',
      }).state;
    }
    assert.ok(state.badges.includes('still_mind'));
    assert.equal(state.pillarWins.mind, 8);
  });
});

describe('level math', () => {
  it('levelForXp thresholds', () => {
    assert.equal(levelForXp(0), 1);
    assert.equal(levelForXp(149), 1);
    assert.equal(levelForXp(150), 2);
    assert.equal(levelForXp(250), 3);
  });

  it('levelProgress ratio in 0–1', () => {
    const p = levelProgress(50);
    assert.ok(p.ratio >= 0 && p.ratio <= 1);
    assert.equal(p.level, 1);
  });
});

describe('daily soft cap', () => {
  it(`stops near ${DAILY_XP_SOFT_CAP} XP in one day`, () => {
    let state = emptyRewardState();
    // Many pillar wins
    for (let i = 0; i < 30; i++) {
      const r = applyRewardEvent(state, {
        type: 'pillar_win',
        winId: `p${i}`,
        pillar: 'learn',
      });
      state = r.state;
    }
    // day soft markers + action caps — total day XP should not vastly exceed soft cap
    assert.ok(state.xpTotal <= DAILY_XP_SOFT_CAP + XP_BY_ACTION.pillar_learn);
  });
});
