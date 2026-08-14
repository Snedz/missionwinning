# Privacy & security program — Phase 0 status

**Tip:** `2026.07-unified.779` (`.778` land + typecheck / persist-home follow-up)  
**Date:** 2026-08-14  
**Not a certification.** Do not claim SOC 2, ISO 27001, HIPAA, or GDPR from this file.

Living checklists stay in [PROTECTION.md](../PROTECTION.md) and [OWASP_AUDIT.md](../OWASP_AUDIT.md). Control catalog: [COMPLIANCE.md](../COMPLIANCE.md) + [`docs/compliance/controls.yaml`](../compliance/controls.yaml). This page is the **current census + re-verify** so those docs are not treated as live.

---

## Frameworks (apply / map / refuse)

| Framework | Role | Meet means |
|-----------|------|------------|
| OWASP ASVS L1 + Top 10 | Technical bar | Test or accepted residual in OWASP_AUDIT |
| CCPA / CPRA | US signed-in PII | Access + delete + no sale/share **in code** |
| COPPA | Youth surface (parked) | Fail-closed secrets; notify not an open relay |
| FTC AI + exercise-as-medicine | Coach / claims | LEGAL_SAFETY §3a + coach boundaries |
| CAN-SPAM | List email | Founder: `MAIL_POSTAL_ADDRESS` (unset) |
| Play Data safety | Android Internal | Fill only from LEGAL_SAFETY §2 |
| SOC 2 TSC / ISO 27001 Annex A | Evidence **map** | Catalog only — never market pass counts |
| HIPAA Security Rule | Map-only | **Never claim.** Not a covered entity |
| NIST CSF 2.0 | Cadence | Weekly/monthly loop — not a cert |
| PCI | Stripe hosts cards | No PAN in this repo |
| GDPR / UK GDPR / PIPEDA | Hosted service **not offered** (EEA/UK/CH/CA) | Enforce the block. No EU representative |

---

## Compliance monitor (catalog v2 · 2026-08-14)

Phase 1 shipped: `source_scan` probes + privacy framework tags (`ccpa`, `coppa`, `play_data`, `ftc_ai`). Deleting HMAC / DNT / webhook verify / ZDR now fails the monitor. P1-1 / P2-2 / P1-5 / P2-4 / P2-5 / P1-2 / P2-8 / P1-3 (`MW-ACCESS-006`, `MW-HEALTH-001`, `MW-HEALTH-002`, `MW-WEAR-001`, `MW-TERR-001`, `MW-TERR-002`, `MW-CCPA-006`, `MW-TERR-003`) are **pass** after `.772`–`.782`.

`npm run compliance:status`: **pass=48 · partial=8 · manual=5 · n_a=4 · fail=0**

Known-open partials: MW-PLAY-001 (Play form). Founder manuals include ACCESS-004 / VEN-004 / INC-002.

---

## Attack surface (code, this tip)

**71** `app/api/**/route.ts`. Perimeter: surface parking (`isPathEnabled`) then `PRIVATE_MODE` then handler auth.

| Bucket | Count | Notes |
|--------|------:|-------|
| Public / no login in handler | 20 | Includes password gate, HMAC unsubscribe, optional-session push, parked youth |
| Gate-or-session (`hasAppAccess`) | 5 | Coach insight/voice/chat + meal estimate. Cookie only — not Bearer |
| Session / Bearer required | 37 | Account, checkout, premium catalogs, mobile sync, parked wearables/school |
| Admin / cron / privileged | 7 + `health?deep=1` | `CRON_SECRET` or beta admin |
| Webhooks | 2 | Stripe HMAC; PayPal REST (PayPal surface parked) |
| File / photo upload | 1 | `POST /api/fuel/estimate-meal` ≤6 MiB; photo not stored |
| LLM ingress | 5 | chat, daily-insight, plan-voice, debrief-voice, meal vision. `llm_usage` stores **token counts only** |
| Mobile (`/api/mobile/*`) | 10 | OpenAPI covers all 10; INDEX misses `play-purchase` |

