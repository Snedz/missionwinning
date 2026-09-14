/**
 * Closed set of staged-rollout keys.
 *
 * The console cannot mint a flag. A new key is a PR that adds a row here, so
 * nothing in this list can silently gate Train: forbidden names are pinned,
 * and the logger isolation test forbids the folder from being imported there.
 */

export const FORBIDDEN_FLAG_KEYS = ['logger', 'private_mode', 'log_set'] as const;

export type ForbiddenFlagKey = (typeof FORBIDDEN_FLAG_KEYS)[number];

export type FeatureFlagKey = 'example_staged';

export type FeatureFlagCatalogEntry = {
  key: FeatureFlagKey;
  title: string;
  description: string;
  /** 0–100. Used when no override row exists. */
  defaultPercent: number;
};

export const FLAG_PERCENT_PRESETS = [0, 1, 5, 10, 25, 50, 100] as const;

export const FEATURE_FLAG_CATALOG: readonly FeatureFlagCatalogEntry[] = [
  {
    key: 'example_staged',
    title: 'Example staged surface',
    description: 'Reserved for the next optional ship. Never imported by Train.',
    defaultPercent: 0,
  },
];

const KEY_SET = new Set<string>(FEATURE_FLAG_CATALOG.map((e) => e.key));

export function isFeatureFlagKey(key: string): key is FeatureFlagKey {
  return KEY_SET.has(key);
}

export function catalogEntry(key: string): FeatureFlagCatalogEntry | null {
  return FEATURE_FLAG_CATALOG.find((e) => e.key === key) ?? null;
}
