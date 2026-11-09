# Security audit — 2026-10-17

Adversarial review of the Mission Winning tree at `136c857a` (`master`). Product code was not changed. Nothing here was run against production.

Method: read the live call path (route → helper → RLS / proxy / surface parking), then try to kill the candidate. A candidate is confirmed only when a local proof shows the check does not stop it. Proofs are schema parses, the PostgREST filter encoding, and the existing error-leak regex. No live Supabase or payment provider was required.

**Result: 0 critical, 0 high, 3 medium, 1 low.** RevenueCat is not in this repo. There are no server actions.

## Confirmed

### M-1 — Waitlist email match is an SQL `ILIKE` pattern

**Severity:** MEDIUM

**Where:** `app/api/leads/route.ts:32`, `app/api/leads/route.ts:42`, `app/api/leads/route.ts:82`, `app/api/leads/unsubscribe/route.ts:38`. Schema: `src/lib/apiSchemas.ts:19`.

**What is wrong:** Both handlers pass the caller’s email to Supabase `.ilike('email', email)`. `@supabase/postgrest-js` appends that string as `ilike.<value>` and does not escape `_` or `%`. In SQL, `_` is a single-character wildcard. Zod’s email check allows `_` in the local part, so `a_b@example.com` is a valid signup and a valid unsubscribe query.

The writes use the service role, so RLS does not narrow them back to one row.

**Reachable:** `/api/leads` and `/api/leads/unsubscribe` are on `PUBLIC_API_PATHS_WHILE_GATED` (`src/lib/privateGate.ts:39-40`), so the private gate does not block them.

- Confirmation update (`leads/route.ts:78-83`) runs after Resend accepts the send (`result.ok && !result.skipped`). It sets `confirmed_at` on every unconfirmed row the pattern matches. A signup as `a_b@example.com` also stamps `axb@example.com`, `aab@example.com`, and so on, which suppresses their confirmation for the 7-day cooldown.
- Unsubscribe (`leads/unsubscribe/route.ts:35-38`) sets `unsubscribed_at` on every match. The HMAC is checked against the exact query string, then the update widens. In production that token verifies only when `NUDGE_SECRET` is set (`src/lib/emailServer.ts:31-36` fails closed on an empty secret). Once that secret is set, one legitimate unsubscribe link opts out every wildcard match.

This environment has no `RESEND_API_KEY`, so the confirmation update does not fire here. The handler that performs it is the live public route.

**Exploit sketch:**

1. `POST /api/leads` with `{ "email": "a_b@example.com", "source": "launch-waitlist" }` from an allowed country (`x-vercel-ip-country`).
2. After the mailer accepts, the service-role update is `email=ilike.a_b@example.com`, which is not an equality match.
3. With `NUDGE_SECRET` set, open the unsubscribe link from that mail. The same pattern writes `unsubscribed_at` for every matching lead.

**Local proof:** Zod accepts `a_b@example.com`. `URLSearchParams` (what postgrest-js uses) round-trips the filter to `ilike.a_b@example.com`, underscore intact. `%` also round-trips to `ilike.%`, but Zod rejects `%` in an email, so the percent wildcard is not reachable through signup.

