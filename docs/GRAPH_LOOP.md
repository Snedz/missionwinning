# Graph loop — continuation protocol

**Audience:** Founder + the next Cursor Cloud / graph agent  
**Lane:** Engineering-Web (unless a loop says Android)  
**Status:** ACTIVE 2026-08-14 · web `2026.07-unified.789` · Alpha 0.1.0  
**Does not replace:** [ORCHESTRATION.md](../ORCHESTRATION.md) (what may be built) · [CONTEXT.md](../CONTEXT.md) `## Now` (where we are) · [vision.md](../vision.md) (constitution) · [docs/THESIS.md](THESIS.md) (wedge) · [docs/PLAN.md](PLAN.md) (phases A–I)

This file is the **execution queue** for the agent graph: one concern per loop, spawn, ship, mark done, spawn the next. It is not a second status block and not a license to skip standing hard bans.

---

## This session — skip Horizon W (2026-08-14)

Founder: *skip Horizon W for now / this session. Continue assuming Horizon W passes. Make a plan. Do deep research. Build.*

| Still true | What this session does **not** do |
|------------|-----------------------------------|
| [ORCHESTRATION.md](../ORCHESTRATION.md) still names Horizon W as the standing NOW | Do not write `status: pass` in [EXCELLENCE_RESULT.md](EXCELLENCE_RESULT.md) — that remains founder phone sign-off |
| Surface PRs still need `Excellence-Override` while RESULT is `unscored` | Do not pull parked W loops 0–8 unless the founder unparks them |
| Hard bans (logger, `PRIVATE_MODE`, traction, America / wearables-as-score / iOS) | Do not invent ≥10 beta, EIN, or secrets |

**Active queue = Horizon 0+** (launch unblock after an assumed W pass). Parked W loops sit at the bottom of this file.

---

## What “the graph / loop” is

A standing cycle, not a chat:

```text
read spine → pick the top open loop here → one PR → tests + ship protocol
    → mark the loop done in this file → spawn the next agent with the prompt below
```

Recent turns:

