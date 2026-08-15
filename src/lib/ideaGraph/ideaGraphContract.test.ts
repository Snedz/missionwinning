/**
 * The contract between this folder and the rest of the repo.
 *
 * Three things have to stay true, and none of them are about the graph's
 * content: the real graph must validate, this code must never reach the
 * browser, and the protocol document must not drift from the thresholds the
 * code enforces.
 *
 * That last one is the reason `gateDocParity.test.ts` exists one layer up:
 * `CLAUDE.md` described a sixteen-step gate that ran eighteen, and the step it
 * omitted was the ratchet that had been silently breached for four ships. A map
 * of a system that cannot see part of it is how that part stops being run.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { reachableFrom, stripComments } from '../domainBoundary.ts';
import { validateGraph, MAX_NODE_BYTES, MAX_NODES_PER_TYPE } from './validate.ts';
import { buildPack, MAX_PACK_BYTES } from './pack.ts';
import { toCandidates } from './derive.ts';
import { DELETION_QUOTA_WINDOW, NOVELTY_EPSILON, allCells, selectNext } from './select.ts';
import { BEHAVIOR_CLASSES } from './schema.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (file: string): string | null => {
  try {
    return readFileSync(path.join(root, file), 'utf8');
  } catch {
    return null;
  }
};

/* ------------------------------------------------------------------ *
 * 1. The real graph                                                    *
 * ------------------------------------------------------------------ */

test('the shipped graph validates', () => {
  const { violations, graph } = validateGraph(root);
  assert.deepEqual(
    violations.map((v) => `${v.file}: ${v.message}`),
    [],
    'run `npm run idea:validate` for the detail'
  );
  // Not a vacuous pass: the walk has to have reached the tree.
  assert.ok(graph.nodes.length >= 20, `only ${graph.nodes.length} nodes found — did the walk reach docs/mechanics/?`);
});

test('every constraint node is backed by an enforcer that exists and still runs', () => {
  const { graph } = validateGraph(root);
  const constraints = graph.nodes.filter((n) => n.type === 'constraint');
  assert.ok(constraints.length >= 5, 'the constitution shrank — check this is deliberate');
  for (const c of constraints) {
    const enforcer = c.fm.enforcer as string;
    assert.ok(existsSync(path.join(root, enforcer)), `${c.id} names a missing enforcer: ${enforcer}`);
  }
});

test('the graph produces exactly one row, and it is not copy-drift', () => {
  const { graph } = validateGraph(root);
  const { emit } = selectNext(toCandidates(graph), []);
  assert.ok(emit, 'the graph emits nothing — Phase 1 has no exit test to pass');
  // The failure mode being replaced was a queue of `change` rows against
  // i18n copy. A first emission of that shape would mean this shipped a
  // more expensive way to produce the same monoculture.
  assert.notEqual(
    `${emit!.behaviorClass}/${emit!.moveClass}`,
    'trust/change',
    'the first emitted row is in the cell the old queue never left'
  );
});

/* ------------------------------------------------------------------ *
 * 2. Bundle safety                                                     *
 * ------------------------------------------------------------------ */

const APP_ROOTS = ['app/', 'src/components/', 'src/page-components/'];
const IDEA_GRAPH = 'src/lib/ideaGraph/';

function sourceFiles(dir: string): string[] {
  const full = path.join(root, dir);
  if (!existsSync(full)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(full)) {
    const rel = path.posix.join(dir, entry);
    if (statSync(path.join(root, rel)).isDirectory()) out.push(...sourceFiles(rel));
    else if (/\.(ts|tsx)$/.test(entry) && !entry.includes('.test.')) out.push(rel);
  }
  return out;
}

