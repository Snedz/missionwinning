import type { WorkflowEntry } from './workflowRegistry.ts';

export type Pick =
  | { ok: true; provider: string; usedFallback: boolean }
  | { ok: false; reason: 'no-fallback' | 'all-down' };

export function pickProvider(
  entry: WorkflowEntry,
  primary: string,
  down: ReadonlySet<string>
): Pick {
  if (!down.has(primary)) {
    return { ok: true, provider: primary, usedFallback: false };
  }

  for (const fallback of entry.fallbackProviders) {
    if (!down.has(fallback)) {
      return { ok: true, provider: fallback, usedFallback: true };
    }
  }

  if (entry.fallbackProviders.length === 0) {
    return { ok: false, reason: 'no-fallback' };
  }

  return { ok: false, reason: 'all-down' };
}
