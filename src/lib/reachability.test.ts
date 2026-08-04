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
  const page = stripComments(read('src/page-components/ActiveWorkoutPage.tsx'));
  const finish = stripComments(read('src/lib/workout/activeSessionFinish.ts'));
  // `.405` — journal fields come from assembleActiveVictory; sheet id is still log.id.
  assert.match(
    page,
    /assembleActiveVictory\(/,
    'completion must assemble journal + victory from one pure helper'
  );
  assert.match(
    page,
    /saveJournalEntry\(\{\s*\.\.\.assembled\.journal/,
    'expected the completion handler to save the assembled journal entry'
  );
  const handed = /setVictoryWorkoutId\(([\w.]+)\)/.exec(page);
  assert.ok(handed, 'expected the completion handler to hand the sheet a workout id');
  assert.equal(
    handed![1],
    'log.id',
    `the sheet is given ${handed![1]} — feel rating must key off the finished log`
  );
  assert.match(
    finish,
    /workoutId:\s*params\.log\.id/,
    'assembled journal must key off the same finished log id'
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

/**
 * The mount decision itself lives in one place, not re-derived per shell.
 *
 * Lean calls `dayReviewMayMount` at the mount site. Dashboard goes through
 * `buildTodayCandidates`, which is the one pure ladder that already asks
 * `dayReviewMayMount` (guarded in buildTodayCandidates tests) — so a shell that
 * only spells the helper name is not the only honest path.
 */
test('both Today shells ask the same question about the evening card', () => {
  for (const shell of TODAY_SHELLS) {
    const src = read(shell);
    const viaHelper = mentions(src, 'dayReviewMayMount') > 0;
    const viaLadder = mentions(src, 'buildTodayCandidates') > 0;
    assert.ok(
      viaHelper || viaLadder,
      `${shell} mounts the evening card without dayReviewMayMount or buildTodayCandidates — two shells deciding "who sees this" separately is how they drift`
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
/**
 * `.212` — this rule only ever knew one spelling of its own defect.
 *
 * `.199` shipped it matching `toISOString().split('T')[0]` and nothing else. It
 * could not see `.slice(0, 10)`, and it passed `.199`'s own falsification
 * because my mutants used the spelling the regex knew. **Fifteen live call sites
 * used the other one**, including `weekRecap.ts`, which serialised a correct
 * *local* Monday through `toISOString()` and shared the wrong week with every
 * athlete east of UTC.
 *
 * The general rule, since this is its fourth appearance in this programme:
 * *a guard keyed to one spelling of a defect has only ever tested that
 * spelling.* Where a parsed shape can be asserted, assert that. Where only
 * source text is available — as here — enumerate the spellings **explicitly**
 * and say why the list is closed.
 *
 * The list is closed because these are the only three ways JavaScript has to
 * take the date half of an ISO string: split on the separator, or slice/substring
 * the first ten characters. `substr` is included because it is deprecated, not
 * removed, and a copy-paste from an old file would still compile.
 */
const UTC_DATE_SPELLINGS = [
  /toISOString\(\)\s*\.\s*split\(\s*'T'\s*\)\s*\[\s*0\s*\]/,
  /toISOString\(\)\s*\.\s*slice\(\s*0\s*,\s*10\s*\)/,
  /toISOString\(\)\s*\.\s*substring\(\s*0\s*,\s*10\s*\)/,
  /toISOString\(\)\s*\.\s*substr\(\s*0\s*,\s*10\s*\)/,
  /*
   * `.241` — **fifth appearance, and the list above was closed on the wrong axis.**
   *
   * `.212` widened this from one slicing spelling to four and wrote that the list
   * was closed "because these are the only three ways JavaScript has to take the
   * date half of an ISO string". True — and it examined only the *slicing* half of
   * the expression. Every pattern above requires a literal `toISOString()` call,
   * so none of them could see the same defect performed on an ISO string that was
   * **already stored**:
   *
   *     w.completedAt.split('T')[0] >= weekStart   // pillarScoreInputs, challenges
   *     const day = at.split('T')[0];              // TodayJournalStrip
   *
   * `completedAt` is a UTC instant. Its date half is the UTC date, and all three
   * sites compared it against a *local* key — `weekStartIso()`, `state.weekStart`,
   * `localDateKey()`. Exactly the frame mismatch `.212` found in `weekRecap`,
   * three more times, surviving the sweep that was written for it because the
   * guard was keyed to how the date was produced rather than to what it was.
   *
   * The rule generalises: *the defect is comparing a UTC-derived date to a local
   * one, so match the shape, not the constructor.* These field names are the ISO
   * timestamps this app stores; a new one must be added here when it is added to
   * a type.
   */
  /\b(?:completedAt|startedAt|updatedAt|createdAt|deletedAt|generatedAt|at)\s*\.\s*split\(\s*'T'\s*\)\s*\[\s*0\s*\]/,
  /\b(?:completedAt|startedAt|updatedAt|createdAt|deletedAt|generatedAt|at)\s*\.\s*slice\(\s*0\s*,\s*10\s*\)/,
];

/**
 * Surfaces where UTC *is* the right frame, each with the reason on the record.
 *
 * `.241` — the widened patterns caught three sites that are not defects: a
 * founder admin panel and a server-composed email. There is no athlete and no
 * device timezone in either; the server's own frame is the only one available,
 * and `localDateKeyFromIso` there would resolve to UTC anyway while implying a
 * localisation that is not happening.
 *
 * An entry needs a reason, the way `check-design-system`'s allowlist does — a
 * bare list of exempt files is how a rule quietly stops applying.
 */
/*
 * `BetaAdminPanel.tsx` was here and is not any more, and the staleness rule
 * below is what removed it — the first time either direction of that rule has
 * fired on real work rather than on a mutant.
 *
 * `.241` exempted it because the feedback-note date column showed server
 * timestamps to one person reading them beside server logs. `.245` then changed
 * that column from `note.at.slice(0, 10)` to `localDateKeyFromIso`, which left
 * no site in the file for the pattern to match, so the entry was claiming an
 * exemption nothing needed. The remaining `toISOString()` in that file stamps
 * `Captured:` on a proof export — a full instant, not a calendar date, so it is
 * outside this rule rather than exempt from it.
 *
 * Local won on the merits: the panel's own download filename already uses
 * `localDateKey()`, so a UTC column disagreed with the file the founder had just
 * saved from the same screen.
 *
 * `founderDigestCompose.ts` went the same way and for a duller reason: its
 * exemption argued that a server-composed email has no client timezone, which is
 * true, but `.245` had already rewritten both of its sites and the runtime is
 * UTC, so `localDateKeyFromIso` returns the identical string. Putting
 * `.slice(0, 10)` back purely to keep an allowlist entry alive would be
 * reintroducing the banned spelling to justify the exception to it.
 *
 * **So this list is empty, and that is the honest state** — not an oversight.
 * Every site the rule matches now complies. The mechanism stays because the next
 * genuine exception should have to write down its reason, and because a list
 * that has to be emptied is the evidence the staleness rule works; deleting it
 * would leave the next person to rediscover why exemptions need reasons.
 */
const UTC_IS_CORRECT: { file: string; why: string }[] = [];

test('no calendar date is derived from toISOString()', () => {
  const exempt = new Set(UTC_IS_CORRECT.map((e) => e.file));
  for (const { file, why } of UTC_IS_CORRECT) {
    assert.ok(why.trim().length > 40, `${file}: an exemption needs a real reason, not a note`);
    assert.ok(PRODUCT_SOURCE.includes(file), `${file} is exempt but no longer exists — drop the entry`);
    // A stale exemption is a rule that has quietly stopped applying (`.219`,
    // `.220`): if the file would pass anyway, the entry must go.
    assert.ok(
      UTC_DATE_SPELLINGS.some((re) => re.test(stripComments(read(file)))),
      `${file} no longer derives a UTC date — remove it from UTC_IS_CORRECT`
    );
  }

  const offenders: string[] = [];
  for (const file of PRODUCT_SOURCE) {
    if (exempt.has(file)) continue;
    const src = stripComments(read(file));
    if (UTC_DATE_SPELLINGS.some((re) => re.test(src))) {
      offenders.push(file);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `these build a calendar date out of a UTC instant — use localDateKey():\n  ${offenders.join('\n  ')}`
  );
});

/**
 * The same defect, one spelling further out — and `.212`'s lesson for the
 * **fourth** time.
 *
 * `UTC_DATE_SPELLINGS` above requires a literal `toISOString()` **call** next to
 * the slice. But an ISO instant does not have to be produced on the spot to be
 * sliced: it is usually read back out of storage, where it is already a plain
 * string. `w.completedAt.split('T')[0]` is byte-for-byte the same bug and the
 * guard could not see any of it.
 *
 * What that hid, proved in `Pacific/Auckland` before anything was touched:
 * [`buildTodayTrends`](todayTrends.ts) keys its buckets with `localDateKey`
 * and keyed the workouts with the **UTC** date, so an athlete training at
 * 10:00 on 1 Aug (`2026-07-31T21:00:00Z`) had that session counted on **31
 * Jul**. East of UTC that is the entire morning — most of when people train —
 * landing one bar to the left, and today's own column reading zero on the
 * Today trend strip. The same comparison decides whether a pillar win falls
 * inside the current week in [`pillarScoreInputs`](pillarScoreInputs.ts),
 * which feeds the **Mission Score**.
 *
 * ## Why this one needs an allowlist and the rule above does not
 *
 * `toISOString().slice(0, 10)` is *always* wrong for a calendar date. Slicing a
 * bare variable is not: `normalizeEntry` in `bodyMetrics.ts` truncates a field
 * that is **already** `YYYY-MM-DD`, which is defensive, not a timezone bug. And
 * `schoolClass.ts` writes `[record, ...existing].slice(0, 10)` — an **array**
 * cap that has nothing to do with dates at all, and which a pattern keyed to
 * `.slice(0, 10)` cannot tell apart from the real thing.
 *
 * So each exemption states the value being sliced and why UTC cannot enter,
 * and `no exempted date-slice is stale` below fails when one stops being true —
 * the `.219`/`.220` shape, applied in both directions.
 */
const DATE_SLICE_EXEMPT: { file: string; why: string }[] = [
  {
    file: 'src/lib/bodyMetrics.ts',
    why: '`raw.date` is already a `YYYY-MM-DD` key, not an instant — the slice is defensive truncation and no timezone is involved.',
  },
  {
    file: 'src/lib/progressPhotos.ts',
    why: '`input.date` is already a `YYYY-MM-DD` key supplied by the caller — same defensive truncation as bodyMetrics.',
  },
  {
    file: 'src/lib/schoolClass.ts',
    why: 'Not a date at all — `[record, ...existing].slice(0, 10)` caps an **array** at ten entries. A rule keyed to `.slice(0, 10)` cannot distinguish this from a date by shape.',
  },
  {
    file: 'src/components/public/ExercisesPublicFilter.tsx',
    why: 'Not a date either — `uniqueMuscleGroups(EXERCISES).slice(0, 10)` caps the muscle-group filter chips at ten. Same array-versus-date ambiguity as schoolClass.',
  },
];

/** A stored ISO string sliced into a calendar date, without a `toISOString()` in sight. */
const STORED_ISO_SLICE =
  /(?<!toISOString\(\))\s*\.\s*(?:split\(\s*'T'\s*\)\s*\[\s*0\s*\]|slice\(\s*0\s*,\s*10\s*\))/;

function slicesAStoredIso(src: string): boolean {
  return src
    .split('\n')
    .some((line) => STORED_ISO_SLICE.test(line) && !/toISOString\(\)\s*\./.test(line));
}

test('no calendar date is sliced off a stored ISO string either', () => {
  // `PRODUCT_SOURCE` holds paths already relative to root — `walk` returns
  // `path.relative(root, abs)` and `read` re-joins root. Relativising again
  // only worked because cwd happened to equal root.
  const exempt = new Set(DATE_SLICE_EXEMPT.map((e) => e.file));
  const offenders = PRODUCT_SOURCE.filter(
    (file) => !exempt.has(file) && slicesAStoredIso(stripComments(read(file)))
  );

  assert.deepEqual(
    offenders,
    [],
    'these slice a calendar date out of a stored UTC instant — use localDateKeyFromIso():\n  ' +
      offenders.join('\n  ')
  );
});

test('no exempted date-slice is stale', () => {
  /*
   * `.220`'s correction applied in the other direction: an exemption naming a
   * file that no longer slices anything makes the list look more considered
   * than it is, and the next reader inherits a rule nobody re-checked.
   */
  const stale = DATE_SLICE_EXEMPT.filter(
    (e) => !slicesAStoredIso(stripComments(read(e.file)))
  ).map((e) => e.file);
  assert.deepEqual(stale, [], 'these no longer need their exemption — remove them');
});

test('every date-slice exemption states why UTC cannot enter', () => {
  for (const e of DATE_SLICE_EXEMPT) {
    assert.ok(e.why.trim().length > 40, `${e.file}: "${e.why}" is not a reason`);
  }
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
