import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  CLINICIAN_HOLD_WHY_KEY,
  capProgressionForPregnancyHold,
  isMaxEffortSessionName,
  isPregnancySafetyHold,
  parsePregnancyFlag,
  shouldHideMaxEffortCtas,
} from './pregnancySafety.ts';
import { nextTargets } from '@/lib/coach/progression';
import { computeContextHash } from '@/lib/coach/planEngine';
import { buildCoachContextFromInputs } from '@/lib/coach/contextBuilder';
import type { CompletedWorkoutLog } from '@/types';

const root = path.join(import.meta.dirname, '..', '..');

function logWithExercise(
  exerciseId: string,
  sets: { reps: number; weight: number; rpe?: 'easy' | 'med' | 'hard' }[],
  daysAgo = 0
): CompletedWorkoutLog {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return {
    id: `log-${daysAgo}`,
    workoutName: 'Push',
    startedAt: d.toISOString(),
    completedAt: d.toISOString(),
    durationSeconds: 1200,
    totalVolume: 1000,
    exercises: [{ exerciseId, sets }],
  };
}

describe('parsePregnancyFlag', () => {
  it('treats unset, empty, and garbage as none — never infers a hold', () => {
    assert.equal(parsePregnancyFlag(undefined), 'none');
    assert.equal(parsePregnancyFlag(null), 'none');
    assert.equal(parsePregnancyFlag(''), 'none');
    assert.equal(parsePregnancyFlag('  '), 'none');
    assert.equal(parsePregnancyFlag('female'), 'none');
    assert.equal(parsePregnancyFlag('yes'), 'none');
  });

  it('accepts the closed athlete-owned values', () => {
    assert.equal(parsePregnancyFlag('none'), 'none');
    assert.equal(parsePregnancyFlag('Pregnant'), 'pregnant');
    assert.equal(parsePregnancyFlag('postpartum'), 'postpartum');
    assert.equal(parsePregnancyFlag('miscarriage_recovery'), 'miscarriage_recovery');
  });
});

describe('isPregnancySafetyHold', () => {
  it('is false for none and true for the three hold flags', () => {
    assert.equal(isPregnancySafetyHold('none'), false);
    assert.equal(isPregnancySafetyHold(undefined), false);
    assert.equal(isPregnancySafetyHold('pregnant'), true);
    assert.equal(isPregnancySafetyHold('postpartum'), true);
    assert.equal(isPregnancySafetyHold('miscarriage_recovery'), true);
  });
});

describe('shouldHideMaxEffortCtas / isMaxEffortSessionName', () => {
  it('hides CTAs only when a hold flag is on', () => {
    assert.equal(shouldHideMaxEffortCtas('none'), false);
    assert.equal(shouldHideMaxEffortCtas('pregnant'), true);
  });

  it('marks closed max-effort session titles and ignores Push / Tester', () => {
    assert.equal(isMaxEffortSessionName('Peaking — 1RM Test'), true);
    assert.equal(isMaxEffortSessionName('Week 3 — Session 4 (Test)'), true);
    assert.equal(isMaxEffortSessionName('Field test'), true);
    assert.equal(isMaxEffortSessionName('Max-effort day'), true);
    assert.equal(isMaxEffortSessionName('Push'), false);
    assert.equal(isMaxEffortSessionName('Tester'), false);
    assert.equal(isMaxEffortSessionName("World's Greatest Stretch"), false);
  });
});

describe('capProgressionForPregnancyHold', () => {
  it('is identity when hold is off or the proposal is not a load jump', () => {
    const hold = { sets: 3, reps: 8, weight: 60, whyKey: 'coachWhyHold', loadPct: 70 };
    const same = { ...hold, whyKey: 'coachWhyRepProgress', reps: 9 };
    assert.deepEqual(capProgressionForPregnancyHold(false, same, hold), same);
    assert.deepEqual(capProgressionForPregnancyHold(true, same, hold), same);
  });

  it('caps a weight rise and uses the clinician why-line', () => {
    const hold = { sets: 3, reps: 8, weight: 60, whyKey: 'coachWhyHold', loadPct: 70 };
    const jump = { sets: 3, reps: 8, weight: 62.5, whyKey: 'coachWhyLoadUp', loadPct: 72.5 };
    const capped = capProgressionForPregnancyHold(true, jump, hold);
    assert.equal(capped.weight, 60);
    assert.equal(capped.loadPct, 70);
    assert.equal(capped.whyKey, CLINICIAN_HOLD_WHY_KEY);
    assert.equal(capped.reps, 8);
  });
});

