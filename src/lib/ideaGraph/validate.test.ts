/**
 * Falsification, one mutant per rule.
 *
 * Every test below starts from a graph that validates clean, breaks exactly one
 * thing, and asserts that the specific rule fires. A guard suite that only ever
 * runs against the real repo proves the repo is currently fine; it does not
 * prove the guard can fail, and "a check that always passes measures as much as
 * one that always fails."
 *
 * Fixtures are built in a temp root rather than against `docs/mechanics/`, so
 * the rules are tested on their own terms and a future edit to the real graph
 * cannot quietly turn one of these green.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { MAX_NODES_PER_TYPE, MAX_NODE_BYTES, validateGraph } from './validate.ts';

type Files = Record<string, string>;

const BODY = '\n\nWhy this node exists.\n';

const CLEAN: Files = {
  'docs/mechanics/INDEX.md': `Budgets: ${MAX_NODE_BYTES} bytes per node, ${MAX_NODES_PER_TYPE} nodes per type.`,
  'docs/mechanics/ANTILIBRARY.md': [
    '| fingerprint | why | citation |',
    '|---|---|---|',
    '| `return+add+ladder` | two independent deaths | X-01 |',
    '| `vendor.example` | no methodology stated | — |',
  ].join('\n'),
  'src/lib/analytics.ts': "export type AnalyticsEvent =\n  | 'set_logged'\n  | 'reentry_shown';\n",
  'tests/e2e/first-90.spec.ts': 'const TAP_BUDGET = 5;\n',
  'src/lib/fakeEnforcer.test.ts': "test('C1: the wall stands', () => {});\n",

  'docs/mechanics/constraints/X-01.md':
    [
      '---',
      'id: X-01',
      'type: constraint',
      'title: The wall',
      'rule: Nothing crosses.',
      'enforcer: src/lib/fakeEnforcer.test.ts',
      'enforcer_anchor: C1: the wall stands',
      'authority: docs/SOMETHING.md',
      '---',
    ].join('\n') + BODY,

  'docs/mechanics/behaviors/B-01.md':
    [
      '---',
      'id: B-01',
      'type: behavior',
      'title: A stranger logs a set',
      'behavior_class: activate',
      'observable: event:set_logged',
      'measurable: blocked-on-telemetry',
      'source:',
      '  - ORCHESTRATION.md Horizon W',
      '---',
    ].join('\n') + BODY,

  'docs/mechanics/mechanics/M-01.md':
    [
      '---',
      'id: M-01',
      'type: mechanic',
      'title: Proposal with a visible diff',
      'primitives:',
      '  trigger: state-change',
      '  cost_to_produce: low',
      '  visibility: self-only',
      '  reciprocity: no',
      '  durability: durable-record',
      '  reversibility: yes',
      '  forgiveness: yes',
      '  optimum_direction: personal-band',
      '  precondition: none',
      'seen_in:',
      '  - product: A tool',
      '    url: https://example.com/tool',
      '    date: 2020-01-01',
      '    retrieval: fetched',
      '    class: E1',
      'also_seen_in_failures:',
      '  - A product that died with the same machinery',
      'produces:',
      '  - B-01',
      '---',
    ].join('\n') + BODY,

  'docs/mechanics/hypotheses/H-01.md':
    [
      '---',
      'id: H-01',
      'type: hypothesis',
      'title: Show the diff',
      'one_line: If we show the diff then more athletes start the session.',
      'targets: B-01',
      'translates: M-01',
      'removes: the unexplained banner',
      'move_class: change',
      'cost_class: S',
      'smallest_test: render two histories and compare.',
      'bar_kind: existing-instrument',
      'instrument: tests/e2e/first-90.spec.ts — the same walk',
      'kill_criterion: it needs a seventh block',
      'guardrail: taps to first set must not rise',
      'reversibility: delete one component',
      'preconditions_hold:',
      '  precondition_none: yes — nothing else required',
      'ratchets_touched:',
      '  TAP_BUDGET: hold',
      'status: candidate',
      '---',
    ].join('\n') + BODY,
};

function build(overrides: Files = {}, drop: string[] = []): string {
  const root = mkdtempSync(path.join(tmpdir(), 'ideagraph-'));
  const files = { ...CLEAN, ...overrides };
  for (const key of drop) delete files[key];
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(root, rel);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, content);
  }
  return root;
}

function violations(overrides: Files = {}, drop: string[] = []): string[] {
  const root = build(overrides, drop);
  try {
    return validateGraph(root).violations.map((v) => `${v.file}: ${v.message}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const matches = (found: string[], re: RegExp) => found.filter((v) => re.test(v));

/** The control. Without this, every assertion below could be passing vacuously. */
test('the clean fixture validates', () => {
  assert.deepEqual(violations(), []);
});

