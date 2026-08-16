/**
 * The router decides which of three protocols runs, so it is tested against the
 * real queue and against the run it exists to stop.
 *
 * `MAX_SINGLE_ROW_RUN` is a ratchet, and the ratchet's whole value is the pinned
 * assertion below: the committed file must stay at or under it. Sixteen
 * consecutive one-row `Now` sections is the drift era, mechanically recovered.
 * Adding a seventeenth turns this red, which is the first time that rule has been
 * anything other than the sentence *"Do not invent X2"* written out again.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { parseQueue, type ParsedQueue } from './parse.ts';
import { excellenceStatusAt } from './criticalPath.ts';
import { MAX_SINGLE_ROW_RUN, isCampaign, isHarvestRow, nowSections, readWorkbench, route, singleRowRun, type Role } from './route.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const source = () => readFileSync(path.join(root, 'docs/GRAPH_LOOP.md'), 'utf8');
const real = () => parseQueue(source());

/** A queue holding only the given sections, for replaying a slice of history. */
const sliceSections = (q: ParsedQueue, keep: ParsedQueue['sections']): ParsedQueue => ({
  sections: keep,
  rows: keep.flatMap((s) => s.rows),
  problems: [],
});

/** Inject a Now section ahead of the live harvest row (or After H0 if none). */
function injectNow(src: string, rows: string): string {
  const an = src.indexOf('\n### Now — AN');
  const at = an > 0 ? an : src.indexOf('\n### After H0');
  assert.ok(at > 0, 'cannot find an insert point for a Now fixture');
  return (
    src.slice(0, at) +
    '\n\n### Now — TEST\n\n| # | Loop | Moves | Status |\n|---|---|---|---|\n' +
    rows +
    src.slice(at)
  );
}

/* ------------------------------------------------------------------ *
 * The live ticket                                                     *
 * ------------------------------------------------------------------ */

/*
 * This asserted `path` / `C5` flat against the live root, which held only while
 * RESULT was `unscored` — so the founder scoring the gate turned a green suite
 * red (`.876`). The queue half is genuinely durable and stays pinned; the
 * routing half is a *rule* about status, so it is asserted as that rule and
 * evaluated against whatever is committed. The `unscored` → C5 branch keeps its
 * own fixture-root coverage below ("two zero generates route to C5").
 */
test('the committed queue has no Now-open row, and routing follows RESULT status', () => {
  const q = real();
  const open = nowSections(q).flatMap((s) => s.rows).filter((x) => x.status === 'open');
  assert.equal(open.length, 0, `Now still has open ${open.map((x) => x.id).join(', ')}`);

  const r = route(root, q);
  assert.notEqual(r.harvestAction, 'generate');
  assert.equal(typeof r.singleRowRun, 'number');
  assert.equal(r.atRatchet, false);

  if (excellenceStatusAt(root) === 'pass') {
    // Horizon W is scored: no critical-path gap is left, and the router must
    // stop rather than mint a letter.
    assert.equal(r.kind, 'stalled');
    assert.equal(r.recipe, null);
    assert.equal(r.path, null);
  } else {
    assert.equal(r.kind, 'path');
    assert.equal(r.recipe, 15);
    assert.equal(r.path?.id, 'C5');
  }
});

test('an injected Now-open row is the live ticket', () => {
  const q = parseQueue(injectNow(source(), '| **ZZ1** | Ordinary thing | a brief | `open` |\n'));
  const r = route(root, q);
  assert.equal(r.row?.id, 'ZZ1');
  assert.equal(r.row?.sectionKind, 'now');
  assert.equal(r.kind, 'build');
});

test('the Parallel lane is never the live ticket', () => {
  const q = real();
  const parallel = q.sections.filter((s) => s.kind === 'parallel').flatMap((s) => s.rows);
  // Precondition: this only proves anything while Parallel actually holds open rows.
  assert.ok(
    parallel.some((x) => x.status === 'open'),
    'the Parallel section holds no open rows; this guard is currently vacuous'
  );
  const r = route(root, q);
  assert.ok(
    !parallel.some((x) => x.id === r.row?.id),
    `${r.row?.id} came from "do not jump the wedge" — the section filter is gone`
  );
});

