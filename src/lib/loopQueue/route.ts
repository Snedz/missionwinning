/**
 * Which organ runs next.
 *
 * Three protocols now sit behind one queue — `GRAPH_LOOP` builds, `GAUNTLET_LOOP`
 * grades, `IDEA_LOOP` generates — and choosing between them is currently a thing
 * a spawn is *told* to do in prose (`AGENT_RECIPES.md:170`, and the copy-paste
 * prompt's rule 4, which does not mention the idea loop at all). This file makes
 * the choice computable, so `npm run harness` can name the row, the route and
 * the recipe instead of an agent remembering all three.
 *
 * ## The ratchet
 *
 * The other half of this file exists because of what the queue's own shape says.
 * Counting rows per `### Now —` section, in document order:
 *
 *     7 7 8 4 2 1 2 1 1 1 1 1 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
 *
 * Sixteen consecutive one-row sections at the tail — mechanically recovering the
 * number `IDEA_LOOP.md` states about itself ("roughly sixteen consecutive rows
 * were the same idea"). Each of those blocks ends with the literal words *"Do not
 * invent X2."* A prose diversity rule, written out sixteen times, obeyed zero.
 *
 * `MAX_SINGLE_ROW_RUN` is that rule as a ratchet, in the shape this repo already
 * uses for `TAP_BUDGET` and the bundle budget: the run may go **down** and not up.
 * To open a new `Now` section you must either batch at least two rows into it, or
 * first close the run with a harvest. It does **not** override a live `open` row —
 * a real campaign with a real brief is not monoculture. It bites at the moment the
 * last row closes and someone would otherwise mint the next letter.
 *
 * A text-similarity check was tried first and is deliberately absent. Measured on
 * the real drift rows, consecutive Jaccard over the Moves cells ran
 * 0.07 / 0.23 / 0.00 / 0.36 / 0.00 / 0.50 — indistinguishable from the H0 and G
 * batches (0.00–0.17). Those rows repeat *structurally* ("<surface> first-paint …
 * match pack. Drift cap <N>"), not lexically. A check that does not separate is
 * not a check, so it is not here.
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { ParsedQueue, QueueRow, QueueSection } from './parse.ts';
import { firstCriticalGap, type PathGap } from './criticalPath.ts';
import { validateGraph } from '@/lib/ideaGraph/validate.ts';
import { readEmittedHistory } from '@/lib/ideaGraph/derive.ts';
import { selectionInputs } from '@/lib/ideaGraph/learn.ts';
import { selectNext } from '@/lib/ideaGraph/select.ts';
import { generateHarvestLegal } from '@/lib/ideaGraph/harvestGate.ts';

/**
 * The committed queue's trailing run of one-row `Now` sections. Pinned by
 * `route.test.ts`, which asserts the real file is at or below it — so this number
 * only ever comes down.
 */
export const MAX_SINGLE_ROW_RUN = 16;

/** `GNT-1`, `GNT-2` … A campaign row routes to the gauntlet, never to a builder. */
const CAMPAIGN = /\bGNT-(\d+)\b/;

/** `[…](gauntlet/GNT-2-coach-plan-quality.md)` — links in this file are `docs/`-relative. */
const WORKBENCH_LINK = /\(?(gauntlet\/GNT-\d+-[a-z0-9-]+\.md)\)/i;

const ROLES = ['LEAD', 'BUILDER', 'CRITIC', 'SMOOTHER'] as const;
export type Role = (typeof ROLES)[number];

export type RouteKind = 'build' | 'gauntlet' | 'harvest' | 'path' | 'stalled';

/** What a harvest hop must do. Null when the route is not harvest. */
export type HarvestAction = 'paste' | 'generate' | null;

export interface Workbench {
  file: string;
  /** The whole `**Next spawn:**` line, verbatim. The brief is prose and stays prose. */
  nextSpawn: string | null;
  role: Role | null;
  unit: string | null;
  round: string | null;
  /** `hard cap **≤10 build PRs** (2 spent: …)` → `{ cap: 10, spent: 2 }`. */
  cap: { cap: number; spent: number } | null;
}

