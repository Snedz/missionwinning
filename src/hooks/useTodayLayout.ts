/**
 * Which Today sections show per journey phase.
 * Consumers: HomePage | See: docs/JOURNEY.md
 */
import type { JourneyPhase } from '@/lib/missionJourney';

export interface TodayLayoutFlags {
  /** Mission Score + header metrics */
  showDashboard: boolean;
  /** Readiness / Strain / Recovery rings (below hero) */
  showMetricRings: boolean;
  /** Leaderboard quick-link cards */
  showQuickLinks: boolean;
  /** Collapsible Health / Week / Progress sections */
  showDetailsAccordion: boolean;
  /** Recommended focus line under date */
  showFocusLine: boolean;
}

/** Single disclosure axis: journey phase only (no Simple/Pro). */
export function getTodayLayout(phase: JourneyPhase): TodayLayoutFlags {
  switch (phase) {
    case 'i-day':
      return {
        showDashboard: false,
        showMetricRings: false,
        showQuickLinks: false,
        showDetailsAccordion: false,
        showFocusLine: false,
      };
    case 'basic':
      return {
        showDashboard: false,
        showMetricRings: false,
        showQuickLinks: true,
        showDetailsAccordion: false,
        showFocusLine: false,
      };
    case 'readiness':
      return {
        showDashboard: true,
        showMetricRings: true,
        showQuickLinks: true,
        showDetailsAccordion: true,
        showFocusLine: true,
      };
    case 'commissioned':
      return {
        showDashboard: true,
        showMetricRings: true,
        showQuickLinks: true,
        showDetailsAccordion: true,
        showFocusLine: true,
      };
  }
}
