import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  todayCoachInviteMayMount,
  todayCoachWeekMayMount,
} from './todayCoachInviteMount.ts';
import { COACH_VICTORY_EARLY_WORKOUTS } from '@/lib/workout/workoutVictory';

describe('todayCoachInviteMayMount (Flow-7 · K3)', () => {
  it('shows for sessions 1–3 on basic and readiness without a plan', () => {
    assert.equal(todayCoachInviteMayMount({ phase: 'basic', totalSessions: 1 }), true);
    assert.equal(todayCoachInviteMayMount({ phase: 'readiness', totalSessions: 1 }), true);
    assert.equal(
      todayCoachInviteMayMount({ phase: 'readiness', totalSessions: COACH_VICTORY_EARLY_WORKOUTS }),
      true
    );
  });

  it('hides when a Coach plan already exists (K3)', () => {
    assert.equal(
      todayCoachInviteMayMount({ phase: 'readiness', totalSessions: 1, hasCoachPlan: true }),
      false
    );
    assert.equal(
      todayCoachInviteMayMount({ phase: 'basic', totalSessions: 2, hasCoachPlan: true }),
      false
    );
  });

  it('hides before first log, after early window, and when commissioned', () => {
    assert.equal(todayCoachInviteMayMount({ phase: 'basic', totalSessions: 0 }), false);
    assert.equal(
      todayCoachInviteMayMount({
        phase: 'readiness',
        totalSessions: COACH_VICTORY_EARLY_WORKOUTS + 1,
      }),
      false
    );
    assert.equal(todayCoachInviteMayMount({ phase: 'commissioned', totalSessions: 2 }), false);
    assert.equal(todayCoachInviteMayMount({ phase: 'i-day', totalSessions: 1 }), false);
  });

  it('buildTodayCandidates + dashboard use one definition; lean drops the invite', () => {
    const root = path.join(import.meta.dirname, '..', '..', '..');
    const ladder = readFileSync(path.join(root, 'src/lib/today/buildTodayCandidates.ts'), 'utf8');
    const dash = readFileSync(path.join(root, 'src/page-components/HomeTodayDashboard.tsx'), 'utf8');
    const lean = readFileSync(path.join(root, 'src/page-components/HomeTodayLean.tsx'), 'utf8');
    assert.match(ladder, /todayCoachInviteMayMount\(/);
    assert.match(ladder, /hasCoachPlan/);
    assert.match(dash, /hasCoachPlan/);
    assert.doesNotMatch(lean, /todayCoachInviteMayMount\(/);
  });
});

describe('todayCoachWeekMayMount (K3)', () => {
  it('commissioned always; readiness only with plan', () => {
    assert.equal(todayCoachWeekMayMount({ phase: 'commissioned' }), true);
    assert.equal(todayCoachWeekMayMount({ phase: 'commissioned', hasCoachPlan: false }), true);
    assert.equal(todayCoachWeekMayMount({ phase: 'readiness', hasCoachPlan: true }), true);
    assert.equal(todayCoachWeekMayMount({ phase: 'readiness', hasCoachPlan: false }), false);
    assert.equal(todayCoachWeekMayMount({ phase: 'readiness' }), false);
    assert.equal(todayCoachWeekMayMount({ phase: 'basic', hasCoachPlan: true }), false);
  });

  it('readiness never stacks invite + week for the same plan state', () => {
    // No plan → invite, not week
    assert.equal(
      todayCoachInviteMayMount({ phase: 'readiness', totalSessions: 1, hasCoachPlan: false }),
      true
    );
    assert.equal(todayCoachWeekMayMount({ phase: 'readiness', hasCoachPlan: false }), false);
    // Plan → week, not invite
    assert.equal(
      todayCoachInviteMayMount({ phase: 'readiness', totalSessions: 1, hasCoachPlan: true }),
      false
    );
    assert.equal(todayCoachWeekMayMount({ phase: 'readiness', hasCoachPlan: true }), true);
  });
});
