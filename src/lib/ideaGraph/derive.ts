/**
 * Turning nodes into the things the selector compares.
 *
 * Fingerprints are **derived**, never authored. A hand-written fingerprint is a
 * field an author can tune until their idea slips past the novelty floor, which
 * would make the floor a formality — the same way `Excellence-Override` would
 * be if agents wrote their own reasons and nobody read them.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { asMap } from './parse.ts';
import type { BehaviorClass, CostClass, MoveClass } from './schema.ts';
import type { GraphNode, LoadedGraph } from './load.ts';
import type { Candidate, EmittedRow } from './select.ts';

/**
 * Words carrying no discriminating power in this corpus. Deliberately short:
 * an aggressive stop list is a quiet way to make two different ideas look
 * identical, which fails candidates rather than passing them.
 */
const STOP = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'for', 'on', 'in', 'is', 'it',
  'that', 'this', 'with', 'from', 'by', 'as', 'at', 'be', 'are', 'was',
]);

export function tokenize(text: string): string[] {
  return [
    ...new Set(
      text
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((t) => t.length >= 3 && !STOP.has(t))
    ),
  ].sort();
}

/**
 * A candidate's fingerprint: its two axes, the mechanic it translates, and the
 * language of what it does and undoes.
 */
export function fingerprintOf(node: GraphNode): string[] {
  const fm = node.fm;
  const parts = [
    typeof fm.behavior_class === 'string' ? fm.behavior_class : '',
    typeof fm.move_class === 'string' ? fm.move_class : '',
    typeof fm.translates === 'string' ? fm.translates : '',
  ].filter(Boolean);
  const text = [fm.title, fm.removes, fm.one_line].filter((v) => typeof v === 'string').join(' ');
  return [...new Set([...parts, ...tokenize(text as string)])].sort();
}

function behaviorClassOf(graph: LoadedGraph, hypothesis: GraphNode): BehaviorClass | null {
  const target = typeof hypothesis.fm.targets === 'string' ? graph.byId.get(hypothesis.fm.targets) : undefined;
  const cls = target?.fm.behavior_class;
  return typeof cls === 'string' ? (cls as BehaviorClass) : null;
}

/** Strongest evidence class on the mechanic this hypothesis translates. */
function evidenceOf(graph: LoadedGraph, hypothesis: GraphNode): Candidate['evidence'] {
  const mech = typeof hypothesis.fm.translates === 'string' ? graph.byId.get(hypothesis.fm.translates) : undefined;
  const rows = Array.isArray(mech?.fm.seen_in) ? (mech!.fm.seen_in as Record<string, string>[]) : [];
  const order: Candidate['evidence'][] = ['E0', 'E1', 'E2', 'E3'];
  for (const cls of order) {
    if (rows.some((r) => r.class === cls)) return cls;
  }
  return 'E3';
}

export function toCandidates(graph: LoadedGraph): Candidate[] {
  const out: Candidate[] = [];
  for (const node of graph.nodes) {
    if (node.type !== 'hypothesis') continue;
    const behaviorClass = behaviorClassOf(graph, node);
    if (!behaviorClass) continue;

    let holds = true;
    try {
      holds = Object.values(asMap(node.fm, 'preconditions_hold', node.file)).every((v) => !v.startsWith('no'));
    } catch {
      holds = false;
    }

    const target = graph.byId.get(node.fm.targets as string);
    const measurable = (target?.fm.measurable as Candidate['measurable']) ?? 'never';

    out.push({
      id: node.id,
      title: String(node.fm.title ?? node.id),
      behaviorClass,
      moveClass: node.fm.move_class as MoveClass,
      costClass: node.fm.cost_class as CostClass,
      fingerprint: fingerprintOf(node),
      status: String(node.fm.status ?? 'candidate'),
      preconditionsHold: holds,
      evidence: evidenceOf(graph, node),
      measurable,
    });
  }
  return out;
}

/**
 * Rows this system has already emitted, read back out of `GRAPH_LOOP.md`.
 *
 * The queue file stays the one home for what is open — this only *reads* it,
 * and reads only rows the Idea Loop itself wrote, which are the ones carrying a
 * node id. Ordinary letter-queue rows are none of this system's business.
 */
export function readEmittedHistory(root: string, graph: LoadedGraph): EmittedRow[] {
  let src: string;
  try {
    src = readFileSync(path.join(root, 'docs/GRAPH_LOOP.md'), 'utf8');
  } catch {
    return [];
  }
  const out: EmittedRow[] = [];
  for (const m of src.matchAll(/\bIL-(H-\d{2,})\b/g)) {
    const node = graph.byId.get(m[1]);
    if (!node) continue;
    const behaviorClass = behaviorClassOf(graph, node);
    if (!behaviorClass) continue;
    out.push({
      id: node.id,
      behaviorClass,
      moveClass: node.fm.move_class as MoveClass,
      fingerprint: fingerprintOf(node),
    });
  }
  return out;
}