| Turn | What it was | Outcome |
|------|-------------|---------|
| Kaizen nights | Wedge UX density | Merged (#222, #234) |
| Live-walk graph (sand, 2026-08-12) | Beta honesty | **Partial.** Merged #453 #454 #455 #462 #463 #464. Closed unmerged #451–#461 — harvest is parked with W |
| `.772`–`.779` | Form stills, coach RAG, LLM $ cap, Mission Server, PAR-Q, privacy program | On master. Craft window, not phone excellence sign-off |
| This file v1 | Horizon W queue 0–8 | Docs-only. **Parked** this session |
| This file v2 | Horizon 0+ queue (research 2026-08-14) | Docs |
| **H0-1** | PWA `start_url` flag-switch | `.780` this PR — **done** |
| **H0-2** | Launch env H0 vs H1 (FREE_BETA) | `.781` this PR — **done** |
| **H0-3** | API inventory + glob guard | `.787` — **done** |
| **H0-5** | Win Score → Mission Score leftover copy | `.788` this PR — **done** |
| **H0-6** | Guidebook chapter heroes | `.268` already paper; leftover glyphs `.789` — **done** |

---

## “Limitless” — how to read the founder ask

Map the path to the constitution. Prefer delete/refine and wedge depth over another planning memo. Do not refuse a loop because it is “too much product” if it is on **this** queue.

Agents still may not: flip `PRIVATE_MODE`, invent traction, mark founder tasks done, gate the free logger, start iOS / America marketing / wearables-as-score / locale-body farms without a **new** override, or spawn ten agents on one concern.

Ambition lives in the **queue**. Each running agent still ships **one loop**.

---

## Loop rules (every agent)

1. **Read** CONTEXT → AGENTS → INDEX → ORCHESTRATION → **this file** → the folder INDEX you will edit.
2. **Take only the top `open` loop.** If you finish early, stop. Do not start the next loop in the same PR (one concern).
3. **Investigate in source** before coding. If the loop’s claim is already false on master, mark it `done (already true)` with the file that proves it — do not restyle.
4. **Ship protocol** if you touch `src/`, `app/`, `scripts/`, or `supabase/`: bump `APP_BUILD_LABEL` **past master**, LOG + CONTEXT `## Now` in the same commit, `[skip vercel]` unless the founder asked for Preview, `Excellence-Override: <reason>` if the path class is `surface` while RESULT is unscored. Docs-only PRs do **not** mint a version.
5. **Hard bans (standing):** free logger never gated · no `PRIVATE_MODE` flip · no invented traction · no America/wearables-as-score/iOS · no chat on Today · do not raise `TAP_BUDGET` · do not steal occupied build labels.
6. **After merge:** edit this file — set the loop `done`, put the PR/label in the Outcome column, leave the next loop `open`. That edit is the baton.

### Stop the graph if

- Two loops in a row ship without moving an H0 agent-allowed item (or an explicit queue item)
- You are about to write another plan instead of executing the top `open` loop
- A loop requires a founder secret / postal / invite / env flip — mark it `founder` and take the next **agent** `open` row

Do **not** stop solely because RESULT is `unscored` while this skip-W note is in force.

---

## Queue

Status key: `open` · `done` · `parked` · `founder` · `blocked`.

### Now — Horizon 0 (agents)

Verified in source 2026-08-14 (master `.779`). Findings with proof paths: [§ Research](#research--verified-2026-08-14).

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **H0-1** | PWA `start_url` flag-switch (same predicate as SW) | Public-flip landmine | `done` — `.780` this PR |
| **H0-2** | `check-env --launch` vs FREE_BETA (H0 vs H1 profiles) | Launch-verify can succeed | `done` — `.781` this PR |
| **H0-3** | API INDEX + `docs/API.md` + PROGRAM_STATUS census | Docs match reality | `done` — `.787` |
| **H0-4** | Public-flip checklist: `start_url` curl + SW; runbook pointers | Flip-day smoke | `done` — docs |
| **H0-5** | “Win Score” → Mission Score leftover strings | Public copy honesty | `done` — `.788` |
| **H0-6** | Guidebook chapter heroes still navy/emerald | Design honesty before baselines | `done` — already `.268`; leftover glyphs `.789` |
| **H0-7** | Production-stack / runbook vs CONTEXT (Upstash, `.104`) | Docs match reality | `open` |

### After H0 (orientation — not open until H0-1…H0-7 are done or `founder`)

Do not pull these forward while H0 agent loops remain `open`.

| Horizon | Agent-allowed | Founder-only |
|---------|---------------|--------------|
| **1 — Public** | Offline + SW smoke after the flip; Search Console wiring; PostHog activation baseline **code**; residual 403 matrix | `PRIVATE_MODE=false`; VAPID / Sentry / Upstash / `CRON_SECRET` / `SMOKE_BASE_URL`; EIN → unmute Bundle; Lifetime vs Grok option 1/2/3 in runbook §5 (code default 15¢/day already `.775`) |
| **2 — PMF** | In-app return loop polish; interview-driven copy &lt;48h; one wall-metric SQL helper if the RPC shape is wrong | Week-4 proof SQL; 10 interviews; stop-acquisition call |
| **3 — Scale** | SEO compound, i18n bodies, TWA, wearables **as inputs**, iOS | Only after week-4 holds on two cohorts |

**Fuel estimate accuracy** is named remaining in ORCHESTRATION. Do **not** invent more NL tokens without founder dogfood. Not an open H0 loop.

**Two week-4 definitions already exist** — set-level in [docs/METRICS.md](METRICS.md) and workout RPC `mw_week4_retention()`. Do not invent a third.

### Parallel (do not jump the wedge)

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **A** | Android Accept B prep (`apps/android/**` only) | Play path | `open` — separate lane |
| **W** | `sites/www` remaining pages / host split | Marketing die | `open` — fourth surface, not the app. Spec §6 still lists about/vision/compare/press/bundle/private; tree is `index` · `start` · `week` only. Compare rail deleted `.668`. Host `www.missionwinning.com` is claimed by both Astro and Next — no `_redirects` / wrangler / deploy workflow. CSP `form-action 'self'` blocks cross-origin POST to `/api/leads`; invite CTA must keep linking Next `/private` ([`sites/www/src/lib/appLinks.ts`](../sites/www/src/lib/appLinks.ts)). |

### Founder (agents never mark done)

| Item | Why the graph cannot finish it |
|------|-------------------------------|
| `MAIL_POSTAL_ADDRESS` | Invite email hard-exits (`scripts/send-beta-invite.ts`, `src/emails/renderEmail.ts`) |
| Phone excellence `status: pass` | [EXCELLENCE_RESULT.md](EXCELLENCE_RESULT.md) |
| Android Accept B checkbox | [apps/android/FOUNDER_ACCEPT.md](../apps/android/FOUNDER_ACCEPT.md) |
| ≥10 invites | Public-flip gate |
| VAPID · `CRON_SECRET` · Sentry · Upstash · `SMOKE_BASE_URL` | Return loop / ops stay dark — CONTEXT Status table |
| EIN → unmute Bundle | [FREE_BETA.md](FREE_BETA.md) |
| `PRIVATE_MODE=false` | Founder only |
| Visual baseline bootstrap | Linux CI after Actions billing |
| CodeQL enable / secrets history scan / DMCA counsel | Founder |

### Parked — Horizon W (resume if founder unparks)

| # | Loop | Status |
|---|------|--------|
| W0 | Harvest closed live-walk PRs #451–#461 | `parked` |
| W1 | Phone hero: one next session | `parked` |
| W2 | Logger one-thumb outdoors | `parked` |
| W3 | Coach week earned from logs, on Coach **and** Today | `parked` |
| W4 | Missed-day re-entry, in-app only | `parked` |
| W5 | Form Index Wave D — next unique stills | `parked` |
| W6 | “Win Score” leftover strings | `done` — same as H0-5 `.788` |
| W7 | API INDEX drift | `done` — same as H0-3 `.787` |
| W8 | Guidebook chapter heroes | `done` — same as H0-6 `.268` / `.789` |

---

## Research — verified 2026-08-14

Do not treat this as a second `## Now`. Status → [CONTEXT.md](../CONTEXT.md). These are **code proofs** for the H0 loops.

### H0-1 — `start_url` is not flag-switched (load-bearing)

SW **is** flag-switched. Manifest **is not**.

- [`next.config.js`](../next.config.js): `pwaDisabled` when `privateGateActive` (CJS mirror of [`isPrivateModeEnabledFromEnv`](../src/lib/privateModeFlag.ts)). Preview short-circuit first.
- [`app/manifest.ts`](../app/manifest.ts): `start_url: '/private'` **hardcoded**. `id: '/log'` (stable — do not change).
- [`src/lib/pwaManifest.test.ts`](../src/lib/pwaManifest.test.ts): requires `start_url === '/private'` and **forbids** `/`, `/log`, `/active` **unconditionally**. After `PRIVATE_MODE=false` rebuild, this test would still demand the teaser.
- Pattern already used: [`sites/www/src/lib/appLinks.ts`](../sites/www/src/lib/appLinks.ts) (`INVITE_URL` vs `START_URL`); [`app/sitemap.ts`](../app/sitemap.ts) imports `privateModeFlag` (guard in `privateModeFlag.test.ts`).
- Manifest is **build-time**. Flip day is a rebuild. Gate builds already set `PRIVATE_MODE=false` so SW compiles — start_url must become `/log` in those builds.
- [`docs/archive/PUBLIC_FLIP_CHECKLIST.md`](archive/PUBLIC_FLIP_CHECKLIST.md) does **not** mention `start_url`. Offline spec needs the ungated build ([`tests/e2e/offline.spec.ts`](../tests/e2e/offline.spec.ts)).

**Ungated start_url is `/log` (Today), not `/active`.** `.768` made `/active` gate-public so a first set can happen while gated; the installed home after flip is Today, matching `id`.

**Preview** (`VERCEL_ENV=preview`) is ungated → start_url `/log`. That is correct for phone review.

### H0-2 — `LAUNCH_STRICT` cannot succeed during free-first public flip

**Landed `.781`.** `evaluateCheckEnv` in [`scripts/check-env.mjs`](../scripts/check-env.mjs): `--launch` is Horizon 0 while FREE_BETA is on (Stripe not required; `MAIL_POSTAL_ADDRESS` fails). `--paid` / `LAUNCH_PAID=true` / FREE_BETA off is Horizon 1 (today’s Stripe hard-fails). [`scripts/launch-verify.mjs`](../scripts/launch-verify.mjs) default stays `--launch`; it does not embed `--paid`.

Finding that justified the loop (pre-`.781`): `launchRequired` included `STRIPE_WEBHOOK_SECRET`; missing Checkout **and** Payment Link hard-failed; postal was warning-only; FREE_BETA was a log line, not a skip. Horizon 0 public flip is during FREE_BETA; EIN / unmute pay is Horizon 1. The founder still has to *set* `MAIL_POSTAL_ADDRESS`.

### H0-3 — API inventory drift

`find app/api -name route.ts` = **74** handlers. [docs/security/PROGRAM_STATUS.md](security/PROGRAM_STATUS.md) still says **71** and lists 9 missing from INDEX.

**Missing from [`app/api/INDEX.md`](../app/api/INDEX.md)** (verified by path substring 2026-08-14):

`account/mission-id` · `beta/feedback` · `beta/invites` · `beta/invites/landed` · `beta/invites/redeem` · `cron/day-review` · `health` · `metrics/week-logged` · `mobile/premium/play-purchase`

[`docs/API.md`](API.md) already has `GET /api/health` and `beta/invites` (+ landed/redeem). It does **not** have mission-id, week-logged, beta/feedback, cron/day-review, play-purchase.

Headers on those routes already say “See: app/api/INDEX.md, docs/API.md”. Discover remaining `route.ts` rather than copying this list — a name that claims “all handlers” must fail on an unreviewed file.

### H0-4 / H0-7 — checklists and runbook vs CONTEXT

[CONTEXT.md](../CONTEXT.md) `## Now` wins (`.178`). [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) §1 still talks `.104` / “CI billing cleared 2026-07-22”; §2b checks Upstash live; CONTEXT Status table: Actions exhausted, Upstash **unset**. Do not “fix” by copying the Status table into the runbook. Add a pointer: if the runbook disagrees, CONTEXT wins. H0-4 adds the missing `start_url` curl to the flip checklist.

### H0-5 — Win Score leftover copy (`done` · `.788`)

Athlete strings say Mission Score. Keys (`landingFreeWinScore`, `winScoreSeen`) unchanged. Guard: [`src/lib/missionScoreCopy.test.ts`](../src/lib/missionScoreCopy.test.ts).

### H0-6 — chapter heroes (`done` · already `.268` · leftover glyphs `.789`)

Every `public/learn/*.webp` measures 0–1% ink and ≥1% brand red. Guard: [`src/lib/guidebookHeroPalette.test.ts`](../src/lib/guidebookHeroPalette.test.ts). This pass only reminted “Win Score” baked into `getting-started-mw-hero` and `win-score-offline`.

### Also true (not a loop)

- Return-loop **code** shipped ([RETURN_LOOP_PLAN.md](RETURN_LOOP_PLAN.md)); **inert** without VAPID + SW (founder).
- `/bundle` still 307s to `/log` while free-beta ([`src/lib/bundleShop.test.ts`](../src/lib/bundleShop.test.ts)).
- `sites/www` photography 3 vs ~12 wanted — not blocking.

---

## H0-1 — PWA `start_url` flag-switch (`done` · `.780`)

**Concern:** After the founder sets `PRIVATE_MODE=false` and rebuilds, installed PWAs must open Today (`/log`), not the teaser. Today they would still open `/private` because the manifest is hardcoded and the test forbids any other value.

**Do this, then stop:**

1. Extract `pwaStartUrl(env)` next to the existing predicate — `isPrivateModeEnabledFromEnv` from [`src/lib/privateModeFlag.ts`](../src/lib/privateModeFlag.ts). Do **not** copy the Preview short-circuit into a third private function. Gated → `'/private'`. Ungated → `'/log'`.
2. [`app/manifest.ts`](../app/manifest.ts) calls `pwaStartUrl()`. Keep `id: '/log'`.
3. Rewrite [`src/lib/pwaManifest.test.ts`](../src/lib/pwaManifest.test.ts):
   - Source coupling: `app/manifest.ts` imports `pwaStartUrl` and has **no** `start_url: '/private'` literal (same shape as the sitemap guard in `privateModeFlag.test.ts`).
   - Env matrix on the helper: production+unset → `/private`; `PRIVATE_MODE=false` → `/log`; `VERCEL_ENV=preview` → `/log`; explicit `PRIVATE_MODE=true` → `/private`.
   - When gated, start_url is `isPrivateGatePublicPath`. When ungated, start_url is `/log` (not `/active`, not `/`).
4. Falsify: a mutant that hardcodes `start_url: '/private'` in `manifest.ts` must go red. A mutant that returns `/active` when ungated must go red.
5. `Excellence-Override: H0 PWA start_url flag-switch (founder skip-W 2026-08-14)` — `app/manifest.ts` is path class `surface`.
6. Ship protocol: label past master `.779`, LOG + CONTEXT `## Now`, `[skip vercel]`.

**Hard bans:** do not flip `PRIVATE_MODE`. Do not change `id`. Do not point start_url at `/active` (logger stays free; it is not the install home). Do not start H0-2 in this PR.

**Done when:** gated production still cold-starts `/private`; ungated / Preview / gate-build cold-start `/log`; tests kill the hardcoded-teaser mutant.

---

## H0-2 — Launch env profiles (`done` · `.781`)

**Concern:** `LAUNCH_STRICT=true npm run launch-verify` cannot go green on the planned free-first public flip.

**Shipped:** `evaluateCheckEnv` in `scripts/check-env.mjs`. `--launch` = H0 while FREE_BETA on (no Stripe; postal fails). `--launch --paid` / `LAUNCH_PAID=true` / FREE_BETA `false|0|off` = H1 (Stripe webhook + Checkout). `launch-verify` uses `checkEnvNodeArgs` — default has no `--paid`. Tests in `src/lib/checkEnvLaunch.test.ts`. No production env set.

**Hard bans:** do not start H0-3 in this commit. Founder still sets `MAIL_POSTAL_ADDRESS`.

---

## H0-3 — API inventory

**Concern:** 9 live handlers missing from INDEX; PROGRAM_STATUS census is 71 vs 74 files.

**Ship:** rows in `app/api/INDEX.md` **and** the five `docs/API.md` holes (mission-id, week-logged, beta/feedback, cron/day-review, play-purchase). Update PROGRAM_STATUS count by discovering `route.ts`. Guard: a test that globs `app/api/**/route.ts` and fails if INDEX has no substring for that path — so the next handler cannot go missing silently. No handler behavior change. Mark parked W7 done.

---

## H0-4 — Flip checklist `start_url`

**Concern:** The agent-prepared flip one-pager never asks what the baked manifest’s `start_url` is.

**Ship:** one curl + expected value in [PUBLIC_FLIP_CHECKLIST.md](archive/PUBLIC_FLIP_CHECKLIST.md) (gated: `/private`; post-flip rebuild: `/log`) and a pointer from [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) §5. Do not restate CONTEXT Status. Depends on H0-1 having landed (or land the curl as “after H0-1”).

---

## H0-5 — Mission Score leftover copy (`done` · `.788`)

**Shipped:** i18n values + packs + `export-locales`, guidebook/leaderboard/welcome leftovers, `missionScoreCopy.test.ts`. Keys and `winScoreSeen` unchanged. W6 marked done.

---

## H0-6 — Guidebook chapter heroes (`done` · `.789`)

**Already true:** `.268` paper/ink/one-red + `check-guidebook-heroes.mjs`. All 19 `public/learn/*.webp` measure 0–1% ink. **This pass:** leftover “Win Score” glyphs in two figures. W8 marked done.

---

## H0-7 — Runbook / scorecard vs CONTEXT

**Ship:** at the top of [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) §1 and [PRODUCTION_STACK.md](PRODUCTION_STACK.md) scorecard, one sentence: live ops facts live in CONTEXT `## Now`; if a checkbox here is older, CONTEXT wins. Uncheck Upstash-live if the runbook still claims it. Do not copy the Status table.

---

## Copy-paste prompt (next graph agent)

```text
You are the next Mission Winning graph-loop agent.

1. Read CONTEXT.md, AGENTS.md, INDEX.md, ORCHESTRATION.md, then docs/GRAPH_LOOP.md.
2. Implement ONLY the top loop whose Status is `open` (today: H0-7 runbook vs CONTEXT).
3. This session skipped Horizon W (2026-08-14). Do not unpark W0–W8. Do not write excellence status: pass.
4. Investigate on current master before coding. If the claim is already false, mark the loop done in GRAPH_LOOP.md with proof paths and stop.
5. One concern. One PR. [skip vercel] unless I asked for Preview.
6. If you touch src|app|scripts|supabase: bump APP_BUILD_LABEL past master, LOG + CONTEXT ## Now in the same commit. Excellence-Override if the excellence gate classifies the path as surface.
7. Free logger never gated. Do not flip PRIVATE_MODE. Do not invent traction. Do not start the next loop in this PR.
8. When done: set this loop to `done` in docs/GRAPH_LOOP.md (Outcome = PR + label) and leave the following loop `open`. If you shipped H0-3 / H0-5 / H0-6, also mark the parked W twin done.
```

To run H0-4 instead (after H0-3 is done), replace step 2 with “Implement H0-4 only.”

---

## Decade map (so the graph has somewhere to go)

Unchanged constitution; gates in ORCHESTRATION. Orientation, not a build ticket.

| Stage | Product | Unlock |
|-------|---------|--------|
| **Year 1 — earn the wedge** | Free offline logger + Mission Coach from logs. Web PWA + Android. Guidebook as SEO. | Excellence pass → ≥10 beta → public → week-4 |
| **Years 2–3 — deepen pillars** | Fuel/Move/Mind/Track/Learn premium depth. iOS. Locale bodies. Wearables as inputs. | Week-4 holds on two cohorts |
| **Years 4+ — platform** | B2B/schools/teams, human coaching ops, Foundation scholarships. Free core still free. | Retention + revenue, legal, founder |

Pitch stays **Train + Mission Coach**. Never “everything app.”

---

## Related

- Horizons / forbidden: [ORCHESTRATION.md](../ORCHESTRATION.md)  
- Phone sign-off: [docs/EXCELLENCE_RESULT.md](EXCELLENCE_RESULT.md)  
- Launch (founder): [docs/LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md)  
- Public flip smoke: [docs/archive/PUBLIC_FLIP_CHECKLIST.md](archive/PUBLIC_FLIP_CHECKLIST.md)  
- Form media: [docs/MEDIA_SYSTEM.md](MEDIA_SYSTEM.md) · `src/lib/formMedia.ts`  
- Return channel: [docs/RETURN_LOOP_PLAN.md](RETURN_LOOP_PLAN.md)  
- Agent playbooks: [docs/AGENT_RECIPES.md](AGENT_RECIPES.md) recipe 11