**Patch:** Normalize with `trim().toLowerCase()` and update with `.eq('email', email)`, or escape `%`, `_`, and `\` before any `ILIKE`. Do this in both handlers. Add a test whose email local-part contains `_` and asserts the filter is equality, not a pattern.

### M-2 — Public waitlist mail includes caller-controlled text

**Severity:** MEDIUM

**Where:** `app/api/leads/route.ts:111-113` (source taken from the body) and `app/api/leads/route.ts:64-67` (interpolated into the text part). Send: `src/lib/emailServer.ts:79-94`.

**What is wrong:** `source` / `package_interest` is any string up to 80 characters (`src/lib/apiSchemas.ts:23-25`). It is not an allowlist. The confirmation text part is:

```text
Your interest tag: ${source}
```

The HTML part does not include it. The text part does, and that part is sent as the product (`RESEND_FROM`, or the Resend onboarding address when unset). Subject is fixed. This is not SMTP header injection; Resend takes structured fields. It is still an unauthenticated send, from this app’s identity, to any address the caller names, with a short attacker sentence in the body.

**Reachable:** Same public route as M-1. Territory allow on Vercel trusts only `x-vercel-ip-country` (`src/lib/legal/supportedRegions.ts:237-298`), so a spoofed `cf-ipcountry` does not open a blocked country. Callers in an allowed country are enough. Feedback sources skip the mail (`app/api/leads/route.ts:200-202`). Any other source string does not. Rate limit is 5/minute/IP in process memory (`Upstash` is unset, per `CONTEXT.md`). The send is skipped when `RESEND_API_KEY` is unset.

**Exploit sketch:** `POST /api/leads` with a victim `email` and `source` set to a one-line lure (URL plus a short instruction). The victim receives that line inside Mission Winning’s waitlist mail.

**Local proof:** `leadsBodySchema` accepts `{ email: "a@example.com", source: "Pay at https://evil.example/x now" }`.

**Patch:** Allowlist `source` to the tags the clients actually send. Drop it from the email body. Keep the recipient cap, and add a per-recipient cooldown that does not depend on the wildcard match in M-1.

### M-3 — Garage author name, mission number, and timestamp are client-asserted

**Severity:** MEDIUM

**Where:** `app/api/social/messages/route.ts:101-110`. Schema: `src/lib/apiSchemas.ts:499-511`. RLS: `supabase/migrations/20260814_social_messages.sql:53-60`. Render: `src/components/social/MessageList.tsx:32-39`.

**What is wrong:** The route sets `user_id` from `getUser()` (that part holds) and then stores `author_call_sign`, `author_mission_id`, and `created_at` from the body. The insert policy checks `auth.uid() = user_id` and the channel slug only. It does not check the display name, the two-digit mission number, or the timestamp. The list renders those three fields as the author line. Call signs are not a server registry; they are read from device storage (`src/lib/social/callSign.ts:15-17`) and accepted per message.

`user_id` on the row is the real account. The screen does not show it. One account can post one message as `Founder` / `01` dated in 2000, and the next as itself.

**Reachable:** `server` is a secondary surface, on unless `NEXT_PUBLIC_SURFACES=wedge` or `-server` (`src/lib/surface.ts:53-63`, path `/api/social` at line 112). The Next route is behind the private gate (it is not on the public-API list). The same insert is granted to `authenticated` on PostgREST (`20260814_social_messages.sql:97`), and the private gate does not sit in front of Supabase. Any signed-in user can do this. The anon key is `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Whether the hosted project allows open signup is a dashboard setting; this repo does not disable it.

**Exploit sketch:** As user A, `POST /api/social/messages` (or `POST /rest/v1/social_messages` with A’s JWT) with `authorCallSign: "Founder"`, `authorMissionId: "01"`, `createdAt` in the past, and any body. The row is stored and listed under that name. A second request with a different name shows the name was never bound to the account.

**Local proof:** `socialMessageBodySchema` accepts that body (`authorCallSign: "Founder"`, `authorMissionId: "01"`, `createdAt: "2000-01-01T00:00:00.000Z"`).

**Patch:** Ignore the three client fields. Set `created_at` to `now()` in a `BEFORE INSERT` trigger. Resolve the visible label from one owner-owned profile column (so a rename is account-wide and attributable) and the mission number from `mission_ids` for that `auth.uid()`, not from the payload. Keep `user_id` as it is. The trigger has to exist even if the route is fixed, because the RLS policy is a second front door.

Message body is rendered as React text (`MessageList.tsx:41`). This finding is impersonation, not XSS.

### L-1 — Mobile sync returns Postgres errors to the caller

**Severity:** LOW

**Where:**

- `app/api/mobile/sync/workouts/route.ts:88` and throws at `:230`, `:274`, `:305`
- `app/api/mobile/sync/customs/route.ts:82` and throws at `:209`, `:234`
- `app/api/mobile/sync/routines/route.ts:82` and throws at `:209`, `:234`

**What is wrong:** On a PostgREST failure the helper does `throw new Error(error.message)`. The route catches it and puts `e.message` on the ack, inside HTTP 200. That string is the database’s own text (type name, column, constraint). The project’s rule is that this text stays in the server log.

The guard in `src/lib/sync/outboxResilience.test.ts` looks for `error.message` in a response-shaped expression. It does not match `throw new Error(error.message)` or `e.message`. Both spellings were checked against that regex and failed to match, which is why the routes stayed green.

