/**
 * Last working-set ghost for the Train logger (.738).
 *
 * Last time this exercise was actually *worked* — not warmup W, not a
 * tombstone, not an invented number. The dial prefills these numbers (F-013 /
 * `.946`). One tap accepts weight × reps when the dial has diverged (same
 * patch path as Use next). First-ever is null: the empty row still logs.
 *
 * Optional tempo / RPE 1–10 / RIR / side are *displayed* when the last working
 * set object already carries them. This module does not mint those fields.
 *
 * Does not rewrite set-input resolution, last-rest, or repeat-last session.
 */
import type { CompletedWorkoutLog } from '@/types';
import { parseOptionalRpe10 } from '@/lib/workout/rpe10';
import { parseOptionalRir } from '@/lib/workout/rir';
import { workingSets } from '@/lib/workout/setMath';

export type LastSetGhost = {
  reps: number;
  weight: number;
  tempo?: string;
  rir?: number;
  rpe10?: number;
  side?: string;
};

type GhostSourceSet = {
  reps: number;
  weight: number;
  kind?: string;
  tempo?: unknown;
  rir?: unknown;
  rpe10?: unknown;
  side?: unknown;
};

function pickOptionalExtras(set: GhostSourceSet): Pick<LastSetGhost, 'tempo' | 'rir' | 'rpe10' | 'side'> {
  const extras: Pick<LastSetGhost, 'tempo' | 'rir' | 'rpe10' | 'side'> = {};
  if (typeof set.tempo === 'string') {
    const tempo = set.tempo.trim();
    if (tempo) extras.tempo = tempo;
  }
  const rir = parseOptionalRir(set.rir);
  if (rir !== undefined) extras.rir = rir;
  const rpe10 = parseOptionalRpe10(set.rpe10);
  if (rpe10 !== undefined) extras.rpe10 = rpe10;
  if (typeof set.side === 'string') {
    const side = set.side.trim();
    if (side) extras.side = side;
  }
  return extras;
}

/**
 * Newest live session that has a working set for this exercise → that
 * exercise's last working set. Warmup-only sessions are skipped.
 */
export function resolveLastSetGhost(
  history: CompletedWorkoutLog[],
  exerciseId: string
): LastSetGhost | null {
  if (!exerciseId) return null;
  for (const log of history) {
    if (log.deletedAt) continue;
    const ex = log.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex || ex.sets.length === 0) continue;
    const work = workingSets(ex.sets as GhostSourceSet[]).filter((s) => s.reps > 0);
    if (work.length === 0) continue;
    const last = work[work.length - 1];
    return {
      reps: last.reps,
      weight: last.weight,
      ...pickOptionalExtras(last),
    };
  }
  return null;
}

/** Offer the ghost only when there is one and the dial does not already hold it. */
export function shouldOfferLastSetGhost(
  ghost: LastSetGhost | null | undefined,
  dial: { reps: number; weight: number }
): boolean {
  if (!ghost) return false;
  return ghost.reps !== dial.reps || ghost.weight !== dial.weight;
}

/** Notation suffix (tempo · RPE · RIR · side) — empty when none of those fields exist. */
export function formatLastSetGhostExtras(ghost: LastSetGhost): string {
  const parts: string[] = [];
  if (ghost.tempo) parts.push(ghost.tempo);
  if (ghost.rpe10 != null) parts.push(`RPE ${ghost.rpe10}`);
  if (ghost.rir != null) parts.push(`RIR ${ghost.rir}`);
  if (ghost.side) parts.push(ghost.side);
  return parts.length ? ` · ${parts.join(' · ')}` : '';
}
