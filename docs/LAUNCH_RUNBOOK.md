# LAUNCH RUNBOOK — the founder's critical path

**Everything in this file only YOU can do.** No coding required — copy-paste steps, in order. Each step ends with a checkbox; when all boxes in a section are checked, move on. Companion docs: [STRATEGY.md](STRATEGY.md) (why) · [PROTECTION.md](PROTECTION.md) (security) · [ORCHESTRATION.md](../ORCHESTRATION.md) (horizon gates).

> **The honest framing:** the app has been "almost ready" for months. The code is not the bottleneck — the steps below are. Do §1 today.

---

**Social copy kit:** [docs/SOCIAL_LAUNCH.md](SOCIAL_LAUNCH.md).  
**Archived plans** (soft launch day, flip checklist, track D, etc.): [docs/archive/INDEX.md](archive/INDEX.md).

## §1 — Regain deploy access (do today, ~30–60 min)

> **2026-07-11:** Vercel is connected via GitHub + Cursor. Skip 2FA recovery unless access breaks again. Confirm Production deploys from `master` and Profile shows the latest build label.
>
> **2026-07-22 (unblock www):** Production was stuck on a Jul 20 CLI deploy (~69 commits behind master). CI and [deploy-production.yml](../.github/workflows/deploy-production.yml) had been failing in ~2s with **GitHub spending limit / billing** — not a code failure.
>
> **2026-07-22 (billing cleared):** GitHub Pro / billing unblocked — **CI runs for real** again. Agents can rely on green checks; founder still owns secrets and promote.
>
> **Agent-verified 2026-07-22 evening:** www `/api/health` was still **`2026.07-unified.103`** before the `.104` push. **Deploy production** succeeded on master for `.103` (token may already work — confirm after `.104` lands). **CodeQL** still fails upload until Code scanning is enabled (workflow is soft `continue-on-error` so master CI is not blocked). **Aikido** job no longer hard-fails when `AIKIDO_SECRET_KEY` is unset.
>
> **Still founder-owned:** enable Code scanning; confirm www shows `.104` after deploy; phone QA + ≥10 invites; Android Accept B; Sentry DSN; Aikido MCP permissions + `AIKIDO_SECRET_KEY`.
>
> **Beta sprint (through 2026-08-02):** Code is not the bottleneck. Finish §1 CodeQL + verify `.104`, then §3 phone QA + ≥10 invites. Android Accept B + Wave A Sentry before any public flip.

1. **GitHub → Settings → Billing:** spending limit / payment cleared **2026-07-22** — CI no longer dies in ~2s on billing. Re-check if Actions fail again.
2. **Confirm / rotate GH Actions secret `VERCEL_TOKEN`** if Deploy production fails again — and confirm `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` still valid.
3. **Enable CodeQL:** repo **Settings → Security → Code scanning** — turn on GitHub CodeQL (upload fails until enabled; workflow soft until then).
4. **Promote Production (if www drifts again):** Actions → **Deploy production** → `workflow_dispatch`, **or** `vercel promote <ready-master-dpl> --yes`, **or** Vercel dashboard → Promote.
5. Confirm you can see the project dashboard and Production deploys from `master`.
6. After promote, check Profile footer / `/api/health` matches `src/lib/buildInfo.ts` (expect **`2026.07-unified.498`+** — do not assume until verified). Smoke anonymous: `/guide` → Start free opens `/welcome` (no 307 to `/private`); `/magazine/beyond-the-basics.pdf` downloads; `/locales/en/common.json` returns 200; `/log` still redirects to `/private` while gated.

- [x] GitHub Actions billing cleared (CI jobs no longer die in ~2–5s) — **cleared 2026-07-22; re-check if regress**
- [x] `VERCEL_TOKEN` confirmed working for Deploy production (`.104` Deploy green 2026-07-22)
- [ ] CodeQL / code scanning enabled (Settings → Security) — workflow soft until then
- [x] Production showed **`.104`+** on `/api/health` (agent-verified 2026-07-22)
- [ ] Production shows **`.498`+** after next promote / Deploy Hook catch-up (Vercel may lag `master`)
- [ ] Deploy Hook still fires on `master` push (or manual promote when www drifts)
- [x] I can open the Vercel project and deploy (GitHub integration / CLI promote)

