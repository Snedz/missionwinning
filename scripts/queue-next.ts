/**
 * `npm run graph` (`queue:next` is the same command)
 *
 * The graph loop's entry point. It reads `docs/GRAPH_LOOP.md`, names the live
 * ticket, and says which of the three protocols runs — build (recipe 11),
 * gauntlet (recipe 12) or harvest (recipe 13).
 *
 * It **prints**. It never edits `docs/GRAPH_LOOP.md`, for the same reason
 * `idea:next` does not: that file is the baton, and the baton is handed over by
 * a human or by the spawn taking the loop, not as a side effect of running a
 * command that was supposed to answer a question.
 *
 * Exit codes are about the *file*, not about the route. A queue with no open row
 * is a legitimate state that routes to a harvest, and exits 0. Only a queue the
 * parser could not read exits 1 — that is a defect in the file, and the loop
 * should stop rather than guess which row was meant.
 */

import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseQueue } from '../src/lib/loopQueue/parse.ts';
import { MAX_SINGLE_ROW_RUN, route } from '../src/lib/loopQueue/route.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const QUEUE = 'docs/GRAPH_LOOP.md';

const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

const field = (label: string, value: string) => `  ${dim(label.padEnd(13))}${value}`;

/** One line each, so a spawn can be told where to read rather than what to think. */
const RECIPE: Record<number, string> = {
  11: 'docs/AGENT_RECIPES.md §11 — one concern, one PR, close the row after merge',
  12: 'docs/AGENT_RECIPES.md §12 — one unit-round; the campaign row stays `open`',
  13: 'docs/AGENT_RECIPES.md §13 — harvest; emits exactly one `IL-` row, and you paste it',
};

function run(): number {
  let src: string;
  try {
    src = readFileSync(path.join(root, QUEUE), 'utf8');
  } catch {
    console.error(red(`✗ cannot read ${QUEUE} — is this the Mission Winning repo?`));
    return 1;
  }

  const queue = parseQueue(src, QUEUE);
  if (queue.problems.length > 0) {
    console.error(bold(red(`\n✗ ${QUEUE} — ${queue.problems.length} problem(s); the live ticket is not decidable\n`)));
    for (const p of queue.problems) console.error(`  ${p}`);
    console.error('');
    return 1;
  }

  const r = route(root, queue);

  console.log(bold('\nGraph loop — next spawn\n'));
  console.log(
    dim(`  ${queue.rows.length} rows · ${queue.sections.filter((s) => s.kind === 'now').length} Now sections\n`)
  );

  if (r.row) {
    console.log(field('live ticket', `${bold(r.row.id)} — ${r.row.loop}`));
    console.log(field('', dim(`${QUEUE}:${r.row.line} · ${r.row.section}`)));
  } else {
    console.log(field('live ticket', dim('none — no agent-open row in any `### Now` section')));
  }

  console.log(field('route', r.recipe ? `${bold(r.kind)} · recipe ${r.recipe}` : bold(r.kind)));
  if (r.recipe) console.log(field('', dim(RECIPE[r.recipe])));

  if (r.workbench) {
    console.log(field('workbench', r.workbench.file));
    const spawn = [r.workbench.role, r.workbench.unit, r.workbench.round].filter(Boolean).join(' ');
    console.log(field('next spawn', spawn || dim('unresolved — read the workbench Next spawn line')));
    if (r.workbench.cap) {
      console.log(field('budget', `${r.workbench.cap.spent} of ≤${r.workbench.cap.cap} build PRs spent`));
    }
  }

  for (const row of r.skipped) {
    console.log(field('skipped', yellow(`${row.id} is \`${row.status}\` — ${QUEUE}:${row.line}`)));
  }

  console.log(
    field(
      'monoculture',
      `${r.singleRowRun}/${MAX_SINGLE_ROW_RUN} consecutive one-row Now sections` +
        (r.atRatchet ? yellow(' — at the ratchet') : '')
    )
  );

  for (const note of r.notes) console.log(`\n  ${yellow('•')} ${note}`);

  console.log(
    dim(
      '\n  Boot before acting: CONTEXT.md → AGENTS.md → INDEX.md → ORCHESTRATION.md → ' +
        `${QUEUE} (§ Copy-paste prompt, BANS verbatim) → the folder INDEX.md you will edit.\n` +
        '  This command does not edit the queue. Marking a row `done` is the baton.\n'
    )
  );

  return 0;
}

process.exit(run());