test('an "open"-in-Moves decoy is never the live ticket', () => {
  const r = route(root, real());
  assert.ok(!['D1', 'K2', 'N1'].includes(r.row?.id ?? ''), `${r.row?.id} is a done row read as open`);
});

/* ------------------------------------------------------------------ *
 * The three routes                                                    *
 * ------------------------------------------------------------------ */

test('an injected GNT row routes to the gauntlet with its workbench resolved', () => {
  const tmp = mkdtempSync(path.join(tmpdir(), 'loopqueue-gnt-'));
  mkdirSync(path.join(tmp, 'docs/gauntlet'), { recursive: true });
  writeFileSync(path.join(tmp, 'docs/IDEA_LOOP.md'), 'stub');
  writeFileSync(
    path.join(tmp, 'docs/gauntlet/GNT-9-replay.md'),
    [
      '# GNT-9',
      '',
      '**Status:** `open` · hard cap **≤10 build PRs** (2 spent: `.001` `.002`)',
      '**Next spawn:** LEAD on **U1 R1** — instrument first.',
      '',
    ].join('\n')
  );
  const q = parseQueue(
    injectNow(
      source(),
      '| **AM9** | Gauntlet GNT-9 replay | [wb](gauntlet/GNT-9-replay.md) | `open` |\n'
    )
  );
  const r = route(tmp, q);
  assert.equal(r.kind, 'gauntlet');
  assert.equal(r.recipe, 12);
  assert.ok(r.workbench, 'no workbench resolved for a campaign row');
  assert.equal(r.workbench.file, 'docs/gauntlet/GNT-9-replay.md');
  assert.ok(r.workbench.nextSpawn?.startsWith('**Next spawn:**'));
  assert.equal(r.workbench.role, 'LEAD');
  assert.deepEqual(r.workbench.cap, { cap: 10, spent: 2 });
  rmSync(tmp, { recursive: true, force: true });
});

test('the GNT-2 workbench cap survives house-style emphasis around spent', () => {
  const row = {
    id: 'AM1',
    loop: 'Gauntlet GNT-2',
    moves: '[wb](gauntlet/GNT-2-coach-plan-quality.md)',
    status: 'done' as const,
    statusCell: '`done`',
    section: '',
    sectionKind: 'now' as const,
    line: 1,
  };
  const wb = readWorkbench(root, row);
  assert.deepEqual(wb?.cap, { cap: 10, spent: 5 });
});

test('the same row without GNT routes to an ordinary build', () => {
  const q = parseQueue(injectNow(source(), '| **ZZ1** | Ordinary thing | a brief | `open` |\n'));
  const r = route(root, q);
  assert.equal(r.kind, 'build');
  assert.equal(r.recipe, 11);
  assert.equal(r.workbench, null);
});

test('no open row, empty idea:next, and mined generate never routes to harvest', () => {
  const q = real();
  for (const s of q.sections) for (const row of s.rows) if (row.status === 'open') row.status = 'done';
  const r = route(root, q);
  // After IL-H-15 is on the queue, idea:next is empty. Generate is mined out:
  // harvest-13 and harvest-14 were two consecutive scout>0 runs at 0-of-N.
  // harvest-11's spare is no longer the last generate.
  //
  // That claim — the harvest branch is exhausted — is what this test is for,
  // and it holds whatever RESULT says. Which side of harvest we land on does
  // depend on status, so it is asserted as the rule rather than as today's
  // reading (`.876`).
  assert.notEqual(r.kind, 'harvest');
  assert.equal(r.harvestAction, null);
  assert.equal(r.kind, excellenceStatusAt(root) === 'pass' ? 'stalled' : 'path');
});

