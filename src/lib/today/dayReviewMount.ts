/**
 * Who sees the evening card — one decision, in one place.
 *
 * `.192` shipped the Day in Review into `HomeTodayDashboard` only, and
 * `HomePage` routes phases `i-day` and `basic` to `HomeTodayLean` — which
 * defaults from `phase ?? 'basic'`. So the card, the behavior impacts row it
 * carries and the push opt-in nested inside it reached **zero new athletes**.
 * That is the `.176`/`.184` defect class again: built, shipped, unreachable.
 *
 * A condition duplicated per shell is a condition that drifts per shell, so
 * both shells ask this function instead.
 *
 * It also carries the **hour** gate. That test used to live inside the card's
 * own effect, which meant the browser downloaded `dayReview`, `sleepConsistency`,
 * `behaviorImpacts`, `behaviors`, `coach/load`, the opt-in and `pushClient` at
 * 09:00 in order to render `null`. Deciding at the mount site instead means the
 * chunk is never fetched before the evening.
 *
 * `i-day` is excluded deliberately: an athlete still in in-processing has no day
 * to review, and the first run is the one screen that must stay bare. Every
 * other phase is included — the card already refuses itself when there is
 * nothing true to say (`composeDayReview` returns null), so "should it appear"
 * is answered by the content, not by a phase the athlete cannot see.
 */

import type { JourneyPhase } from '@/lib/missionJourney';
import { DAY_REVIEW_START_HOUR } from '@/lib/dayReview';

export interface DayReviewMountInput {
  /** Local hour, 0–23. */
  hour: number;
  phase: JourneyPhase;
}

export function dayReviewMayMount({ hour, phase }: DayReviewMountInput): boolean {
  if (phase === 'i-day') return false;
  return hour >= DAY_REVIEW_START_HOUR;
}
