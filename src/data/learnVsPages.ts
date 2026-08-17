/**
 * Public Learn vs-pages — unpublished.
 *
 * Named compare copy lives in ops/intel/seo/ until a founder GTM exception.
 * Routes `/guide/mission-winning-vs-*` redirect to /welcome.
 */

import type { GuideChecklist, GuideTable } from '@/data/guidebook/types';

export const LEARN_VS_PAGE_IDS = [] as const;

export type LearnVsPageId = (typeof LEARN_VS_PAGE_IDS)[number];

export const LEARN_VS_CSV_CELL =
  'Import of a workout CSV is live. Export of the two common gym-logger layouts is live. JSON device backup is live.';

export type LearnVsSection = {
  id: string;
  title: string;
  summary: string;
  body: string;
  table?: GuideTable;
  callout?: { title: string; body: string };
  checklist?: GuideChecklist;
};

export type LearnVsPage = {
  id: string;
  title: string;
  subtitle: string;
  lead: string;
  sections: LearnVsSection[];
};

export const LEARN_VS_PAGES: LearnVsPage[] = [];

export function learnVsPublicHref(id: string): string {
  return `/guide/${id}`;
}

export function getLearnVsPage(id: string): LearnVsPage | null {
  return LEARN_VS_PAGES.find((p) => p.id === id) ?? null;
}

export function requireLearnVsPage(id: string): LearnVsPage {
  const page = getLearnVsPage(id);
  if (!page) {
    throw new Error(`learn vs-page unpublished: ${id}`);
  }
  return page;
}
