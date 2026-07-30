/**
 * Was it built, and can anyone get to it?
 *
 * Every test in this repo asserted that the `.190`–`.194` wave *computed* the
 * right thing. Not one asserted that a person could see it. Three separate
 * defects shipped behind that gap in a single night:
 *
 *   - `HomeTodayLean` — the shell every new athlete lands on, since
 *     `phase ?? 'basic'` routes there — contained zero references to the
 *     Day-in-Review card. Three PRs of work reached nobody.
 *   - `setJournalFeel` had no callers while `JournalTimeline` rendered
 *     `· Feel N/5`, so the field was displayed and never written. That is
 *     `.184` returning under a different name.
 *   - `behaviorById` and `roundToQuarterHour` sat unused in `behaviors.ts`
 *     while two components re-implemented both — the `.178` two-definitions
 *     shape, minted twice in one file pair.
 *
 * The through-line is one rule: *a thing was built, and nothing asserted anyone
 * could reach it.* So this suite states the rule executably rather than fixing
 * three instances of it and waiting for the fourth.
 *
 * It reads source text, like `surfaceReality.test.ts` does and for the same
 * reason: the alternative is rendering React in a node test, and a grep that
 * fails loudly beats an integration harness nobody runs. That matters more than
 * usual right now — Actions is billing-blocked, so `npm run gate` is the gate.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const abs = path.join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.tsx?$/.test(abs)) out.push(path.relative(root, abs));
  }
  return out;
}

const isTest = (p: string) => /\.(test|routetest)\.tsx?$/.test(p);
const ALL_SOURCE = [...walk(path.join(root, 'src')), ...walk(path.join(root, 'app'))];
const PRODUCT_SOURCE = ALL_SOURCE.filter((p) => !isTest(p));

/** Comments describe intent; only code reaches anything. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

/**
 * Import statements, removed.
 *
 * Importing a symbol is not using it, and this suite has now been fooled by
 * that three separate times: `.198`'s shell guard counted a component name
 * inside `dynamic(() => import('…'))`, and `.199`'s orphan rule counted
 * `savePreferredDays` in the very import line of the file that had stopped
 * calling it. Both mutants walked straight through. Stripping imports before
 * counting is the fix in one place instead of three.
 */
function stripImports(src: string): string {
  return src.replace(/^import\s[\s\S]*?;$/gm, '');
}

/** Real references — not comments, not imports. */
function mentions(src: string, name: string): number {
  const code = stripImports(stripComments(src));
  return (code.match(new RegExp(`\\b${name}\\b`, 'g')) ?? []).length;
}

/* ------------------------------------------------------------------ *
 * (a) Nothing in the wave is exported into the void.
 * ------------------------------------------------------------------ */

/**
 * The modules the wave added or reshaped. Deliberately a short, named list
 * rather than all of `src/lib`: a rule that fires on a hundred pre-existing
 * exports is a rule someone turns off in week one.
 */
const WAVE_MODULES = [
  'src/lib/behaviors.ts',
  'src/lib/sleepConsistency.ts',
  'src/lib/dayReview.ts',
  'src/lib/dayReviewNudge.ts',
  'src/lib/journal/behaviorImpacts.ts',
  'src/lib/journal/composeEntry.ts',
  'src/lib/today/dayReviewMount.ts',
  // `.199` — `savePreferredDays` lived here with zero callers, so
  // `loadPreferredDays()` always returned `[]` and `mapToCalendar`'s
  // athlete's-chosen-days branch was permanently dead. `splitPlanner.test.ts`
  // passes `preferredDays` in directly, so it proved the branch worked while
  // nothing on earth could reach it — the `.195` shape exactly.
  'src/lib/coach/schedulePrefs.ts',
];

/**
 * Escape hatch, deliberately uncomfortable to use: every entry needs a reason,
 * and the reason is read by whoever adds the next one. This is empty, and an
 * empty table is the point — an orphan allowlist that fills up is an orphan
 * allowlist that has replaced the rule it was meant to enforce.
 */
const ALLOWED_ORPHANS: { module: string; name: string; reason: string }[] = [];

