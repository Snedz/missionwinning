/**
 * One Highlights sentence on Summary. Honest empty when there is nothing to say.
 * Wallpaper facts are how Today became a tour.
 */

export type HighlightsSentence = {
  key: 'todayHighlightsTrained' | 'todayHighlightsLast';
  sessionName?: string;
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
