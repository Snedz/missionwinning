/**
 * The checklist is reachable after the athlete dismisses it.
 *
 * `.240` shipped First Steps with exactly one mount — a Today card — and a
 * Dismiss writing `mw_first_steps_dismissed` through `useDismissed`, which
 * **never clears**. The same card also retires itself on `progress.complete`.
 * Two endings, both terminal: dismissed or finished, the checklist and the sheet
 * behind it were gone for the life of the install, and there was no reset
 * control anywhere in Profile.
 *
 * Nothing said so. `firstSteps.test.ts` asked whether the *steps* were right —
 * they were — and `todayGuidanceMount.test.ts` asked whether both Today shells
 * agreed about when to mount, which they did. Both are true of a surface with a
 * one-way exit. The gap was that no test asked *how many doors there are*, which
 * is `.195` in its original form: can anyone actually get to what the app shows?
 *
 * So this counts doors. It **discovers** them (`.220`) rather than asserting
 * that one named file imports one named sheet, because an enumeration would pass
 * the moment someone moved the second mount somewhere else and rot silently if
 * they deleted it.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const abs = path.join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.tsx?$/.test(abs)) out.push(path.relative(root, abs));
  }
  return out;
}

const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

const PRODUCT = [...walk(path.join(root, 'src')), ...walk(path.join(root, 'app'))].filter(
  (p) => !/\.(test|routetest)\.tsx?$/.test(p)
);

/** Files that render `<FirstStepsSheet`, however they got hold of it. */
function sheetMounts(): string[] {
  return PRODUCT.filter((f) => /<FirstStepsSheet\b/.test(stripComments(read(f))));
}

test('the checklist has more than one way in', () => {
  const mounts = sheetMounts();
  assert.ok(
    mounts.length >= 2,
    'FirstStepsSheet has ' +
      `${mounts.length} mount(s): ${mounts.join(', ') || 'none'}. ` +
      'The Today card dismisses to a flag nothing clears and retires itself on ' +
      'completion, so a single mount means the checklist is unreachable forever ' +
      'after either ending.'
  );
});

/**
 * At least one door must not be the dismissable one.
 *
 * Two mounts both gated on `dismissed` would satisfy the count above and change
 * nothing — the vacuity `.220` names, where a check's name claims more than its
 * assertion delivers. A surviving mount is one that never reads the dismiss key.
 */
test('at least one way in survives the dismissal', () => {
  const survivors = sheetMounts().filter((f) => {
    const src = stripComments(read(f));
    return !/FIRST_STEPS_DISMISS_KEY|useDismissed/.test(src);
  });
  assert.ok(
    survivors.length >= 1,
    'every FirstStepsSheet mount is gated on the dismiss flag, so dismissing ' +
      'still ends onboarding permanently'
  );
});

/**
 * And Dismiss says where it goes.
 *
 * A control that moves something is allowed to be called Dismiss only while
 * that is what it does. Now that the sheet survives in More, the old bare
 * "Dismiss" would be the copy describing the *previous* behaviour — the
 * `.221`-class defect where a rule outlives the thing it described.
 */
test('the dismiss control names where the checklist goes', () => {
  const card = read('src/components/journey/FirstStepsCard.tsx');
  assert.match(
    stripComments(card),
    /firstStepsDismissToMore/,
    'the Today card still uses the bare dismiss label'
  );
  const en = read('src/i18n/firstStepsLocales.ts');
  const line = en.split('\n').find((l) => l.includes("firstStepsDismissToMore:")) ?? '';
  assert.match(line, /More/i, 'the English label must name the surface it moves to');
});