export interface Route {
  kind: RouteKind;
  /** Recipe number in `docs/AGENT_RECIPES.md`. */
  recipe: 11 | 12 | 13 | 15 | null;
  row: QueueRow | null;
  workbench: Workbench | null;
  /** `founder` / `blocked` rows passed over on the way to the live ticket. Never silent. */
  skipped: QueueRow[];
  singleRowRun: number;
  /** True when the run is at or past `MAX_SINGLE_ROW_RUN`. */
  atRatchet: boolean;
  /** Conditions a human has to decide about. Reported, never auto-resolved. */
  notes: string[];
  /** Orchestration-path gap when `kind` is `path`. */
  path: PathGap | null;
  /** Set when `kind` is `harvest`. */
  harvestAction: HarvestAction;
}

/** `Now` sections only, in document order. Parallel / Founder / Parked are other lanes. */
export function nowSections(queue: ParsedQueue): QueueSection[] {
  return queue.sections.filter((s) => s.kind === 'now');
}

/**
 * An Idea Loop paste. The notes already said a harvest row is the other legal
 * way off the 16-run; the counter has to see the same fact or pasting `IL-H-01`
 * is a seventeenth letter.
 */
export function isHarvestRow(row: QueueRow): boolean {
  return /^IL-/.test(row.id);
}

/**
 * Consecutive `Now` sections holding exactly one row, counted back from the last.
 * A section with two or more rows resets it — that is the whole point: batching is
 * the behaviour this rewards. A one-row harvest (`IL-*`) also closes the run:
 * that is the exception the ratchet notes already named.
 */
export function singleRowRun(queue: ParsedQueue): number {
  const sections = nowSections(queue);
  let run = 0;
  for (let i = sections.length - 1; i >= 0; i -= 1) {
    const rows = sections[i].rows;
    if (rows.length !== 1) break;
    if (rows[0] && isHarvestRow(rows[0])) break;
    run += 1;
  }
  return run;
}

export function isCampaign(row: QueueRow): boolean {
  return CAMPAIGN.test(row.loop) || CAMPAIGN.test(row.moves);
}

