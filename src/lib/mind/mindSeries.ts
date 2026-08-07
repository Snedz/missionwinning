/**
 * Named Mind series — ordered session ids for multi-day protocols.
 * Pure data; UI filters via series tags on sessions + collection rail.
 */

export type MindSeriesDef = {
  id: string;
  titleKey: string;
  titleDefault: string;
  /** Tag shared by every session in the series */
  tag: string;
  /** Collection id on Mind page rail */
  collectionId: 'sleep-week';
  /** Ordered premium (or free) session ids */
  sessionIds: string[];
};

export const MIND_SERIES: MindSeriesDef[] = [
  {
    id: 'sleep-week',
    titleKey: 'mindSeriesSleepWeek',
    titleDefault: 'Sleep week (series)',
    tag: 'series-sleep-week',
    collectionId: 'sleep-week',
    sessionIds: ['sleep-week-night-1', 'sleep-week-night-2', 'sleep-week-night-3'],
  },
];

export function mindSeriesByCollectionId(
  collectionId: string
): MindSeriesDef | undefined {
  return MIND_SERIES.find((s) => s.collectionId === collectionId);
}

/** Order sessions to match series order when filtering a series collection. */
export function orderSessionsForSeries<T extends { id: string }>(
  sessions: T[],
  series: MindSeriesDef
): T[] {
  const byId = new Map(sessions.map((s) => [s.id, s]));
  const ordered: T[] = [];
  for (const id of series.sessionIds) {
    const s = byId.get(id);
    if (s) ordered.push(s);
  }
  // Append any extra tagged sessions not in the ordered list
  for (const s of sessions) {
    if (!series.sessionIds.includes(s.id)) ordered.push(s);
  }
  return ordered;
}