test('every export of the wave is reached by something', () => {
  const orphans: string[] = [];

  for (const modulePath of WAVE_MODULES) {
    const src = read(modulePath);
    const names = [...stripComments(src).matchAll(/^export (?:async )?function (\w+)|^export const (\w+)/gm)]
      .map((m) => m[1] ?? m[2])
      .filter((n): n is string => !!n);

    for (const name of names) {
      const allowed = ALLOWED_ORPHANS.find((o) => o.module === modulePath && o.name === name);
      if (allowed) {
        assert.ok(
          allowed.reason.trim().length > 0,
          `ALLOWED_ORPHANS entry for ${name} has no reason — an allowlist without reasons is a disabled test`
        );
        continue;
      }

      // Reached if the product imports it, or if the module itself depends on
      // it (an internal helper exported so a unit test can pin the tricky part
      // is legitimate; an export nothing at all refers to is not).
      const usedByProduct = PRODUCT_SOURCE.some(
        (f) => f !== modulePath && mentions(read(f), name) > 0
      );
      const usedInternally = mentions(src, name) > 1;
      if (!usedByProduct && !usedInternally) orphans.push(`${modulePath} :: ${name}`);
    }
  }

  assert.deepEqual(
    orphans,
    [],
    `exports nothing refers to — delete them or give them a caller:\n  ${orphans.join('\n  ')}`
  );
});

/* ------------------------------------------------------------------ *
 * (b) A field on screen has a writer someone can trigger.
 * ------------------------------------------------------------------ */

/**
 * The `.184` class as a rule. Rendering a field the product never writes shows
 * the athlete a permanent blank and reads as a broken feature — worse than not
 * having built it, because it also costs trust.
 */
const RENDERED_FIELDS: {
  field: string;
  renderedIn: string;
  writer: string;
  writerModule: string;
}[] = [
  {
    field: 'journal feel',
    renderedIn: 'src/components/history/JournalTimeline.tsx',
    writer: 'setJournalFeel',
    writerModule: 'src/lib/journal/journalStore.ts',
  },
  {
    field: 'behaviors footer',
    renderedIn: 'src/components/history/JournalTimeline.tsx',
    writer: 'formatBehaviorFooter',
    writerModule: 'src/lib/behaviors.ts',
  },
];

test('a field the product renders has a writer the product calls', () => {
  for (const { field, renderedIn, writer, writerModule } of RENDERED_FIELDS) {
    assert.ok(
      PRODUCT_SOURCE.includes(renderedIn),
      `${renderedIn} is listed as rendering ${field} but is not a product file`
    );
    const callers = PRODUCT_SOURCE.filter(
      (f) => f !== writerModule && mentions(read(f), writer) > 0
    );
    assert.ok(
      callers.length > 0,
      `${renderedIn} renders ${field}, but nothing outside ${writerModule} calls ${writer}() — the field can only ever be blank`
    );
  }
});

/**
 * A writer that runs is only half of it: it has to write to the right row.
 *
 * The feel tap annotates the journal entry the just-finished session saved, so
 * both must name the same log. Two ids that merely look similar — the finished
 * log versus the store's `activeWorkout`, which is cleared by then — would give
 * a writer with callers, a test suite that passes, and a rating filed against
 * nothing.
 */
