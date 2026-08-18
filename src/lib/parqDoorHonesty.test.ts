/**
 * PAR-Q door is Continue to this week.
 *
 * ParqIntakeCard reused Assessments keys. Packs win, so first paint
 * said Continue to this week then Submit Assessment, and the notes
 * became the Assessments lecture.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { firstStepsStringsFor } from '@/i18n/firstStepsLocales';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const abs = path.join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.tsx$/.test(abs)) out.push(path.relative(root, abs));
  }
  return out;
}

const PRODUCT = [...walk(path.join(root, 'src')), ...walk(path.join(root, 'app'))].filter(
  (p) => !/\.(test|routetest)\.tsx$/.test(p)
);

const PARQ = 'src/components/coach/ParqIntakeCard.tsx';
const ASSESS = 'src/page-components/AssessmentsPage.tsx';
const ASSESS_KEYS = /t\('(submitAssessment|assessDisclaimer|assessRisk(?:High|Moderate|Low)Notes)'/;

test('firstStepParqContinue pack is Continue to this week', () => {
  assert.equal(firstStepsStringsFor('en').firstStepParqContinue, 'Continue to this week');
});

test('only Assessments uses the assess lecture keys', () => {
  const offenders = PRODUCT.filter((f) => {
    if (f === ASSESS) return false;
    return ASSESS_KEYS.test(read(f));
  });
  assert.deepEqual(
    offenders,
    [],
    'submitAssessment / assessRisk* / assessDisclaimer belong to Assessments. ' +
      `Offenders: ${offenders.join(', ') || 'none'}`
  );
  assert.match(read(ASSESS), /t\('submitAssessment'/, 'Assessments still owns Submit Assessment');
});

test('PAR-Q door uses firstStepParq keys with matching defaults', () => {
  const src = read(PARQ);
  const en = firstStepsStringsFor('en');
  for (const [key, value] of [
    ['firstStepParqContinue', en.firstStepParqContinue],
    ['firstStepParqDisclaimer', en.firstStepParqDisclaimer],
    ['firstStepParqNotesHigh', en.firstStepParqNotesHigh],
    ['firstStepParqNotesModerate', en.firstStepParqNotesModerate],
    ['firstStepParqNotesLow', en.firstStepParqNotesLow],
  ] as const) {
    assert.match(src, new RegExp(`t\\('${key}'`), `PAR-Q missing ${key}`);
    const m = new RegExp(
      `t\\('${key}',[\\s\\S]*?defaultValue:\\s*(['"])([\\s\\S]*?)\\1`
    ).exec(src);
    assert.ok(m, `${key} needs a literal defaultValue`);
    assert.equal(m[2].replace(/\s+/g, ' ').trim(), value.replace(/\s+/g, ' ').trim());
  }
});
