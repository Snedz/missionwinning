/**
 * What the graph must be true about itself.
 *
 * Every rule here exists because the same rule stated as prose has already
 * failed in this repo. `GRAPH_LOOP.md` ends each queue block with the literal
 * words *"Do not invent X2"* — a prose diversity rule — and sixteen consecutive
 * rows were the same idea anyway. Prose was sufficient for the two organs that
 * work; it was not sufficient for this one, so the rules that failed as prose
 * are the rules that live in code.
 *
 * Everything is asserted against a parsed shape, never against text, and
 * everything discovers rather than enumerates.
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { asMap, asMapList, type FrontMatter } from './parse.ts';
import {
  DECIDING_EVIDENCE,
  RETRIEVALS,
  EVIDENCE_CLASSES,
  FIELDS,
  PRIMITIVES,
  PRIMITIVE_NAMES,
  RATCHETS,
  RATCHET_DIRECTIONS,
  type EvidenceClass,
  type NodeType,
} from './schema.ts';
import { GRAPH_DIR, loadGraph, readAntiLibrary, type GraphNode, type LoadedGraph } from './load.ts';

/**
 * Budgets. Judgements, not measurements — which is why they live in one place
 * where they can be argued with, exactly like `TODAY_MAX_TOP_LEVEL_BLOCKS` and
 * `MAX_NOW_BULLETS`.
 *
 * A node past the byte cap is a node that stopped being retrievable: the whole
 * reason the graph lives on disk instead of in a context window is that
 * accuracy degrades with input size well before the stated limit, and worst of
 * all against *near-duplicate* content — which is precisely what an idea
 * archive is made of. A fat node defeats the retrieval it exists to enable.
 */
export const MAX_NODE_BYTES = 6_000;
export const MAX_NODES_PER_TYPE = 60;

export interface Violation {
  file: string;
  message: string;
}

const isMap = (v: unknown): v is Record<string, string> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

function fieldKindOf(v: unknown): string {
  if (typeof v === 'string') return 'scalar';
  if (Array.isArray(v)) return v.every((e) => typeof e === 'string') ? 'list' : 'map-list';
  if (isMap(v)) return 'map';
  return 'unknown';
}

/* ------------------------------------------------------------------ *
 * 1. Shape                                                             *
 * ------------------------------------------------------------------ */

function checkFields(node: GraphNode, out: Violation[]): void {
  const spec = FIELDS[node.type];
  for (const [name, f] of Object.entries(spec)) {
    const v = node.fm[name];
    if (v === undefined) {
      if (f.required) out.push({ file: node.file, message: `missing required field \`${name}\`` });
      continue;
    }
    const got = fieldKindOf(v);
    if (got !== f.kind) {
      out.push({ file: node.file, message: `\`${name}\` is a ${got}, expected ${f.kind}` });
      continue;
    }
    if (f.oneOf && typeof v === 'string' && !f.oneOf.includes(v)) {
      out.push({
        file: node.file,
        message: `\`${name}: ${v}\` is not one of ${f.oneOf.join(' | ')}`,
      });
    }
  }
  for (const name of Object.keys(node.fm)) {
    if (!(name in spec)) {
      out.push({
        file: node.file,
        message:
          `unknown field \`${name}\` on a ${node.type}. Fields are a closed set — if this is a new ` +
          `kind of claim it needs a home in schema.ts and a rule here, not a quiet extra key`,
      });
    }
  }
}

/* ------------------------------------------------------------------ *
 * 2. Primitives — where "add badges" becomes unwritable                *
 * ------------------------------------------------------------------ */

