/**
 * The selector. Code, not a model — and this is the load-bearing decision.
 *
 * ## Why nothing here asks an LLM what it thinks
 *
 * A model asked to rank its own ideas is biased three documented ways at once:
 * it prefers its own outputs, it prefers whichever candidate it saw first (a
 * study across fifteen judges and roughly 150,000 instances measured post-swap
 * consistency between 70.5% and 77.3%), and it prefers longer answers. Ranking
 * on generated justification therefore selects for ideas that are long, listed
 * first, and written in the judge's own voice. That is not an idea-quality
 * signal, and at zero marginal cost it is *strong opinions loosely held*
 * automated — the exact pathology that critique names.
 *
 * So the score below is computed only from things a model cannot fabricate on
 * demand: cost class, whether the mechanic's preconditions actually hold
 * against our arithmetic, the evidence class of the sighting, and whether the
 * target behaviour is measurable today. Argument quality is not an input.
 *
 * ## Why an archive rather than a ranked list
 *
 * The failure this replaces was monoculture: one fitness axis, no diversity
 * pressure, sixteen consecutive queue rows of the same idea while the cap
 * walked 216 → 167. A ranked list reproduces that by construction, because the
 * best-scoring *kind* of idea keeps winning. So this keeps one elite per cell
 * over (behaviour × move × cost), and a candidate that scores badly but sits in
 * an empty cell is retained as a stepping stone — the operational form of the
 * observation that ambitious goals are reached through steps that score badly
 * against them.
 */

import { BEHAVIOR_CLASSES, MOVE_CLASSES, type BehaviorClass, type CostClass, type MoveClass } from './schema.ts';

export interface Candidate {
  id: string;
  title: string;
  behaviorClass: BehaviorClass;
  moveClass: MoveClass;
  costClass: CostClass;
  /** Normalised token set. Derived from the node, never authored by hand. */
  fingerprint: string[];
  status: string;
  /** Un-fabricable inputs only. See the header. */
  preconditionsHold: boolean;
  evidence: 'E0' | 'E1' | 'E2' | 'E3';
  measurable: 'live' | 'blocked-on-telemetry' | 'never';
}

/** A row this system has already emitted into `GRAPH_LOOP`. */
export interface EmittedRow {
  id: string;
  behaviorClass: BehaviorClass;
  moveClass: MoveClass;
  fingerprint: string[];
}

export interface Refusal {
  id: string;
  rule: 'status' | 'novelty' | 'anti-library' | 'consecutive-cell' | 'deletion-quota';
  because: string;
}

export interface Selection {
  emit: Candidate | null;
  refusals: Refusal[];
  /** Cells with no elite. These are where the next harvest is pointed. */
  emptyCells: string[];
}

/**
 * Similarity at or above this counts as "we already did that".
 *
 * A judgement, so it lives in one place where it can be argued with — like
 * `TODAY_MAX_TOP_LEVEL_BLOCKS` and `MAX_NOW_BULLETS`.
 *
 * Calibrated by measurement, not by taste. Against the real queue rows this
 * system exists to prevent, consecutive first-paint copy-drift rows measure
 * **0.588 to 0.733** similar — they share their axis, their move and most of
 * their language, and differ only in which surface they name and which cap
 * number they carry. So 0.6 sits deliberately *inside* that band: it catches
 * the tighter pairs and lets the looser ones through to the consecutive-cell
 * rule, which is the rule that should own them.
 *
 * That division of labour is pinned by a test. An earlier draft of this comment
 * asserted the band was exactly 0.6 and the measurement said otherwise — which
 * is the entire argument for writing the test before believing the number.
 */
export const NOVELTY_EPSILON = 0.6;

/** How far back novelty looks. */
export const NOVELTY_WINDOW = 8;

/** Every window of this many emitted rows must contain a `remove` or a `measure`. */
export const DELETION_QUOTA_WINDOW = 5;

export const SUBTRACTIVE_MOVES: readonly MoveClass[] = ['remove', 'measure'];

export function cellKey(b: BehaviorClass, m: MoveClass, c?: CostClass): string {
  return c ? `${b}/${m}/${c}` : `${b}/${m}`;
}

export function jaccard(a: readonly string[], b: readonly string[]): number {
  const A = new Set(a);
  const B = new Set(b);
  if (A.size === 0 && B.size === 0) return 1;
  let shared = 0;
  for (const t of A) if (B.has(t)) shared += 1;
  return shared / (A.size + B.size - shared);
}