test('the victory sheet annotates the entry the same completion just saved', () => {
  const src = stripComments(read('src/page-components/ActiveWorkoutPage.tsx'));
  const saved = /saveJournalEntry\(\{\s*workoutId:\s*([\w.]+)/.exec(src);
  const handed = /setVictoryWorkoutId\(([\w.]+)\)/.exec(src);
  assert.ok(saved, 'expected the completion handler to save a journal entry keyed by workoutId');
  assert.ok(handed, 'expected the completion handler to hand the sheet a workout id');
  assert.equal(
    handed![1],
    saved![1],
    `the sheet is given ${handed![1]} while the entry is saved under ${saved![1]} — the feel rating would land on a different session, or none`
  );
});

/* ------------------------------------------------------------------ *
 * (c) A card exists on both Today shells, or on neither.
 * ------------------------------------------------------------------ */

/**
 * `HomePage` routes `i-day`/`basic` to the lean shell and everyone else to the
 * dashboard, and `phase ?? 'basic'` makes lean the default. A card mounted in
 * one shell is a card half the app cannot see — and it is the half that has
 * just arrived. Cards that should not appear for a phase self-suppress by
 * returning null; that decision belongs in the card, not in which file
 * someone remembered to edit.
 */
const TODAY_SHELLS = [
  'src/page-components/HomeTodayLean.tsx',
  'src/page-components/HomeTodayDashboard.tsx',
];

const WAVE_CARDS = ['TodayDayReviewCard'];

/**
 * Rendered, not merely mentioned.
 *
 * The first version of this test counted name occurrences, and a mutant that
 * deleted the JSX walked straight through it: the name still appeared inside
 * `dynamic(() => import('@/components/today/TodayDayReviewCard'))`, so the
 * shell "referenced" a card it never put on screen. An importing-is-not-using
 * hole in a test written specifically to catch importing-is-not-using.
 */
test('a Today card is mounted in every Today shell', () => {
  for (const card of WAVE_CARDS) {
    const missing = TODAY_SHELLS.filter(
      (shell) => !new RegExp(`<${card}\\b`).test(stripComments(read(shell)))
    );
    assert.deepEqual(
      missing,
      [],
      `${card} is never rendered in ${missing.join(', ')} — athletes routed to that shell never see it`
    );
  }
});

/** The mount decision itself lives in one place, not re-derived per shell. */
test('both Today shells ask the same question about the evening card', () => {
  for (const shell of TODAY_SHELLS) {
    assert.ok(
      mentions(read(shell), 'dayReviewMayMount') > 0,
      `${shell} mounts the evening card without dayReviewMayMount — two shells deciding "who sees this" separately is how they drift`
    );
  }
});

/* ------------------------------------------------------------------ *
 * (d) One concept, one definition.
 * ------------------------------------------------------------------ */

/**
 * `.178` in executable form. Both of these had two definitions each while the
 * shared one sat unused; the inline copy in `TodayDayReviewCard` also got the
 * midnight wrap wrong, which is exactly the bug a second definition exists to
 * produce.
 */
const SINGLE_DEFINITION: { concept: string; pattern: RegExp; home: string; use: string }[] = [
  {
    concept: 'quarter-hour rounding',
    pattern: /\/\s*15\s*\)\s*\*\s*15/,
    home: 'src/lib/behaviors.ts',
    use: 'roundToQuarterHour',
  },
  {
    concept: 'behavior lookup by id',
    pattern: /BEHAVIORS\.find\s*\(/,
    home: 'src/lib/behaviors.ts',
    use: 'behaviorById',
  },
  {
    // `.199` — this one had SIX definitions and four of them were wrong, each in
    // a different band of the world. Three called `toISOString()` on a local
    // date; the fourth anchored to noon first, which covers |offset| < 12 and
    // fails at UTC+13/+14.
    concept: 'start of the local week',
    pattern: /day\s*===\s*0\s*\?\s*-6\s*:\s*1\s*-\s*day/,
    home: 'src/lib/time/localDate.ts',
    use: 'startOfLocalWeek / localWeekKey',
  },
  {
    /*
     * `.208` — four filters for one quantity, and `percentLoad.ts` claimed in
     * prose that they all "quote the same number". The PR chip included sets
     * taken to failure while the chart, the debrief and the prescribed load all
     * excluded them, so the celebration fired on a number the rest of the app
     * refused to confirm.
     */
    concept: 'sets that support a strength estimate',
    pattern: /kind\s*!==\s*'warmup'\s*&&\s*s?\.?kind\s*!==\s*'failure'/,
    home: 'src/lib/workout/setKind.ts',
    use: 'countsTowardStrengthEstimate',
  },
  {
    // Five copies, differing only in whether they guarded NaN.
    concept: 'local YYYY-MM-DD formatting',
    pattern: /getMonth\(\)\s*\+\s*1\)\.padStart/,
    home: 'src/lib/time/localDate.ts',
    use: 'localDateKey / localDateKeyFromIso',
  },
];

/**
 * A calendar date is a local fact; `toISOString()` is an instant in UTC. Mixing
 * them is what produced the `.199` bug, and the mistake is invisible in review
 * because the code reads as if it were formatting a date.
 */
test('no calendar date is derived from toISOString()', () => {
  const offenders: string[] = [];
  for (const file of PRODUCT_SOURCE) {
    const src = stripComments(read(file));
    if (/toISOString\(\)\s*\.\s*split\(\s*'T'\s*\)\s*\[\s*0\s*\]/.test(src)) {
      offenders.push(file);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `these build a calendar date out of a UTC instant — use localDateKey():\n  ${offenders.join('\n  ')}`
  );
});

test('one concept has one definition', () => {
  for (const { concept, pattern, home, use } of SINGLE_DEFINITION) {
    const offenders = PRODUCT_SOURCE.filter(
      (f) => f !== home && pattern.test(stripComments(read(f)))
    );
    assert.deepEqual(
      offenders,
      [],
      `${concept} is defined outside ${home} in ${offenders.join(', ')} — call ${use}() instead`
    );
    assert.ok(
      pattern.test(stripComments(read(home))),
      `${concept} is no longer defined in ${home} — move this rule to wherever it went, do not delete it`
    );
  }
});
