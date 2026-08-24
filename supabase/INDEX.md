# supabase/

> One concern: PostgreSQL schema and migrations for Supabase.

## Read order

1. `migrations/20250629_complete_base_schema.sql` — profiles, enrollments, RLS base
2. Later migrations in chronological order (filename date prefix)
3. `schema.sql` — reference snapshot if present

## Migrations (apply in order)

| File | Adds |
|------|------|
| `20250629_complete_base_schema.sql` | `profiles`, `enrollments`, RLS |
| `20250629_journey_state.sql` | `journey_state`, `ui_mode`, `experience`, `primary_goal` |
| `20250629_journey_events.sql` | Journey events |
| `20250629_leaderboard.sql` | Leaderboard tables |
| `20250629_leaderboard_squad_patch.sql` | Squad patch |
| `20250629_pft_leaderboard_teacher_pin.sql` | Teacher PIN |
| `20250629_fitness_test_school.sql` | School fitness test |
| `20250629_youth_consent_records.sql` | COPPA consent |
| `20260702_security_hardening.sql` | Security |
| `20260703_reminders_optin.sql` | `reminders_opt_in`, `last_nudge_at` |
| `20260716_crypto_payment_intents.sql` | Phantom USDC lifetime payment intents |
| `20260719_wearable_connections.sql` | Wearable OAuth connections + samples |
| `20260720_referrals.sql` | Referrals |
| `20260720_perf_indexes.sql` | `workout_logs(user_id, completed_at)` + leaderboard board indexes + leads filters |
| `20260813_week_logged.sql` | Signed-in ISO-week logger rollup (CoS applies; guests local-only) |
| `20260814_social_messages.sql` | Shared Garage rooms + presence + reports (signed-in; guests local) |
| `20260814_feedback_reviews.sql` | Founder ratings on tester notes (`class` + dest). Applied 2026-08-14 |
| `20260824_profiles_open_session.sql` | `profiles.open_session` jsonb — in-progress Train session (`.958`). Not applied |

## Key tables

| Table | Purpose |
|-------|---------|
| `profiles` | User prefs, journey, coach plan JSON, locale, units, `open_session` (`.958`) |
| `enrollments` | Premium subscription records |
| `crypto_payment_intents` | Solana Pay reference intents for Phantom USDC |
| `wearable_connections` | OAuth/hub connection tokens (service-role write) |
| `wearable_samples` | Normalized wearable samples |
| School/PFT tables | See fitness_test migration |
| `youth_consent_records` | COPPA |
| `week_logged` | Signed-in weekly logger rollup (ISO week). No PII beyond `user_id`. |
| `social_messages` | Signed-in Garage room posts |
| `social_presence` | Signed-in self presence |
| `social_message_reports` | Reports on another athlete's Garage message |
| `feedback_reviews` | Founder class/dest on a lead. Cascade-delete with the lead. No athlete `user_id` |

## Related (not here)

- Client sync: `src/lib/journeySync.ts`, `src/lib/coachSync.ts`
- Premium check: `src/lib/premiumServer.ts`