## §2 — Environment & database (~45 min, one-time)

1. **Generate secrets** (Mac terminal):
   ```bash
   openssl rand -base64 32   # run twice: once for PRIVATE_ACCESS_SECRET, once for YOUTH_CONSENT_SECRET
   ```
2. **Vercel → Project → Settings → Environment Variables** (Production + Preview). Set:
   - `PRIVATE_MODE=true` (stays true until §5)
   - `PRIVATE_ACCESS_SECRET=<new random value>` (this replaces the old weak one — rotate, don't reuse)
   - `DEMO_PREMIUM=false`
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase → Project Settings → API)
   - `SUPABASE_SERVICE_ROLE_KEY` (same page — the **service_role** key; never expose in client)
   - `BETA_ADMIN_EMAILS=founder@example.com`
   - `YOUTH_CONSENT_SECRET` and `NUDGE_SECRET` (dedicated `openssl rand -base64 32` each — do not reuse gate secret)
   - `RESEND_API_KEY` + `RESEND_FROM` (consent, nudges, welcome, weekly digest)
   - `MAIL_POSTAL_ADDRESS` — physical address printed in every email footer (CAN-SPAM). **Blocks list mail until set**: waitlist confirmations drop to text-only, launch broadcast + beta invite refuse to send. Confirm the Bizee registered-agent address is usable as a public business address first — see [LEGAL_SAFETY.md](LEGAL_SAFETY.md) §3
   - `CRON_SECRET` (Vercel cron: daily nudges + Monday founder digest)
   - `FOUNDER_DIGEST_EMAIL=you@…` (Monday digest + Stripe `charge.dispute.*` alerts; skip send if unset)
   - Optional: `NEXT_PUBLIC_POSTHOG_KEY` (product analytics after user allow)
   - Optional AI coach: `COACH_LLM_*` + Console ZDR ([ENV.md](ENV.md))
   - Optional push (dark until public): VAPID keys ([ENV.md](ENV.md))
