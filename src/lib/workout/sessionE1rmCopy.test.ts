/**
 * Educational e1RM copy must name the formula and refuse "your max".
 *
 * A string that says "your max" is a tested-max claim. Field-test / max-effort
 * CTAs stay in #505 / #519. This guard is the done-bar for `.739`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'path';
import { activeWorkoutStringsFor } from '@/i18n/activeWorkoutLocales';
import { SESSION_E1RM_COPY } from '@/lib/workout/sessionE1rm';

const root = join(import.meta.dirname, '..', '..', '..');

/**
 * Closed list: these are the spellings a reviewer would treat as a tested max,
 * a prescription, medical cover, or a government-test brand. Not a vibe check.
 */
const BANNED = [
  /your max/i,
  /test your 1\s*rm/i,
  /test your max/i,
  /safe pt/i,
  /\busmc\b/i,
  /\bacft\b/i,
] as const;

function assertHonest(label: string, text: string): void {
  for (const re of BANNED) {
    assert.doesNotMatch(
      text,
      re,
      `${label} must not say ${re.source} — this is an Epley estimate, not a tested max`
    );
  }
}

test('EN copy names Epley and says formula estimate, not a tested max', () => {
  const values = Object.values(SESSION_E1RM_COPY);
  assert.ok(values.some((v) => /Epley/.test(v)), 'the named formula must appear');
  assert.ok(values.some((v) => /estimate/i.test(v)), 'must say estimate');
  assert.ok(
    values.some((v) => /not a tested max/i.test(v)),
    'must say it is not a tested max'
  );
  for (const [key, value] of Object.entries(SESSION_E1RM_COPY)) {
    assertHonest(`SESSION_E1RM_COPY.${key}`, value);
  }
});

test('locale pack EN matches the single copy source', () => {
  const en = activeWorkoutStringsFor('en');
  assert.equal(en.activeE1rmLine, SESSION_E1RM_COPY.line);
  assert.equal(en.activeE1rmHide, SESSION_E1RM_COPY.hide);
  assert.equal(en.activeE1rmShow, SESSION_E1RM_COPY.show);
  assert.equal(en.activeE1rmAria, SESSION_E1RM_COPY.aria);
  assertHonest('activeE1rmLine', en.activeE1rmLine);
});

test('header and menu defaultValues stay honest and wired', () => {
  const header = readFileSync(
    join(root, 'src/components/workout/ActiveExerciseHeader.tsx'),
    'utf8'
  );
  const menu = readFileSync(
    join(root, 'src/components/workout/ActiveExerciseMoreMenu.tsx'),
    'utf8'
  );
  assert.match(header, /sessionE1rmFromSets/);
  assert.match(header, /data-testid="session-e1rm"/);
  assert.match(header, /SESSION_E1RM_COPY\.line/);
  assert.match(header, /not a tested max/);
  assert.doesNotMatch(header, /test your 1RM/i);
  assert.doesNotMatch(header, /your max/i);
  assert.match(menu, /SESSION_E1RM_COPY\.(hide|show)/);
  assert.match(menu, /onToggleE1rm/);
  assertHonest('ActiveExerciseHeader.tsx', header);
  assertHonest('ActiveExerciseMoreMenu.tsx', menu);
});
