/**
 * Move collections + filters — pure (Super Bundle depth plan).
 */

import type { MobilityFlow } from '@/data/mobilityFlows';

export type MoveCollectionId =
  | 'all'
  | 'recover-after-lower'
  | 'desk-athlete'
  | 'pre-session'
  | 'travel-hotel'
  | 'yoga-lite'
  | 'shoulders'
  | 'long-form';

export type MoveCollectionDef = {
  id: MoveCollectionId;
  /** i18n key */
  titleKey: string;
  titleDefault: string;
  /** Match if flow.tags intersects any of these (empty tags never match non-all). */
  tags: string[];
  /** Prefer durationMin >= this when set */
  minMinutes?: number;
};

export const MOVE_COLLECTIONS: MoveCollectionDef[] = [
  {
    id: 'all',
    titleKey: 'moveCollectionAll',
    titleDefault: 'All flows',
    tags: [],
  },
  {
    id: 'recover-after-lower',
    titleKey: 'moveCollectionPostLegs',
    titleDefault: 'After lower body',
    tags: ['post-legs', 'hips', 'recovery'],
  },
  {
    id: 'desk-athlete',
    titleKey: 'moveCollectionDesk',
    titleDefault: 'Desk athlete',
    tags: ['desk', 'thoracic', 'neck'],
  },
  {
    id: 'pre-session',
    titleKey: 'moveCollectionPre',
    titleDefault: 'Pre-session prime',
    tags: ['pre-lift', 'primer', 'ankles'],
  },
  {
    id: 'travel-hotel',
    titleKey: 'moveCollectionTravel',
    titleDefault: 'Travel / hotel',
    tags: ['travel', 'no-equipment'],
  },
  {
    id: 'yoga-lite',
    titleKey: 'moveCollectionYoga',
    titleDefault: 'Yoga-lite mobility',
    tags: ['yoga-lite'],
  },
  {
    id: 'shoulders',
    titleKey: 'moveCollectionShoulders',
    titleDefault: 'Shoulders & T-spine',
    tags: ['shoulders', 'thoracic'],
  },
  {
    id: 'long-form',
    titleKey: 'moveCollectionLong',
    titleDefault: '15+ min deep',
    tags: ['long'],
    minMinutes: 15,
  },
];

export function flowMatchesCollection(
  flow: MobilityFlow,
  collection: MoveCollectionDef
): boolean {
  if (collection.id === 'all') return true;
  if (collection.minMinutes != null && flow.durationMin < collection.minMinutes) {
    return false;
  }
  const tags = flow.tags ?? [];
  if (collection.tags.length === 0) return true;
  if (tags.length === 0) {
    // Fallback: keyword match on focus/name for untagged legacy flows
    const hay = `${flow.name} ${flow.focus}`.toLowerCase();
    return collection.tags.some((t) => hay.includes(t.replace(/-/g, ' ')) || hay.includes(t));
  }
  return collection.tags.some((t) => tags.includes(t));
}

export function filterFlowsByCollection(
  flows: MobilityFlow[],
  collectionId: MoveCollectionId
): MobilityFlow[] {
  const def = MOVE_COLLECTIONS.find((c) => c.id === collectionId) ?? MOVE_COLLECTIONS[0];
  return flows.filter((f) => flowMatchesCollection(f, def));
}

/** Hydrate Move page from ?collection= deep links (ContinuityStrip). */
export function parseMoveCollectionParam(
  raw: string | null | undefined
): MoveCollectionId {
  if (!raw) return 'all';
  const id = raw.trim() as MoveCollectionId;
  return MOVE_COLLECTIONS.some((c) => c.id === id) ? id : 'all';
}

/**
 * Hydrate `/move?flow=` — only ids present in the caller-supplied catalog.
 * Victory passes free flows; unknown / premium-only ids are ignored.
 */
export function parseMoveFlowParam(
  raw: string | null | undefined,
  flows: readonly { id: string }[]
): string | null {
  if (!raw) return null;
  const id = raw.trim();
  if (!id) return null;
  return flows.some((f) => f.id === id) ? id : null;
}
