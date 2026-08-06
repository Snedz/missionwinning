# Service-role usage map

**Status:** Agent inventory 2026-08-05 (security enhance plan S4).  
**Rule:** `getSupabaseAdmin()` bypasses RLS. Every call site must have independent authZ (webhook signature, CRON_SECRET, beta admin, or equivalent). Prefer user-scoped client + RLS when possible.

**Factory:** `src/lib/supabaseAdmin.ts` — returns null if `SUPABASE_SERVICE_ROLE_KEY` unset (fail soft/closed per caller).

## Call sites (non-test)

| Module | Role | Auth in front | Tables (typical) | Notes |
|--------|------|---------------|------------------|-------|
| `app/api/stripe-webhook` | Enroll premium after pay | Stripe signature | enrollments | Critical path |
| `app/api/leads` + unsubscribe | Waitlist | Public + rate limit / token | leads | Gated public API |
| `app/api/beta/invites*` | Invite admin / redeem / land | Beta admin or opaque token | beta_invites | landed is public allowlist |
| `app/api/referral` | Referral codes | Session / rules in route | referrals | Review user scope |
| `app/api/health` | Deep health | CRON_SECRET for deep | ping | Shallow public |
| `app/api/journey/welcome` | Welcome email ops | Route auth | — | Check route |
| `app/api/mobile/telemetry` | Android heartbeat | Private gate + RL | android_telemetry_heartbeats | No PII by design |
| `app/api/cron/*` (via nudgeServer etc.) | Digests / nudges | CRON_SECRET at route | various | Allowlisted + secret |
| `src/lib/premiumServer.ts` | Premium truth | Called from authorized routes | enrollments | |
| `src/lib/nudgeServer.ts` | Push/email nudges | Cron only | push, prefs | |
| `src/lib/betaMetricsServer.ts` | Founder metrics | Beta admin | feedback, leads | |
| `src/lib/feedbackServer.ts` | Read feedback | Beta admin path | feedback | |
| `src/lib/schoolClassServer.ts` | School classes | PIN / creator | school_* | Parked product |
| `src/lib/youthConsentServer.ts` | Youth consent | Fail-closed secrets | youth_* | |
| `src/lib/cryptoCheckout/intent.ts` | USDC intents | Sign-in required at route | crypto_* | |
| `src/lib/llm/metering.ts` | LLM usage rows | Coach routes | llm_usage | |
| `src/lib/wearables/connections.ts` | Wearable links | Wearable routes | wearable_* | Parked |
| `src/lib/beta/funnelAggregate.ts` | Funnel | Admin metrics | aggregates | |

## Founder verify (live Supabase)

- [ ] RLS enabled on `workout_logs`, sync tables, enrollments  
- [ ] No table grants to `anon`/`authenticated` that bypass owner checks  
- [ ] Service role used only from server (never `NEXT_PUBLIC_`)  

## Related

- [SECURITY_PUBLIC_OSS_AUDIT_2026-08.md](SECURITY_PUBLIC_OSS_AUDIT_2026-08.md)  
- [OWASP_AUDIT.md](OWASP_AUDIT.md)  