function checkPrimitives(node: GraphNode, out: Violation[]): void {
  if (node.type !== 'mechanic') return;
  let prims: Record<string, string>;
  try {
    prims = asMap(node.fm as FrontMatter, 'primitives', node.file);
  } catch {
    return; // shape check already reported it
  }
  for (const name of PRIMITIVE_NAMES) {
    const v = prims[name];
    if (v === undefined) {
      out.push({
        file: node.file,
        message:
          `\`primitives.${name}\` is missing. Every primitive is required — the field cargo-culting ` +
          `always drops is the one that decides whether the mechanic can work here at all`,
      });
      continue;
    }
    const legal = PRIMITIVES[name] as readonly string[];
    if (!legal.includes(v)) {
      out.push({
        file: node.file,
        message: `\`primitives.${name}: ${v}\` is not one of ${legal.join(' | ')}`,
      });
    }
  }
  for (const name of Object.keys(prims)) {
    if (!(PRIMITIVE_NAMES as string[]).includes(name)) {
      out.push({
        file: node.file,
        message:
          `\`primitives.${name}\` is not in the ontology. Free text here is how a mechanic gets ` +
          `recorded at surface level, which is the failure this vocabulary exists to prevent`,
      });
    }
  }
}

/* ------------------------------------------------------------------ *
 * 3. Evidence                                                          *
 * ------------------------------------------------------------------ */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function checkEvidence(node: GraphNode, unciteable: Set<string>, out: Violation[]): void {
  if (node.type !== 'mechanic') return;
  let rows: Record<string, string>[];
  try {
    rows = asMapList(node.fm as FrontMatter, 'seen_in', node.file);
  } catch {
    return;
  }
  rows.forEach((row, i) => {
    const at = `seen_in[${i}]`;
    const cls = row.class as EvidenceClass | undefined;
    if (!cls || !EVIDENCE_CLASSES.includes(cls)) {
      out.push({ file: node.file, message: `${at} needs \`class:\` one of ${EVIDENCE_CLASSES.join(' | ')}` });
      return;
    }
    if (!row.product) out.push({ file: node.file, message: `${at} needs \`product:\`` });

    if (row.retrieval !== undefined && !(RETRIEVALS as readonly string[]).includes(row.retrieval)) {
      out.push({ file: node.file, message: `${at} \`retrieval: ${row.retrieval}\` — say ${RETRIEVALS.join(' | ')}` });
    }

    if (cls === 'E1') {
      if (!row.url) {
        out.push({
          file: node.file,
          message: `${at} is class E1 with no \`url:\` — documented means documented somewhere`,
        });
      }
      if (!row.date || !ISO_DATE.test(row.date)) {
        out.push({
          file: node.file,
          message: `${at} is class E1 with no ISO \`date:\` — an undated claim cannot be re-checked`,
        });
      }
      if (row.retrieval !== 'fetched') {
        out.push({
          file: node.file,
          message:
            `${at} is class E1 but \`retrieval\` is \`${row.retrieval ?? 'unset'}\`. A page nobody opened is ` +
            `not a documented claim — record it E2 with a reason, and upgrade only after actually reading it`,
        });
      }
      const host = row.url ? hostOf(row.url) : '';
      if (host && unciteable.has(host)) {
        out.push({
          file: node.file,
          message:
            `${at} cites ${host} as class E1, and ANTILIBRARY lists it as unciteable. ` +
            `Record it as E2 with a reason, or drop it — an evidence class is never upgraded`,
        });
      }
    }
    if (cls === 'E0' && !(row.instrument && row.value && row.date)) {
      out.push({
        file: node.file,
        message: `${at} is class E0, which means measured here — it needs \`instrument:\`, \`value:\` and \`date:\``,
      });
    }
    if (cls === 'E2' && !row.why_not_e1) {
      out.push({
        file: node.file,
        message: `${at} is class E2 and must say \`why_not_e1:\` — otherwise it reads as E1 with a missing link`,
      });
    }
  });

  const deciding = rows.some((r) => DECIDING_EVIDENCE.includes(r.class as EvidenceClass));
  if (!deciding && !node.fm.also_seen_in_failures) {
    out.push({ file: node.file, message: 'a mechanic with no E0/E1 sighting still needs its failure column' });
  }
}

/* ------------------------------------------------------------------ *
 * 4. Edges                                                             *
 * ------------------------------------------------------------------ */

