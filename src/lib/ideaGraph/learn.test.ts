/**
 * A verdict the next harvest cannot see is a diary, not a ledger.
 *
 * Each test breaks exactly one thing: status rewrite, kill-fingerprint, or
 * the campaign-coverage check. The selector is exercised through the same
 * `selectNext` the CLI uses, so a lesson that does not change the pick is red.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { campaignsWithoutVerdict, lessons, verdictKills, withVerdictStatuses } from './learn.ts';
import { selectNext, type Candidate } from './select.ts';
import type { GraphNode, LoadedGraph } from './load.ts';

const node = (over: Partial<GraphNode> & Pick<GraphNode, 'id' | 'type'>): GraphNode => ({
  file: `docs/mechanics/${over.type}s/${over.id}.md`,
  fm: {},
  body: '',
  ...over,
});

const graphOf = (nodes: GraphNode[]): LoadedGraph => ({
  nodes,
  byId: new Map(nodes.map((n) => [n.id, n])),
  problems: [],
  filesSeen: nodes.map((n) => n.file),
});

const candidate = (over: Partial<Candidate> & Pick<Candidate, 'id'>): Candidate => ({
  title: over.id,
  behaviorClass: 'trust',
  moveClass: 'change',
  costClass: 'S',
  fingerprint: ['alpha', 'beta', 'gamma'],
  status: 'candidate',
  preconditionsHold: true,
  evidence: 'E1',
  measurable: 'live',
  ...over,
});

test('a fail verdict rewrites the settled hypothesis to killed', () => {
  const g = graphOf([
    node({
      id: 'V-01',
      type: 'verdict',
      fm: { settles: 'H-01', outcome: 'fail', learned: 'the brief was the wrong axis' },
    }),
  ]);
  const [rewritten] = withVerdictStatuses([candidate({ id: 'H-01' }), candidate({ id: 'H-02' })], g);
  assert.equal(rewritten.status, 'killed');
});

test('a pass verdict rewrites the settled hypothesis to already-true, not killed', () => {
  const g = graphOf([
    node({ id: 'V-01', type: 'verdict', fm: { settles: 'H-01', outcome: 'already-true', learned: 'engine already did it' } }),
  ]);
  const [rewritten] = withVerdictStatuses([candidate({ id: 'H-01' })], g);
  assert.equal(rewritten.status, 'already-true');
});

test('a killed verdict fingerprint refuses a similar new candidate', () => {
  const settled = node({
    id: 'H-01',
    type: 'hypothesis',
    fm: { title: 'Add a public ladder', one_line: 'rank on Today', removes: 'quiet logging', move_class: 'add', targets: 'B-01' },
  });
  const g = graphOf([
    settled,
    node({ id: 'V-01', type: 'verdict', fm: { settles: 'H-01', outcome: 'fail', learned: 'no population' } }),
  ]);
  const kills = verdictKills(g);
  assert.ok(kills.length === 1, 'no fingerprint extracted from the settled node');
  const similar = candidate({
    id: 'H-99',
    fingerprint: kills[0],
  });
  const { emit, refusals } = selectNext([similar], [], kills);
  assert.equal(emit, null);
  assert.ok(refusals.some((r) => r.rule === 'anti-library'));
});

test('a rewritten status is enough for selectNext to refuse the same id', () => {
  const g = graphOf([
    node({ id: 'V-01', type: 'verdict', fm: { settles: 'H-01', outcome: 'already-true', learned: 'pinned' } }),
  ]);
  const rewritten = withVerdictStatuses([candidate({ id: 'H-01' })], g);
  const { emit, refusals } = selectNext(rewritten, []);
  assert.equal(emit, null);
  assert.ok(refusals.some((r) => r.id === 'H-01' && r.rule === 'status'));
});

test('lessons are printed from the outcome and the learned line, not from the body', () => {
  const g = graphOf([
    node({
      id: 'V-02',
      type: 'verdict',
      fm: {
        campaign: 'GNT-2',
        outcome: 'already-true',
        learned: 'green is last-session RPE, not a bigger week',
      },
    }),
  ]);
  assert.deepEqual(lessons(g), [
    {
      id: 'V-02',
      outcome: 'already-true',
      learned: 'green is last-session RPE, not a bigger week',
      settles: null,
      campaign: 'GNT-2',
    },
  ]);
});

test('a closed campaign with no verdict is reported, a covered one is not', () => {
  const g = graphOf([
    node({ id: 'V-01', type: 'verdict', fm: { campaign: 'GNT-1', outcome: 'already-true', learned: 'land Today' } }),
  ]);
  assert.deepEqual(campaignsWithoutVerdict(g, ['GNT-1', 'GNT-2']), ['GNT-2']);
});
