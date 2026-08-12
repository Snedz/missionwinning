import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildWeekRationale, hasWeekRationale } from './weekRationale.ts';
import type { CoachPlan, PlanSession } from './types.ts';

function session(
  partial: Partial<PlanSession> & Pick<PlanSession, 'id' | 'status'>
): PlanSession {
  return {
    dayOffset: 0,
    kind: 'strength',
    name: 'Push',
    focusGroups: ['Chest'],
    exercises: [],
    estMinutes: 40,
    ...partial,
  };
}

function plan(sessions: PlanSession[], revision = 1): CoachPlan {
  return {
    revision,
    weekStart: '2026-07-20',
    daysPerWeek: 3,
    sessions,
    generatedAt: '2026-07-20T12:00:00Z',
    contextHash: 'x',
    equipmentProfile: 'bodyweight',
  };
}

function ex(whyKey: string, id = 'bench') {
  return { exerciseId: id, sets: 3, reps: 5, weight: 60, whyKey };
}

describe('buildWeekRationale', () => {
  it('returns null for empty plan', () => {
    assert.equal(buildWeekRationale(plan([])), null);
    assert.equal(hasWeekRationale(plan([])), false);
  });

  it('missed sessions → log input + re-spread rule + calendar effect', () => {
    const r = buildWeekRationale(
      plan([
        session({ id: 'a', status: 'missed', dayOffset: 0 }),
        session({ id: 'b', status: 'planned', dayOffset: 3 }),
      ])
    );
    assert.ok(r);
    assert.equal(r!.kind, 'missed-respread');
    assert.match(r!.inputDefault, /Missed Mon/);
    assert.match(r!.ruleDefault, /re-spread/i);
    assert.match(r!.effectDefault, /calendar|continue/i);
    assert.match(r!.compactDefault, /Missed Mon.*re-spread/i);
  });

  it('swapped sessions → readiness input + recovery swap rule', () => {
    const r = buildWeekRationale(
      plan([session({ id: 'a', status: 'swapped', kind: 'recovery', dayOffset: 1 })])
    );
    assert.ok(r);
    assert.equal(r!.kind, 'readiness-swap');
    assert.match(r!.inputDefault, /Readiness|strain/i);
    assert.match(r!.ruleDefault, /recovery swap/i);
    assert.match(r!.effectDefault, /recovery|mobility/i);
  });

  it('logged done + revision → log match story', () => {
    const r = buildWeekRationale(plan([session({ id: 'a', status: 'done' })], 2));
    assert.ok(r);
    assert.equal(r!.kind, 'logged-update');
    assert.match(r!.inputDefault, /finished|workout log/i);
    assert.match(r!.ruleDefault, /Log match/i);
  });

  it('dominant deload whyKey → progression deload (no adapt signal)', () => {
    const r = buildWeekRationale(
      plan([
        session({
          id: 'a',
          status: 'planned',
          exercises: [ex('coachWhyDeload'), ex('coachWhyDeload', 'squat')],
        }),
      ])
    );
    assert.ok(r);
    assert.equal(r!.kind, 'progression-deload');
    assert.match(r!.ruleDefault, /Deload/i);
  });

  it('loadZone high hint → load-hold when no adapt beats', () => {
    const r = buildWeekRationale(
      plan([
        session({
          id: 'a',
          status: 'planned',
          exercises: [ex('coachWhyHold')],
        }),
      ]),
      { loadZone: 'high' }
    );
    assert.ok(r);
    assert.equal(r!.kind, 'load-hold');
    assert.match(r!.ruleDefault, /Load guard/i);
  });

  it('fresh generate cites days + gear (and log count when provided)', () => {
    const r = buildWeekRationale(
      plan([
        session({
          id: 'a',
          status: 'planned',
          exercises: [ex('coachWhyRecovery')],
        }),
        session({ id: 'b', status: 'planned', dayOffset: 2 }),
      ]),
      { loggedWorkoutCount: 8 }
    );
    assert.ok(r);
    assert.equal(r!.kind, 'generate-week');
    assert.match(r!.inputDefault, /8 workout/);
    assert.match(r!.inputDefault, /bodyweight/);
    assert.match(r!.ruleDefault, /Weekly generate/i);
    assert.match(r!.effectDefault, /2 sessions/);
  });

  it('missed takes priority over deload whyKeys', () => {
    const r = buildWeekRationale(
      plan([
        session({
          id: 'a',
          status: 'missed',
          dayOffset: 0,
          exercises: [ex('coachWhyDeload')],
        }),
        session({
          id: 'b',
          status: 'planned',
          dayOffset: 3,
          exercises: [ex('coachWhyDeload')],
        }),
      ])
    );
    assert.equal(r!.kind, 'missed-respread');
  });
});

describe('weekRationale wiring', () => {
  const root = join(import.meta.dirname, '..', '..');

  it('CoachAdaptBanner mounts buildWeekRationale', () => {
    const src = readFileSync(join(root, 'components/coach/CoachAdaptBanner.tsx'), 'utf8');
    assert.match(src, /buildWeekRationale/);
    assert.match(src, /coach-week-rationale/);
  });

  it('CoachPage surfaces week rationale for current week', () => {
    const src = readFileSync(
      join(root, 'page-components/CoachPage.tsx'),
      'utf8'
    );
    // Page wires the banner with showWeekRationale + log hints; testid lives on the banner.
    assert.match(src, /showWeekRationale/);
    assert.match(src, /rationaleHints/);
    assert.match(src, /loggedWorkoutCount:\s*ctx\.history\.length/);
  });
});