const EDGE_TARGET_TYPE: Record<string, NodeType> = {
  targets: 'behavior',
  translates: 'mechanic',
  settles: 'hypothesis',
};

function checkEdges(node: GraphNode, graph: LoadedGraph, out: Violation[]): void {
  for (const [field, wantType] of Object.entries(EDGE_TARGET_TYPE)) {
    const v = node.fm[field];
    if (typeof v !== 'string') continue;
    const target = graph.byId.get(v);
    if (!target) {
      out.push({ file: node.file, message: `\`${field}: ${v}\` points at no node in the graph` });
      continue;
    }
    if (target.type !== wantType) {
      out.push({ file: node.file, message: `\`${field}: ${v}\` is a ${target.type}, expected a ${wantType}` });
    }
  }
  const violates = node.fm.violates;
  if (Array.isArray(violates)) {
    for (const id of violates as string[]) {
      const target = graph.byId.get(id);
      if (!target || target.type !== 'constraint') {
        out.push({ file: node.file, message: `\`violates\` names \`${id}\`, which is not a constraint node` });
      }
    }
    if (violates.length > 0 && node.fm.status !== 'killed') {
      out.push({
        file: node.file,
        message:
          `this hypothesis violates ${(violates as string[]).join(', ')} and its status is ` +
          `\`${node.fm.status}\`. A constitution violation is an auto-kill, not a trade-off to weigh`,
      });
    }
  }
  // `produces` names behaviour ids; a mechanic that produces nothing we track
  // is an observation, not a node.
  if (node.type === 'mechanic' && Array.isArray(node.fm.produces)) {
    for (const id of node.fm.produces as string[]) {
      const target = graph.byId.get(id);
      if (!target || target.type !== 'behavior') {
        out.push({ file: node.file, message: `\`produces\` names \`${id}\`, which is not a behavior node` });
      }
    }
  }
}

/* ------------------------------------------------------------------ *
 * 5. Constraints must be live                                          *
 * ------------------------------------------------------------------ */

function checkConstraintLiveness(node: GraphNode, root: string, out: Violation[]): void {
  if (node.type !== 'constraint') return;
  const enforcer = node.fm.enforcer;
  const anchor = node.fm.enforcer_anchor;
  if (typeof enforcer !== 'string' || typeof anchor !== 'string') return;

  const full = path.join(root, enforcer);
  if (!existsSync(full)) {
    out.push({
      file: node.file,
      message:
        `enforcer \`${enforcer}\` does not exist. A constraint whose enforcer is gone is prose, ` +
        `and prose is exactly what failed sixteen times in GRAPH_LOOP`,
    });
    return;
  }
  const src = readFileSync(full, 'utf8');
  if (!src.includes(anchor)) {
    out.push({
      file: node.file,
      message:
        `enforcer \`${enforcer}\` no longer contains \`${anchor}\` — the rule may still be enforced, ` +
        `but this node can no longer prove it. Re-anchor or re-home the constraint`,
    });
  }
}

/* ------------------------------------------------------------------ *
 * 6. Ratchets are read, never restated                                 *
 * ------------------------------------------------------------------ */

export function readRatchet(root: string, name: string): number | null {
  const spec = RATCHETS[name];
  if (!spec) return null;
  const full = path.join(root, spec.file);
  if (!existsSync(full)) return null;
  const m = spec.pattern.exec(readFileSync(full, 'utf8'));
  return m ? Number(m[1]) : null;
}

