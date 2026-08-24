import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildSessionRationale, hasSessionRationale } from './sessionRationale.ts';
import type { PlanSession } from './types.ts';

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

function ex(whyKey: string, id = 'bench') {
  return { exerciseId: id, sets: 3, reps: 5, weight: 60, whyKey };
}

describe('buildSessionRationale', () => {
  it('returns null for done or missed sessions', () => {
    assert.equal(buildSessionRationale(session({ id: 'a', status: 'done' })), null);
    assert.equal(
      buildSessionRationale(session({ id: 'b', status: 'missed', dayOffset: 0 })),
      null
    );
    assert.equal(hasSessionRationale(session({ id: 'a', status: 'done' })), false);
  });

  it('honest empty on clean start with no whyKey and no logs', () => {
    const r = buildSessionRationale(
      session({ id: 'a', status: 'planned', exercises: [] }),
      { loggedWorkoutCount: 0 }
    );
    assert.ok(r);
    assert.equal(r!.kind, 'session-empty');
    assert.equal(hasSessionRationale(session({ id: 'a', status: 'planned' }), { loggedWorkoutCount: 0 }), true);
    assert.match(r!.compactDefault, /No sets logged yet/i);
    assert.doesNotMatch(r!.compactDefault, /\b0 workouts\b/i);
    assert.doesNotMatch(r!.compactDefault, /wearable claim|predicted|ACWR/i);
    assert.doesNotMatch(r!.inputDefault, /recent sets in your logs/i);
  });

  it('whyKey + zero logs is empty, not a fake log cite', () => {
    const r = buildSessionRationale(
      session({
        id: 'a',
        status: 'planned',
        exercises: [ex('coachWhyDeload')],
      }),
      { loggedWorkoutCount: 0 }
    );
    assert.ok(r);
    assert.equal(r!.kind, 'session-empty');
    assert.doesNotMatch(r!.inputDefault, /Recent sets in your logs/i);
    assert.doesNotMatch(r!.compactDefault, /Deload session/i);
  });

  it('omitted log count still lets whyKey stories fire (unit kind tests)', () => {
    const r = buildSessionRationale(
      session({
        id: 'a',
        status: 'planned',
        exercises: [ex('coachWhyDeload')],
      })
    );
    assert.equal(r!.kind, 'session-deload');
  });

  it('swapped session → readiness input + recovery rule + effect', () => {
    const r = buildSessionRationale(
      session({
        id: 'a',
        status: 'swapped',
        kind: 'recovery',
        exercises: [ex('coachWhyRecovery')],
      })
    );
    assert.ok(r);
    assert.equal(r!.kind, 'session-swapped');
    assert.match(r!.inputDefault, /Readiness|strain/i);
    assert.match(r!.ruleDefault, /Recovery session/i);
    assert.match(r!.effectDefault, /quality|strain/i);
    assert.match(r!.compactDefault, /recovery session/i);
  });

  it('deload whyKey on this session → session deload story', () => {
    const r = buildSessionRationale(
      session({
        id: 'a',
        status: 'planned',
        exercises: [ex('coachWhyDeload'), ex('coachWhyDeload', 'squat')],
      })
    );
    assert.ok(r);
    assert.equal(r!.kind, 'session-deload');
    assert.match(r!.ruleDefault, /Deload session/i);
    assert.match(r!.effectDefault, /lighter/i);
  });

  it('loadZone high hint → session load-hold when hold whyKey', () => {
    const r = buildSessionRationale(
      session({
        id: 'a',
        status: 'planned',
        exercises: [ex('coachWhyHold')],
      }),
      { loadZone: 'high' }
    );
    assert.ok(r);
    assert.equal(r!.kind, 'session-load-hold');
    assert.match(r!.ruleDefault, /Load guard/i);
  });

  it('load-up whyKey → session load-up story', () => {
    const r = buildSessionRationale(
      session({
        id: 'a',
        status: 'planned',
        exercises: [ex('coachWhyLoadUp')],
      })
    );
    assert.ok(r);
    assert.equal(r!.kind, 'session-load-up');
    assert.match(r!.inputDefault, /manageable|load bump/i);
    assert.match(r!.ruleDefault, /Load progression/i);
  });

  it('rep-progress whyKey is distinct from load-up', () => {
    const r = buildSessionRationale(
      session({
        id: 'a',
        status: 'planned',
        exercises: [ex('coachWhyRepProgress')],
      })
    );
    assert.ok(r);
    assert.equal(r!.kind, 'session-rep-progress');
    assert.match(r!.ruleDefault, /Rep progression/i);
  });

  it('post-first-workout focus baseline cites logs + focus (no whyKey)', () => {
    const r = buildSessionRationale(
      session({
        id: 'a',
        status: 'planned',
        focusGroups: ['Back', 'Arms'],
        kind: 'strength',
        exercises: [],
      }),
      { loggedWorkoutCount: 5 }
    );
    assert.ok(r);
    assert.equal(r!.kind, 'session-focus');
    assert.equal(r!.inputKey, 'coachSessionRationaleFocusInput');
    assert.match(r!.inputDefault, /5 workout/);
    assert.match(r!.inputDefault, /Back/);
    assert.match(r!.ruleDefault, /Session pick|split|logged/i);
    assert.doesNotMatch(r!.inputDefault, /\b0\b/);
  });

  it('swapped takes priority over deload whyKeys on the same session', () => {
    const r = buildSessionRationale(
      session({
        id: 'a',
        status: 'swapped',
        kind: 'recovery',
        exercises: [ex('coachWhyDeload')],
      })
    );
    assert.equal(r!.kind, 'session-swapped');
  });

  it('does not invent metrics — compact and full cite logs or prescription only', () => {
    const r = buildSessionRationale(
      session({
        id: 'a',
        status: 'planned',
        exercises: [ex('coachWhyHoldHard')],
      })
    );
    assert.ok(r);
    assert.equal(r!.kind, 'session-hold');
    assert.match(r!.inputDefault, /logs|Hard recent/i);
    assert.doesNotMatch(r!.compactDefault, /ACWR|wearable|predicted/i);
  });
});