3. **Supabase migrations** (SQL Editor, **filename order**, all idempotent):
   1. Base / early: everything under `supabase/migrations/20250629_*.sql` if not already applied  
   2. `20260702_security_hardening.sql` — teacher PINs, leaderboard reads  
   3. `20260703_reminders_optin.sql`  
   4. `20260704_coach_plan.sql`  
   5. `20260705_leads_api_only.sql`  
   6. `20260716_crypto_payment_intents.sql` + `20260716_leads_growth_welcome_email.sql`  
   7. **`20260719_push_subscriptions.sql`** — web push (Wave 7). **Creates the table all three push features write to**; without it every subscribe call fails and the comeback nudge, wind-down and day-review pushes are all inert.  
   7b. `20260719_wearable_connections.sql` — OAuth connections + normalized samples. **The `wearables` surface is parked by default, so this is only required if `NEXT_PUBLIC_SURFACES` turns it on**; recorded here so turning that surface on is not a silent 500. ([WEARABLES.md](WEARABLES.md))  
   7c. `20260720_perf_indexes.sql` — composite indexes for workout history, the week-4 retention RPC and leaderboard board sorts. Nothing breaks without it; **queries degrade as history grows**, which is the failure mode you notice last and at the worst time.  
   8. **`20260720_referrals.sql`** — referral codes + `mw_week4_retention()` RPC (Wave 8). **The week-4 retention number is the boss metric and cannot be computed at all without this RPC**, so the Horizon 2 gate has nothing to read.  
   9. **`20260721_beta_invites.sql`** — beta invites + `checkout_recovery` (Wave 10). **Without it the invite sender has nowhere to record who was invited**, so the beta panel cannot show progress toward the ten-tester gate.  
   10. **`20260721_workout_sync_v2.sql`** — `client_id`/`revision`/**tombstones** (`deleted_at`)  
   11. **`20260721_routines_sync.sql`** · **`20260721_custom_exercises_prefs_sync.sql`** — Android sync  
   12. **`20260721_android_telemetry.sql`** — weekly Android heartbeat  
   13. **`20260728_anonymous_push.sql`** — nullable `user_id` + `device_id`; **without it the anonymous return loop is inert** ([RETURN_LOOP_PLAN.md](RETURN_LOOP_PLAN.md))  
   14. **`20260728_week4_exclude_tombstones.sql`** — **the boss metric counts deleted workouts until this is applied.** Then prove it: `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/checks/week4_retention_proof.sql`  
   15. **`20260730_wind_down_nudge.sql`** — `last_session_high` + `last_wind_down_at` on `push_subscriptions`; **the evening wind-down push (`.176`) is inert without it.** Apply after #13 — it extends the table #13 creates.
   16. **`20260731_llm_usage.sql`** — the `llm_usage` ledger; **per-user LLM spend metering (`.188`) records nothing without it**, so the quota gates cannot bind and the cost ceiling is unenforced.
   17. **`20260801_day_review_push.sql`** — `day_review_hour` + `last_day_review_at` on `push_subscriptions`; **the evening day-review push (`.194`/`.196`) is inert without it.** Apply after #13, and after #15 for ordering clarity — all three extend the same table.  
   18. **`20260813_week_logged.sql`** — signed-in `week_logged` ISO-week rollup; **without it the optional account sink for week-4 working-set events 500s** (guests stay local-only; PostHog still fires). CoS applies via MCP — agents do not apply.  
   19. **`20260813_mission_ids.sql`** — monotonic `mission_ids` per signed-in account (id 1 reserved). **Without it `/api/mission-id` 500s** after sign-in; guests are unaffected. CoS applies via MCP — agents do not apply.  
4. Redeploy, then verify on the Profile page in-app: build label matches the latest commit (`src/lib/buildInfo.ts`).
5. **Smoke after env** (from a machine with secrets):
   ```bash
   npm run check-env
   npm run gate-smoke          # or security-smoke
   npm run growth-smoke        # leads/unsub paths
   # Monday digest dry-run (local or prod with CRON_SECRET):
   curl -sH "Authorization: Bearer $CRON_SECRET" \
     "$SMOKE_BASE_URL/api/cron/weekly-digest?dryRun=1" | head
   ```

- [x] Env vars set (incl. service role, DEMO_PREMIUM=false, Resend, Stripe webhook secret, Payment Links)
- [x] All migrations run through **20260720_referrals** (push + week-4 RPC)
- [ ] **Migrations from §2 item 9 onward are NOT applied** (beta invites → week_logged). **One-sitting pack:** [MIGRATION_FOUNDER_PACK.md](MIGRATION_FOUNDER_PACK.md) (P1–P11 = files `20260721_*` … `20260813_week_logged.sql`). The two `20260728_*` gate the anonymous return loop and the correctness of the boss metric (tombstones); the `20260721_*` set gates invite ledger + Android sync; `20260730_wind_down_nudge` / `20260801_day_review_push` gate evening pushes; `20260731_llm_usage` gates LLM spend metering; `20260813_week_logged` gates the signed-in week-4 working-set sink. **After tombstone migration:** run `supabase/checks/week4_retention_proof.sql`. CI path: `apply-migration.yml` when `SUPABASE_DB_URL` is set.
- [x] Deployed URL loads and shows the new private teaser page
- [x] Digest dry-run + live send OK (`sent:true` with Resend)

## §2b — Ops maturity Wave A (before public flip)

Scorecard: [docs/PRODUCTION_STACK.md](PRODUCTION_STACK.md). Recovery: [docs/BACKUP_RESTORE.md](BACKUP_RESTORE.md).  
**Monitoring (health, Sentry, uptime):** [docs/OPS_MONITORING.md](OPS_MONITORING.md).

1. **Upstash (L9):** create Redis DB → set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` on Vercel Production → redeploy.
2. **Sentry (L12):** set `NEXT_PUBLIC_SENTRY_DSN` on Production → redeploy → confirm one error event.
3. **CI deploy/smoke (L5/L7):** GitHub Actions secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `SMOKE_BASE_URL`, `SMOKE_ACCESS_SECRET`.
4. Verify:
   ```bash
   SMOKE_BASE_URL=https://www.missionwinning.com SMOKE_ACCESS_SECRET=… npm run gate-smoke
   SMOKE_BASE_URL=https://www.missionwinning.com npm run rate-limit-smoke
   ```
5. **Backup drill (L13):** Profile → Export backup once; skim operator restore steps in BACKUP_RESTORE.md.

- [x] Upstash live · [x] rate-limit-smoke sees 429 on www (2026-07-22) · [ ] Sentry DSN live
- [ ] GitHub `SMOKE_BASE_URL` / `SMOKE_ACCESS_SECRET` for gate-smoke in CI (Deploy secrets present)
- [ ] Profile export verified once
- **Also before flip:** Android Accept B Pass — [apps/android/FOUNDER_ACCEPT.md](../apps/android/FOUNDER_ACCEPT.md) 15-min path → [SHIP_INTERNAL.md](../apps/android/SHIP_INTERNAL.md)
- **Aikido (optional but recommended):** MCP issues permissions + `AIKIDO_SECRET_KEY` — [AIKIDO.md](AIKIDO.md)

## §2c — Security pre-launch (before public flip)

> **Not “unhackable.”** Defense-in-depth: secrets out of git, RLS + no service_role in the browser, API auth, webhook signatures, smokes after deploy. Spine: [PROTECTION.md](PROTECTION.md) · [SECRETS.md](SECRETS.md) · [OWASP_AUDIT.md](OWASP_AUDIT.md) · [SECURITY.md](../SECURITY.md).

1. **Secrets scan (working tree):**
   ```bash
   npm run secrets:scan
   ```
2. **Optional history scan before repo Public:**
   ```bash
   gitleaks detect --source . -v
   ```
   Rotate any credential that ever appeared in history.
3. **GitHub → Settings → Security:** enable **Code scanning (CodeQL)** if not already; enable **Secret scanning** + **Push protection** when the plan allows (stronger on Public).
4. **Vercel Production env (names only in docs):** confirm `SUPABASE_SERVICE_ROLE_KEY`, Stripe secrets, `PRIVATE_ACCESS_SECRET`, `CRON_SECRET` are **Sensitive** / server-only — never `NEXT_PUBLIC_*`. Confirm `DEMO_PREMIUM=false` and `PRIVATE_ALLOW_QUERY_ACCESS` is not `true`.
5. **After each Production deploy:**
   ```bash
   SMOKE_BASE_URL=https://www.missionwinning.com npm run security-smoke
   SMOKE_BASE_URL=https://www.missionwinning.com npm run rate-limit-smoke
   ```
6. **Sentry:** set `NEXT_PUBLIC_SENTRY_DSN` or explicitly defer with a written reason.
7. **Support:** watch `support@missionwinning.com` for subject `SECURITY` ([SECURITY.md](../SECURITY.md)).

- [ ] `npm run secrets:scan` clean on the machine used for public-flip prep
- [ ] Optional full-history gitleaks; any hits rotated
- [ ] CodeQL / code scanning enabled
- [ ] Secret scanning + push protection enabled (or scheduled for Public flip)
- [ ] Vercel Sensitive: service role / Stripe / gate secrets not client-exposed; `DEMO_PREMIUM=false`
- [ ] Post-deploy `security-smoke` + `rate-limit-smoke` green on www
- [ ] Sentry DSN live **or** deferred with reason
- [ ] Support inbox monitored for security reports

**DB isolation (ties to §2 migrations):** user data is protected by **Supabase RLS** + **never shipping `service_role` to the client**. Pending migrations 10–17 still block return-loop / week-4 correctness / Android sync — apply them before treating cloud sync as production-ready.

## §2d — Legal / counsel (before first real charge)

> Agents draft; **counsel** owns enforceability. Pack: [legal/COUNSEL_BRIEF.md](legal/COUNSEL_BRIEF.md) · frozen EN text in [legal/exports/](legal/exports/) · [PAY_READY_LEGAL.md](PAY_READY_LEGAL.md) · [LEGAL_SAFETY.md](LEGAL_SAFETY.md).

- [ ] Fill entity blanks in [COUNSEL_BRIEF.md](legal/COUNSEL_BRIEF.md) (formation state, officers, EIN)
- [ ] Decide public **postal address** (Bizee RA publishable vs PO box/CMRA); set `MAIL_POSTAL_ADDRESS` on Vercel Production + Preview
- [ ] File **DMCA agent** at [copyright.gov](https://www.copyright.gov/dmca-directory/); put exact name/email/postal on `/dmca`
- [ ] Outside counsel review of Terms + Privacy + Refunds (+ DMCA agent block) before first real Stripe/PayPal/USDC charge
- [ ] Optional: trademark clearance; cyber liability quote before school/enterprise (do not claim “insured” in Privacy until bound)

---

## §3 — Beta: 10 real users (target: **2026-08-02**)

> **Sprint order:** **`MAIL_POSTAL_ADDRESS`** (§2 — invites cannot send without it) → migrations → **dogfood notes** (below) → issue 10 invites → day-2/day-7 follow-ups. Do not flip `PRIVATE_MODE` until gates pass.

### §3a — Dogfood notes (standing founder todo)

**What:** 2–5 minutes of notes after a real phone session (or gym wifi). Not a formal QA report. Agents treat this as the product signal: **fix what you wrote**, don’t invent logger polish without it.

**Paste template** (chat or note to self before next agent session):

```text
Device / build: <phone> · <Profile footer or /api/health label>
Path: Today → Start → log 3 sets → Finish → Victory → Coach/Today

Worked:
- …

Friction / bugs:
- … (what you did · expected · got)

Nice-to-have only if it slowed you:
- …
```

**Poke list for recent craft (prefer local `npm run dev` if Vercel lags; www ≥ `.498` when promoted):**

| Build | Check on phone / desktop |
|-------|----------------|
| `.285`–`.289` | Last · Next · why; Enter logs set; Use next when dial ≠ target; next set carries what you just did |
| `.290` | Victory “Next: …” after a real session (BW line if you have bodyweight work) |
| `.291` | After **one** finished workout, Today / First Steps push **session 2**, not Fuel |
| `.292` | Rest after a set feels ~90s+ for compounds (not a bare 30s if something started without a duration) |
| `.476`–`.479` | Form Index: open form mid-set on **deadlift / front-squat / bench** — silent **loop autoplays** when wired. **OHP / pull-ups** may be **SVG** (wrong stills demoted `.498` — not a bug) |
| `.481` | Rest meter under the big clock is **thick** enough to read outdoors without the digits |
| `.482` | Log console defaults to **Work + Kind** (not four kind chips). Kind expands Warmup/Fail/Drop |
| `.485` | Rest clock turns **accent** in the last ~10s (outdoor “about to go” without reading digits) |
| `.486` | Rest **Skip** fills accent in last 10s; presets hide so one bright thumb target |
| `.494`–`.497` | Footer Product: **Start free** first, **How Coach adapts**; More sheet tiers **Wedge · Pillars · You** (not a tab dump) |
| `.495` | `/exercises/{id}` → **Log this free** starts Train with that lift (`?exercise=`) |
| `.496` | `/paths/{id}` → **Open in Learn** expands that path; magazine ↔ app guide links |
| `.498` | Desktop exercise orange strip: **copy + button side-by-side** (not full-width button crushing text) |

Also Horizon W: one-thumb outdoors · one clear next session · coach week earned · re-entry after a gap · ≤90s first open not a chore list.

**Still founder-only (agents cannot complete):** set `MAIL_POSTAL_ADDRESS` · apply pending Supabase migrations · flip `PRIVATE_MODE` · live Stripe / EIN · recruit ≥10 · counsel review · secrets/history scan before Public.

- [ ] Dogfood notes taken on current build (paste to agent or keep; at least **#1 friction** written down)
- [ ] Hero flow QA'd on a real phone: teaser → access → I-Day → first workout → Victory → Coach/Today
- [ ] 10+ testers invited · [ ] gates met (check the beta panel) — **target 2026-08-02**

1. Smoke-check the hero flow yourself **on your phone** (table above). **Write down the #1 confusion** — agents fix only that until you paste new notes.
2. Recruit using the scripts in [STRATEGY.md §First 10 users](STRATEGY.md). Send personal invites with the URL + access code. Preferred: Profile → Beta panel → `MW-B-…` link. **Blocked until `MAIL_POSTAL_ADDRESS` is set.**
3. Track the funnel: Profile → founder beta panel (`BETA_ADMIN_EMAILS`). Gates: **10+ users, I-Day ≥80%, Basic Training ≥60%.**  
   Client drop-off (after analytics allow): PostHog funnel  
   `iday_started → iday_mission_accepted → iday_profile_completed → iday_completed → first_workout_completed`  
   ([docs/SEO_ANALYTICS.md](SEO_ANALYTICS.md)). Monday email digest repeats server funnel + week-4 RPC.
4. Message every tester at day 2 and day 7 (script in STRATEGY.md + [BETA_INVITE.md](BETA_INVITE.md)). Fix the #1 confusion each week.

- **Invite format:** `/private?invite=MW-B-XXXXX` + access code out-of-band — [BETA_INVITE.md](BETA_INVITE.md)


## §4 — Money: Stripe in ~1 hour (do in parallel with §3)

> **⚠️ SUPERSEDED by the founder override of 2026-07-23.**
> This section used to say *"open Stripe as **Individual**, not Company"* and cite
> [LLC_AND_PAYMENTS.md](LLC_AND_PAYMENTS.md) §1d as its authority — but §1d is the doc
> that **reverses** it: *"**Do not** take individual Stripe / PayPal / crypto checkout
> until business accounts exist."* Following this section as written would have opened
> an SSN-based account the current policy forbids, then required migrating it.
>
> **Current policy: free-first beta.** No checkout of any kind until LLC + EIN +
> business bank land. `NEXT_PUBLIC_FREE_BETA` defaults **on** and mutes all Bundle UI —
> [FREE_BETA.md](FREE_BETA.md).
>
> The checklist below is the **post-EIN** path. Work it when the entity clears, not now.

*This is not legal/tax advice — check your local requirements.*

### Post-EIN checklist (do NOT start before the entity clears)

- [ ] Stripe account **under the LLC** (EIN), not individual/sole-prop
- [ ] Beta 80% Prices or Payment Links (prefer 12‑mo / Lifetime; keep monthly as anchor)
- [ ] Production `sk_live_` / links + webhook `whsec` wired; dispute events + `FOUNDER_DIGEST_EMAIL`
- [ ] One live or test purchase → `enrollments` + `/api/premium/status`
- [ ] Spreadsheet for any Venmo/Zelle manual grants (stop once Stripe individual is live)
- [ ] Calendar: migrate Stripe → LLC when EIN + business bank land
- [ ] Phantom treasury ATA funded (optional parallel; list $149 — no amount change unless approved)

1. Create the account: https://dashboard.stripe.com/register (**individual** is fine — required until EIN).
2. Create **Products** with **Payment Links** (Dashboard → Product catalog → Add product → "Create payment link"). Pricing source of truth: `src/lib/bundleConfig.ts` + STRATEGY.md:
   - "Mission Winning Super Bundle — Monthly" · **$11.99/mo** (recurring monthly) → copy link
   - "Mission Winning Super Bundle — 12 months (Founders)" · **$59/year** (recurring yearly) → copy link  **← push this**
   - "Mission Winning Super Bundle — Founders Lifetime" · **$149** one-time → copy link
   - **Beta 80% off:** create separate beta Prices/Links (honest amounts); wire those env vars until founders list pricing returns
3. Webhook: Dashboard → Developers → Webhooks → Add endpoint → URL `https://www.missionwinning.com/api/stripe-webhook` → events: `checkout.session.completed`, `checkout.session.expired`, `charge.dispute.created`, `charge.dispute.updated`, `charge.dispute.closed` → copy the **signing secret** (`whsec_…`). Existing endpoint: add any missing events in Dashboard (or re-run `node scripts/setup-stripe-webhook.mjs` after delete).
4. Add to Vercel env (Production):
   ```
   NEXT_PUBLIC_STRIPE_LINK_BUNDLE=<12-month payment link>   # default checkout
   NEXT_PUBLIC_STRIPE_LINK_BUNDLE_MONTHLY=<monthly payment link>
   NEXT_PUBLIC_STRIPE_LINK_BUNDLE_12MO=<12-month payment link>
   NEXT_PUBLIC_STRIPE_LINK_BUNDLE_LIFETIME=<lifetime payment link>
   STRIPE_WEBHOOK_SECRET=<whsec_...>
   FOUNDER_DIGEST_EMAIL=you@…   # Monday digest + charge.dispute.* alerts
   ```
5. Redeploy. The bundle page switches from "waitlist" to real checkout automatically.
6. **Refunds at Checkout (Dashboard):** Branding / Checkout **custom text** (and Payment Link description if used) → `14-day money-back: https://www.missionwinning.com/refunds` — [STRIPE_PREMIUM_SETUP.md](STRIPE_PREMIUM_SETUP.md) · [STRIPE_DISPUTE_OPS.md](STRIPE_DISPUTE_OPS.md).
7. **Test in Stripe test mode first**: use test links + test card `4242 4242 4242 4242`, confirm a row appears in Supabase `enrollments`, and that the account you paid with gets premium (`/api/premium/status` → `premium: true`).
8. Before first live dollar: walk [PRE_REVENUE_CHECKLIST.md](PRE_REVENUE_CHECKLIST.md) (interim sole-prop allowed — see that doc); bookmark [legal/STRIPE_DISPUTE_EVIDENCE_PACK.md](legal/STRIPE_DISPUTE_EVIDENCE_PACK.md).

- [x] Stripe account live · [x] payment links created (test sandbox links on Production)
- [x] Webhook verified via signed `--ping-webhook` → `enrollments` row (`verify-test@missionwinning.com`)
- [x] Env vars set + redeployed
- [ ] Still open: Stripe Dashboard endpoint pointing at `/api/stripe-webhook` with matching `whsec` (or `node scripts/setup-stripe-webhook.mjs` with full `sk_`) so live Payment Link checkouts deliver events
- [ ] Dispute events enabled on webhook (`charge.dispute.*`) + `FOUNDER_DIGEST_EMAIL` set
- [ ] Checkout custom text / Payment Link footer → `/refunds`
- [ ] **Live individual Stripe** (pre-EIN) replacing sandbox-only checkout for beta buyers

### Phantom Lifetime USDC (code + Production env on; founder verify)

See [PHANTOM_USDC_CHECKOUT.md](PHANTOM_USDC_CHECKOUT.md). Strategy lens (crypto = rail, not product): [CRYPTO_RAILS_THESIS.md](CRYPTO_RAILS_THESIS.md). Do **not** market crypto until one end-to-end Lifetime payment is verified.

- [x] `crypto_payment_intents` on prod · Production `NEXT_PUBLIC_CRYPTO_CHECKOUT=true` + treasury + RPC · API smoke 401 without session
- [ ] Save treasury secret offline (never commit; delete any temp keystore file after import); fund USDC ATA for `YOUR_SOLANA_TREASURY_PUBKEY`
- [ ] Signed-in `/bundle` Lifetime → **Pay with Phantom** → confirm `enrollments.provider = phantom`
- [ ] Optional: dedicated RPC (Helius/QuickNode); Phantom Portal App ID for social/deeplink
- [ ] Parallel (when live KYB ready): Dashboard → Payment methods → **Stablecoins and Crypto** for Lifetime Sessions only — [STRIPE_PREMIUM_SETUP.md](STRIPE_PREMIUM_SETUP.md)

## §5 — Go public (only after §2 / §2b security + ops boxes + §3 gates)

**Automated verify** (after env is set on Vercel):

```bash
# Gate still on
SMOKE_BASE_URL=https://www.missionwinning.com SMOKE_ACCESS_SECRET=... npm run launch-verify
SMOKE_BASE_URL=https://www.missionwinning.com npm run rate-limit-smoke

# After PRIVATE_MODE=false (Layer 10 PWA enables via next.config.js)
SMOKE_BASE_URL=https://www.missionwinning.com SMOKE_ALLOW_PUBLIC=true SMOKE_EXPECT_PWA=true npm run launch-verify
```

See [docs/archive/TRACK_D_GO_LIVE.md](archive/TRACK_D_GO_LIVE.md) for Stripe enrollment + Supabase probe commands.  
Flip checklist: [docs/archive/PUBLIC_FLIP_CHECKLIST.md](archive/PUBLIC_FLIP_CHECKLIST.md) (offline + SW spot-check Today/Train).

1. Final security curls (replace domain if needed):
   ```bash
   curl -sI https://www.missionwinning.com/ | grep -i location        # → /private while gated
   curl -sI https://www.missionwinning.com/api/premium/recipes        # → 401/403
   curl -s  https://www.missionwinning.com/manifest.webmanifest | head -3  # → JSON
   ```
2. Vercel env: set `PRIVATE_MODE=false` → redeploy. PWA + landing page are now live.
3. Install the PWA on your own phone from the live site (browser menu → "Install / Add to Home Screen"). Confirm offline logging works in airplane mode.
4. Launch posts (order): the beta testers ("we're live — share it?") → Product Hunt → Show HN → the 2–3 communities from §3. One honest post each, written as the builder. **Copy kit:** [docs/SOCIAL_LAUNCH.md](SOCIAL_LAUNCH.md) Phase B.
5. Email the waitlist (Supabase `leads` where source in `launch-waitlist`, `waitlist-*`): you're live + founders offer. Template in SOCIAL_LAUNCH.md.

- [ ] Curls pass · [ ] PRIVATE_MODE=false · [ ] PWA installs from prod
- [ ] Launch posts up · [ ] Waitlist emailed

## §6 — Operating cadence (after launch)

- **Weekly (1h)**: check beta panel + Supabase numbers against ONE metric (week-4 retained loggers — STRATEGY.md); talk to 2 users; fix the top confusion.
- **Before any deploy**: `npm test` + `npm run gate-smoke` (CI also runs tests).
- **Monthly**: re-read [REDTEAM.md](REDTEAM.md) §1 and check falsifying evidence; review Stripe → enrollments reconciliation; `npm audit`.
- **Rule that keeps you honest**: no new features while a LOAD-BEARING assumption is failing its evidence check.
- **YC:** only after beta → public → week-4 + paid gates — [docs/YC_THESIS.md](YC_THESIS.md) · [ORCHESTRATION.md](../ORCHESTRATION.md). Agents never flip `PRIVATE_MODE` or invent traction.

---

## Quick reference — who does what

| | Founder (this runbook) | Claude Code sessions |
|---|---|---|
| Vercel/Stripe/Supabase accounts, secrets | ✅ | ❌ (can't own accounts) |
| Recruiting + talking to users | ✅ | ❌ |
| Launch posts (authentic voice) | ✅ drafts welcome | ✍️ can draft |
| Features, fixes, tests, reviews | ❌ | ✅ |
| AI Coach v1, premium pillar depth | decide *when* | ✅ build |
