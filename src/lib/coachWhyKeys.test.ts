/**
 * Every reason the coach computes has words to say it with.
 *
 * `.252` — found while making the locale exporter emit the split shape. The
 * exporter now derives each namespace from `stringsFor('en')`, which dropped two
 * keys the committed `public/locales/en/coach.json` still carried:
 * `coachWhySteadyWeek` and `coachWhyPlateauDeload`. Both are **live** —
 * `loadGuard.ts:42` and `progression.ts:173` emit them — and neither existed in
 * `src/i18n/coachLocales.ts` at all.
 *
 * Nothing broke loudly, which is the problem.
 * [`PlanExerciseLine`](../components/coach/PlanExerciseLine.tsx) renders
 * `i18n.exists(ex.whyKey) ? t(ex.whyKey) : ''`, so a missing key is not a raw
 * key on screen — it is a **blank line**. The coach decided the week was a
 * plateau deload, wrote down why, and told the athlete nothing. In all fifteen
 * languages, for as long as those keys have been absent.
 *
 * The existing tests made it worse rather than catching it:
 * `progression.test.ts:117` and `loadGuard.test.ts:51` both assert the engine
 * picks the right `whyKey`. They were green the whole time, proving the *choice*
 * while nothing proved the *string*. `.184`'s shape — a field displayed and
 * never written — one layer down into i18n.
 *
 * **Discovered, not enumerated** (`.220`): the keys are scraped out of the coach
 * engine, so a new reason added tomorrow is covered without anyone remembering
 * to list it here.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { LOCALE_EXPORTS } from '@/lib/exportLocales';

const root = path.join(import.meta.dirname, '..', '..');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const abs = path.join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.ts$/.test(abs) && !/\.test\.ts$/.test(abs)) out.push(abs);
  }
  return out;
}

/** Comments quote key names while explaining them; only code emits one. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

function englishKeys(): Set<string> {
  const keys = new Set<string>();
  for (const entry of LOCALE_EXPORTS) {
    for (const k of Object.keys(entry.stringsFor('en') as Record<string, string>)) keys.add(k);
  }
  return keys;
}

test('every coachWhy* key the engine emits has an English string', () => {
  const en = englishKeys();
  const emitted = new Map<string, string>(); // key → first file that emits it

  for (const file of walk(path.join(root, 'src', 'lib', 'coach'))) {
    const src = stripComments(readFileSync(file, 'utf8'));
    for (const m of src.matchAll(/'(coachWhy[A-Za-z0-9]*)'/g)) {
      if (!emitted.has(m[1])) emitted.set(m[1], path.relative(root, file));
    }
  }

  assert.ok(emitted.size >= 5, `scraped only ${emitted.size} whyKeys — the scraper broke`);

  const missing = [...emitted.entries()]
    .filter(([key]) => !en.has(key))
    .map(([key, file]) => `${key}  (emitted by ${file})`);

  assert.deepEqual(
    missing,
    [],
    'these reasons render as a blank line — the engine writes the key and no pack defines it:\n  ' +
      missing.join('\n  ')
  );
});

test('the two keys that were missing are specifically covered', () => {
  /*
   * Named because they are the ones that were live and silent, and because the
   * scraper above could regress into finding nothing while still passing its own
   * size check if the coach engine were restructured.
   */
  const en = englishKeys();
  for (const key of ['coachWhySteadyWeek', 'coachWhyPlateauDeload']) {
    assert.ok(en.has(key), `${key} lost its English string again — see .252`);
  }
});
