/**
 * Which fate each Supabase table has on account export / deletion.
 *
 * Pure data (no `server-only`), so the completeness guard can run in the unit
 * lane: `accountDataCompleteness.test.ts` discovers every `create table` in
 * `supabase/migrations/` and fails unless it appears in exactly one registry —
 * a table added next month with no deletion/export story turns the gate red.
 *
 * The executor lives in `accountDataServer.ts`.
 */

type OwnershipMatch = 'id' | 'user_id' | 'user_id_or_device';

export type ExportTableSpec = {
  table: string;
  /**
   * Export always filters by the server-verified user id ('id' on profiles,
   * 'user_id' elsewhere). 'user_id_or_device' additionally documents that
   * DELETE cleans anonymous rows for the caller's device — the cascade cannot
   * reach rows with no user_id.
   */
  match: OwnershipMatch;
  /** Columns stripped from every exported row (secrets ride in no export). */
  redact?: readonly string[];
};

/** Cap per table — an export is a copy of your data, not a denial-of-service. */
export const EXPORT_ROW_CAP = 5000;

export const EXPORT_TABLES: readonly ExportTableSpec[] = [
  { table: 'profiles', match: 'id' },
  { table: 'enrollments', match: 'user_id' },
  { table: 'journey_events', match: 'user_id' },
  { table: 'workout_logs', match: 'user_id' },
  { table: 'nutrition_logs', match: 'user_id' },
  { table: 'fitness_test_results', match: 'user_id' },
  { table: 'leaderboard_snapshots', match: 'user_id' },
  { table: 'youth_consent_records', match: 'user_id' },
  { table: 'routines', match: 'user_id' },
  { table: 'custom_exercises', match: 'user_id' },
  { table: 'mobile_user_prefs', match: 'user_id' },
  { table: 'crypto_payment_intents', match: 'user_id' },
  { table: 'wearable_connections', match: 'user_id', redact: ['access_token', 'refresh_token'] },
  { table: 'wearable_samples', match: 'user_id' },
  { table: 'push_subscriptions', match: 'user_id_or_device' },
  { table: 'llm_usage', match: 'user_id_or_device' },
  { table: 'week_logged', match: 'user_id' },
] as const;

/** Email-keyed rows with no user_id — cleaned explicitly before the cascade. */
export const EMAIL_ONLY_TABLES = ['leads', 'checkout_recovery', 'beta_invites'] as const;

/** Tables deliberately outside both lanes — each with the reason on record. */
export const EXCLUDED_TABLES: Readonly<Record<string, string>> = {
  school_classes:
    'Shared resource owned by a class, not an athlete; created_by is on delete set null, so deleting the teacher account anonymizes without destroying the class.',
  android_telemetry_heartbeats:
    'Keyed by an opaque install_id with no linkage to auth.users or email — contains no personal data to export or delete.',
};
