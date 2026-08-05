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

  it('buildTodayCandidates + lean + dashboard use one definition', () => {
    const root = path.join(import.meta.dirname, '..', '..', '..');
    for (const rel of [
      'src/lib/today/buildTodayCandidates.ts',
      'src/page-components/HomeTodayLean.tsx',
      'src/page-components/HomeTodayDashboard.tsx',
    ]) {
      const src = readFileSync(path.join(root, rel), 'utf8');
      assert.match(src, /hasCoachPlan/, rel);
      if (rel.includes('buildTodayCandidates') || rel.includes('HomeTodayLean')) {
        assert.match(src, /todayCoachInviteMayMount\(/, rel);
      }
    }
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