test('no rendered surface can reach the idea graph', () => {
  // Build tooling that happens to be typed. If a page component ever imports it,
  // the whole graph — every node, every citation — lands in the client bundle,
  // and `bundle-budget.mjs` would be the second thing to notice.
  const entries = APP_ROOTS.flatMap((dir) => sourceFiles(dir));
  assert.ok(entries.length > 50, `only ${entries.length} app files scanned — the walk stopped finding the product`);

  const offenders: string[] = [];
  for (const entry of entries) {
    for (const reached of reachableFrom(entry, read)) {
      if (reached.startsWith(IDEA_GRAPH)) offenders.push(`${entry} → ${reached}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    'the idea graph is reachable from a rendered surface; it must stay build tooling'
  );
});

test('the idea graph imports nothing from the product it reasons about', () => {
  // The reverse direction matters too. A validator that imported a component
  // would couple the graph's schema to render code and start failing for
  // reasons that have nothing to do with ideas.
  const forbidden = ['@/components', '@/page-components', 'next/', 'react'];
  for (const file of sourceFiles(IDEA_GRAPH)) {
    const src = stripComments(read(file) ?? '');
    for (const bad of forbidden) {
      assert.ok(!src.includes(`from '${bad}`), `${file} imports ${bad}`);
    }
  }
});

/* ------------------------------------------------------------------ *
 * 3. Doc parity                                                        *
 * ------------------------------------------------------------------ */

const PROTOCOL = 'docs/IDEA_LOOP.md';

test('the protocol states the thresholds the code enforces', () => {
  const doc = read(PROTOCOL);
  assert.ok(doc, `${PROTOCOL} is missing — the protocol is half of this system`);
  for (const [what, value] of [
    ['novelty floor', String(NOVELTY_EPSILON)],
    ['deletion quota window', String(DELETION_QUOTA_WINDOW)],
    ['node byte budget', String(MAX_NODE_BYTES)],
    ['nodes per type', String(MAX_NODES_PER_TYPE)],
    ['pack budget', String(MAX_PACK_BYTES)],
  ] as const) {
    assert.ok(doc!.includes(value), `${PROTOCOL} no longer states the ${what} (${value})`);
  }
});

test('the protocol names every role the ledger accounts for', () => {
  const doc = read(PROTOCOL) ?? '';
  for (const role of ['SCOUT', 'ANATOMIST', 'TRANSLATOR', 'RED TEAM', 'SELECTOR', 'HISTORIAN']) {
    assert.ok(doc.includes(role), `${PROTOCOL} does not define the ${role} role`);
  }
});

test('the protocol keeps stating the bans that make refusal mechanical', () => {
  // The `MUST_STATE` shape from `contextBudget.test.ts`: counting sections
  // without checking which facts survive is how the governing one gets edited
  // away by someone tidying.
  const doc = read(PROTOCOL) ?? '';
  /**
   * Each pattern must match the **rule** and nothing else in the document.
   *
   * The first draft of this list used `/one row/i`, which the surrounding prose
   * satisfies four different ways — so a mutant that deleted the ban itself
   * left the guard green. That is `.220` in a regex: a pattern claiming a scope
   * wider than the thing it actually pins. Every entry below now requires
   * language that only the rule uses.
   */
  const MUST_STATE: [string, RegExp][] = [
    ['only one queue row per run', /one row per run|more than one row/i],
    ['the generator never judges its own candidate', /never judges its own|different model family/i],
    ['the graph never targets its own process', /own process, tooling|self-reference is how/i],
    ['evidence classes are never upgraded', /never upgrade an evidence class/i],
    ['PRIVATE_MODE stays founder-only', /[Nn]ever flip `PRIVATE_MODE`/],
  ];
  const missing = MUST_STATE.filter(([, re]) => !re.test(doc)).map(([q]) => q);
  assert.deepEqual(missing, [], `${PROTOCOL} no longer states: ${missing.join(', ')}`);
});

/* ------------------------------------------------------------------ *
 * 4. Packs stay retrievable                                            *
 * ------------------------------------------------------------------ */

test('every behaviour axis produces a pack inside its budget', () => {
  const { graph } = validateGraph(root);
  for (const cls of BEHAVIOR_CLASSES) {
    const pack = buildPack(root, graph, cls);
    assert.ok(
      !pack.overBudget,
      `the \`${cls}\` pack is ${pack.bytes} bytes over ${MAX_PACK_BYTES} — split a node or narrow the axis`
    );
    // A pack that included nothing would also be "inside budget".
    assert.ok(pack.included.length > 0, `the \`${cls}\` pack is empty`);
  }
});

test('the archive reports its own empty cells', () => {
  // Empty cells are the harvest's target list. A system that could not say
  // which regions it had never visited would be a ranked list wearing a grid.
  const { graph } = validateGraph(root);
  const { emptyCells } = selectNext(toCandidates(graph), []);
  assert.equal(emptyCells.length, allCells().length, 'nothing has been emitted yet, so every cell should read empty');
});