export function readWorkbench(root: string, row: QueueRow): Workbench | null {
  const link = WORKBENCH_LINK.exec(row.moves);
  if (!link) return null;
  const file = path.posix.join('docs', link[1]);
  const full = path.join(root, file);
  if (!existsSync(full)) return { file, nextSpawn: null, role: null, unit: null, round: null, cap: null };

  const src = readFileSync(full, 'utf8');
  const nextSpawn = src.split('\n').find((l) => l.startsWith('**Next spawn:**')) ?? null;

  // GNT-1's line opens `ready-for-founder` with no role at all, so every field
  // here is optional. An absent role is reported, not guessed at.
  //
  // Both readers below are positional on purpose, and both were wrong once.
  //
  // `ROLES.find(...)` scanned in *this file's* declaration order, so the
  // SMOOTHER line — "SMOOTHER — U1–U4 critic PASS … Then LEAD writes the
  // campaign report" — reported `LEAD`, because LEAD is first in the array and
  // is mentioned as the step *after* this one. The answer has to come from the
  // sentence, not from how the constant happens to be sorted.
  const role =
    nextSpawn === null
      ? null
      : (ROLES.map((r) => ({ r, at: nextSpawn.search(new RegExp(`\\b${r}\\b`)) }))
          .filter((x) => x.at >= 0)
          .sort((a, b) => a.at - b.at)[0]?.r ?? null);

  // The unit is only ever written as `<ROLE> on **U<n> R<r>**`. A bare scan for
  // `U\d` picked `U1` out of the range "U1–U4", which describes what is already
  // done rather than what to do next — and a SMOOTHER round has no unit at all.
  const assignment =
    role && nextSpawn
      ? new RegExp(`\\b${role}\\b\\s+on\\s+\\*{0,2}(U\\d+)(?:\\s+(R\\d+))?`).exec(nextSpawn)
      : null;
  const unit = assignment?.[1] ?? null;
  const round = assignment?.[2] ?? null;

  const capLine = /hard cap\s+\*\*≤(\d+)\s+build PRs\*\*\s*\(\*{0,2}(\d+)\s+spent/.exec(src);
  const cap = capLine ? { cap: Number(capLine[1]), spent: Number(capLine[2]) } : null;

  return { file, nextSpawn, role, unit, round, cap };
}

export function route(root: string, queue: ParsedQueue): Route {
  const run = singleRowRun(queue);
  const atRatchet = run >= MAX_SINGLE_ROW_RUN;
  const notes: string[] = [];
  const skipped: QueueRow[] = [];

  const rows = nowSections(queue).flatMap((s) => s.rows);
  let live: QueueRow | null = null;
  for (const row of rows) {
    if (row.status === 'founder' || row.status === 'blocked') {
      // GRAPH_LOOP.md § "Stop the graph if": mark it and take the next *agent*
      // open row. Taking it is allowed; taking it quietly is not.
      skipped.push(row);
      continue;
    }
    if (row.status === 'open') {
      live = row;
      break;
    }
  }

  if (atRatchet) {
    notes.push(
      `single-row-section run is ${run}, at the ${MAX_SINGLE_ROW_RUN} ratchet — ` +
        `the next \`### Now\` section must carry ≥2 rows or be a harvest row`
    );
  }

  if (!live) {
    return emptyQueueRoute(root, { singleRowRun: run, atRatchet, skipped, notes });
  }

  if (isCampaign(live)) {
    const workbench = readWorkbench(root, live);
    if (!workbench) {
      notes.push(`${live.id} names a GNT campaign but its Moves cell links no workbench under docs/gauntlet/`);
    } else if (!workbench.nextSpawn) {
      notes.push(`${workbench.file} has no \`**Next spawn:**\` line — the role and unit are unresolved`);
    } else if (workbench.cap && workbench.cap.spent >= workbench.cap.cap) {
      notes.push(
        `${workbench.file} has spent ${workbench.cap.spent} of ≤${workbench.cap.cap} build PRs — ` +
          `budget exhausted means LEAD writes the report, not another builder`
      );
    }
    return {
      kind: 'gauntlet',
      recipe: 12,
      row: live,
      workbench,
      skipped,
      singleRowRun: run,
      atRatchet,
      notes,
      path: null,
      harvestAction: null,
    };
  }

  return {
    kind: 'build',
    recipe: 11,
    row: live,
    workbench: null,
    skipped,
    singleRowRun: run,
    atRatchet,
    notes,
    path: null,
    harvestAction: null,
  };
}

function harvestWouldEmit(root: string): boolean {
  try {
    const { graph, violations } = validateGraph(root);
    if (violations.length > 0) return false;
    const { candidates, antiLibrary } = selectionInputs(root, graph);
    const history = readEmittedHistory(root, graph);
    return selectNext(candidates, history, antiLibrary).emit !== null;
  } catch {
    return false;
  }
}

function emptyQueueRoute(
  root: string,
  base: Pick<Route, 'singleRowRun' | 'atRatchet' | 'skipped' | 'notes'>
): Route {
  const { singleRowRun: run, atRatchet, skipped, notes } = base;
  const blank = {
    row: null,
    workbench: null,
    skipped,
    singleRowRun: run,
    atRatchet,
    path: null as PathGap | null,
    harvestAction: null as HarvestAction,
  };

  if (harvestWouldEmit(root)) {
    notes.push(
      'no agent-open row — `/harness` pastes the `idea:next` row. That is the baton.'
    );
    return { kind: 'harvest', recipe: 13, notes, ...blank, harvestAction: 'paste' };
  }

  if (generateHarvestLegal(root)) {
    notes.push(
      'no agent-open row and nothing to emit — generate a harvest (recipe 13), then paste if one survives'
    );
    return { kind: 'harvest', recipe: 13, notes, ...blank, harvestAction: 'generate' };
  }

  const gap = firstCriticalGap(root);
  if (gap) {
    notes.push(
      gap.owner === 'founder'
        ? `no queue row, harvest mined out — next is ${gap.id} (${gap.owner} phone), not AU2`
        : `no queue row, harvest mined out — next is ${gap.id} (${gap.claim})`
    );
    return { kind: 'path', recipe: 15, notes, ...blank, path: gap };
  }

  notes.push(
    existsSync(path.join(root, 'docs/IDEA_LOOP.md'))
      ? 'Horizon W is pass and Horizon 0 agent streams are proven — remaining flip work is founder (postal, secrets, PRIVATE_MODE). Do not invent a letter or a craft walk'
      : 'no agent-open row, no harvest, and no critical-path gap — stalled'
  );
  return { kind: 'stalled', recipe: null, notes, ...blank };
}