describe('nextTargets pregnancy hold', () => {
  const easyHistory = [
    logWithExercise('bench-press', [
      { reps: 8, weight: 60, rpe: 'easy' },
      { reps: 8, weight: 60, rpe: 'easy' },
    ]),
  ];

  it('still load-ups when the flag is off (logging independence)', () => {
    const t = nextTargets('bench-press', easyHistory, 'metric', 'strength', 'intermediate');
    assert.equal(t.whyKey, 'coachWhyLoadUp');
    assert.ok(t.weight > 60);
  });

  it('does not emit a load jump when pregnant / postpartum / miscarriage_recovery', () => {
    const plain = nextTargets(
      'bench-press',
      easyHistory,
      'metric',
      'strength',
      'intermediate',
      undefined,
      false
    );
    for (const _hold of [true]) {
      const t = nextTargets(
        'bench-press',
        easyHistory,
        'metric',
        'strength',
        'intermediate',
        undefined,
        true
      );
      assert.notEqual(t.whyKey, 'coachWhyLoadUp');
      assert.equal(t.whyKey, CLINICIAN_HOLD_WHY_KEY);
      assert.ok(t.weight < plain.weight || t.weight === 60);
      assert.ok(t.weight <= 60 + 1e-6 || t.loadPct == null || (plain.loadPct != null && t.loadPct < plain.loadPct));
    }
  });

  it('still allows rep progress (not a load jump) under the hold', () => {
    const history = [
      logWithExercise('push-ups', [
        { reps: 8, weight: 0, rpe: 'med' },
        { reps: 8, weight: 0, rpe: 'easy' },
      ]),
    ];
    const t = nextTargets(
      'push-ups',
      history,
      'metric',
      'general',
      'intermediate',
      undefined,
      true
    );
    assert.equal(t.reps, 9);
    assert.equal(t.weight, 0);
    assert.equal(t.whyKey, 'coachWhyRepProgress');
  });
});

describe('generateWeek pregnancy hold', () => {
  it('context hash includes the flag so a hold is a different week', () => {
    const base = {
      history: [] as CompletedWorkoutLog[],
      experience: 'intermediate' as const,
      equipment: 'full-gym',
      goal: 'goal:strength',
      daysPerWeek: 4,
      seedId: 'preg-hash',
      includeCheckIn: false as const,
    };
    const open = buildCoachContextFromInputs({ ...base, pregnancyFlag: 'none' });
    const held = buildCoachContextFromInputs({ ...base, pregnancyFlag: 'pregnant' });
    const week = 'hash-week';
    assert.notEqual(computeContextHash(open, week), computeContextHash(held, week));
  });
});

describe('pregnancySafety module stays a closed door', () => {
  it('does not import score, chat, or rewards', () => {
    const src = readFileSync(path.join(import.meta.dirname, 'pregnancySafety.ts'), 'utf8');
    assert.doesNotMatch(src, /from ['"]@\/lib\/score/);
    assert.doesNotMatch(src, /coach\/chat/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/rewards/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/sync\/outbox/);
  });
});

describe('pregnancy safety wiring (.746)', () => {
  it('Account mounts the flag under More settings; Today does not import it', () => {
    const account = readFileSync(
      path.join(root, 'src/page-components/AccountPage.tsx'),
      'utf8'
    );
    assert.match(account, /ProfilePregnancyCard/);
    assert.match(account, /accountMoreSettings/);
    const moreIdx = account.indexOf('accountMoreSettings');
    const cardIdx = account.indexOf('<ProfilePregnancyCard');
    assert.ok(cardIdx > moreIdx, 'pregnancy card must sit under More settings');

    const home = readFileSync(path.join(root, 'src/page-components/HomePage.tsx'), 'utf8');
    assert.doesNotMatch(home, /pregnancy/i);
    assert.doesNotMatch(home, /ProfilePregnancyCard/);
  });

  it('Coach mounts the hold note; Log set does not read the flag', () => {
    const coach = readFileSync(path.join(root, 'src/page-components/CoachPage.tsx'), 'utf8');
    assert.match(coach, /PregnancyHoldNote/);
    assert.match(coach, /isPregnancySafetyHold/);

    const active = readFileSync(
      path.join(root, 'src/page-components/ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.doesNotMatch(active, /pregnancySafety/);
    assert.doesNotMatch(
      active.slice(active.indexOf('const handleLogSet')),
      /loadPregnancyFlag|isPregnancySafetyHold/
    );

    const store = readFileSync(path.join(root, 'src/store/workoutStore.ts'), 'utf8');
    assert.doesNotMatch(store, /pregnancySafety/);
  });

  it('PFT Continue and program Load hide max-effort starts when hold helpers are wired', () => {
    const pft = readFileSync(
      path.join(root, 'src/components/fitness-test/FitnessTestRunner.tsx'),
      'utf8'
    );
    assert.match(pft, /isPregnancySafetyHold/);
    assert.match(pft, /PregnancyHoldNote/);

    const programs = readFileSync(
      path.join(root, 'src/components/builder/ProgramTemplatesPanel.tsx'),
      'utf8'
    );
    assert.match(programs, /isMaxEffortSessionName/);
    assert.match(programs, /hideMaxEffort/);

    const pftSection = readFileSync(
      path.join(root, 'src/components/fitness-test/PresidentialFitnessSection.tsx'),
      'utf8'
    );
    assert.match(pftSection, /isPregnancySafetyHold/);
    assert.match(pftSection, /PregnancyHoldNote/);
    assert.match(pftSection, /pftTakeFull/);
  });

  it('selector passes the pregnancy hold into nextTargets', () => {
    const selector = readFileSync(path.join(root, 'src/lib/coach/selector.ts'), 'utf8');
    assert.match(selector, /ctx\.pregnancyFlag/);
    assert.match(selector, /nextTargets\(/);
  });
});
