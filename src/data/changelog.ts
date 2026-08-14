/**
 * Athlete-facing changelog. Newest first.
 * Internal engineering history stays in LOG.md.
 */

export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  lead: string;
  bullets: string[];
};

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: "0.1.0",
    date: "2026-08-14",
    title: "Mission Winning 0.1.0",
    lead: "Open Alpha. Invite gate. The logger stays free and works without an account.",
    bullets: [
      "Log a set from the gate — no account, no strap, no card.",
      "Finish I-Day and land in Train while the gate is up. Today and Coach stay behind the cookie.",
      "The set row remembers last weight, counts plates, times rest, and shows vs last session.",
      "The Done access code works on Preview the same way it works on production.",
      "The week still refuses a readiness number until you have two weeks of logs.",
    ],
  },
];

export function latestChangelogEntry(): ChangelogEntry {
  const first = CHANGELOG_ENTRIES[0];
  if (!first) throw new Error("CHANGELOG_ENTRIES is empty");
  return first;
}

/** August 14, 2026 — xAI changelog date line. */
export function formatChangelogDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
