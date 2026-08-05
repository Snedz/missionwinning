/**
 * Which Today blocks mount, in declaration order — without React nodes.
 *
 * `HomeTodayDashboard` used to encode the if-ladder next to JSX. That made
 * densest-evening order untestable without mounting the shell. Specs here;
 * nodes stay in the page. Priorities always come from `TODAY_BLOCK_PRIORITY`.
 *
 * Does **not** include `more` — that is the overflow container and is appended
 * after `planTodayBlocks` (counting it against the budget it enforces is circular).
 */

import type { JourneyPhase } from '@/lib/missionJourney';
import {
  dayReviewMayMount,
} from '@/lib/today/dayReviewMount';
import {
  firstStepsMayMount,
  reentryCardMayMount,
} from '@/lib/today/todayGuidanceMount';
import { todayCoachInviteMayMount } from '@/lib/today/todayCoachInviteMount';
import {
  TODAY_BLOCK_PRIORITY,
  type TodayBlockKey,
} from '@/lib/today/todayBlockPriority';

export type TodayCandidateSpec = {
  key: TodayBlockKey;
  priority: number;
  pinned?: boolean;
};

export type BuildTodayCandidatesInput = {
  phase: JourneyPhase;
  /** First Steps dismissed (or never offered). */
  firstStepsDismissed: boolean;
  /** Soft re-entry card wants to show. */
  reentryShow: boolean;
  /** From `getTodayLayout(phase).showDashboard`. */
  showDashboard: boolean;
  /** Idle / below-fold gate — secondary surfaces wait for this. */
  belowFoldReady: boolean;
  totalSessions: number;
  streak: number;
  /** Local hour 0–23 for day-review. */
  hour: number;
  weekRecap: { hasActivity: boolean; isWeekEnd: boolean } | null;
};

const P = TODAY_BLOCK_PRIORITY;

/**
 * Ordered candidate specs for the dashboard Today shell.
 * Declaration order matches what athletes read top→bottom; priority decides spill.
 */
export function buildTodayCandidates(input: BuildTodayCandidatesInput): TodayCandidateSpec[] {
  const out: TodayCandidateSpec[] = [];

  if (firstStepsMayMount({ phase: input.phase, dismissed: input.firstStepsDismissed })) {
    out.push({ key: 'beta', priority: P.beta, pinned: true });
  }

  out.push({ key: 'header', priority: P.header, pinned: true });

  if (input.phase === 'commissioned') {
    out.push({ key: 'intent', priority: P.intent });
  }

  if (reentryCardMayMount({ phase: input.phase, show: input.reentryShow })) {
    out.push({ key: 'reentry', priority: P.reentry, pinned: true });
  }

  if (input.showDashboard) {
    out.push({ key: 'dashboard', priority: P.dashboard });
    out.push({ key: 'freshness', priority: P.freshness });
  }

  if (
    input.belowFoldReady &&
    todayCoachInviteMayMount({ phase: input.phase, totalSessions: input.totalSessions })
  ) {
    out.push({ key: 'coach-invite', priority: P['coach-invite'] });
  }

  if (input.belowFoldReady && dayReviewMayMount({ hour: input.hour, phase: input.phase })) {
    out.push({ key: 'day-review', priority: P['day-review'] });
  }

  if (
    input.belowFoldReady &&
    input.weekRecap &&
    (input.weekRecap.hasActivity || input.weekRecap.isWeekEnd)
  ) {
    out.push({ key: 'week-recap', priority: P['week-recap'] });
  }

  if (input.belowFoldReady && (input.phase === 'readiness' || input.phase === 'commissioned')) {
    out.push({ key: 'coach-week', priority: P['coach-week'] });
  }

  if (input.belowFoldReady && input.phase === 'commissioned') {
    out.push({ key: 'coach-today', priority: P['coach-today'] });
  }

  if (input.belowFoldReady && (input.phase === 'readiness' || input.phase === 'commissioned')) {
    out.push({ key: 'guidebook', priority: P.guidebook });
  }

  if (!input.showDashboard && input.phase === 'basic' && input.streak === 0) {
    out.push({ key: 'encourage', priority: P.encourage });
  }

  return out;
}
