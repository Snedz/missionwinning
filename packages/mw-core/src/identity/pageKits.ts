/**
 * Page kits — curated Athlete Page compositions (IDENTITY_SOCIAL_PLAN C6 / S3).
 *
 * MySpace expression without user CSS: every kit is a named poster layout drawn
 * inside the Modernist system. Kits are **manifest entries**, not stylesheets.
 *
 * **C6:** values may only reference design tokens / composition modes. No hex,
 * no rgb(), no free CSS, no second typeface. Enforced by
 * `src/lib/identity/pageKitsContract.test.ts` (discover the manifest — do not
 * enumerate kit ids in the guard).
 *
 * S3b ships four structural kits (stack / field / poster / ledger). Difference is
 * composition + token accent only — no free CSS, no second typeface. Design can
 * later refine names and art; the clamp and C6 shape stay.
 */

import type { CardTier } from './athleteCard';

/** Known composition modes — layout structure, never free CSS. */
export const PAGE_KIT_COMPOSITIONS = ['stack', 'field', 'poster', 'ledger'] as const;
export type PageKitComposition = (typeof PAGE_KIT_COMPOSITIONS)[number];

/**
 * Token ids a kit may name. Must stay inside the product palette vocabulary
 * (paper/ink + three reds + structural greys). Not CSS variables with hex
 * payloads — those belong in `src/index.css`, not here.
 */
export const PAGE_KIT_TOKEN_IDS = [
  'paper',
  'ink',
  'muted',
  'border',
  'card',
  'primary',
  'primary-fill',
  'accent-poster',
] as const;
export type PageKitTokenId = (typeof PAGE_KIT_TOKEN_IDS)[number];

export interface PageKit {
  readonly id: string;
  readonly composition: PageKitComposition;
  readonly surface: PageKitTokenId;
  readonly accent: PageKitTokenId;
  /** Minimum card tier that may wear this kit. 1 = always. */
  readonly minTier: CardTier;
}

/**
 * The manifest. Add kits here only; UI discovers via `PAGE_KITS` / `pageKitById`.
 * Default is always present so a missing pick falls back without inventing layout.
 */
export const PAGE_KITS: readonly PageKit[] = [
  {
    id: 'default',
    composition: 'stack',
    surface: 'paper',
    accent: 'primary',
    minTier: 1,
  },
  {
    id: 'field',
    composition: 'field',
    surface: 'paper',
    accent: 'accent-poster',
    minTier: 2,
  },
  {
    id: 'ledger',
    composition: 'ledger',
    surface: 'paper',
    accent: 'ink',
    minTier: 2,
  },
  {
    id: 'poster',
    composition: 'poster',
    surface: 'card',
    accent: 'accent-poster',
    minTier: 3,
  },
] as const;

export const DEFAULT_PAGE_KIT_ID = 'default';

const TOKEN_SET = new Set<string>(PAGE_KIT_TOKEN_IDS);
const COMPOSITION_SET = new Set<string>(PAGE_KIT_COMPOSITIONS);

export function pageKitById(id: string | null | undefined): PageKit | undefined {
  if (!id) return undefined;
  return PAGE_KITS.find((k) => k.id === id);
}

export function unlockedPageKits(tier: CardTier): readonly PageKit[] {
  return PAGE_KITS.filter((k) => k.minTier <= tier);
}

/**
 * Clamp a stored kit id to something this athlete may wear.
 * Unknown or locked → default. Never invents a kit that is not in the manifest.
 */
export function resolvePageKitId(
  raw: unknown,
  tier: CardTier = 1
): string {
  if (typeof raw !== 'string' || !raw) return DEFAULT_PAGE_KIT_ID;
  const kit = pageKitById(raw);
  if (!kit) return DEFAULT_PAGE_KIT_ID;
  if (kit.minTier > tier) return DEFAULT_PAGE_KIT_ID;
  return kit.id;
}

/** Structural validators used by the C6 contract test — pure, no filesystem. */
export function isPageKitTokenId(value: string): value is PageKitTokenId {
  return TOKEN_SET.has(value);
}

export function isPageKitComposition(value: string): value is PageKitComposition {
  return COMPOSITION_SET.has(value);
}

/**
 * Shape check for one kit. Returns human-readable problems (empty = valid).
 * The contract test fails if any kit reports a problem.
 */
export function pageKitProblems(kit: PageKit): string[] {
  const problems: string[] = [];
  if (typeof kit.id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(kit.id)) {
    problems.push(`id must be kebab-case ascii, got ${JSON.stringify(kit.id)}`);
  }
  if (!isPageKitComposition(kit.composition)) {
    problems.push(`composition not in allowlist: ${kit.composition}`);
  }
  if (!isPageKitTokenId(kit.surface)) {
    problems.push(`surface is not a token id: ${kit.surface}`);
  }
  if (!isPageKitTokenId(kit.accent)) {
    problems.push(`accent is not a token id: ${kit.accent}`);
  }
  if (![1, 2, 3, 4].includes(kit.minTier)) {
    problems.push(`minTier must be 1–4, got ${kit.minTier}`);
  }
  // Refuse any sneak of free styling if a future field is added carelessly.
  const allowedKeys = new Set(['id', 'composition', 'surface', 'accent', 'minTier']);
  for (const key of Object.keys(kit)) {
    if (!allowedKeys.has(key)) {
      problems.push(`unknown field "${key}" — kits are not stylesheets`);
    }
  }
  const blob = JSON.stringify(kit);
  if (/#[0-9a-fA-F]{3,8}\b/.test(blob)) {
    problems.push('raw hex colour is forbidden in the kit manifest (C6)');
  }
  if (/rgba?\(/i.test(blob)) {
    problems.push('rgb()/rgba() is forbidden in the kit manifest (C6)');
  }
  if (/font-family|@import|stylesheet|<\/?style/i.test(blob)) {
    problems.push('CSS/HTML style surface is forbidden in the kit manifest (C6)');
  }
  return problems;
}