test('no open row, nothing to emit, but generate still legal routes to harvest generate', () => {
  const tmp = mkdtempSync(path.join(tmpdir(), 'loopqueue-gen-'));
  mkdirSync(path.join(tmp, 'docs/mechanics'), { recursive: true });
  writeFileSync(path.join(tmp, 'docs/IDEA_LOOP.md'), 'stub');
  writeFileSync(
    path.join(tmp, 'docs/mechanics/LEDGER.md'),
    `| run | date | scout | anatomist | translator | red team | cap declared | spent | emitted | survived red team | later PASS |
|---|---|---|---|---|---|---|---|---|---|---|
| harvest-9 | 2026-08-16 | 3 | 1 | 3 | 1 | 0 | 0 | 0 | 0 of 3 | — |
| harvest-11 | 2026-08-16 | 3 | 1 | 2 | 1 | 0 | 0 | 0 | 1 of 2 | — |
`
  );
  const q = real();
  for (const s of q.sections) for (const row of s.rows) if (row.status === 'open') row.status = 'done';
  const r = route(tmp, q);
  assert.equal(r.kind, 'harvest');
  assert.equal(r.harvestAction, 'generate');
  rmSync(tmp, { recursive: true, force: true });
});

test('no open row, nothing to emit, and two zero generates route to C5', () => {
  const tmp = mkdtempSync(path.join(tmpdir(), 'loopqueue-mined-'));
  mkdirSync(path.join(tmp, 'docs/mechanics'), { recursive: true });
  writeFileSync(path.join(tmp, 'docs/IDEA_LOOP.md'), 'stub');
  writeFileSync(
    path.join(tmp, 'docs/mechanics/LEDGER.md'),
    `| run | date | scout | anatomist | translator | red team | cap declared | spent | emitted | survived red team | later PASS |
|---|---|---|---|---|---|---|---|---|---|---|
| harvest-8 | 2026-08-16 | 3 | 1 | 1 | 1 | 0 | 0 | 0 | 0 of 2 | — |
| harvest-9 | 2026-08-16 | 3 | 1 | 1 | 1 | 0 | 0 | 0 | 0 of 3 | — |
`
  );
  const q = real();
  for (const s of q.sections) for (const row of s.rows) if (row.status === 'open') row.status = 'done';
  const r = route(tmp, q);
  assert.equal(r.kind, 'path', 'mined harvest must not invent a letter');
  assert.equal(r.recipe, 15);
  assert.equal(r.harvestAction, null);
  assert.ok(r.path, 'path names a Horizon W gap');
  rmSync(tmp, { recursive: true, force: true });
});

test('a founder or blocked row is skipped to the next open row, and reported', () => {
  const q = parseQueue(
    injectNow(
      source(),
      '| **F1** | founder thing | x | `founder` |\n| **ZZ1** | next | y | `open` |\n'
    )
  );
  const r = route(root, q);
  assert.deepEqual(r.skipped.map((x) => x.id), ['F1'], 'the skip was silent');
  assert.equal(r.row?.id, 'ZZ1');
});

/**
 * Budget is read off disk, so this rewrites the workbench in a throwaway root
 * rather than asserting a helper that mirrors the rule. A test that recomputes
 * the thing it is checking has only ever checked itself.
 */
test('an exhausted campaign budget is reported rather than spent', () => {
  const tmp = mkdtempSync(path.join(tmpdir(), 'loopqueue-'));
  mkdirSync(path.join(tmp, 'docs/gauntlet'), { recursive: true });
  writeFileSync(path.join(tmp, 'docs/IDEA_LOOP.md'), 'stub');
  writeFileSync(
    path.join(tmp, 'docs/gauntlet/GNT-9-replay.md'),
    [
      '# GNT-9',
      '',
      '**Status:** `open` · hard cap **≤3 build PRs** (3 spent: `.001` `.002` `.003`)',
      '**Next spawn:** LEAD on **U1 R1** — write the report.',
      '',
    ].join('\n')
  );
  const q = parseQueue(
    injectNow(
      source(),
      '| **AM9** | Gauntlet GNT-9 replay | [wb](gauntlet/GNT-9-replay.md) | `open` |\n'
    )
  );
  const r = route(tmp, q);
  assert.equal(r.kind, 'gauntlet', 'an exhausted budget must still route to the campaign, not away from it');
  assert.equal(r.workbench?.cap?.spent, 3);
  assert.match(r.notes.join(' '), /budget exhausted means LEAD writes the report/);
  rmSync(tmp, { recursive: true, force: true });
});

