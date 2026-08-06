/**
 * "How was <session>?" — when Today may invite words onto the latest entry.
 *
 * Every session already gets a journal entry at completion (machine debrief +
 * whatever the athlete typed during the workout), and `JournalTimeline` can
 * edit `fragments` after the fact — but nothing ever invites the athlete back.
 * The Apple Journal moment this borrows is the *morning after*, so the window
 * is 48h: a Saturday-evening session still prompts on Monday morning, while
 * the card can never become furniture.
 *
 * Anti-nag is structural, not stored: the prompt retires when words exist or
 * the window passes, so there is no dismissal key to sweep. Only the latest
 * entry is consulted — a newer session supersedes an older unanswered one
 * rather than stacking prompts.
 */

export const REFLECT_WINDOW_HOURS = 48;

export interface ReflectCandidate {
  savedAt: string;
  workoutName: string;
  /** The athlete's own words — any present means the invitation is answered. */
  fragments?: string[];
}

export function journalReflectMayMount(
  latest: ReflectCandidate | null,
  now: Date = new Date()
): boolean {
  if (!latest) return false;
  if (latest.fragments && latest.fragments.length > 0) return false;
  const saved = new Date(latest.savedAt).getTime();
  if (!Number.isFinite(saved)) return false;
  const age = now.getTime() - saved;
  // A savedAt in the future is clock skew, not a session to reflect on.
  if (age < 0) return false;
  return age <= REFLECT_WINDOW_HOURS * 3_600_000;
}
