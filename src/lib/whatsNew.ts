/**
 * What’s New — thin trust surface keyed off the deploy build label.
 *
 * D13. Athlete-facing bullets are **hand-authored constants** here. Never scrape
 * `LOG.md` into the product UI (DESIGN_ORCHESTRATION wave D13 refuse list).
 *
 * Last-seen label lives in safeStorage so Safari private mode cannot blank a
 * page on a bare `localStorage` call.
 */

import { APP_BUILD_LABEL } from '@/lib/buildInfo';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';

export const WHATS_NEW_SEEN_KEY = STORAGE_KEYS.whatsNewSeenLabel;

/** One curated note — titles/bodies resolve through i18n keys at render time. */
export type WhatsNewBullet = {
  id: string;
  titleKey: string;
  titleDefault: string;
  bodyKey: string;
  bodyDefault: string;
};

/**
 * Curated for the current craft window. Replace the list when the athlete-facing
 * story of a ship changes — do not auto-derive from commit subjects or LOG.
 */
export const WHATS_NEW_BULLETS: readonly WhatsNewBullet[] = [
  {
    id: 'history-exercises',
    titleKey: 'whatsNewBulletHistoryTitle',
    titleDefault: 'Exercises in History',
    bodyKey: 'whatsNewBulletHistoryBody',
    bodyDefault:
      'Open History → Exercises for lift trends without digging through session lists.',
  },
  {
    id: 'coach-manage',
    titleKey: 'whatsNewBulletCoachTitle',
    titleDefault: 'Manage your week from Coach',
    bodyKey: 'whatsNewBulletCoachBody',
    bodyDefault:
      'Adjust preferred days, regenerate the week, or ask the coach — one sheet on the plan screen.',
  },
  {
    id: 'just-go-honesty',
    titleKey: 'whatsNewBulletJustGoTitle',
    titleDefault: 'Coach days say the session name',
    bodyKey: 'whatsNewBulletJustGoBody',
    bodyDefault:
      'When Mission Coach has today’s session, Start names it. Freestyle still says Just Go.',
  },
  {
    id: 'faq-first-steps',
    titleKey: 'whatsNewBulletTrustTitle',
    titleDefault: 'Straight answers, first steps again',
    bodyKey: 'whatsNewBulletTrustBody',
    bodyDefault:
      'Landing FAQ opens one question at a time. Under Profile you can bring First Steps back to Today.',
  },
] as const;

export function readWhatsNewSeenLabel(): string | null {
  return readRaw(WHATS_NEW_SEEN_KEY);
}

/** Persist that the athlete has seen notes for this (or a given) build label. */
export function markWhatsNewSeen(label: string = APP_BUILD_LABEL): void {
  writeRaw(WHATS_NEW_SEEN_KEY, label);
}

/**
 * True when the device has never recorded this build label.
 * SSR / unread storage → false (no flash of “new” before hydrate).
 */
export function isWhatsNewUnseen(label: string = APP_BUILD_LABEL): boolean {
  const seen = readWhatsNewSeenLabel();
  if (seen === null) return true;
  return seen !== label;
}
