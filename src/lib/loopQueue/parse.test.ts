/**
 * The parser is tested against the **committed** `docs/GRAPH_LOOP.md`, not against
 * fixtures, because the defect it exists to prevent is already sitting in that
 * file and a fixture would not contain it.
 *
 * Three `done` rows carry the literal word "open" in their *Moves* text — `D1`
 * ("open beta"), `K2` ("when the beta opens"), `N1` ("open / private beta") — and
 * a whole-file `grep '`open`'` returns thirteen hits of which nine are prose. Any
 * router that reads status as text names the wrong live ticket on a file nobody
 * edited wrongly. So the decoy test below is the acceptance test: mutate
 * `readStatus` into a line grep and it must go red.
 *
 * The synthetic cases exist only for the failure modes the real file does not
 * currently exhibit — a drifted header, a stale exemption, a short row.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { NOT_A_QUEUE_TABLE, QUEUE_HEADER, parseQueue, readStatus } from './parse.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const GRAPH_LOOP = path.join(root, 'docs/GRAPH_LOOP.md');
const real = () => parseQueue(readFileSync(GRAPH_LOOP, 'utf8'));

/* ------------------------------------------------------------------ *
 * The real file                                                       *
 * ------------------------------------------------------------------ */

test('the committed queue parses with no problems', () => {
  const { problems, rows, sections } = real();
  assert.deepEqual(problems, [], problems.join('\n'));
  // Preconditions, asserted rather than assumed: a parser that found nothing
  // would also report no problems.
  assert.ok(sections.length > 10, `only ${sections.length} sections — the walk did not reach the queue`);
  assert.ok(rows.length > 30, `only ${rows.length} rows — the walk did not reach the tables`);
});

test('the three "open"-in-Moves decoys are read as done, not open', () => {
  const { rows } = real();
  const decoys = ['D1', 'K2', 'N1'];
  for (const id of decoys) {
    const row = rows.find((r) => r.id === id);
    assert.ok(row, `${id} is missing — the decoy set is stale, re-derive it before trusting this test`);
    // The precondition IS the test: if the word stopped appearing in the Moves
    // cell, this guard silently stops guarding anything.
    assert.match(row.moves, /\bopen/i, `${id} no longer contains "open" in Moves; pick new decoys`);
    assert.equal(row.status, 'done', `${id} was read as \`${row.status}\` — status came from the line, not the cell`);
  }
});

test('every row status is a documented state', () => {
  const { rows } = real();
  const unknown = rows.filter((r) => r.status === 'unknown');
  assert.deepEqual(
    unknown.map((r) => `${r.id} @ ${r.line}: ${r.statusCell}`),
    []
  );
});

test('sections are classified into lanes', () => {
  const { sections } = real();
  const kinds = new Set(sections.map((s) => s.kind));
  for (const required of ['now', 'parallel', 'founder', 'parked', 'after-h0']) {
    assert.ok(kinds.has(required as never), `no \`${required}\` section found — the lane classifier drifted`);
  }
});

test('the dossier below `## Research` is not read as queue', () => {
  const src = readFileSync(GRAPH_LOOP, 'utf8');
  const at = src.indexOf('\n## Research');
  assert.ok(at > 0, 'GRAPH_LOOP.md no longer has a `## Research` section; re-scope this test');
  const { rows } = parseQueue(src);
  const tail = src.slice(at);
  for (const row of rows) {
    assert.ok(
      !tail.includes(`| **${row.id}** |`) || src.indexOf(`| **${row.id}** |`) < at,
      `${row.id} was picked up from below \`## Research\``
    );
  }
});

/* ------------------------------------------------------------------ *
 * readStatus                                                          *
 * ------------------------------------------------------------------ */

test('readStatus takes the backticked head and discards the annotation', () => {
  assert.equal(readStatus('`done` — `.834` this PR'), 'done');
  assert.equal(readStatus('`open` — separate lane'), 'open');
  assert.equal(readStatus('`done (already true)` — JourneyHero Resume'), 'done');
  assert.equal(readStatus('`hold`'), 'hold');
});

test('readStatus refuses an unbackticked or undocumented status', () => {
  assert.equal(readStatus('hold'), 'unknown', 'an unbackticked cell is prose, not a value');
  assert.equal(readStatus('`shipped`'), 'unknown');
  assert.equal(readStatus(''), 'unknown');
});

/* ------------------------------------------------------------------ *
 * Failure modes the real file does not currently exhibit              *
 * ------------------------------------------------------------------ */

const exemptTables = Object.keys(NOT_A_QUEUE_TABLE)
  .map((sig) => {
    const cols = sig.split('|');
    return `| ${cols.join(' | ')} |\n|${cols.map(() => '---').join('|')}|\n| ${cols.map(() => 'x').join(' | ')} |`;
  })
  .join('\n\n');

const doc = (body: string) => `# T\n\n## Queue\n\n${body}\n\n${exemptTables}\n\n## Research\n\nnot the queue.\n`;
const queueTable = (rows: string[]) =>
  [`| ${QUEUE_HEADER.join(' | ')} |`, `|---|---|---|---|`, ...rows].join('\n');

test('a drifted header under a Now section is reported, never skipped', () => {
  const { problems, rows } = parseQueue(
    doc(['### Now — Z (t)', '', '| # | Loop | Move | Status |', '|---|---|---|---|', '| **Z1** | a | b | `open` |'].join('\n'))
  );
  assert.equal(rows.length, 0);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /neither the queue shape .* nor exempted/);
});

test('a stale exemption is reported', () => {
  const { problems } = parseQueue(`# T\n\n## Queue\n\n### Now — Z (t)\n\n${queueTable(['| **Z1** | a | b | `open` |'])}\n\n## Research\n\nx\n`);
  assert.equal(problems.length, Object.keys(NOT_A_QUEUE_TABLE).length);
  for (const p of problems) assert.match(p, /remove the stale exemption/);
});

test('a short row is reported and not guessed at', () => {
  const { problems, rows } = parseQueue(doc(`### Now — Z (t)\n\n${queueTable(['| **Z1** | a | `open` |'])}`));
  assert.equal(rows.length, 0);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /has 3 cells, not 4/);
});

test('an undocumented status is reported but the row still parses', () => {
  const { problems, rows } = parseQueue(doc(`### Now — Z (t)\n\n${queueTable(['| **Z1** | a | b | `shipped` |'])}`));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].status, 'unknown');
  assert.equal(problems.length, 1);
  assert.match(problems[0], /does not open with one of/);
});

test('a file with no `## Queue` heading is a problem, not an empty queue', () => {
  const { problems, rows } = parseQueue('# T\n\nno queue here.\n');
  assert.equal(rows.length, 0);
  assert.match(problems[0], /has no `## Queue` heading/);
});