**Reachable:** These routes require a Bearer user (`requireUser` in each file). While `PRIVATE_MODE` is on they also need a gate cookie (they are not public-API paths). A signed-in caller triggers it by sending a row the database rejects.

**Exploit sketch:** `POST /api/mobile/sync/workouts` with a valid user and `completedAt: "not-a-timestamp"`. Zod allows that string (`src/lib/apiSchemas.ts:340` is `z.string().max(40)` with no datetime check). Postgres rejects the `timestamptz` cast and the ack’s `error` field echoes `error.message`.

**Local proof:** `mobileSyncPushBodySchema` accepts `completedAt: "not-a-timestamp"` with a v4 `clientId`. The leak regex does not match the two spellings above.

**Patch:** Catch in the helper, log `error.message`, return a fixed code (`sync_failed`). Validate `completedAt`, `updatedAt`, and `deletedAt` as timestamps in the schema. Extend the leak regex (or scan the thrown `Error`) so `e.message` and `new Error(error.message)` fail the test.

## Dismissed

Each of these was a real-looking candidate. The call path does not let an attacker use it.

| Candidate | Why it was dropped |
|---|---|
| Stripe webhook forgery or replay-to-enroll | `validateStripeWebhookRequest` (`src/lib/api/stripeWebhookAuth.ts:9-27`) requires `STRIPE_WEBHOOK_SECRET`, the `stripe-signature` header, HMAC-SHA256 over `t.payload`, and a 300s window (`src/lib/stripeWebhook.ts:5-32`). `checkout.session.completed` returns `granted: false` and does not enroll (`app/api/stripe-webhook/route.ts:40-41`). Expired-session recovery upserts on `session_id`. |
| PayPal signature bypass | Headers are rejected unless `cert_url` is `https` and the host is `paypal.com` or `*.paypal.com` (`src/lib/paypalWebhookParse.ts:10-18`). Verification is PayPal’s own endpoint, not a local fetch of `cert_url` (`src/lib/paypalWebhook.ts:48-79`). The route is also parked: `paypal` is in `PARKED_BY_DEFAULT`, and `proxy.ts` returns 404 before the handler. |
| PayPal grants premium without checking the amount | True in `handleVerifiedPayPalEvent` (`app/api/paypal-webhook/route.ts:70-90`): any verified `PAYMENT.CAPTURE.COMPLETED` enrolls by payer email, and `custom_id` becomes `product_id`. Not reachable while the surface is parked. Re-check before `NEXT_PUBLIC_SURFACES` turns `paypal` on. |
| RevenueCat webhooks | No RevenueCat client, route, or secret in `app/`, `src/`, or `apps/android/`. |
| Crypto checkout replay / wrong-intent confirm | `extractUsdcTransferToTreasury` requires the intent’s reference pubkey on the transaction, a positive USDC delta to the treasury owner, and an exact micro-unit amount (`src/lib/cryptoCheckout/verifyTransfer.ts:42-77`, `81-90`). Intent load is scoped to the session user (`confirm.ts:34`). The whole prefix `/api/crypto-checkout` is parked with `cryptoRails`. |
| Server actions | No `"use server"` modules. |
| Unauthenticated premium catalog | Premium GETs are not on the public-API list. `isPremiumForUser` reads `enrollments` with the service role and ignores client flags in production (`src/lib/premiumServer.ts:19-27`, `38-75`). `DEMO_PREMIUM=true` is ignored when `NODE_ENV=production`. |
| Enrollment self-insert | `enrollments` has RLS and a SELECT policy only (`supabase/schema.sql:53-60`). No insert/update policy for `anon` or `authenticated`. |
| School class list / PIN column / fitness-test IDOR | `20260702_security_hardening.sql` revoked broad select and hid `teacher_pin`. `20260817_school_classes_revoke_anon_select.sql` revokes select entirely. `20260817_fitness_test_results_api_only.sql` revokes client insert. `school` and `youth` are parked, so `/api/school` and `/api/youth` 404 in `proxy.ts` before the handler. PIN compare is rate-limited inside the shared access gate (`src/lib/schoolClassAccess.ts`, asserted by `outboxResilience.test.ts`). |
| Leaderboard score spoof | `20260817_leaderboard_snapshots_server_write.sql` revokes client insert/update. The snapshot route recomputes from the caller’s logs. Signed-in SELECT of standings is the policy written in `20260702_security_hardening.sql:29-31` (names and country for a board). That is the intended read, not an IDOR. |
| Leads direct PostgREST spam | `20260705_leads_api_only.sql` drops the public insert policy. |
| Account export / delete IDOR | Both take the user id only from `auth.getUser` (`app/api/account/export/route.ts:29-34`, `app/api/account/delete/route.ts:35-42`). Body `userId` is not the actor. Delete ignores client `deviceId`. |
| Open redirect after login | `sanitizeNextPath` allows a fixed path set, rejects `//`, `\`, `@`, `..`, and control characters (`src/lib/safeRedirect.ts:52-73`). The auth callback redirects to that path on `configuredSiteOrigin()`. |
| Wearable OAuth code theft | State is verified before the code exchange (`app/api/wearables/oauth/[provider]/callback/route.ts:42-53`). `/api/wearables` is parked. |
| Meal-photo upload XSS / stored file | `app/api/fuel/estimate-meal/route.ts` caps the body at 6MB, requires `hasAppAccess`, and does not write the bytes to disk. The image is not reflected. `image/*` is a client MIME, so a non-image can be sent to the vision model when that model is configured and the caller is entitled; that is spend, not script execution. |
| Fuel search SSRF | Barcode digits and the search string are encoded into fixed Open Food Facts URLs (`src/lib/openFoodFacts.ts:42-46`, `61-65`). |
| Push-endpoint SSRF | `pushSubscribeBodySchema` is `z.string().url()` with no host allowlist (`src/lib/apiSchemas.ts:416`), and `webpush.sendNotification` will fetch that URL (`src/lib/pushServer.ts:85-90`). `deliver` returns before any fetch when VAPID is unset (`isPushConfigured`, `pushServer.ts:12-17`). `CONTEXT.md` records VAPID as unset. `/api/push/subscribe` is also behind the gate. The missing allowlist becomes a bug the day push is turned on: restrict the endpoint host to known push services before the first send. |
| Cron / health bearer forgery | Compare is `!==`, not `timingSafeEqual` (`app/api/cron/nudges/route.ts:154`, `app/api/health/route.ts:27`). A network timing attack on a high-entropy bearer is not a practical exploit, and a missing `CRON_SECRET` fails closed (503 on cron, 401 on deep health). Deep health does return a truncated Postgres message; that line is behind the bearer, and the leak allowlist names it on purpose. |
| Beta admin open when the secret is unset | `secret === process.env.BETA_ADMIN_SECRET` is not true for a missing env (`src/lib/api/betaAdminAuth.ts:36-37`). Email allowlist uses `getUser()`, not the JWT payload alone. |
| Private-gate password oracle | `matchesPrivateAccessPassword` compares with `timingSafeEqual` and still walks every code (`src/lib/privateSession.ts:85-96`). Query-string bypass is off in production unless `PRIVATE_ALLOW_QUERY_ACCESS=true` (`src/lib/privateGate.ts:116-120`). |
| CORS | No `Access-Control-Allow-Origin` reflection. Cookies are `SameSite=Lax` (`src/lib/privateSession.ts:112-118`). |
| CSP `unsafe-inline` / `unsafe-eval` | Present in `next.config.js:38-49`, enforced in production. No request sinks the attacker into HTML: JSON-LD uses `JSON.stringify` on catalog data, social and feedback render as text, and a catalog `</script>` breakout was not found in `src/data/`. Without a sink this is defense-in-depth, which `SECURITY.md` treats as out of scope. |
| XSS via `dangerouslySetInnerHTML` | The hits are JSON-LD and the email-off marker in `app/layout.tsx`. Not attacker-controlled. |
| Service-role key in the client bundle | `getSupabaseAdmin` is `server-only` (`src/lib/supabaseAdmin.ts`). No `.tsx` imports it. |
| Security-definer RPCs callable by anon | `mw_next_mission_id`, `mw_week4_retention`, and `mw_week4_retention_weekly` all `REVOKE` from `public`, `anon`, and `authenticated`. Profile triggers that freeze `email`, nudge columns, `referral_code`, `referred_by`, and `invited_via` skip only `service_role`. `20260817_profiles_protect_nudge_cols.sql` is recorded as applied. |
| `X-Forwarded-For` rate-limit spoof | `clientIp` uses the first hop (`src/lib/clientIp.ts:3-8`). On Vercel that hop is the platform client IP. Not shown to be client-controlled there. In-memory limits are a known ops gap (Upstash unset); they do not by themselves open a low-entropy secret. Invite codes are 32^5 (`src/lib/inviteCode.ts:13-16`). |
| Android exported components | `MainActivity` is the launcher and `mw://workout` view. Widgets are exported because `APPWIDGET_UPDATE` requires it. `WearMessageService` is exported because `WearableListenerService` requires it; it only accepts the app’s own paths and applies them to the local session (`WearMessageService.kt:21-46`). `usesCleartextTraffic` is false. |
| Android backup of the local log | `allowBackup=true` with no backup-rules file. Auto Backup goes to the user’s own Google account. `SECURITY.md` puts physical-device and own-account backup outside this pass. No `mw.privateAccessCookie` value is committed. `apps/android/app/build.gradle.kts:43-48` will bake `local.properties` into `BuildConfig` for a release build if a developer leaves it set; that is a footgun, and the tree does not contain a cookie today. |
| Committed live secrets | Working-tree scan (AWS `AKIA`, `sk_live_`, `sk_test_`, `whsec_`, `ghp_`, `xoxb-`, PEM blocks, `re_` tokens) hit fixtures only: `sk_test_` / `whsec_` in `src/lib/checkEnvLaunch.test.ts` and `.gitleaks.toml`, a PEM banner in `src/lib/graph/redact.test.ts`, and `re_` as a substring of identifiers such as `mw_form_score_…` (not a Resend key). History `sk_live_` matches are documentation placeholders (suffix not a live key alphabet; ellipsis or empty). `USDC_MINT_MAINNET` in `src/lib/cryptoCheckout/constants.ts` is the published mint. The treasury is `SOLANA_TREASURY_ADDRESS` from the environment, not a literal. |
| PII / health data in logs | `logCoachLlmMeta` records token counts and status, not the prompt (`src/lib/coachLlmClient.ts:249-260`). `withApiLogging` records route, method, status, duration. Sentry `sendDefaultPii` is false (`src/lib/sentryCommon.ts:22`) and the DSN is unset. Account delete logs the step name, not the email. |
| Free `/api/coach/trainer` | No session and no premium check, by design (`app/api/coach/trainer/route.ts:1-4`). Body is a single set plus an optional 280-character question, not a workout history. The route is behind the gate today. Treating it as a bug would contradict the free-trainer decision. |
| Dependency CVEs (`npm audit --omit=dev`, 2026-10-17) | 0 critical, 25 high, 8 moderate, across 494 prod deps. Traced, not listed as findings. `next` is high only because it depends on `sharp` below 0.35.5 (librsvg CVE). `next.config.js` sets no `images.remotePatterns`, and the meal upload does not call `sharp`, so an attacker cannot hand it a file. `axios` is not imported by `app/` or `src/`; it arrives through the Phantom SDK, and crypto checkout is parked. `bigint-buffer`, `uuid`, `jayson`, and `stream-json` sit under `@solana/web3.js`, which the parked confirm path calls with an operator RPC, not an attacker URL. `braces` / `micromatch` / `chokidar` are the Tailwind file watcher, build-time only. None of these have a request path that supplies the vulnerable input. |
| `20260824_profiles_open_session.sql` not applied | Adds `profiles.open_session`. It does not change grants. Not an auth hole. |

## What was covered

Authn/z and RLS (migrations through `20261009`, service-role call sites, `proxy.ts` public-API list, surface parking), all 78 `app/api/**/route.ts` handlers, server actions (none), injection sinks (`dangerouslySetInnerHTML`, `.ilike`, `.or`, Open Food Facts, Solana verify), secrets in the tree and `git log -S` for live-key prefixes, Stripe and PayPal signature checks, crypto confirm binding, IDOR on account, social, school, sync, and push, CORS/CSP/`vercel.json` headers, the meal upload, `npm audit --omit=dev`, Android manifest and `BuildConfig` fields, and log statements on the coach, account, and API paths.

Parked surfaces were still read. They are dismissed because `proxy.ts` 404s them before the handler, not because the handler was skipped.