/**
 * Cheap-to-falsify outranks impressive.
 *
 * Even a frontier evolutionary agent improved on the state of the art in only
 * about a fifth of problems that had *perfect machine-checkable evaluators*,
 * and a mature experimentation platform lands roughly a third of well-designed
 * experiments. This product's evaluator is far weaker than either. The right
 * response is not a better ranking, it is to make a losing idea cost almost
 * nothing — so cost class carries the most weight of any term here.
 */
export function scoreOf(c: Candidate): number {
  const cost = { S: 3, M: 2, L: 1 }[c.costClass];
  const precondition = c.preconditionsHold ? 2 : 0;
  const evidence = { E0: 2, E1: 1, E2: 0, E3: -1 }[c.evidence];
  const measurable = c.measurable === 'live' ? 1 : 0;
  return cost + precondition + evidence + measurable;
}

/** Every cell on the two axes the selector round-robins over. */
export function allCells(): string[] {
  const out: string[] = [];
  for (const b of BEHAVIOR_CLASSES) for (const m of MOVE_CLASSES) out.push(cellKey(b, m));
  return out;
}

/**
 * Pick at most one row.
 *
 * The cap of one is not a throughput limit, it is the seam: `GRAPH_LOOP`'s
 * whole contract is one concern per PR, and a generator that appends five rows
 * has taken the baton away from the queue that owns it.
 */
export function selectNext(
  candidates: readonly Candidate[],
  history: readonly EmittedRow[],
  antiLibrary: readonly string[][] = []
): Selection {
  const refusals: Refusal[] = [];
  const recent = history.slice(-NOVELTY_WINDOW);
  const last = history[history.length - 1];

  // The quota is due when the trailing window is one short of full and holds
  // nothing subtractive.
  const trailing = history.slice(-(DELETION_QUOTA_WINDOW - 1));
  const quotaDue =
    trailing.length === DELETION_QUOTA_WINDOW - 1 &&
    !trailing.some((r) => SUBTRACTIVE_MOVES.includes(r.moveClass));

  const survivors: Candidate[] = [];

  for (const c of candidates) {
    if (c.status !== 'candidate') {
      refusals.push({ id: c.id, rule: 'status', because: `status is \`${c.status}\`, not \`candidate\`` });
      continue;
    }

    const killed = antiLibrary.find((f) => jaccard(c.fingerprint, f) >= NOVELTY_EPSILON);
    if (killed) {
      refusals.push({
        id: c.id,
        rule: 'anti-library',
        because: `matches a killed idea (${killed.join('+')}) at ${jaccard(c.fingerprint, killed).toFixed(2)}`,
      });
      continue;
    }

    const near = recent.find((r) => jaccard(c.fingerprint, r.fingerprint) >= NOVELTY_EPSILON);
    if (near) {
      refusals.push({
        id: c.id,
        rule: 'novelty',
        because: `${jaccard(c.fingerprint, near.fingerprint).toFixed(2)} similar to ${near.id}, already emitted`,
      });
      continue;
    }

    if (last && cellKey(c.behaviorClass, c.moveClass) === cellKey(last.behaviorClass, last.moveClass)) {
      refusals.push({
        id: c.id,
        rule: 'consecutive-cell',
        because: `same cell as ${last.id} (${cellKey(last.behaviorClass, last.moveClass)}) — the queue does not repeat itself`,
      });
      continue;
    }

    if (quotaDue && !SUBTRACTIVE_MOVES.includes(c.moveClass)) {
      refusals.push({
        id: c.id,
        rule: 'deletion-quota',
        because: `${DELETION_QUOTA_WINDOW - 1} rows without a remove/measure — this one must subtract or measure`,
      });
      continue;
    }

    survivors.push(c);
  }

  const filled = new Set(history.map((r) => cellKey(r.behaviorClass, r.moveClass)));
  const emptyCells = allCells().filter((k) => !filled.has(k));

  survivors.sort((a, b) => {
    // Illumination first: a candidate in a never-visited cell wins on tie-break
    // *before* score, because coverage is the thing a ranked list cannot buy.
    const aNew = filled.has(cellKey(a.behaviorClass, a.moveClass)) ? 1 : 0;
    const bNew = filled.has(cellKey(b.behaviorClass, b.moveClass)) ? 1 : 0;
    if (aNew !== bNew) return aNew - bNew;
    const s = scoreOf(b) - scoreOf(a);
    if (s !== 0) return s;
    // Node ids are machine keys (`H-01`), not language, so this must not claim
    // a linguistic comparison — `localeCompare` with no locale sorts by whatever
    // the runtime decides, which would make the tie-break environment-dependent.
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });

  return { emit: survivors[0] ?? null, refusals, emptyCells };
}
