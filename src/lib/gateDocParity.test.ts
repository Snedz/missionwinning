/**
 * `CLAUDE.md`'s description of the gate must match the gate.
 *
 * It did not. Until `.562` that section read **"16 steps, in order"** against a
 * gate that runs **18**, and the numbered list omitted **Coverage floors**
 * entirely — the one ratchet that had been silently breached on `master` from
 * `.544` (411 untested files) through `.561` (415) against a floor of 407. The
 * port guard was missing from the list too.
 *
 * That is not a typo, it is a failure mode. `CLAUDE.md` is the file every agent
 * reads before touching this repo, so a step absent from that list is a step
 * nobody is looking for when the gate is skipped — and the gate *was* being
 * skipped, which is how the floor drifted for four ships without a word.
 *
 * ## Why this derives instead of enumerating
 *
 * A guard that hardcoded `18` would need editing on the day a step is added,
 * which is the day nobody remembers it exists (`.220`). So the count is read out
 * of `scripts/gate.mjs` by finding every site that advances the step counter,
 * and the doc is read for the number it claims and the list it prints. Add a
 * step to the gate and this fails until the doc says so.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const GATE = 'scripts/gate.mjs';
const DOC = 'CLAUDE.md';

/** The body of `function run(...)`, which is the one incrementer that repeats. */
function runBody(src: string): string {
  const at = src.indexOf('function run(');
  assert.notEqual(at, -1, `${GATE} no longer declares \`function run(\` — re-read this guard`);
  // The function closes at the first `}` in column zero after its opening.
  const end = src.indexOf('\n}', at);
  assert.notEqual(end, -1, `could not find the end of run() in ${GATE}`);
  return src.slice(at, end);
}

/**
 * How many numbered steps `npm run gate` prints.
 *
 * Every step is announced by advancing `step`, so the counter is the ground
 * truth rather than the labels: `run()` advances once per call, and the three
 * lanes that manage their own server (port guard, hero e2e, a11y) advance
 * inline.
 */
function gateStepCount(): number {
  const src = read(GATE);
  const body = runBody(src);

  const inRun = [...body.matchAll(/step \+= 1;/g)].length;
  assert.equal(
    inRun,
    1,
    `run() advances the step counter ${inRun} times, not once — the arithmetic below assumes one`
  );

  const total = [...src.matchAll(/step \+= 1;/g)].length;
  const oneShot = total - inRun;
  assert.ok(oneShot > 0, 'no inline step increments found — the port/e2e/a11y lanes moved');

  // `run(` at the start of a statement is a call; the declaration is `function run(`.
  const calls = [...src.matchAll(/^run\(/gm)].length;
  assert.ok(calls >= 10, `found only ${calls} run() calls — the parser broke`);

  return calls + oneShot;
}

/** The `— N steps` figure in the CLAUDE.md heading. */
function docClaimedCount(): number {
  const m = /### `npm run gate` — (\d+) steps/.exec(read(DOC));
  assert.ok(m, `${DOC} no longer heads that section with "— N steps" — this guard is pointing at nothing`);
  return Number(m![1]);
}

/**
 * The numbered entries in the doc's step list.
 *
 * The list is prose — `1. A · 2. B · 3. C` wrapped over several lines — so the
 * entries are counted by their ordinals rather than by line.
 */
function docListedSteps(): number[] {
  const doc = read(DOC);
  const start = doc.indexOf('### `npm run gate`');
  assert.notEqual(start, -1, `${DOC} has no gate section`);
  const block = doc.slice(start, doc.indexOf('Not covered:', start));
  assert.ok(block.length > 100, 'gate section in CLAUDE.md is suspiciously short');

  return [...block.matchAll(/(?:^|·\s|\n)(\d+)\.\s/g)].map((m) => Number(m[1]));
}

test('CLAUDE.md claims the number of steps the gate actually runs', () => {
  assert.equal(
    docClaimedCount(),
    gateStepCount(),
    `CLAUDE.md says ${docClaimedCount()} gate steps; scripts/gate.mjs runs ${gateStepCount()}. ` +
      `A map of the gate that cannot see a step is how the step stops being run.`
  );
});

test('the doc lists every step, numbered 1..N with no gaps', () => {
  const listed = docListedSteps();
  const expected = Array.from({ length: gateStepCount() }, (_, i) => i + 1);
  assert.deepEqual(
    listed,
    expected,
    `CLAUDE.md's gate list is [${listed.join(', ')}] — expected 1..${gateStepCount()}. ` +
      `The .562 defect was an omitted entry (Coverage floors), not a wrong total, so the ` +
      `ordinals are checked rather than just the count.`
  );
});

test('the ratchet steps are named in the doc, not just counted', () => {
  const doc = read(DOC);
  const start = doc.indexOf('### `npm run gate`');
  const block = doc.slice(start, doc.indexOf('Not covered:', start));

  /*
   * Named explicitly because these three are the ones whose absence is
   * survivable-looking: each passes silently for months and only speaks when
   * something has already regressed. Coverage floors is here because it was the
   * step actually missing.
   */
  for (const label of ['Coverage floors', 'Bundle budget', 'i18n coverage']) {
    assert.ok(
      block.includes(label),
      `"${label}" runs in the gate but is not in CLAUDE.md's list — that is exactly the .562 defect`
    );
  }
});
