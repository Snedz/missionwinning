/**
 * Coach output must quote the log or admit it has none.
 *
 * East Asia shard (mission-ops #13): coach-from-logs clarity **2.56/5**, the
 * lowest item, from an AI-skeptical cohort — *"coach output has no log-derived
 * labels"*. The product's answer to "where did this week come from?" was three
 * provenance *claims* ("built from your logs", "AI weekly plan") and no
 * evidence. A claim is what a fabricated plan would also make, so to this reader
 * it is worse than silence.
 *
 * These tests hold the two halves of the fix: the citation quotes a stored set
 * exactly, and every Coach surface that can be on screen carries either a
 * citation or the no-logs sentence.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import {
  COACH_CITATION_COPY,
  FORBIDDEN_GENERIC_AI,
  coachCitationFact,
  coachCopyAvoidsGenericAi,
  coachLogCitation,
} from '@/lib/coach/logCitation';
import type { CompletedWorkoutLog } from '@/types';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

/**
 * No date literals: a fixture with a date in it is a fixture with an expiry
 * date, and `sessionsLast7` is a rolling window.
 */
const NOW = new Date('2031-06-15T18:00:00.000Z');
const daysBefore = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();

function log(over: Partial<CompletedWorkoutLog> = {}): CompletedWorkoutLog {
  return {
    id: 'w',
    workoutName: 'Push A',
    startedAt: daysBefore(0),
    completedAt: daysBefore(0),
    durationSeconds: 1800,
    totalVolume: 1000,
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 60 }] }],
    ...over,
  };
}

test('an empty device says so instead of claiming provenance', () => {
  for (const history of [[], undefined as unknown as CompletedWorkoutLog[], null as unknown as CompletedWorkoutLog[]]) {
    assert.equal(coachLogCitation(history, NOW).kind, 'no-logs');
  }
  assert.equal(coachCitationFact({ kind: 'no-logs' }, 'en', 'kg'), null);
});

test('a loaded set is quoted exactly as stored', () => {
  const cite = coachLogCitation([log()], NOW);
  assert.equal(cite.kind, 'set');
  if (cite.kind !== 'set') return; // precondition, not a skip
  assert.equal(cite.weight, 60);
  assert.equal(cite.reps, 5);
  assert.match(cite.exerciseName, /bench/i);

  const fact = coachCitationFact(cite, 'en', 'kg');
  assert.ok(fact && fact.includes('60kg'), `expected the stored load in "${fact}"`);
  assert.ok(fact!.includes('× 5'), `expected the stored reps in "${fact}"`);
});

test('the most recent log wins, because that is the set the reader remembers', () => {
  const older = log({
    id: 'old',
    completedAt: daysBefore(9),
    exercises: [{ exerciseId: 'squat', sets: [{ reps: 3, weight: 140 }] }],
  });
  const newer = log({
    id: 'new',
    completedAt: daysBefore(1),
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 8, weight: 50 }] }],
  });
  // Heavier is older: a "biggest lift" rule would pick the squat and be wrong.
  for (const order of [[older, newer], [newer, older]]) {
    const cite = coachLogCitation(order, NOW);
    assert.equal(cite.kind, 'set');
    if (cite.kind !== 'set') return;
    assert.equal(cite.weight, 50, 'quoted the older, heavier set instead of the last one');
  }
});

test('a bodyweight-only session is quoted as a session, never as a 0 kg set', () => {
  const cite = coachLogCitation(
    [log({ workoutName: 'Mobility flow', exercises: [{ exerciseId: 'push-ups', sets: [{ reps: 20, weight: 0 }] }] })],
    NOW
  );
  assert.equal(cite.kind, 'session');
  if (cite.kind !== 'session') return;
  assert.equal(cite.sessionName, 'Mobility flow');
  const fact = coachCitationFact(cite, 'en', 'kg');
  assert.ok(fact && !/0kg/.test(fact), `quoted a zero load: "${fact}"`);
});

test('zero-rep rows from older builds are not quotable sets', () => {
  const cite = coachLogCitation(
    [log({ exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 0, weight: 60 }] }] })],
    NOW
  );
  assert.equal(cite.kind, 'session', 'a 0×60 row is not a set anyone performed');
});

test('a deleted log is never quoted back at the athlete', () => {
  const cite = coachLogCitation([log({ deletedAt: daysBefore(0) })], NOW);
  assert.equal(cite.kind, 'no-logs', 'tombstoned rows are deletions the athlete asked for');
});

