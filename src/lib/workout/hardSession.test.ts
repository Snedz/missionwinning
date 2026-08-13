import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  EXACT_HARD_SESSION_NAMES,
  isHardSessionName,
  needsHardSessionWarning,
} from './hardSession.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');

describe('needsHardSessionWarning', () => {
  it('is true for PFT / mini / field-test kinds', () => {
    assert.equal(needsHardSessionWarning({ kind: 'pft' }), true);
    assert.equal(needsHardSessionWarning({ kind: 'pft-mini' }), true);
    assert.equal(needsHardSessionWarning({ kind: 'field-test' }), true);
  });

  it('is true for fieldTest=1 param (does not start the session)', () => {
    assert.equal(needsHardSessionWarning({ fieldTestParam: '1' }), true);
    assert.equal(needsHardSessionWarning({ fieldTestParam: 'true' }), false);
    assert.equal(needsHardSessionWarning({ fieldTestParam: 'yes' }), false);
  });

  it('is true for closed exact names (dash-folded)', () => {
    assert.equal(needsHardSessionWarning({ name: 'Peaking — 1RM Test' }), true);
    assert.equal(needsHardSessionWarning({ name: 'Peaking - 1RM Test' }), true);
    assert.equal(needsHardSessionWarning({ name: 'Week 3 — Session 4 (Test)' }), true);
    assert.equal(needsHardSessionWarning({ name: 'Field test' }), true);
    assert.equal(needsHardSessionWarning({ name: 'Five-event field test' }), true);
  });

  it('is true for 2-mile / max-test / max-effort session titles', () => {
    assert.equal(needsHardSessionWarning({ name: '2-mile run' }), true);
    assert.equal(needsHardSessionWarning({ name: '2 mile' }), true);
    assert.equal(isHardSessionName('12-mile ruck'), false);
    assert.equal(needsHardSessionWarning({ name: 'Squat 1RM test' }), true);
    assert.equal(needsHardSessionWarning({ name: 'Max test' }), true);
    assert.equal(needsHardSessionWarning({ name: 'Max-effort day' }), true);
  });

  it('is false for normal Train starts', () => {
    assert.equal(needsHardSessionWarning({ name: 'Push' }), false);
    assert.equal(needsHardSessionWarning({ name: 'Just Go' }), false);
    assert.equal(needsHardSessionWarning({ name: "Today's WOD — Full Body AMRAP" }), false);
    assert.equal(needsHardSessionWarning({ name: '' }), false);
    assert.equal(needsHardSessionWarning({}), false);
    assert.equal(needsHardSessionWarning({ name: 'Tester' }), false);
    assert.equal(needsHardSessionWarning({ name: "World's Greatest Stretch" }), false);
  });

  it('never warns once a set is logged (not a logger gate)', () => {
    assert.equal(
      needsHardSessionWarning({ kind: 'pft', hasLoggedWork: true }),
      false
    );
    assert.equal(
      needsHardSessionWarning({ name: '2-mile run', hasLoggedWork: true }),
      false
    );
  });
});

describe('closed names stay attached to master templates', () => {
  it('Peaking 1RM Test and Week 3 Session 4 (Test) stay in the exact list', () => {
    const templates = readFileSync(
      path.join(root, 'src/data/premiumProgramTemplates.ts'),
      'utf8'
    );
    assert.match(templates, /Peaking — 1RM Test/);
    assert.match(templates, /Week 3 — Session 4 \(Test\)/);
    assert.ok(EXACT_HARD_SESSION_NAMES.includes('peaking - 1rm test'));
    assert.ok(EXACT_HARD_SESSION_NAMES.includes('week 3 - session 4 (test)'));
  });
});

describe('hardSession module stays a closed door', () => {
  it('does not import score, chat, or rewards', () => {
    const src = readFileSync(path.join(import.meta.dirname, 'hardSession.ts'), 'utf8');
    assert.doesNotMatch(src, /from ['"]@\/lib\/score/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/coach\/chat/);
    assert.doesNotMatch(src, /coach\/chat/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/rewards/);
  });
});

describe('hard-session wiring (.727)', () => {
  it('Active opens the warning for unmarked-hard sessions with no logged work', () => {
    const active = readFileSync(
      path.join(root, 'src/page-components/ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(active, /needsHardSessionWarning/);
    assert.match(active, /hasLoggedWork/);
    assert.match(active, /hardWarningOpen/);
    assert.match(active, /cancelActiveWorkout/);
    assert.doesNotMatch(
      active.slice(active.indexOf('const handleLogSet')),
      /needsHardSessionWarning/,
      'Log set must not call the hard-session warning'
    );
  });

  it('PFT Continue opens the warning before events', () => {
    const pft = readFileSync(
      path.join(root, 'src/components/fitness-test/FitnessTestRunner.tsx'),
      'utf8'
    );
    assert.match(pft, /HardSessionWarningSheet/);
    assert.match(pft, /kind: isMini \? 'pft-mini' : 'pft'/);
  });

  it('sheet cluster mounts HardSessionWarningSheet', () => {
    const sheets = readFileSync(
      path.join(root, 'src/components/workout/ActiveWorkoutSheets.tsx'),
      'utf8'
    );
    assert.match(sheets, /HardSessionWarningSheet/);
  });
});
