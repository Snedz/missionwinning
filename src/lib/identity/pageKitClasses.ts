/**
 * Map a C6 page kit to layout class names the Athlete Page may wear.
 *
 * Only returns known classes from our stylesheet — never injects free CSS,
 * hex, or user strings into `style=`. That is how C6 stays enforceable when
 * composition actually changes the page.
 */

import {
  pageKitById,
  type PageKit,
  type PageKitComposition,
} from '../../../packages/mw-core/src/identity/pageKits';

const COMPOSITION_CLASS: Record<PageKitComposition, string> = {
  stack: 'athlete-page-kit athlete-page-kit--stack',
  field: 'athlete-page-kit athlete-page-kit--field',
  poster: 'athlete-page-kit athlete-page-kit--poster',
  ledger: 'athlete-page-kit athlete-page-kit--ledger',
};

const ACCENT_CLASS: Record<string, string> = {
  primary: 'athlete-page-kit-accent--primary',
  'accent-poster': 'athlete-page-kit-accent--poster',
  ink: 'athlete-page-kit-accent--ink',
  paper: 'athlete-page-kit-accent--primary',
  muted: 'athlete-page-kit-accent--primary',
  border: 'athlete-page-kit-accent--primary',
  card: 'athlete-page-kit-accent--primary',
  'primary-fill': 'athlete-page-kit-accent--primary',
};

export function pageKitLayoutClass(kit: PageKit | string | null | undefined): string {
  const resolved = typeof kit === 'string' || kit == null ? pageKitById(kit ?? 'default') : kit;
  if (!resolved) return COMPOSITION_CLASS.stack;
  const base = COMPOSITION_CLASS[resolved.composition] ?? COMPOSITION_CLASS.stack;
  const accent = ACCENT_CLASS[resolved.accent] ?? ACCENT_CLASS.primary;
  return `${base} ${accent}`;
}
