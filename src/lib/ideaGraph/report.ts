/**
 * Views over the archive that a human reads.
 *
 * Separate from `scripts/idea-graph.ts` because that file ends in
 * `process.exit(run())` — importing it from a guard would run the CLI. A
 * function a test needs to call does not live behind a side effect.
 */

import { BEHAVIOR_CLASSES, MOVE_CLASSES } from './schema.ts';
import type { Candidate } from './select.ts';

/**
 * The archive as a grid: which cells hold what.
 *
 * Printed by `npm run idea:cells` and checked against
 * `docs/mechanics/INDEX.md` by a guard — the canonical-script-paired-with-a-
 * high-water-test shape `GAUNTLET_LOOP` §3 already names for a new ratchet.
 *
 * The command deliberately does **not** write the doc. A command that edits a
 * document as a side effect of being run is how the document stops being read
 * by the person it was written for.
 */
export function fillTable(candidates: readonly Candidate[]): string {
  const at = (b: string, m: string) =>
    candidates
      .filter((c) => c.behaviorClass === b && c.moveClass === m)
      .map((c) => (c.status === 'candidate' ? c.id : `${c.id} ${c.status}`))
      .join(' · ') || '—';

  return [
    `| | ${BEHAVIOR_CLASSES.join(' | ')} |`,
    `|---|${BEHAVIOR_CLASSES.map(() => '---').join('|')}|`,
    ...MOVE_CLASSES.map((m) => `| **${m}** | ${BEHAVIOR_CLASSES.map((b) => at(b, m)).join(' | ')} |`),
  ].join('\n');
}