test('an unparseable timestamp is dropped rather than dated', () => {
  const cite = coachLogCitation([log({ completedAt: 'not-a-date' })], NOW);
  assert.equal(cite.kind, 'no-logs');
});

test('the 7-day count is a rolling window, inclusive of today', () => {
  const history = [
    log({ id: 'a', completedAt: daysBefore(0) }),
    log({ id: 'b', completedAt: daysBefore(3) }),
    log({ id: 'c', completedAt: daysBefore(6) }),
    log({ id: 'd', completedAt: daysBefore(30) }),
  ];
  const cite = coachLogCitation(history, NOW);
  assert.equal(cite.kind, 'set');
  if (cite.kind !== 'set') return;
  assert.equal(cite.sessionsLast7, 3, 'the 30-day-old session is not part of this week');
});

test('numbers and dates go through the app locale, not the browser', () => {
  const cite = coachLogCitation(
    [log({ exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 62.5 }] }] })],
    NOW
  );
  const de = coachCitationFact(cite, 'de', 'kg');
  assert.ok(de?.includes('62,5kg'), `German decimal comma missing from "${de}"`);
  const en = coachCitationFact(cite, 'en', 'kg');
  assert.ok(en?.includes('62.5kg'), `English decimal point missing from "${en}"`);
});

test('the unit label is the caller’s, so an imperial athlete is not told kg', () => {
  const cite = coachLogCitation([log()], NOW);
  assert.ok(coachCitationFact(cite, 'en', 'lbs')?.includes('60lbs'));
});

/*
 * ---------------------------------------------------------------------------
 * No generic AI copy — and a citation actually present on every surface.
 * ---------------------------------------------------------------------------
 */

test('the citation copy describes the evidence, not the technology', () => {
  const result = coachCopyAvoidsGenericAi({ ...COACH_CITATION_COPY });
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.ok(FORBIDDEN_GENERIC_AI.length >= 5, 'the forbidden list was emptied');
});

test('the generic-AI screen fails closed on the phrasing that shipped', () => {
  // Verbatim the value `BOOTSTRAP_EN.todayCoachInviteEyebrow` carried until `.766`.
  const bad = coachCopyAvoidsGenericAi({ eyebrow: 'AI weekly plan' });
  assert.equal(bad.ok, false);
  const alsoBad = coachCopyAvoidsGenericAi({
    body: 'Adaptive plan from your gear and days/week — free every week, no API key required.',
  });
  assert.equal(alsoBad.ok, true, 'API-key copy is not a generic-AI claim — do not over-match');
  for (const phrase of ['Powered by AI', 'machine learning picks your week', 'A.I. coaching', 'smarter coach']) {
    assert.equal(coachCopyAvoidsGenericAi({ k: phrase }).ok, false, `missed: ${phrase}`);
  }
});

test('"AI-skeptical" prose in our own docs is not a product claim', () => {
  // The word appears in this file's own header and in logCitation.ts. A screen
  // that cannot tell a defect report from a defect is `.220`'s shape.
  assert.equal(coachCopyAvoidsGenericAi({ k: 'AI-skeptical cohort' }).ok, true);
});

test('BOOTSTRAP_EN carries no generic-AI Coach copy above a Coach surface', () => {
  const src = read('src/i18n/bootstrapResources.ts');
  const inviteKeys = ['todayCoachInviteEyebrow', 'todayCoachInviteTitle', 'todayCoachInviteBody'];
  for (const key of inviteKeys) {
    const m = new RegExp(`${key}:\\s*\\n?\\s*'([^']*)'`).exec(src);
    assert.ok(m, `${key} left BOOTSTRAP_EN — the Coach invite would paint a raw key`);
    const result = coachCopyAvoidsGenericAi({ [key]: m![1] });
    assert.equal(result.ok, true, `${key} = ${JSON.stringify(m![1])} — ${JSON.stringify(result)}`);
  }
});

/** Every rendering file, so a Coach claim cannot escape by moving folders. */
function componentFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(path.join(root, dir))) {
      const rel = `${dir}/${name}`;
      if (statSync(path.join(root, rel)).isDirectory()) walk(rel);
      else if (/\.tsx$/.test(rel)) out.push(rel);
    }
  };
  walk('src/components');
  walk('src/page-components');
  walk('app');
  return out;
}

const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

/**
 * A provenance claim: "from your logs" / "built from your logs" and kin.
 *
 * `.767` — widened to the *derived* phrasings after shard 3 repeated the
 * finding. `CoachInsightCard` says *"From your recent training load and
 * recovery"*: load and recovery are computed from sessions, so that sentence
 * makes the same promise one step removed, and the original pattern did not see
 * it. The list is closed and every entry is a spelling this repo ships.
 */