Default-parked surfaces (handlers exist, 404 unless `NEXT_PUBLIC_SURFACES` enables): **school**, **youth**, **wearables**, **cryptoRails**, **paypal**.

`app/api/INDEX.md` is missing 9 live handlers: `account/mission-id`, `beta/feedback`, `beta/invites`, `beta/invites/landed`, `beta/invites/redeem`, `cron/day-review`, `health`, `metrics/week-logged`, `mobile/premium/play-purchase`. Inventory drift — not a new hole.

Cleanest unauthenticated proxy while the gate is off: `fuel/search-food` and `fuel/barcode` (Open Food Facts + IP rate limit only).

---

## 2026-08-13 hunt — re-verify

Original memo: [REDTEAM_2026-08-13.md](REDTEAM_2026-08-13.md). Re-read in source on this tip. **No P0.**

| ID | Verdict | Residual |
|----|---------|----------|
| **P1-1** any Supabase session mints `mw_private_access` | **CLOSED (`.772`)** | Cookie mint requires `sessionMintEligible` (invite-bound while gated). Proxy is cookie / `?access=` only. Password form unchanged. |
| **P1-2** client-settable country headers | **CLOSED (`.779`)** | `x-country-code` is display-only. On Vercel, only `x-vercel-ip-country` may allow. `cf-ipcountry` can only tighten a block. Local / `next start` still fail-open when no header is set. |
| **P1-3** signup geo UI-only | **CLOSED (`.782`)** | Callback exchanges to identify, then expires session cookies and will not mint the gate cookie. A brand-new empty account may be reaped. Existing athletes are kept. SignInPanel is still a client check. OTP-without-click can leave a ghost user (Auth Hook is founder). |
| **P1-4** mobile Coach vs `PRIVATE_MODE` | **CLOSED** | `allowMobileCoachBootstrap` → `isPrivateModeEnabled()`. |
| **P1-5** shared-device `mw_*` not account-scoped | **CLOSED (`.774`)** | Sign-out wipes athlete keys. `mw_storage_owner` binds the device. Foreign/guest leftover does not OR-merge PAR-Q onto the next account. |
| **P2-1** delete honors client `deviceId` | **CLOSED (`.775`)** | Anonymous rows wiped only for device ids already stored on this user. Body `deviceId` is ignored. |
| **P2-2** PAR-Q risk written as a food row | **CLOSED (`.773`)** | Persist is `mw_last_assessment` only. Assessments + Profile assessment card do not call `saveNutritionEntry`. Historical `Assessment:` rows still filter in Fuel. |
| **P2-3** youth notify unauthenticated mail | **CLOSED (`.776`)** | Handler 404 when parked; session required; 3/hour per recipient plus IP cap. |
| **P2-4** wearables OAuth fallback secret | **CLOSED (`.777`)** | Dedicated secret required in production. Redirect URI from configured origin. Surface parked. |
| **P2-5** territory client fail-open | **CLOSED (`.778`)** | Non-OK / thrown geo is blocked and not cached. Missing-country / accept-language allow is not session-cached. |

Hunt-closed items **still closed:** sequential Mission ID (now a Postgres sequence, client cannot choose), pregnancy/PT stripped from PostHog, planner/LLM blind to standing, notes XSS, path traversal, open redirects, unsigned payment grants, export IDOR, school stats/leaderboard IDOR.

---

## Data classification (code as truth)

LEGAL_SAFETY §2 is the store-label seed. Classes below are **sensitivity**, not git [CLASSIFICATION.md](../CLASSIFICATION.md).

**Restricted** (health / youth / credentials)

