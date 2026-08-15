/**
 * What a closed loop taught, applied to the next pick.
 *
 * The historian writes a `V-NN` after a campaign report or after a hypothesis
 * is graded. Until this file existed, those nodes could be loaded and then
 * ignored — the selector only saw hypothesis `status` and `ANTILIBRARY.md`,
 * so a verdict was a diary the next harvest could not read.
 *
 * Nothing here asks a model what it learned. `learned` is printed for the
 * next spawn. Selection uses only the outcome and, for a failed hypothesis,
 * the settled node's fingerprint — the same un-fabricable inputs `select.ts`
 * already accepts.
 */

import { fingerprintOf, toCandidates } from './derive.ts';
import { readAntiLibrary, type GraphNode, type LoadedGraph } from './load.ts';
import type { Candidate } from './select.ts';

export interface Lesson {
  id: string;
  outcome: string;
  learned: string;
  settles: string | null;
  campaign: string | null;
}

const KILL_OUTCOMES = new Set(['fail', 'abandoned']);

function verdictsOf(graph: LoadedGraph): GraphNode[] {
  return graph.nodes.filter((n) => n.type === 'verdict');
}

export function lessons(graph: LoadedGraph): Lesson[] {
  return verdictsOf(graph).map((n) => ({
    id: n.id,
    outcome: String(n.fm.outcome ?? ''),
    learned: String(n.fm.learned ?? ''),
    settles: typeof n.fm.settles === 'string' ? n.fm.settles : null,
    campaign: typeof n.fm.campaign === 'string' ? n.fm.campaign : null,
  }));
}

/**
 * Status rewrite: a settled hypothesis is no longer a candidate, even if its
 * own file still says so. `fail`/`abandoned` become `killed`; `pass` /
 * `already-true` become `already-true`. The hypothesis file is updated by the
 * historian in the same PR as the verdict when they remember; this function
 * is the backstop so a forgotten status flip cannot re-emit the idea.
 */
export function withVerdictStatuses(candidates: readonly Candidate[], graph: LoadedGraph): Candidate[] {
  const byId = new Map<string, string>();
  for (const n of verdictsOf(graph)) {
    if (typeof n.fm.settles !== 'string') continue;
    byId.set(n.fm.settles, String(n.fm.outcome ?? ''));
  }
  return candidates.map((c) => {
    const outcome = byId.get(c.id);
    if (!outcome) return c;
    return { ...c, status: KILL_OUTCOMES.has(outcome) ? 'killed' : 'already-true' };
  });
}

/** Fingerprints of hypotheses a verdict killed, in the shape `selectNext` already consumes. */
export function verdictKills(graph: LoadedGraph): string[][] {
  const out: string[][] = [];
  for (const n of verdictsOf(graph)) {
    if (!KILL_OUTCOMES.has(String(n.fm.outcome ?? ''))) continue;
    if (typeof n.fm.settles !== 'string') continue;
    const target = graph.byId.get(n.fm.settles);
    if (!target || target.type !== 'hypothesis') continue;
    out.push(fingerprintOf(target));
  }
  return out;
}

/**
 * Closed `GNT-n` ids that have no campaign verdict. The caller extracts the
 * ids from the queue so this folder does not import `loopQueue`.
 */
export function campaignsWithoutVerdict(graph: LoadedGraph, campaignIds: readonly string[]): string[] {
  const have = new Set(
    verdictsOf(graph)
      .map((n) => (typeof n.fm.campaign === 'string' ? n.fm.campaign : ''))
      .filter(Boolean)
  );
  return campaignIds.filter((id) => !have.has(id));
}

/** Anti-library lines plus verdict kills — the refuse list `selectNext` already takes. */
export function refuseFingerprints(root: string, graph: LoadedGraph): string[][] {
  const fromFile = readAntiLibrary(root)
    .filter((e) => !e.fingerprint.includes('.'))
    .map((e) => e.fingerprint.split('+').map((t) => t.trim()));
  return [...fromFile, ...verdictKills(graph)];
}

export function selectionInputs(root: string, graph: LoadedGraph): {
  candidates: Candidate[];
  antiLibrary: string[][];
  lessons: Lesson[];
} {
  return {
    candidates: withVerdictStatuses(toCandidates(graph), graph),
    antiLibrary: refuseFingerprints(root, graph),
    lessons: lessons(graph),
  };
}
