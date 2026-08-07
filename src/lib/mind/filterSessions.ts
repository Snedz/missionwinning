/**
 * Mind collections + filters — pure (Super Bundle depth).
 */

import type { GuidedMindSession } from '@/data/guidedMindSessions';

export type MindCollectionId =
  | 'all'
  | 'pre-lift'
  | 'post-train'
  | 'sleep'
  | 'stress'
  | 'focus'
  | 'travel';

export type MindCollectionDef = {
  id: MindCollectionId;
  titleKey: string;
  titleDefault: string;
  tags: string[];
};

export const MIND_COLLECTIONS: MindCollectionDef[] = [
  { id: 'all', titleKey: 'mindCollectionAll', titleDefault: 'All sessions', tags: [] },
  { id: 'pre-lift', titleKey: 'mindCollectionPre', titleDefault: 'Pre-session', tags: ['pre-lift', 'focus'] },
  { id: 'post-train', titleKey: 'mindCollectionPost', titleDefault: 'After training', tags: ['post-train', 'recovery'] },
  { id: 'sleep', titleKey: 'mindCollectionSleep', titleDefault: 'Sleep', tags: ['sleep'] },
  { id: 'stress', titleKey: 'mindCollectionStress', titleDefault: 'Stress reset', tags: ['stress', 'anxiety'] },
  { id: 'focus', titleKey: 'mindCollectionFocus', titleDefault: 'Focus', tags: ['focus'] },
  { id: 'travel', titleKey: 'mindCollectionTravel', titleDefault: 'Travel / hotel', tags: ['travel'] },
];

export function mindMatchesCollection(
  session: GuidedMindSession,
  collection: MindCollectionDef
): boolean {
  if (collection.id === 'all') return true;
  const tags = session.tags ?? [];
  if (collection.tags.length === 0) return true;
  if (tags.length === 0) {
    const hay = `${session.title} ${session.subtitle}`.toLowerCase();
    return collection.tags.some((t) => hay.includes(t.replace(/-/g, ' ')) || hay.includes(t));
  }
  return collection.tags.some((t) => tags.includes(t));
}

export function filterMindByCollection(
  sessions: GuidedMindSession[],
  collectionId: MindCollectionId
): GuidedMindSession[] {
  const def = MIND_COLLECTIONS.find((c) => c.id === collectionId) ?? MIND_COLLECTIONS[0];
  return sessions.filter((s) => mindMatchesCollection(s, def));
}

/** Hydrate Mind page from ?collection= deep links (ContinuityStrip). */
export function parseMindCollectionParam(
  raw: string | null | undefined
): MindCollectionId {
  if (!raw) return 'all';
  const id = raw.trim() as MindCollectionId;
  return MIND_COLLECTIONS.some((c) => c.id === id) ? id : 'all';
}