| Data | Where |
|------|--------|
| Youth parent email, child age | `youth_consent_records` (exported in full — no redact). Parked. |
| Pregnancy / postpartum / miscarriage | **Device only** `mw_pregnancy_flag` |
| Mood / sleep / stress / journal | **Device only** `mw_mind_checkins`, `mw_session_journal` |
| Body metrics | **Device only** `mw_body_metrics` |
| Assessment / PAR-Q risk | Device `mw_last_assessment` only (P2-2 closed `.773`) |
| Wearable OAuth tokens | `wearable_connections` (redacted on export). Parked. |
| Teacher PIN | `school_classes`. Parked. |
| Auth secrets, gate HMAC, LLM keys | Vercel / `.env.local` |

**Confidential** — email, workout/fuel logs (cloud when signed in), coach plan, enrollments, crypto intents, LLM **content in transit** (not stored), leads, push endpoints, Mission ID, opt-in PostHog.

**Internal** — `llm_usage` token counts, `week_logged`, `android_telemetry_heartbeats` (opaque `install_id`), anonymized `beta_invites`.

**Public** — marketing, guidebook, exercise catalog, gated premium *catalog* (not user data), Open Food Facts proxy results.

---

## DSAR (access / delete)

Routes: `GET /api/account/export` (session, 3/5 min) · `POST /api/account/delete` (`confirm: 'DELETE'`, 2/5 min).  
Registry: [`src/lib/accountDataRegistry.ts`](../../src/lib/accountDataRegistry.ts) — `accountDataCompleteness.test.ts` fails if a new `create table` has no fate.

**26** public tables. Export is `user_id`/`id` plus email-keyed PI when the session has an email, 5000 rows/table. Delete: email-keyed cleanup → optional device wipe → `auth.admin.deleteUser` cascade.

| Fate | Tables |
|------|--------|
| Exported + cascade-deleted | profiles, enrollments, journey_events, workout_logs, nutrition_logs, fitness_test_results, leaderboard_snapshots, youth_consent_records, routines, custom_exercises, mobile_user_prefs, crypto_payment_intents, wearable_connections (tokens redacted), wearable_samples, push_subscriptions, llm_usage, week_logged, mission_ids, social_messages, social_presence, social_message_reports |
| Exported + email-delete / anonymize | leads, checkout_recovery (deleted); beta_invites (email stripped, row kept) |
| Excluded with reason | `school_classes` (shared; `created_by` SET NULL), `android_telemetry_heartbeats` (no auth/email link) |

**Policy vs code**

- Privacy copy: 30-day erase with tax / fraud / legal-hold exceptions. **No legal-hold flag in code** (pinned by `accountDataCompleteness`). Enrollments and crypto intents hard-delete with the user. Email-keyed PI is exported when the session has an email (`.780`).
- Device `mw_*` (mood, pregnancy, body, journal) is **not** in cloud DSAR — user clears site data or uses Profile backup.
- Account delete still does **not** wipe Android local stores. Web sign-out wipes athlete-local `mw_*` (P1-5 / `.774`).
- Help privacy page matches runtime: opt-in + DNT hard-off (pinned by `privacyInstill.test.ts`).

Third parties not in this executor: Stripe/PayPal/Play ledgers, Resend, xAI/OpenAI (ZDR hoped), PostHog, Sentry, wearable vendors, platform backups.

---

## Next

Phase 0–3 plus the P1-3 residual are on this stack. OTP-without-click can still leave a ghost `auth.users` row (Supabase Auth Hook is founder). No `.greptile/` tree — do not invent one.

1. ~~Phase 0 census~~ done.
2. ~~Phase 1 monitor~~ done (`.771`).
3. ~~Phase 2 hunt + DSAR~~ done (`.772`–`.780`).
4. ~~Phase 3 instill~~ done (`.781`).
5. ~~P1-3 leftover~~ done (`.782`).

Founder-only (do not tick): `MAIL_POSTAL_ADDRESS`, DMCA agent, counsel, cyber insurance, Upstash, Sentry DSN, Aikido, Play labels, xAI ZDR if LLM is on.