const PROVENANCE_CLAIM =
  /from your (?:logs|history|workout logs|recent training|recent logs)|built from your|logs alone|from your gear and days/i;

/**
 * A *Coach* provenance claim is one made under a Coach key.
 *
 * The first draft matched the sentence anywhere in a coach/today file and
 * flagged `TodayProgressSection`, whose claim is
 * `'Milestones from your logs — streaks and volume feed Mission Score.'` — a
 * **rewards** line. Citing a set under it would have been wrong twice: it does
 * not describe a plan, and `domainBoundary.test.ts` C1–C3 keeps the planner and
 * standing apart on purpose. So the key carries the scope, which is also the
 * thing a reviewer can check: coach copy lives under a coach key.
 */
function coachClaimKeys(src: string): string[] {
  const clean = stripComments(src);
  const re = /\bt\(\s*(['"])([A-Za-z][A-Za-z0-9_.]*)\1\s*,\s*\{[\s\S]{0,400}?defaultValue:\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g;
  const keys: string[] = [];
  for (const m of clean.matchAll(re)) {
    const key = m[2];
    const value = m[3].slice(1, -1);
    if (/coach/i.test(key) && PROVENANCE_CLAIM.test(value)) keys.push(key);
  }
  return keys;
}

/**
 * Files allowed to make the claim without rendering a citation, each with the
 * reason. Asserted to still make a claim, so a stale row cannot sit here
 * quietly — which is how the `CoachVoiceCard` row I wrote from memory got
 * caught: it makes no provenance claim at all.
 */
const CLAIM_WITHOUT_CITE_EXEMPT: Record<string, string> = {
  'src/components/coach/CoachAdaptBanner.tsx':
    '`.693` — this component *is* the citation (input · rule · effect from weekRationale); a second one under it would repeat itself.',
  'src/components/coach/PlanSessionCard.tsx':
    '`.699` — session rationale *is* the citation (input · rule · effect from the log); a second one under it would repeat itself.',
  'src/components/bundle/BundleShopStack.tsx':
    'Shop merch names the Coach-from-logs mechanism; `/bundle` has no athlete log to quote.',
  'src/components/nutrition/FuelMealPlanCard.tsx':
    'Fuel Coach generate copy names the mechanism before a plan exists; there is no set to quote until meals are logged.',
};

test('a Coach provenance claim never ships without a citation beside it', () => {
  const files = componentFiles();
  assert.ok(files.length > 200, `only ${files.length} components found — walk broken?`);

  const claiming = files.filter((f) => coachClaimKeys(read(f)).length > 0);
  assert.ok(
    claiming.length >= 3,
    `only ${claiming.length} files make a Coach provenance claim — the pattern stopped matching`
  );

  /*
   * The **rendered element**, not the import. The first draft tested
   * `/CoachLogCite/`, which the `import` line satisfies on its own — so deleting
   * `<CoachLogCite />` from `CoachTodayCard` and from `/coach` left this green.
   * Two mutants survived and said so. A guard that a leftover import can satisfy
   * is checking spelling, not behaviour.
   */
  const uncited = claiming.filter((f) => {
    if (f in CLAIM_WITHOUT_CITE_EXEMPT) return false;
    return !/<CoachLogCite[\s/>]/.test(stripComments(read(f)));
  });

  assert.deepEqual(
    uncited,
    [],
    `These tell the athlete the plan comes from their logs without naming one. ` +
      `Render <CoachLogCite /> (it also owns the no-logs case), or exempt with a ` +
      `reason:\n  ${uncited.join('\n  ')}`
  );
});

test('every claim-without-citation exemption is still true', () => {
  for (const [file, reason] of Object.entries(CLAIM_WITHOUT_CITE_EXEMPT)) {
    assert.ok(reason.length > 30, `${file} needs a reason, not a label`);
    assert.ok(
      coachClaimKeys(read(file)).length > 0,
      `${file} no longer makes a Coach provenance claim — delete its exemption`
    );
  }
});

test('the citation component reads the log, not the plan', () => {
  const src = read('src/components/coach/CoachLogCite.tsx');
  assert.match(src, /coachLogCitationFromStorage/);
  assert.doesNotMatch(
    src,
    /useCoachPlan|loadPlan/,
    'citing the plan would quote the output back as its own evidence'
  );
  assert.match(src, /coachCiteNoLogs/, 'the no-logs branch is half the point');
});
