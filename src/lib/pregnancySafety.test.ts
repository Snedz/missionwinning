import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  ATHLETE_VISIBLE_FLAGS,
  HARD_SESSION_STOP_DEFAULT,
  HARD_SESSION_STOP_PREGNANCY,
  hardSessionStopKey,
  hardSessionStopLine,
  isAthleteVisibleFlag,
  isPregnancySafetyHold,
  loadPregnancyFlag,
  parsePregnancyFlag,
  savePregnancyFlag,
} from './pregnancySafety.ts';
import { nextTargets } from '@/lib/coach/progression';
import { readRaw, remove, writeRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
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
    assert.equal(parsePregnancyFlag('cycle'), 'none');
    assert.equal(parsePregnancyFlag('age:32'), 'none');
  });

  it('accepts the closed athlete-owned values', () => {
    assert.equal(parsePregnancyFlag('none'), 'none');
    assert.equal(parsePregnancyFlag('Pregnant'), 'pregnant');
    assert.equal(parsePregnancyFlag('postpartum'), 'postpartum');
    assert.equal(parsePregnancyFlag('miscarriage_recovery'), 'miscarriage_recovery');
  });
});

describe('athlete-visible labels stay unsigned for grief-adjacent copy', () => {
  it('Account options are None / Pregnant / Postpartum only', () => {
    assert.deepEqual([...ATHLETE_VISIBLE_FLAGS], ['none', 'pregnant', 'postpartum']);
    assert.equal(isAthleteVisibleFlag('none'), true);
    assert.equal(isAthleteVisibleFlag('pregnant'), true);
    assert.equal(isAthleteVisibleFlag('postpartum'), true);
    assert.equal(isAthleteVisibleFlag('miscarriage_recovery'), false);
    assert.equal(isPregnancySafetyHold('miscarriage_recovery'), true);
    assert.equal(hardSessionStopLine('miscarriage_recovery'), HARD_SESSION_STOP_PREGNANCY);
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

describe('hardSessionStopLine', () => {
  it('keeps the #519 line when the flag is off', () => {
    assert.equal(hardSessionStopLine('none'), HARD_SESSION_STOP_DEFAULT);
    assert.equal(hardSessionStopLine(undefined), HARD_SESSION_STOP_DEFAULT);
    assert.equal(hardSessionStopLine('garbage'), HARD_SESSION_STOP_DEFAULT);
    assert.equal(hardSessionStopKey('none'), 'hardSessionStop');
  });

  it('uses the pregnancy stop line when any hold flag is on', () => {
    for (const flag of ['pregnant', 'postpartum', 'miscarriage_recovery'] as const) {
      assert.equal(hardSessionStopLine(flag), HARD_SESSION_STOP_PREGNANCY);
      assert.equal(hardSessionStopKey(flag), 'hardSessionStopPregnancy');
    }
    assert.match(HARD_SESSION_STOP_PREGNANCY, /bleeding/);
    assert.match(HARD_SESSION_STOP_PREGNANCY, /cramping/);
    assert.match(HARD_SESSION_STOP_PREGNANCY, /dizzy/);
    assert.doesNotMatch(HARD_SESSION_STOP_DEFAULT, /bleeding/);
  });
});

describe('savePregnancyFlag flag-off deletes derived state', () => {
  it('removes the storage key when cleared to none — does not leave none stored', () => {
    writeRaw(STORAGE_KEYS.pregnancyFlag, 'pregnant');
    assert.equal(loadPregnancyFlag(), 'pregnant');
    savePregnancyFlag('none');
    assert.equal(readRaw(STORAGE_KEYS.pregnancyFlag), null);
    assert.equal(loadPregnancyFlag(), 'none');
    savePregnancyFlag('postpartum');
    assert.equal(readRaw(STORAGE_KEYS.pregnancyFlag), 'postpartum');
    remove(STORAGE_KEYS.pregnancyFlag);
  });
});

describe('Coach prescriptions are unchanged in v1', () => {
  it('nextTargets still load-ups on all-easy — no pregnancy arg on the planner', () => {
    const easyHistory = [
      logWithExercise('bench-press', [
        { reps: 8, weight: 60, rpe: 'easy' },
        { reps: 8, weight: 60, rpe: 'easy' },
      ]),
    ];
    const t = nextTargets('bench-press', easyHistory, 'metric', 'strength', 'intermediate');
    assert.equal(t.whyKey, 'coachWhyLoadUp');
    assert.ok(t.weight > 60);

    const progression = readFileSync(
      path.join(root, 'src/lib/coach/progression.ts'),
      'utf8'
    );
    assert.doesNotMatch(progression, /pregnancySafety|pregnancyHold|capProgressionForPregnancyHold/);
    const selector = readFileSync(path.join(root, 'src/lib/coach/selector.ts'), 'utf8');
    assert.doesNotMatch(selector, /pregnancySafety|pregnancyFlag/);
  });
});

describe('pregnancySafety module stays a closed door', () => {
  it('does not import score, chat, rewards, outbox, or coach plan engine', () => {
    const src = readFileSync(path.join(import.meta.dirname, 'pregnancySafety.ts'), 'utf8');
    assert.doesNotMatch(src, /from ['"]@\/lib\/score/);
    assert.doesNotMatch(src, /coach\/chat/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/rewards/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/sync\/outbox/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/coach/);
    assert.doesNotMatch(src, /shouldHideMaxEffortCtas|capProgressionForPregnancyHold/);
  });

  it('does not emit an analytics property', () => {
    const src = readFileSync(path.join(import.meta.dirname, 'pregnancySafety.ts'), 'utf8');
    const card = readFileSync(
      path.join(root, 'src/components/profile/ProfilePregnancyCard.tsx'),
      'utf8'
    );
    for (const [label, text] of [
      ['pregnancySafety.ts', src],
      ['ProfilePregnancyCard.tsx', card],
    ] as const) {
      assert.doesNotMatch(text, /from ['"]@\/lib\/analytics/, label);
      assert.doesNotMatch(text, /\btrack\s*\(/, label);
    }
  });
});

describe('pregnancy safety wiring v1', () => {
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

    const card = readFileSync(
      path.join(root, 'src/components/profile/ProfilePregnancyCard.tsx'),
      'utf8'
    );
    assert.match(card, /ATHLETE_VISIBLE_FLAGS/);
    assert.doesNotMatch(card, /Miscarriage recovery/);
    assert.doesNotMatch(card, /pregnancyFlagMiscarriage/);

    const home = readFileSync(path.join(root, 'src/page-components/HomePage.tsx'), 'utf8');
    assert.doesNotMatch(home, /pregnancy/i);
    assert.doesNotMatch(home, /ProfilePregnancyCard/);
  });

  it('Log set does not read the flag; Coach does not mount a hold note or hide CTAs', () => {
    const active = readFileSync(
      path.join(root, 'src/page-components/ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.doesNotMatch(
      active.slice(active.indexOf('const handleLogSet')),
      /loadPregnancyFlag|isPregnancySafetyHold|pregnancySafety/
    );

    const store = readFileSync(path.join(root, 'src/store/workoutStore.ts'), 'utf8');
    assert.doesNotMatch(store, /pregnancySafety/);

    const coach = readFileSync(path.join(root, 'src/page-components/CoachPage.tsx'), 'utf8');
    assert.doesNotMatch(coach, /PregnancyHoldNote|pregnancySafety/);

    const pft = readFileSync(
      path.join(root, 'src/components/fitness-test/FitnessTestRunner.tsx'),
      'utf8'
    );
    assert.doesNotMatch(pft, /isPregnancySafetyHold|PregnancyHoldNote|shouldHideMaxEffortCtas/);
    assert.match(pft, /HardSessionWarningSheet/);

    const programs = readFileSync(
      path.join(root, 'src/components/builder/ProgramTemplatesPanel.tsx'),
      'utf8'
    );
    assert.doesNotMatch(programs, /pregnancySafety|hideMaxEffort|isMaxEffortSessionName/);
  });

  it('hard-session sheet uses the stop-line selector — the one v1 behavior', () => {
    const sheet = readFileSync(
      path.join(root, 'src/components/workout/HardSessionWarningSheet.tsx'),
      'utf8'
    );
    assert.match(sheet, /hardSessionStopLine/);
    assert.match(sheet, /hardSessionStopPregnancy/);
    assert.match(sheet, /loadPregnancyFlag/);
    assert.doesNotMatch(sheet, /shouldHideMaxEffortCtas/);
  });
});
