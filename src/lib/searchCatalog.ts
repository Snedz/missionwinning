/**
 * Search is a field over existing rooms — not a new pillar.
 * Query empty → caller shows tiers. Query set → these matches.
 */

import type { SummaryPinId } from '@/lib/today/summaryPins';

export type CatalogItem = {
  href: string;
  label: string;
};

export function filterSearchCatalog(
  items: readonly CatalogItem[],
  query: string
): CatalogItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...items];
  return items.filter(
    (item) =>
      item.label.toLowerCase().includes(q) || item.href.toLowerCase().includes(q)
  );
}

export function summaryPinIdForHref(href: string): SummaryPinId | null {
  if (href === '/nutrition') return 'fuel';
  if (href === '/coach') return 'coach';
  if (href === '/active') return 'session';
  return null;
}
