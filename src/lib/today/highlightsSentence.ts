/**
 * One Highlights sentence on Summary. Honest empty when there is nothing to say.
 * Wallpaper facts are how Today became a tour.
 */

import type { CompletedWorkoutLog } from '@/types';
import { liveSessionLogs } from '@/lib/history/liveLogs';
import { localDateKeyFromIso } from '@/lib/time/localDate';
import { countCompletedLogSets } from '@/lib/workout/completedLogSets';

export type HighlightsSentence = {
  key: 'todayHighlightsTrained' | 'todayHighlightsLast' | 'todayHighlightsTrainedSets';
  sessionName?: string;
  count?: number;
};

export function todayHighlightsSentence(input: {
  trainedToday: boolean;
  lastSessionName: string | null;
}): HighlightsSentence | null {
  if (input.trainedToday) {
    return { key: 'todayHighlightsTrained' };
  }
  const name = input.lastSessionName?.trim() || null;
  if (name) {
    return { key: 'todayHighlightsLast', sessionName: name };
  }
  return null;
}

export function todayHighlightsFromLogs(input: {
  history: readonly CompletedWorkoutLog[];
  todayKey: string;
}): HighlightsSentence | null {
  const live = liveSessionLogs(input.history);
  const todayLogs = live.filter((w) => localDateKeyFromIso(w.completedAt) === input.todayKey);
  if (todayLogs.length > 0) {
    const count = todayLogs.reduce((n, w) => n + countCompletedLogSets(w), 0);
    if (count > 0) return { key: 'todayHighlightsTrainedSets', count };
    return { key: 'todayHighlightsTrained' };
  }
  const last = [...live].sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1))[0];
  const name = last?.workoutName?.trim() || null;
  if (name) return { key: 'todayHighlightsLast', sessionName: name };
  return null;
}