/**
 * Replayed from the real `Next spawn` lines this campaign has actually carried.
 *
 * The SMOOTHER line is the one that caught the defect: scanning `ROLES` in
 * declaration order reported `LEAD`, because LEAD appears later in the sentence
 * as the step *after* the smoother, and a bare `U\d` scan reported `U1` out of
 * the range "U1–U4". Both answers have to come from the sentence.
 */
test('the Next spawn reader takes the role the sentence names, not the first one it knows', () => {
  const cases: { line: string; role: Role | null; unit: string | null; round: string | null }[] = [
    {
      line: '**Next spawn:** SMOOTHER — U1–U4 critic PASS (engine). Walk Train / Today / Victory / Coach. Then LEAD writes the campaign report (`ready-for-founder`).',
      role: 'SMOOTHER',
      unit: null,
      round: null,
    },
    { line: '**Next spawn:** LEAD on **U4 R1** — U3 R1 critic PASS (engine).', role: 'LEAD', unit: 'U4', round: 'R1' },
    { line: '**Next spawn:** BUILDER on **U1** — wire `loadZone` into the split.', role: 'BUILDER', unit: 'U1', round: null },
    { line: '**Next spawn:** CRITIC on **U4 R1** — the instrument is written and green.', role: 'CRITIC', unit: 'U4', round: 'R1' },
    { line: '**Next spawn:** `ready-for-founder` — every unit now has render evidence.', role: null, unit: null, round: null },
  ];

  const tmp = mkdtempSync(path.join(tmpdir(), 'loopqueue-spawn-'));
  mkdirSync(path.join(tmp, 'docs/gauntlet'), { recursive: true });
  const row = { ...real().rows[0], moves: '[wb](gauntlet/GNT-9-replay.md)' };

  for (const c of cases) {
    writeFileSync(path.join(tmp, 'docs/gauntlet/GNT-9-replay.md'), `# GNT-9\n\n${c.line}\n`);
    const wb = readWorkbench(tmp, row);
    assert.equal(wb?.role, c.role, `role from: ${c.line.slice(0, 60)}…`);
    assert.equal(wb?.unit, c.unit, `unit from: ${c.line.slice(0, 60)}…`);
    assert.equal(wb?.round, c.round, `round from: ${c.line.slice(0, 60)}…`);
  }
  rmSync(tmp, { recursive: true, force: true });
});

test('isCampaign reads the id or the moves cell, not one of them', () => {
  const base = { id: 'X1', loop: '', moves: '', status: 'open' as const, statusCell: '`open`', section: '', sectionKind: 'now' as const, line: 1 };
  assert.equal(isCampaign({ ...base, loop: 'Gauntlet GNT-3 thing' }), true);
  assert.equal(isCampaign({ ...base, moves: 'see docs/gauntlet/GNT-3-thing.md' }), true);
  assert.equal(isCampaign({ ...base, loop: 'Ordinary loop', moves: 'a normal brief' }), false);
});

/* ------------------------------------------------------------------ *
 * The ratchet                                                         *
 * ------------------------------------------------------------------ */

test('the committed queue is at or under the single-row ratchet', () => {
  const run = singleRowRun(real());
  assert.ok(
    run <= MAX_SINGLE_ROW_RUN,
    `${run} consecutive one-row Now sections, over the ${MAX_SINGLE_ROW_RUN} ratchet — ` +
      `the new section must carry ≥2 rows, or the queue needs a harvest, not another letter`
  );
});

