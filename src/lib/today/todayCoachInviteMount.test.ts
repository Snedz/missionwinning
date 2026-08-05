import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { todayCoachInviteMayMount } from './todayCoachInviteMount.ts';
import { COACH_VICTORY_EARLY_WORKOUTS } from '@/lib/workout/workoutVictory';

describe('todayCoachInviteMayMount (Flow-7)', () => {
  it('shows for sessions 1–3 on basic and readiness', () => {
    assert.equal(todayCoachInviteMayMount({ phase: 'basic', totalSessions: 1 }), true);
    assert.equal(todayCoachInviteMayMount({ phase: 'readiness', totalSessions: 1 }), true);
    assert.equal(
      todayCoachInviteMayMount({ phase: 'readiness', totalSessions: COACH_VICTORY_EARLY_WORKOUTS }),
      true
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

  it('buildTodayCandidates + lean use one definition', () => {
    const root = path.join(import.meta.dirname, '..', '..', '..');
    for (const rel of [
      'src/lib/today/buildTodayCandidates.ts',
      'src/page-components/HomeTodayLean.tsx',
    ]) {
      const src = readFileSync(path.join(root, rel), 'utf8');
      assert.match(src, /todayCoachInviteMayMount\(/, rel);
      assert.doesNotMatch(
        src,
        /totalSessions\s*>=\s*1\s*&&\s*input\.phase\s*===\s*'basic'/,
        `${rel} must not hardcode basic-only invite`
      );
    }
  });
});
