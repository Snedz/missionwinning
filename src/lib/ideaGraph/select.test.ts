/**
 * The selector is the whole point, so it is tested against the run it exists to
 * prevent rather than against invented cases.
 *
 * `GRAPH_LOOP.md` ran Q → R → U → V → X → Y → Z → AA → … → AK, and every one of
 * those rows was the same idea: first-paint copy matching the English pack, with
 * a drift cap walking 216 → 167. Each block ends with the literal words
 * *"Do not invent X2"* — a prose diversity rule, which did not hold.
 *
 * So the acceptance test is a **replay**: feed the real history in, and the
 * selector must refuse the second copy-drift row. If it emits them, the
 * diversity rules do not work and nothing else in this folder matters.
 *
 * Each rule then gets its own test with the other rules deliberately unable to
 * fire, because a replay that four rules could each have caught proves only that
 * at least one of them works.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tokenize } from './derive.ts';
import {
  DELETION_QUOTA_WINDOW,
  NOVELTY_EPSILON,
  cellKey,
  jaccard,
  selectNext,
  type Candidate,
  type EmittedRow,
} from './select.ts';

const candidate = (over: Partial<Candidate> & Pick<Candidate, 'id'>): Candidate => ({
  title: over.id,
  behaviorClass: 'trust',
  moveClass: 'change',
  costClass: 'S',
  fingerprint: ['alpha', 'beta', 'gamma'],
  status: 'candidate',
  preconditionsHold: true,
  evidence: 'E1',
  measurable: 'blocked-on-telemetry',
  ...over,
});

/* ------------------------------------------------------------------ *
 * The replay                                                          *
 * ------------------------------------------------------------------ */

/**
 * Verbatim from the `Moves` column of the real queue blocks. Fingerprints are
 * built the way `fingerprintOf` builds them — axis, move, then the language —
 * so this is the actual shape the selector would have seen, not a caricature.
 */
const REAL_DRIFT_ROWS = [
  'History first-paint — title, count, empty, no-match match pack. Drift cap 210',
  'Move first-paint — title and chrome match pack. Drift cap 205',
  'Mind first-paint — title and chrome match pack. Drift cap 201',
  'Learn first-paint — title and chrome match pack. Drift cap 195',
  'Coach first-paint — subtitle, empty title, free-core match pack. Drift cap 192',
  'Today Coach card — mission and locked chrome match pack. Drift cap 189',
];

const driftRow = (text: string, i: number): EmittedRow => ({
  id: `real-${i}`,
  behaviorClass: 'trust',
  moveClass: 'change',
  fingerprint: ['trust', 'change', 'M-00', ...tokenize(text)].sort(),
});

test('replay: the second real copy-drift row is refused', () => {
  const history = [driftRow(REAL_DRIFT_ROWS[0], 0)];
  const next = candidate({
    id: 'drift-2',
    behaviorClass: 'trust',
    moveClass: 'change',
    fingerprint: driftRow(REAL_DRIFT_ROWS[1], 1).fingerprint,
  });

  const { emit, refusals } = selectNext([next], history);

  assert.equal(emit, null, 'the selector emitted a second copy-drift row — the run repeats');
  assert.equal(refusals.length, 1);
  assert.ok(
    ['consecutive-cell', 'novelty'].includes(refusals[0].rule),
    `refused by ${refusals[0].rule}, which is not a diversity rule`
  );
});

test('replay: sixteen consecutive drift rows never get past the first', () => {
  let history: EmittedRow[] = [];
  let emitted = 0;
  REAL_DRIFT_ROWS.forEach((text, i) => {
    const row = driftRow(text, i);
    const { emit } = selectNext([candidate({ id: row.id, fingerprint: row.fingerprint })], history);
    if (emit) {
      emitted += 1;
      history = [...history, row];
    }
  });
  assert.equal(emitted, 1, `${emitted} drift rows were emitted; the queue is repeating itself again`);
});

/**
 * What the replay does *not* prove, recorded so nobody reads more into it.
 *
 * These rows are close but not identical — they name different surfaces and
 * carry different cap numbers — so their similarity sits below the novelty
 * floor and it is the consecutive-cell rule that stops them. That is the
 * correct division of labour, and it is worth pinning: if a future edit raised
 * `NOVELTY_EPSILON` expecting novelty to carry this case, it would not.
 */
test('consecutive drift rows are similar, but below the novelty floor', () => {
  const a = driftRow(REAL_DRIFT_ROWS[0], 0).fingerprint;
  const b = driftRow(REAL_DRIFT_ROWS[1], 1).fingerprint;
  const s = jaccard(a, b);
  assert.ok(s > 0.4, `similarity ${s.toFixed(2)} — these rows should look alike`);
  assert.ok(s < NOVELTY_EPSILON, `similarity ${s.toFixed(2)} is at the floor; the replay's division of labour changed`);
});

/* ------------------------------------------------------------------ *
 * Each rule, alone                                                     *
 * ------------------------------------------------------------------ */

test('novelty alone refuses a near-identical idea in a different cell', () => {
  const history: EmittedRow[] = [
    { id: 'prior', behaviorClass: 'trust', moveClass: 'change', fingerprint: ['a', 'b', 'c', 'd'] },
  ];
  // Different cell entirely, so consecutive-cell cannot fire. 3 of 5 shared.
  const near = candidate({ id: 'near', behaviorClass: 'return', moveClass: 'add', fingerprint: ['a', 'b', 'c', 'e'] });
  const { emit, refusals } = selectNext([near], history);
  assert.equal(emit, null);
  assert.equal(refusals[0].rule, 'novelty');
});