describe('sessionRationale wiring', () => {
  const root = join(import.meta.dirname, '..', '..');

  it('PlanSessionCard mounts buildSessionRationale for boss session', () => {
    const src = readFileSync(join(root, 'components/coach/PlanSessionCard.tsx'), 'utf8');
    assert.match(src, /buildSessionRationale/);
    assert.match(src, /coach-session-rationale/);
    assert.match(src, /data-rationale-kind/);
    assert.match(src, /session-empty/);
    assert.match(src, /isPrimaryStart/);
    assert.doesNotMatch(src, /premium|isPremium|usePremium|entitled/);
    assert.doesNotMatch(src, /\blocked\b/);
  });

  it('Train and Today do not mount session rationale', () => {
    const active = readFileSync(join(root, 'page-components/ActiveWorkoutPage.tsx'), 'utf8');
    const home = readFileSync(join(root, 'page-components/HomePage.tsx'), 'utf8');
    assert.doesNotMatch(active, /buildSessionRationale|coach-session-rationale/);
    assert.doesNotMatch(home, /buildSessionRationale|coach-session-rationale/);
  });

  it('CoachPlanSessionGrid passes log hints into session cards', () => {
    const src = readFileSync(
      join(root, 'components/coach/CoachPlanSessionGrid.tsx'),
      'utf8'
    );
    assert.match(src, /rationaleHints/);
    assert.match(src, /SessionRationaleHints/);
  });

  it('CoachPage wires session rationale hints from ctx (not Today/Train)', () => {
    const src = readFileSync(join(root, 'page-components/CoachPage.tsx'), 'utf8');
    assert.match(src, /rationaleHints/);
    assert.match(src, /loggedWorkoutCount:\s*ctx\.history\.length/);
    // Must not force Coach chrome onto Active / Home.
    assert.doesNotMatch(src, /TrainerRail|forceCoach/);
  });
});
