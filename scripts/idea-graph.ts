/**
 * `npm run idea:validate` · `idea:next` · `idea:pack <class>`
 *
 * The Idea Loop's only executable surface. It reads `docs/mechanics/`, checks
 * the graph, prints the one candidate the selector would emit, and builds the
 * bounded context pack a spawn is allowed to read.
 *
 * It **prints** a queue row. It does not write one. Appending to
 * `docs/GRAPH_LOOP.md` is the baton, and the baton is handed over by a human or
 * by the spawn that is about to take the loop — not as a side effect of a
 * validation command.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateGraph } from '../src/lib/ideaGraph/validate.ts';
import { readAntiLibrary } from '../src/lib/ideaGraph/load.ts';
import { buildPack, MAX_PACK_BYTES } from '../src/lib/ideaGraph/pack.ts';
import { readEmittedHistory, toCandidates } from '../src/lib/ideaGraph/derive.ts';
import { allCells, cellKey, scoreOf, selectNext } from '../src/lib/ideaGraph/select.ts';
import { BEHAVIOR_CLASSES, type BehaviorClass } from '../src/lib/ideaGraph/schema.ts';
import { fillTable } from '../src/lib/ideaGraph/report.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const [command = 'validate', arg] = process.argv.slice(2);

const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

function killedFingerprints(): string[][] {
  return readAntiLibrary(root)
    .filter((e) => !e.fingerprint.includes('.')) // hosts live in the unciteable table
    .map((e) => e.fingerprint.split('+').map((t) => t.trim()));
}

function validate(): number {
  const { graph, violations } = validateGraph(root);
  if (violations.length > 0) {
    console.error(bold(red(`\n✗ idea graph — ${violations.length} violation(s)\n`)));
    for (const v of violations) console.error(`  ${bold(v.file)}\n    ${v.message}\n`);
    return 1;
  }
  const counts = new Map<string, number>();
  for (const n of graph.nodes) counts.set(n.type, (counts.get(n.type) ?? 0) + 1);
  const summary = [...counts].map(([t, n]) => `${n} ${t}`).join(' · ');
  console.log(green(`✓ idea graph — ${graph.nodes.length} nodes (${summary}), 0 violations`));
  return 0;
}

function next(): number {
  const { graph, violations } = validateGraph(root);
  if (violations.length > 0) {
    console.error(red('✗ graph does not validate — fix that first (npm run idea:validate)'));
    return 1;
  }
  const candidates = toCandidates(graph);
  const history = readEmittedHistory(root, graph);
  const { emit, refusals, unvisitedCells, uncoveredCells } = selectNext(candidates, history, killedFingerprints());

  console.log(bold('\nIdea Loop — next row\n'));
  console.log(dim(`  ${candidates.length} hypotheses · ${history.length} already emitted · ` +
    `${uncoveredCells.length}/${allCells().length} cells uncovered · ` +
    `${unvisitedCells.length} never emitted\n`));

  if (!emit) {
    console.log(red('  nothing to emit.'));
    for (const r of refusals) console.log(`    ${r.id} refused by ${bold(r.rule)} — ${r.because}`);
    console.log(
      dim(
        '\n  An empty result is a legitimate outcome, not a bug. Two consecutive harvests ' +
          'at zero means the source region is mined out — stop, do not refill.\n'
      )
    );
    return 0;
  }

  console.log(`  ${bold(emit.id)} — ${emit.title}`);
  console.log(
    `  cell ${bold(cellKey(emit.behaviorClass, emit.moveClass, emit.costClass))} · score ${scoreOf(emit)} · ` +
      `evidence ${emit.evidence} · preconditions ${emit.preconditionsHold ? 'hold' : 'do not hold'}`
  );
  console.log(bold('\n  Paste into docs/GRAPH_LOOP.md as the top open row:\n'));
  console.log(
    `  | **IL-${emit.id}** | ${emit.title} | ` +
      `docs/mechanics/hypotheses/ — instrument and kill criterion on the node | \`open\` |\n`
  );

  if (refusals.length > 0) {
    console.log(dim('  Refused this round:'));
    for (const r of refusals) console.log(dim(`    ${r.id} — ${r.rule}: ${r.because}`));
  }
  // Uncovered, not unvisited. The first harvest was aimed at the wrong one of
  // these two and would have re-covered three cells that already held candidates.
  console.log(dim(`\n  Uncovered cells (aim the next harvest here): ${uncoveredCells.slice(0, 8).join(', ')}…\n`));
  return 0;
}

function pack(): number {
  const cls = arg as BehaviorClass;
  if (!BEHAVIOR_CLASSES.includes(cls)) {
    console.error(red(`usage: idea:pack <${BEHAVIOR_CLASSES.join('|')}>`));
    return 1;
  }
  const { graph, violations } = validateGraph(root);
  if (violations.length > 0) {
    console.error(red('✗ graph does not validate — fix that first'));
    return 1;
  }
  const p = buildPack(root, graph, cls);
  console.log(p.text);
  console.error(
    dim(`\n[${p.bytes} bytes of ${MAX_PACK_BYTES} · ${p.included.length} nodes]`) +
      (p.overBudget ? red(' OVER BUDGET — split a node or narrow the axis') : '')
  );
  return p.overBudget ? 1 : 0;
}


function cells(): number {
  const { graph } = validateGraph(root);
  console.log(fillTable(toCandidates(graph)));
  return 0;
}

const commands: Record<string, () => number> = { validate, next, pack, cells };
const run = commands[command];
if (!run) {
  console.error(red(`unknown command \`${command}\` — one of ${Object.keys(commands).join(', ')}`));
  process.exit(1);
}
process.exit(run());