function checkRatchets(node: GraphNode, root: string, out: Violation[]): void {
  if (node.type !== 'hypothesis' || node.fm.ratchets_touched === undefined) return;
  let touched: Record<string, string>;
  try {
    touched = asMap(node.fm as FrontMatter, 'ratchets_touched', node.file);
  } catch {
    return;
  }
  for (const [name, direction] of Object.entries(touched)) {
    if (!(name in RATCHETS)) {
      out.push({
        file: node.file,
        message: `\`ratchets_touched.${name}\` is not a known ratchet (${Object.keys(RATCHETS).join(', ')})`,
      });
      continue;
    }
    if (!(RATCHET_DIRECTIONS as readonly string[]).includes(direction)) {
      out.push({
        file: node.file,
        message: `\`ratchets_touched.${name}: ${direction}\` — say ${RATCHET_DIRECTIONS.join(' | ')}, not a number. ` +
          `The value lives in ${RATCHETS[name].file}; restating it here is a second home for it`,
      });
      continue;
    }
    if (readRatchet(root, name) === null) {
      out.push({
        file: node.file,
        message:
          `\`${name}\` could not be read out of ${RATCHETS[name].file}. The constant moved or was renamed, ` +
          `so this hypothesis is reasoning about a bar that no longer exists where it thinks`,
      });
    }
    if (direction === 'raise' && node.fm.status !== 'killed') {
      out.push({
        file: node.file,
        message:
          `raises \`${name}\` and is not \`killed\`. Ratchets only ever come down — GAUNTLET_LOOP §3 ` +
          `lists raising one among the bars agents may never self-declare`,
      });
    }
  }
}

/* ------------------------------------------------------------------ *
 * 7. Hypothesis coherence                                              *
 * ------------------------------------------------------------------ */

const EMPTY_REMOVAL = /^(nothing|none|n\/a|tbd|-)$/i;

function checkHypothesis(node: GraphNode, root: string, out: Violation[]): void {
  if (node.type !== 'hypothesis') return;

  const removes = node.fm.removes;
  if (typeof removes === 'string' && EMPTY_REMOVAL.test(removes.trim())) {
    out.push({
      file: node.file,
      message:
        `\`removes: ${removes}\` is the field being answered with a shrug. Name what this replaces, ` +
        `deletes or supersedes — a generator with no subtraction operator only grows`,
    });
  }

  const instrument = node.fm.instrument;
  const guardrail = node.fm.guardrail;
  if (typeof instrument === 'string' && typeof guardrail === 'string' && instrument.trim() === guardrail.trim()) {
    out.push({
      file: node.file,
      message:
        'the guardrail is the same metric as the instrument, so it cannot get worse while the ' +
        'instrument gets better. A pair is the whole point — one number optimised alone is how ' +
        '"meaningful social interactions" ended up weighting anger five to one',
    });
  }

  // An existing-instrument bar must name something that exists.
  if (node.fm.bar_kind === 'existing-instrument' && typeof instrument === 'string') {
    const file = instrument.split(/[\s:]/)[0];
    if (/\.(ts|tsx|mjs|spec\.ts)$/.test(file) && !existsSync(path.join(root, file))) {
      out.push({
        file: node.file,
        message: `\`bar_kind: existing-instrument\` names \`${file}\`, which does not exist`,
      });
    }
  }

  // Preconditions are answered against *our* arithmetic, one line per primitive
  // the mechanic declared. `hold: no` is legal — it just cannot be `candidate`.
  let holds: Record<string, string> = {};
  try {
    holds = asMap(node.fm as FrontMatter, 'preconditions_hold', node.file);
  } catch {
    return;
  }
  const unmet = Object.entries(holds).filter(([, v]) => v.startsWith('no'));
  if (unmet.length > 0 && node.fm.status === 'candidate') {
    out.push({
      file: node.file,
      message:
        `precondition ${unmet.map(([k]) => k).join(', ')} does not hold, so this cannot be a live ` +
        `candidate. Mark it \`blocked-on-telemetry\` or \`killed\` — a leaderboard needs a population, ` +
        `and wanting one does not create it`,
    });
  }
}

/* ------------------------------------------------------------------ *
 * 8. Behaviours name instruments that exist                            *
 * ------------------------------------------------------------------ */

/**
 * The declared analytics event union. Read, never restated — no new event names.
 *
 * Only union *members* count: the arm regex requires the leading `|`, so a
 * doc-comment inside the union that happens to quote a word cannot smuggle a
 * name into the set. This is the difference between a check that reads the
 * declaration and one that reads the neighbourhood.
 */
