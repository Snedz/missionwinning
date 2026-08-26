/**
 * This session as a file they own (`.1016`).
 *
 * File out of one finished History log. Reuses `decideExportDiary`
 * columns. Empty / missing / tomb invents nothing. Not a share.
 * Pure: no store.
 */

import type { CompletedWorkoutLog } from '@/types';
import { findFinishedSession } from '@/lib/workout/deleteFinishedSession';
import { decideExportDiary, type ExportDiaryDecision } from '@/lib/history/exportDiary';

export type { ExportDiaryDecision };

export function decideExportSession(input: {
  sessionId?: unknown;
  history?: readonly CompletedWorkoutLog[] | null;
}): ExportDiaryDecision {
  const found = findFinishedSession(input.history, input.sessionId);
  if (!found) return { kind: 'empty' };
  return decideExportDiary([found]);
}

export function exportSessionFileName(
  decision: ExportDiaryDecision,
  ext: 'csv' | 'json'
): string {
  if (decision.kind !== 'ready') return `mission-winning-session.${ext}`;
  const date = decision.rows[0]?.date;
  if (!date) return `mission-winning-session.${ext}`;
  return `mission-winning-session-${date}.${ext}`;
}
