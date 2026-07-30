/**
 * A target is not a meal.
 *
 * `.206` — `MacroCalculator.applyTargets` called `saveMacroTargets(...)`, which
 * is the whole job, and then *also* unshifted a row into `mw_nutrition_log`:
 *
 *     { date: today, name: `Calc target protein ${protein}g`, protein, cals }
 *
 * Two independent failures came out of that one line.
 *
 * **Phantom intake.** `NutritionPage` sums every row dated today into the day's
 * *consumed* totals. So setting a 2400 kcal / 180 g target made Fuel report 2400
 * kcal already eaten, before a single meal — and it fed
 * `countHighProteinDaysFromNutritionLog` (threshold 150 g), inflating the
 * Mission Score's Fuel pillar off a number the athlete had only wished for. That
 * is the `.127` rule broken at the source: nothing said on thin data, least of
 * all a score.
 *
 * **Silent truncation.** It wrote `logs.slice(0, 50)`. Every other writer keeps
 * **90 days** through `pruneNutritionLogToDays`. At ~4 entries a day, 50 rows is
 * under two weeks — so one tap of "Apply targets" deleted months of real meals,
 * and `NutritionPage`'s own next write persisted the truncated array back.
 *
 * `.170` already ruled that non-food rows do not belong in the Fuel diary, and
 * put the predicate beside the writer. This is the same rule one layer down, on
 * the device log rather than the cloud table — so the guard is stated the same
 * way: **the writer is the thing under test.**
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

const CALC = 'src/components/calculators/MacroCalculator.tsx';

test('applying macro targets writes targets and nothing else', () => {
  const src = stripComments(read(CALC));
  const body = src.slice(src.indexOf('const applyTargets ='), src.indexOf('return ('));

  assert.match(body, /saveMacroTargets\(/, 'applying targets must still save the targets');
  assert.doesNotMatch(
    body,
    /nutritionLog/,
    'a macro target is a plan, not something eaten — writing it to the food log makes Fuel ' +
      "report the day's goal as the day's intake, before any meal exists"
  );
});

/**
 * The cap is the second half and would survive a fix that only removed the
 * `name` field, so it gets its own rule. Stated repo-wide rather than about this
 * one file: any future writer that invents its own retention is the same bug.
 */
test('nothing truncates the food log by row count', () => {
  const offenders: string[] = [];
  for (const file of [CALC, 'src/page-components/NutritionPage.tsx', 'src/lib/nutritionQuickLog.ts']) {
    const src = stripComments(read(file));
    // `slice(0, N)` applied to the nutrition log — a row cap where the repo's
    // one retention rule is a 90-day window.
    if (/nutritionLog[\s\S]{0,200}?\.slice\(\s*0\s*,\s*\d+\s*\)/.test(src)) offenders.push(file);
  }
  assert.deepEqual(
    offenders,
    [],
    'the food log is pruned by age (`pruneNutritionLogToDays`, 90 days), never by row count — ' +
      'a 50-row cap is under two weeks for a real user and deletes months of meals:\n  ' +
      offenders.join('\n  ')
  );
});

/**
 * The window itself, pinned. It is the one number that decides how much history
 * an athlete keeps, and it is currently agreed on by every writer — which is
 * exactly the property that broke here.
 */
test('the food log retention window is stated once', () => {
  const src = read('src/lib/nutritionQuickLog.ts');
  const m = /export function pruneNutritionLogToDays\([\s\S]*?days = (\d+)/.exec(src);
  assert.ok(m, 'pruneNutritionLogToDays no longer declares a default window');
  assert.equal(Number(m![1]), 90, 'the food-log window is 90 days; change it here, not per caller');
});
