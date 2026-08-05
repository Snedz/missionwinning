/**
 * Nutrition cloud inserts through the outbox.
 *
 * Framework review: `NutritionPage` (and Assessments / Today quick-wins) used
 * `saveNutritionEntry(...).catch(() => {})` — the same fire-and-forget pattern
 * that lost workouts on gym wifi before the outbox existed. Fuel rows are
 * insert-only (no client_id yet), so each enqueue keys on a minted id rather
 * than collapsing edits.
 */

import { enqueue, registerHandler } from '@/lib/sync/outbox';
import { saveNutritionEntry, type CloudNutritionEntry } from '@/lib/supabase';

export type NutritionUpsertPayload = Omit<CloudNutritionEntry, 'user_id' | 'id'>;

function isNutritionPayload(p: unknown): p is NutritionUpsertPayload {
  if (!p || typeof p !== 'object') return false;
  const o = p as Record<string, unknown>;
  return (
    typeof o.date === 'string' &&
    typeof o.name === 'string' &&
    typeof o.protein === 'number' &&
    typeof o.cals === 'number'
  );
}

let seq = 0;
function mintDedupeKey(entry: NutritionUpsertPayload): string {
  seq += 1;
  return `nutrition:${entry.date}:${entry.name}:${seq}:${Date.now()}`;
}

/** Queue a nutrition insert for the cloud. Never throws. */
export function enqueueNutritionUpsert(entry: NutritionUpsertPayload): void {
  enqueue('nutrition.upsert', mintDedupeKey(entry), entry);
}

export function registerNutritionSyncHandler(): void {
  registerHandler('nutrition.upsert', async (payload) => {
    if (!isNutritionPayload(payload)) return true;
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return true;
    const row = await saveNutritionEntry(payload);
    // null = no user (signed out) or insert failed. Signed out is not a failure —
    // local Fuel is the source of truth; re-queue happens when they sign in and log again.
    // A real insert failure returns null too — retry.
    if (row) return true;
    // Distinguish signed-out via getUser inside saveNutritionEntry: when there is
    // no user it returns null without error. Treat as success so we do not spin.
    const { getUser } = await import('@/lib/supabase');
    const user = await getUser();
    return !user;
  });
}
