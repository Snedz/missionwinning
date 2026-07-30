/**
 * What Today is allowed to load, and how many times it may read the day.
 *
 * `.197` removed five `loadCheckIns()` calls, a duplicated behavior-correlation
 * pass, and a Tuesday that downloaded the whole weekly-debrief module to be told
 * it was not the weekend. None of that stays removed on its own: the next card
 * that needs a check-in will call `loadCheckIns()`, because that is the obvious
 * thing to do and nothing says otherwise.
 *
 * So this says otherwise. Source-text reading in the `surfaceReality.test.ts`
 * idiom — a bundle-size assertion would be better and does not exist here, and a
 * grep that fails loudly beats a budget nobody measures.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(path.join(root, dir))) {
    const rel = path.join(dir, entry);
    if (statSync(path.join(root, rel)).isDirectory()) walk(rel, out);
    else if (/\.tsx?$/.test(rel) && !/\.(test|routetest)\.tsx?$/.test(rel)) out.push(rel);
  }
  return out;
}

/** Everything a Today render can pull in. */
const TODAY_PATH = [
  ...walk('src/components/today'),
  'src/page-components/HomeTodayLean.tsx',
  'src/page-components/HomeTodayDashboard.tsx',
  'src/hooks/useTodayDigest.ts',
];

/**
 * Modules that must never be reached by a *static* import from the Today path.
 * Each is either large, or only needed on one day of the week, or only after a
 * tap that most sessions never make.
 */
const NEVER_STATIC: { module: string; why: string; except?: string[] }[] = [
  {
    module: '@/lib/share/shareCard',
    why: 'canvas rendering, needed only when someone taps Share — import it inside the handler',
  },
  {
    module: '@/lib/weeklyDebrief',
    why: 'Sunday and Monday only; a Tuesday should not download it',
    // The hook is what imports it dynamically, and it needs the type.
    except: ['src/hooks/useTodayDigest.ts'],
  },
];

test('nothing heavy is statically imported on the Today path', () => {
  const offenders: string[] = [];
  for (const { module, except } of NEVER_STATIC) {
    for (const file of TODAY_PATH) {
      if (except?.includes(file)) continue;
      const src = stripComments(read(file));
      // `import type` erases at build time and costs nothing at runtime.
      const staticImport = new RegExp(
        `import\\s+(?!type\\b)[^;]*?from\\s+['"]${module.replace(/[/@]/g, '\\$&')}['"]`
      );
      if (staticImport.test(src)) offenders.push(`${file} → ${module}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `static imports of heavy modules on the Today path — use await import() at the point of use:\n  ${offenders.join('\n  ')}`
  );
});

/**
 * One read of the day, in one place.
 *
 * A single Today render called `loadCheckIns()` five times: three in
 * `TodayWeekRecapCard` alone, once in `TodayDayReviewCard`, once more via the
 * debrief. Each was individually reasonable, which is exactly why a rule is
 * needed rather than vigilance.
 */
test('only the digest hook reads the day from the device', () => {
  const READER = 'src/hooks/useTodayDigest.ts';
  const offenders = TODAY_PATH.filter(
    (f) => f !== READER && /\bloadCheckIns\s*\(/.test(stripComments(read(f)))
  );
  assert.deepEqual(
    offenders,
    [],
    `these read check-ins directly instead of using useTodayDigest():\n  ${offenders.join('\n  ')}`
  );
  assert.ok(
    /\bloadCheckIns\s*\(/.test(stripComments(read(READER))),
    `${READER} no longer reads check-ins — this guard is pointing at the wrong file`
  );
});

const DIGEST = 'src/lib/today/todayDigest.ts';
const CORRELATIONS = ['computeBehaviorImpacts', 'computeImpacts', 'computeSleepConsistency'];

/** The correlation passes are expensive and were being run twice, identically. */
test('the expensive correlations run only inside the digest', () => {
  for (const fn of CORRELATIONS) {
    const offenders = TODAY_PATH.filter((f) =>
      new RegExp(`\\b${fn}\\s*\\(`).test(stripComments(read(f)))
    );
    assert.deepEqual(
      offenders,
      [],
      `${fn}() is called outside ${DIGEST} on the Today path — the digest already has the result:\n  ${offenders.join('\n  ')}`
    );
  }
});

/**
 * One call site each, inside the digest itself.
 *
 * This is a shape guard, and deliberately so. "Ran exactly once" is not
 * observable through the digest's return value — a second pass over the same
 * arrays produces an equal result, so a mutant that recomputed
 * `computeBehaviorImpacts` for the evening review walked straight through the
 * behavioural test that was supposed to catch it. The property lives in the
 * number of call sites, so that is what gets asserted.
 *
 * Injecting these the way `buildDebrief` is injected would make it observable,
 * but that injection is earned by a dynamic import; doing it here would be
 * ceremony in place of a rule.
 */
test('each correlation has exactly one call site in the digest', () => {
  const src = stripComments(read(DIGEST));
  for (const fn of CORRELATIONS) {
    const calls = (src.match(new RegExp(`\\b${fn}\\s*\\(`, 'g')) ?? []).length;
    assert.equal(
      calls,
      1,
      `${fn}() is called ${calls} times in ${DIGEST} — the whole point of this module is that it runs once and the cards read the result`
    );
  }
});