test('a one-row letter after a harvest starts a new run of one, not 17', () => {
  const src = source();
  const at = src.indexOf('\n### After H0');
  assert.ok(at > 0, 'the queue no longer ends with `### After H0`; re-anchor this test');
  const added =
    src.slice(0, at) +
    '\n\n### Now — AO (t)\n\n| # | Loop | Moves | Status |\n|---|---|---|---|\n| **AO1** | another letter | x | `open` |\n' +
    src.slice(at);
  const run = singleRowRun(parseQueue(added));
  assert.equal(run, 1, 'a letter after an IL- closer is a new run of one, not 17');
});

test('turning every harvest row into a letter reopens the 16-run', () => {
  const src = source().replace(/\*\*IL-H-\d+\*\*/g, '**XX1**');
  const run = singleRowRun(parseQueue(src));
  assert.ok(run > MAX_SINGLE_ROW_RUN, 'letters wearing the harvest slots did not move the ratchet');
});

test('a harvest IL- row after the 16-run resets the run to zero', () => {
  const q = real();
  assert.equal(singleRowRun(q), 0, 'the pasted IL-H-01 section did not close the 16-run');
  const last = nowSections(q).at(-1);
  assert.ok(last && last.rows.length === 1 && isHarvestRow(last.rows[0]));
});

test('a batched section resets the run to zero', () => {
  const src = source();
  const at = src.indexOf('\n### After H0');
  const added =
    src.slice(0, at) +
    '\n\n### Now — AO (t)\n\n| # | Loop | Moves | Status |\n|---|---|---|---|\n' +
    '| **AO1** | one | x | `open` |\n| **AO2** | two | y | `open` |\n' +
    src.slice(at);
  assert.equal(singleRowRun(parseQueue(added)), 0, 'batching two rows did not pay the ratchet down');
});

test('the pre-drift slice of the same history measures 5, not 16', () => {
  // Sliced from the real sections, so this is the queue as it actually stood
  // before the copy-drift run — the contrast that makes 16 mean something.
  const q = real();
  const sections = nowSections(q);
  const w = sections.findIndex((s) => /^Now — W\b/.test(s.heading));
  assert.ok(w > 0, 'the W section is gone; re-derive the pre-drift slice');
  assert.equal(sections[w].rows.length, 2, 'W no longer holds two rows; the slice boundary moved');
  assert.equal(singleRowRun(sliceSections(q, sections.slice(0, w))), 5);
});

test('singleRowRun counts Now sections only', () => {
  const q = real();
  const withoutNow = sliceSections(q, q.sections.filter((s) => s.kind !== 'now'));
  assert.equal(singleRowRun(withoutNow), 0);
});

test('the ratchet does not displace a live open row', () => {
  const tmp = mkdtempSync(path.join(tmpdir(), 'loopqueue-ratchet-'));
  mkdirSync(path.join(tmp, 'docs/gauntlet'), { recursive: true });
  writeFileSync(path.join(tmp, 'docs/IDEA_LOOP.md'), 'stub');
  writeFileSync(
    path.join(tmp, 'docs/gauntlet/GNT-9-replay.md'),
    '# GNT-9\n\n**Next spawn:** LEAD on **U1 R1**.\n'
  );
  const withoutHarvest = source().replace(/\n### Now — [A-Z]+ \(harvest[\s\S]*?(?=\n### )/g, '\n');
  const q = parseQueue(
    injectNow(
      withoutHarvest,
      '| **AM9** | Gauntlet GNT-9 replay | [wb](gauntlet/GNT-9-replay.md) | `open` |\n'
    )
  );
  const r = route(tmp, q);
  assert.equal(r.atRatchet, true, 'injecting one more one-row Now section must stay at the ratchet');
  assert.equal(r.kind, 'gauntlet', 'the ratchet hijacked a live campaign row');
  assert.equal(r.row?.id, 'AM9');
  assert.match(r.notes.join(' '), /at the 16 ratchet/);
  rmSync(tmp, { recursive: true, force: true });
});
