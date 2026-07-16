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

## Key tables

| Table | Purpose |
|-------|---------|
| `profiles` | User prefs, journey, coach plan JSON, locale, units |
| `enrollments` | Premium subscription records |
| `crypto_payment_intents` | Solana Pay reference intents for Phantom USDC |
| School/PFT tables | See fitness_test migration |
| `youth_consent_records` | COPPA |

## Related (not here)

- Client sync: `src/lib/journeySync.ts`, `src/lib/coachSync.ts`
- Premium check: `src/lib/premiumServer.ts`
