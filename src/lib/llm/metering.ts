import 'server-only';

/**
 * The LLM spend ledger writer — one row per paid call, into `llm_usage`.
 *
 * Counts, never content: a row is token numbers, the feature name, and the
 * outcome. The prompt and completion do not pass through this module at all,
 * so no bug here can leak them. Row shape and refusals live in the pure
 * `meteringRow.ts`; this file owns only the service-role insert.
 *
 * Fire-and-forget by contract: `recordLlmUsage` never throws and never blocks
 * the athlete's response on the insert. When the service-role client is not
 * configured (local dev, preview) it is a silent no-op — the stdout token log
 * in coachLlmClient still gives spend visibility there.
 */

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { buildLlmUsageRow, type LlmUsageRecordInput } from '@/lib/llm/meteringRow';

export type {
  LlmCallerIdentity,
  LlmFeature,
  LlmUsageRecordInput,
} from '@/lib/llm/meteringRow';
export { buildLlmUsageRow } from '@/lib/llm/meteringRow';

/** Service-role insert; no-op without an owner or without admin config. */
export async function recordLlmUsage(input: LlmUsageRecordInput): Promise<void> {
  try {
    const row = buildLlmUsageRow(input);
    if (!row) return;
    const admin = getSupabaseAdmin();
    if (!admin) return;
    await admin.from('llm_usage').insert(row);
  } catch {
    // The ledger must never take the feature down with it.
  }
}