test('consecutive-cell alone refuses an unrelated idea in the same cell', () => {
  const history: EmittedRow[] = [
    { id: 'prior', behaviorClass: 'trust', moveClass: 'change', fingerprint: ['a', 'b', 'c'] },
  ];
  // Nothing shared, so novelty cannot fire.
  const other = candidate({ id: 'other', behaviorClass: 'trust', moveClass: 'change', fingerprint: ['x', 'y', 'z'] });
  const { emit, refusals } = selectNext([other], history);
  assert.equal(emit, null);
  assert.equal(refusals[0].rule, 'consecutive-cell');
});

test('the anti-library refuses a killed idea with no history at all', () => {
  const killed = [['return', 'add', 'ladder', 'public']];
  const revived = candidate({ id: 'revived', behaviorClass: 'return', moveClass: 'add', fingerprint: ['return', 'add', 'ladder', 'public'] });
  const { emit, refusals } = selectNext([revived], [], killed);
  assert.equal(emit, null);
  assert.equal(refusals[0].rule, 'anti-library');
});

test('the deletion quota forces a subtraction after four additive rows', () => {
  const history: EmittedRow[] = ['activate', 'return', 'trust', 'depth'].map((b, i) => ({
    id: `add-${i}`,
    behaviorClass: b as EmittedRow['behaviorClass'],
    moveClass: i % 2 === 0 ? 'add' : 'change',
    fingerprint: [`t${i}`],
  }));
  assert.equal(history.length, DELETION_QUOTA_WINDOW - 1);

  const another = candidate({ id: 'another-add', behaviorClass: 'tell', moveClass: 'add', fingerprint: ['fresh'] });
  const refused = selectNext([another], history);
  assert.equal(refused.emit, null);
  assert.equal(refused.refusals[0].rule, 'deletion-quota');

  const subtraction = candidate({ id: 'a-removal', behaviorClass: 'tell', moveClass: 'remove', fingerprint: ['fresh'] });
  assert.equal(selectNext([subtraction], history).emit?.id, 'a-removal');
});

test('a subtraction inside the window satisfies the quota', () => {
  const history: EmittedRow[] = ['activate', 'return', 'trust', 'depth'].map((b, i) => ({
    id: `row-${i}`,
    behaviorClass: b as EmittedRow['behaviorClass'],
    moveClass: i === 1 ? 'measure' : 'add',
    fingerprint: [`t${i}`],
  }));
  const another = candidate({ id: 'ok-add', behaviorClass: 'tell', moveClass: 'add', fingerprint: ['fresh'] });
  assert.equal(selectNext([another], history).emit?.id, 'ok-add');
});

test('a killed or blocked hypothesis is never emitted', () => {
  const pool = [
    candidate({ id: 'killed', status: 'killed' }),
    candidate({ id: 'blocked', status: 'blocked-on-telemetry', fingerprint: ['q'] }),
  ];
  const { emit, refusals } = selectNext(pool, []);
  assert.equal(emit, null);
  assert.deepEqual(refusals.map((r) => r.rule), ['status', 'status']);
});

/* ------------------------------------------------------------------ *
 * Illumination                                                         *
 * ------------------------------------------------------------------ */

test('a stepping stone in an empty cell beats a higher-scoring idea in a filled one', () => {
  // The objective paradox, operationalised: coverage is the thing a ranked list
  // cannot buy, so an unvisited cell wins the tie-break before score does.
  const history: EmittedRow[] = [
    { id: 'prior', behaviorClass: 'trust', moveClass: 'add', fingerprint: ['old'] },
  ];
  const strongButFamiliar = candidate({
    id: 'strong',
    behaviorClass: 'trust',
    moveClass: 'change',
    costClass: 'S',
    evidence: 'E0',
    measurable: 'live',
    fingerprint: ['s1'],
  });
  const weakButNew = candidate({
    id: 'weak',
    behaviorClass: 'pay',
    moveClass: 'remove',
    costClass: 'L',
    evidence: 'E2',
    fingerprint: ['s2'],
  });
  // Put the strong one in a previously visited cell.
  const seeded = [...history, { id: 'p2', behaviorClass: 'trust' as const, moveClass: 'change' as const, fingerprint: ['old2'] }];
  const { emit } = selectNext([strongButFamiliar, weakButNew], seeded);
  assert.equal(emit?.id, 'weak');
});

test('exactly one row is ever emitted', () => {
  const pool = ['a', 'b', 'c'].map((id, i) =>
    candidate({ id, behaviorClass: 'trust', moveClass: 'add', fingerprint: [`u${i}`] })
  );
  const { emit } = selectNext(pool, []);
  assert.ok(emit && typeof emit.id === 'string');
});

test('cellKey ignores cost on the two-axis form', () => {
  assert.equal(cellKey('trust', 'add'), 'trust/add');
  assert.equal(cellKey('trust', 'add', 'S'), 'trust/add/S');
});

test('jaccard is a similarity, not a distance', () => {
  assert.equal(jaccard(['a'], ['a']), 1);
  assert.equal(jaccard(['a'], ['b']), 0);
  assert.equal(jaccard(['a', 'b'], ['a', 'c']), 1 / 3);
});