export function declaredAnalyticsEvents(root: string): Set<string> {
  const file = path.join(root, 'src/lib/analytics.ts');
  if (!existsSync(file)) return new Set();
  const src = readFileSync(file, 'utf8');
  const at = src.indexOf('export type AnalyticsEvent =');
  if (at === -1) return new Set();
  const end = src.indexOf(';', at);
  const union = src.slice(at, end === -1 ? undefined : end);
  return new Set([...union.matchAll(/^\s*\|\s*'([a-z0-9_]+)'/gm)].map((m) => m[1]));
}

function checkBehavior(node: GraphNode, events: Set<string>, out: Violation[]): void {
  if (node.type !== 'behavior') return;
  const observable = node.fm.observable;
  if (typeof observable !== 'string') return;
  const m = /^event:([a-z0-9_]+)$/.exec(observable.trim());
  if (!m) return; // a non-event observable is checked by the instrument rules instead
  if (!events.has(m[1])) {
    out.push({
      file: node.file,
      message:
        `\`observable: ${observable}\` names an event that is not in the AnalyticsEvent union in ` +
        `src/lib/analytics.ts. The union is closed on purpose; the graph reads it and never adds to it`,
    });
  }
}

/* ------------------------------------------------------------------ *
 * 9. Budgets                                                           *
 * ------------------------------------------------------------------ */

function checkBudgets(graph: LoadedGraph, root: string, out: Violation[]): void {
  for (const node of graph.nodes) {
    const bytes = statSync(path.join(root, node.file)).size;
    if (bytes > MAX_NODE_BYTES) {
      out.push({
        file: node.file,
        message:
          `${bytes} bytes over a ${MAX_NODE_BYTES} cap. Split it. A node too big to retrieve cheaply ` +
          `is a node the loop will stop loading, and then stop obeying`,
      });
    }
  }
  const counts = new Map<NodeType, number>();
  for (const n of graph.nodes) counts.set(n.type, (counts.get(n.type) ?? 0) + 1);
  for (const [type, n] of counts) {
    if (n > MAX_NODES_PER_TYPE) {
      out.push({
        file: `${GRAPH_DIR}/`,
        message: `${n} ${type} nodes over a ${MAX_NODES_PER_TYPE} cap — rotate the settled ones to docs/archive/mechanics/`,
      });
    }
  }
  // The cap is only real if the file says so where the next author will look.
  const index = path.join(root, GRAPH_DIR, 'INDEX.md');
  if (existsSync(index)) {
    const src = readFileSync(index, 'utf8');
    if (!src.includes(String(MAX_NODE_BYTES)) || !src.includes(String(MAX_NODES_PER_TYPE))) {
      out.push({
        file: `${GRAPH_DIR}/INDEX.md`,
        message: `must state its own budgets (${MAX_NODE_BYTES} bytes, ${MAX_NODES_PER_TYPE} nodes) — a cap nobody can see is a cap nobody keeps`,
      });
    }
  }
}

/* ------------------------------------------------------------------ *
 * Entry point                                                          *
 * ------------------------------------------------------------------ */

export interface ValidationResult {
  graph: LoadedGraph;
  violations: Violation[];
}

export function validateGraph(root: string): ValidationResult {
  const graph = loadGraph(root);
  const out: Violation[] = graph.problems.map((message) => ({ file: GRAPH_DIR, message }));

  const unciteable = new Set(
    readAntiLibrary(root)
      .map((e) => e.fingerprint)
      .filter((f) => f.includes('.'))
  );
  const events = declaredAnalyticsEvents(root);

  for (const node of graph.nodes) {
    checkFields(node, out);
    checkPrimitives(node, out);
    checkEvidence(node, unciteable, out);
    checkEdges(node, graph, out);
    checkConstraintLiveness(node, root, out);
    checkRatchets(node, root, out);
    checkHypothesis(node, root, out);
    checkBehavior(node, events, out);
  }
  checkBudgets(graph, root, out);

  return { graph, violations: out };
}