test('a missing required field fails', () => {
  const mutant = CLEAN['docs/mechanics/hypotheses/H-01.md'].replace(/kill_criterion: .*\n/, '');
  assert.ok(matches(violations({ 'docs/mechanics/hypotheses/H-01.md': mutant }), /missing required field `kill_criterion`/).length === 1);
});

test('an unknown field fails, because fields are a closed set', () => {
  const mutant = CLEAN['docs/mechanics/hypotheses/H-01.md'].replace('status: candidate', 'vibes: strong\nstatus: candidate');
  assert.ok(matches(violations({ 'docs/mechanics/hypotheses/H-01.md': mutant }), /unknown field `vibes`/).length === 1);
});

test('a missing primitive fails — the dropped field is the one that matters', () => {
  const mutant = CLEAN['docs/mechanics/mechanics/M-01.md'].replace('  precondition: none\n', '');
  assert.ok(matches(violations({ 'docs/mechanics/mechanics/M-01.md': mutant }), /`primitives\.precondition` is missing/).length === 1);
});

test('free text where a primitive belongs fails — "add badges" must be unwritable', () => {
  const mutant = CLEAN['docs/mechanics/mechanics/M-01.md'].replace('  trigger: state-change', '  trigger: whenever it feels right');
  assert.ok(matches(violations({ 'docs/mechanics/mechanics/M-01.md': mutant }), /`primitives\.trigger: whenever/).length === 1);
});

test('an E1 claim with no date fails', () => {
  const mutant = CLEAN['docs/mechanics/mechanics/M-01.md'].replace('    date: 2020-01-01\n', '');
  assert.ok(matches(violations({ 'docs/mechanics/mechanics/M-01.md': mutant }), /class E1 with no ISO `date:`/).length === 1);
});

test('an E1 claim with no URL fails', () => {
  const mutant = CLEAN['docs/mechanics/mechanics/M-01.md'].replace('    url: https://example.com/tool\n', '');
  assert.ok(matches(violations({ 'docs/mechanics/mechanics/M-01.md': mutant }), /class E1 with no `url:`/).length === 1);
});

test('citing an unciteable source as E1 fails', () => {
  const mutant = CLEAN['docs/mechanics/mechanics/M-01.md'].replace('https://example.com/tool', 'https://vendor.example/case-study');
  assert.ok(matches(violations({ 'docs/mechanics/mechanics/M-01.md': mutant }), /ANTILIBRARY lists it as unciteable/).length === 1);
});

test('an E1 claim nobody actually opened fails', () => {
  // The first real harvest produced ~40 correct URLs with plausible dates and
  // not one opened page, because the egress proxy blocked every fetch. Without
  // this rule that batch would have entered the graph as documented evidence.
  const mutant = CLEAN['docs/mechanics/mechanics/M-01.md'].replace('    retrieval: fetched', '    retrieval: indexed');
  assert.ok(matches(violations({ 'docs/mechanics/mechanics/M-01.md': mutant }), /A page nobody opened is/).length === 1);
});

test('an E1 claim with no retrieval at all fails', () => {
  const mutant = CLEAN['docs/mechanics/mechanics/M-01.md'].replace('    retrieval: fetched\n', '');
  assert.ok(matches(violations({ 'docs/mechanics/mechanics/M-01.md': mutant }), /`retrieval` is `unset`/).length === 1);
});

test('an unknown retrieval value fails', () => {
  const mutant = CLEAN['docs/mechanics/mechanics/M-01.md'].replace('    retrieval: fetched', '    retrieval: probably');
  assert.ok(matches(violations({ 'docs/mechanics/mechanics/M-01.md': mutant }), /say fetched \| indexed/).length === 1);
});

test('an edge pointing at nothing fails', () => {
  const mutant = CLEAN['docs/mechanics/hypotheses/H-01.md'].replace('targets: B-01', 'targets: B-99');
  assert.ok(matches(violations({ 'docs/mechanics/hypotheses/H-01.md': mutant }), /`targets: B-99` points at no node/).length === 1);
});

test('an edge pointing at the wrong node type fails', () => {
  const mutant = CLEAN['docs/mechanics/hypotheses/H-01.md'].replace('translates: M-01', 'translates: B-01');
  assert.ok(matches(violations({ 'docs/mechanics/hypotheses/H-01.md': mutant }), /is a behavior, expected a mechanic/).length === 1);
});

test('a constraint whose enforcer is gone fails', () => {
  assert.ok(matches(violations({}, ['src/lib/fakeEnforcer.test.ts']), /enforcer `src\/lib\/fakeEnforcer\.test\.ts` does not exist/).length === 1);
});

test('a constraint whose enforcer no longer contains its anchor fails', () => {
  const found = violations({ 'src/lib/fakeEnforcer.test.ts': "test('renamed away', () => {});\n" });
  assert.ok(matches(found, /no longer contains `C1: the wall stands`/).length === 1);
});

test('a ratchet restated as a number instead of a direction fails', () => {
  const mutant = CLEAN['docs/mechanics/hypotheses/H-01.md'].replace('  TAP_BUDGET: hold', '  TAP_BUDGET: 5');
  assert.ok(matches(violations({ 'docs/mechanics/hypotheses/H-01.md': mutant }), /restating it here is a second home/).length === 1);
});

test('a ratchet that cannot be read out of source fails', () => {
  // The constant was renamed. The hypothesis is now reasoning about a bar that
  // does not exist where it thinks it does.
  const found = violations({ 'tests/e2e/first-90.spec.ts': 'const TAPS_ALLOWED = 5;\n' });
  assert.ok(matches(found, /could not be read out of/).length === 1);
});

test('raising a ratchet without being killed fails', () => {
  const mutant = CLEAN['docs/mechanics/hypotheses/H-01.md'].replace('  TAP_BUDGET: hold', '  TAP_BUDGET: raise');
  assert.ok(matches(violations({ 'docs/mechanics/hypotheses/H-01.md': mutant }), /Ratchets only ever come down/).length === 1);
});

test('a hypothesis that removes nothing fails', () => {
  const mutant = CLEAN['docs/mechanics/hypotheses/H-01.md'].replace('removes: the unexplained banner', 'removes: nothing');
  assert.ok(matches(violations({ 'docs/mechanics/hypotheses/H-01.md': mutant }), /answered with a shrug/).length === 1);
});

test('a guardrail identical to the instrument fails', () => {
  const mutant = CLEAN['docs/mechanics/hypotheses/H-01.md'].replace(
    'guardrail: taps to first set must not rise',
    'guardrail: tests/e2e/first-90.spec.ts — the same walk'
  );
  assert.ok(matches(violations({ 'docs/mechanics/hypotheses/H-01.md': mutant }), /cannot get worse while the/).length === 1);
});

test('a live candidate whose precondition does not hold fails', () => {
  const mutant = CLEAN['docs/mechanics/hypotheses/H-01.md'].replace(
    '  precondition_none: yes — nothing else required',
    '  population_n: no — there are no users'
  );
  assert.ok(matches(violations({ 'docs/mechanics/hypotheses/H-01.md': mutant }), /wanting one does not create it/).length === 1);
});

test('a constitution violation on a live candidate fails', () => {
  const mutant = CLEAN['docs/mechanics/hypotheses/H-01.md'].replace('status: candidate', 'violates:\n  - X-01\nstatus: candidate');
  assert.ok(matches(violations({ 'docs/mechanics/hypotheses/H-01.md': mutant }), /auto-kill, not a trade-off/).length === 1);
});

test('an invented analytics event fails', () => {
  const mutant = CLEAN['docs/mechanics/behaviors/B-01.md'].replace('observable: event:set_logged', 'observable: event:athlete_delighted');
  assert.ok(matches(violations({ 'docs/mechanics/behaviors/B-01.md': mutant }), /not in the AnalyticsEvent union/).length === 1);
});

test('a doc comment inside the event union cannot smuggle a name in', () => {
  // The arm regex requires the leading `|`. Reading the neighbourhood instead of
  // the declaration is how a check starts accepting things nobody declared.
  const stub = "export type AnalyticsEvent =\n  /** not 'athlete_delighted' */\n  | 'set_logged';\n";
  const mutant = CLEAN['docs/mechanics/behaviors/B-01.md'].replace('event:set_logged', 'event:athlete_delighted');
  const found = violations({ 'src/lib/analytics.ts': stub, 'docs/mechanics/behaviors/B-01.md': mutant });
  assert.ok(matches(found, /not in the AnalyticsEvent union/).length === 1);
});

test('an unreviewed file under the graph fails rather than being ignored', () => {
  const found = violations({ 'docs/mechanics/notes.md': 'some stray thinking\n' });
  assert.ok(matches(found, /not in a node folder .* and not exempted/).length === 1);
});

test('a node in the wrong folder fails', () => {
  const found = violations({ 'docs/mechanics/behaviors/M-02.md': CLEAN['docs/mechanics/mechanics/M-01.md'].replace('M-01', 'M-02') });
  assert.ok(matches(found, /declares type `mechanic` but sits in `behaviors\/`/).length === 1);
});

test('a node over the byte budget fails', () => {
  const fat = CLEAN['docs/mechanics/behaviors/B-01.md'] + 'x'.repeat(MAX_NODE_BYTES);
  assert.ok(matches(violations({ 'docs/mechanics/behaviors/B-01.md': fat }), /over a \d+ cap\. Split it/).length === 1);
});

test('an INDEX that stops stating its own budgets fails', () => {
  // The lesson from `contextBudget.test.ts`: a cap nobody can see is a cap
  // nobody keeps.
  const found = violations({ 'docs/mechanics/INDEX.md': 'Some prose with no numbers in it.' });
  assert.ok(matches(found, /must state its own budgets/).length === 1);
});
