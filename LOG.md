# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep ≤15 entries / ≤20KB here. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22).

---

## 2026-07-24 — OSS public-ready + lean CI / prod path

- **CI minutes:** `ci.yml` PR-only lean gate; heavy e2e/Android/smokes → `ci-extended.yml` (manual/weekly); CodeQL monthly+dispatch; Aikido PR-only. Master push no longer burns minutes racing production.
- **Prod:** keep `deploy-production.yml`; checklist adds Deploy Hook webhook (zero Actions minutes) + billing/secrets founder steps.
- **OSS:** CoC, `docs/OPEN_SOURCE.md`, README badges, Profile footer **Source** → GitHub (AGPL §13). Founder flips repo Public when ready — no `PRIVATE_MODE` change.

## 2026-07-24 — Fuel train-day targets (Wave A)

- Rings/budget adapt from **workout history** load (heavy/training/rest) via shared fuelCoach rules.
- Banner chip + delta; **Use base** / **Match training** toggle (`mw_fuel_adapt_enabled`).
- Base targets still editable; week glance stays on base. Tests: `fuelDayAdapt`.

## 2026-07-24 — Fuel goal wizard + weight strip (Wave T/W)

- **Set from goal:** lose / maintain / gain → Mifflin + activity macros (`fuelGoalWizard`, Fuel UI next to Edit targets).
- **Weight on Fuel:** log today’s weight + 7d delta/mini trend (`mw_body_metrics`, shared with Track).
- Help: goal table + weight; tests for goal math.

## 2026-07-23 — Free beta: full More nav (`.122`)

- `extendedNavSectionsForPhase`: free beta always returns full More minus Bundle (i-day/basic no longer train-only).
- Softened unlocked Super Bundle labels (Fuel recipes title, Learn empty state, Android Coach depth chips).
- Build: `2026.07-unified.122`.

## 2026-07-24 — Fuel speed logging (competitive Wave S)

- Steal from MacroFactor/Lose It/MFP: **Recent** rail (1-tap re-log), **servings** ½–3× on draft, Enter picks top search hit, larger remaining budget.
- Compare matrix in plan session; no micros/social. Tests: `getRecentFoods`, `scaleMealMacros`.

## 2026-07-24 — Fuel calorie tracker pass 7

- **Help + ENV:** accurate Fuel logging guide; `MEAL_VISION_*` founder notes.
- **Toasts** on log / edit; copy-day skips exact duplicates already on today; quiet multi-add for yesterday/copy.

## 2026-07-24 — Fuel calorie tracker pass 6

- **Past days:** browse last 14 logged days + **Copy to today**.
- **Recipes:** Use → review draft before log (free + premium).

## 2026-07-24 — Fuel calorie tracker pass 5

- **Persistence:** single merge of today list → 90-day local history (fixes stale allLogs duplicates).
- **Week glance:** 7-day calorie bars from local log vs target.
- **Edit → cloud:** best-effort append of corrected macros when signed in.

## 2026-07-24 — Fuel calorie tracker pass 4

- **Edit** logged entries (pencil → same draft card → save).
- **Clear day** prunes today’s rows from full nutrition log storage.
- **Custom log sheet:** carbs + fat fields.

## 2026-07-23 — Fuel calorie tracker pass 3

- **Targets editor** on Fuel (cals/protein/carbs/fat → `mw_macro_targets`).
- **Barcode/search** → review draft before log (same `MealEstimateDraft`).
- **Today’s meals** ordered B/L/D/snack with per-meal protein/kcal subtotals.

## 2026-07-23 — Fuel calorie tracker accuracy pass 2

- **NL:** more foods; `50g` / cups portion scaling; low-confidence embeds Open Food Facts search into draft.
- **Day totals:** calories left/over + protein left on Fuel overview.
- Tests: grams scale case + prior suite green. Commit `d0fd15c`.

## 2026-07-23 — Fuel calorie tracker accuracy pass

- **NL meals:** expanded food dictionary, per-item quantities (`3 eggs`), conservative low-confidence fallback; always **edit-before-log**.
- **Photo:** honest source labels (vision / rough / database); OFF matches fill draft; shared `MealEstimateDraft` for corrections.
- Tests: `nlMealLog.test.ts` green.

## 2026-07-23 — Web UX pass 6: History/Compare + secondary pillars

- **History:** “Past sessions”, calm at-a-glance card.
- **Compare + PublicSeoHeader:** wedge-accurate rows; no “everything app” pitch; quieter SEO chrome.
- **Move/Mind/Track/Learn/Leaderboard/Feedback:** human titles; free-beta honest; Today coach invite card.

## 2026-07-23 — Web UX pass 5: Profile + marketing shell

- **Profile:** human subtitle, account card free-beta foot, quieter journey setup.
- **Marketing nav/footer:** sentence-case brand, no glass/mono tagline theater; free-beta hides Bundle.
- **Landing:** hero/section titles sentence-case; CommandersIntent → calm “Today’s focus”.

## 2026-07-23 — Web UX pass 4: Welcome + Active logger human craft

- **Welcome:** drop texture/ALL CAPS briefing; real progress bar; “Welcome” + quiet session cards.
- **Active:** rest dock labels, quieter Victory (session locked, no brass glow theater), calmer tips/PR.
- **Session check-in:** default z-index via AdaptiveOverlay portal; human eyebrow copy.

## 2026-07-23 — Web UX pass 3: shell chrome less template-AI

- **In-app headers:** sentence-case PillarPageHeader / Today title (drop briefing mono caps).
- **Nav:** solid quieter MobileNav + AppHeader; Coach active path matching.
- **Empty states / coach insight / score foot:** human type + free-beta honest footers.
- **content-card:** lighter shadow system-wide in app surfaces.

## 2026-07-23 — Web UX pass 2: Today + Coach organic + free-beta honesty

- **Coach:** free-beta never hard-locks next week; quieter chrome; no brass glow lock card.
- **Today:** calmer JourneyHero / journey strip; coach invite card; human Just Go copy.
- **Fuel macros:** drop emerald card glow; vision page de-emphasizes “everything app”.

## 2026-07-23 — Web UX: Log food fix + wedge nav + organic landing

- **AdaptiveOverlay:** portal to `document.body`, body scroll lock, `z-[70]` above MobileNav — fixes clipped Log food sheet inside `AppLayout` overflow shell.
- **Nav:** primary tabs **Today · Train · Coach · Fuel · You**; Track moved to More menu.
- **Fuel:** honest free-beta copy (no “paid Nutrition course”); calmer Log food sheet; science notes collapsed by default; human page title.
- **Landing:** quieter hero (less orbs/texture/glow theater); wedge copy stays Train + Coach.
- Docs: [ADAPTIVE_LAYOUT.md](docs/ADAPTIVE_LAYOUT.md).

## 2026-07-23 — Beyond the Basics v1.4.1 (acquisition polish)

- **Media:** `getting-started-mw` chapter hero; section figures on ch2-s2/s3, ch3-s1/s2, ch5-s2, ch6-s2 (7 total with existing ch2-s1); [`media/manifest.json`](media/manifest.json) + originality log.
- **Links / copy:** denser `relatedExerciseIds` on movement/programming/recovery/benchmark sections; light polish on thin free bodies; meta **1.4.1**.
- **PDF:** regenerated `public/magazine/beyond-the-basics.pdf` (~27 pages). Still 6 free chapters / 18 sections — no Horizon W expansion.

## 2026-07-23 — Scout brand mascot (Duolingo → MW)

- [docs/MASCOT.md](docs/MASCOT.md): Scout geometric falcon — celebrate logs, never shame; placement matrix.
- Kit: `public/brand/mascot/` (idle / invite / celebrate + SVG mark) · Flow prompts · `mascot-*` inbox optimize.
- Phase A social docs · Phase B History empty · Phase C Victory sheet flourish. Not on Train logger.

## 2026-07-23 — Google Flow HQ media path

- Free Flow credits (≈50/day, Veo Lite/Fast/Quality) are the **primary** Learn/social HQ generator; form guides stay SVG.
- [media/FLOW_PROMPTS.md](media/FLOW_PROMPTS.md) copy-paste queue · `media/inbox/` drop zone · `npm run media:optimize-inbox`.
- Docs: [MEDIA_SYSTEM.md](docs/MEDIA_SYSTEM.md) Wave 3. No Flow keys in the product — founder generates in Flow UI.

## 2026-07-23 — Media asset system (`.121`)

- [docs/MEDIA_SYSTEM.md](docs/MEDIA_SYSTEM.md) + [`media/manifest.json`](media/manifest.json): form / Learn / art / social pipeline (offline gen → approve → static).
- Instructional form SVGs: replaced 15 placeholders + 15 expansion movements; FormGuideSheet dark frame + caption; light SMIL on heroes.
- Guidebook `heroImage` / `figure` → web + magazine print; 5 Learn heroes in `public/learn/`; social stills in `public/social/`.
- Android: `FormGuideMedia` + `MwFormGuideSheet` on Active (same CDN `/form-guides/{id}.svg`).
- Build: `2026.07-unified.121`.

## 2026-07-23 — Pre-EIN interim payments (docs)

- Texas LLC filed (Bizee, ~4 weeks) + EIN pending: document path to take beta payments **without** business Stripe/PayPal.
- [LLC_AND_PAYMENTS.md](docs/LLC_AND_PAYMENTS.md) §1d — Stripe **individual/sole prop** primary; Phantom list Lifetime parallel; manual Venmo/Zelle escape hatch; migrate when EIN lands.
- [LAUNCH_RUNBOOK.md](docs/LAUNCH_RUNBOOK.md) §4 pre-EIN checklist · [PRE_REVENUE_CHECKLIST.md](docs/PRE_REVENUE_CHECKLIST.md) interim exception · [STRIPE_PREMIUM_SETUP.md](docs/STRIPE_PREMIUM_SETUP.md) pointer.
- Founder still owns: open individual Stripe, wire live keys, test purchase, treasury ATA, LLC migration.

---

## 2026-07-23 — Free beta unlocks full depth (`.120`)

- Free-first mute kept; **also** unlock premium depth for everyone (`isPremiumBypassEnabled` / `usePremium` / Android `MwFreeBeta`) — Coach chat, Fuel Coach, catalogs. No credits wallet.
- Build: `2026.07-unified.120`. Docs: [docs/FREE_BETA.md](docs/FREE_BETA.md).

## 2026-07-23 — Free-first beta mute (`.119`)

- `NEXT_PUBLIC_FREE_BETA` / `isFreeBeta()` (default ON) + Android `MwFreeBeta.ENABLED`: hide Bundle, UnlockButton, LockedPreviews, nav/marketing paid CTAs, Play subscribe, crypto Lifetime.
- `/bundle` redirects to `/log`. LLC §1d overridden — no individual Stripe until EIN. Docs: [docs/FREE_BETA.md](docs/FREE_BETA.md).
- Build: `2026.07-unified.119`.

## 2026-07-23 — Adaptive layouts web + Android (`.118`)

- Web: `AdaptiveOverlay` (compact bottom sheet / md+ centered dialog); Fuel log pilot + two-column xl; SessionCheckIn, PlateCalculator, AdjustSession migrated; Victory dialog widened; AppLayout `xl:max-w-4xl 2xl:max-w-5xl`.
- Android: `MwWidthSizeClass` + `MwAdaptiveOverlay`; Active confirms + plate calculator; gallery demo. Docs: [docs/ADAPTIVE_LAYOUT.md](docs/ADAPTIVE_LAYOUT.md).
- Build: `2026.07-unified.118`.

## 2026-07-23 — Region defaults for language + units (`.117`)

- First visit: `/api/geo` reads Vercel/Cloudflare country → default language (APP_LANGS) + units (imperial for US/LR/MM). Profile/Guide choices set explicit flags and are never overwritten.
- Build: `2026.07-unified.117`.

## 2026-07-23 — PKCE via @supabase/ssr cookies (`.116`)

- “PKCE code verifier not found” after Google: browser client now `createBrowserClient` (cookie verifier); `/auth/callback` is a Route Handler that `exchangeCodeForSession` server-side and mints the private-gate cookie.
- Build: `2026.07-unified.116`. Still requires Supabase Site URL = www.

## 2026-07-23 — OAuth must not land on *.vercel.app (`.115`)

- Google after www was returning to `*.vercel.app/private` when Supabase Site URL was a Vercel alias. Auth redirect now prefers `NEXT_PUBLIC_SITE_URL` and never uses ephemeral vercel.app; `/auth/callback` on vercel.app bounces to www with the same `?code=`.
- **Founder:** Supabase → Auth → URL Configuration → Site URL = `https://www.missionwinning.com` (required). Build: `2026.07-unified.115`.

## 2026-07-23 — Google sign-in vs private gate (`.114`)

- After Google OAuth, session lives in localStorage so the proxy never saw auth and bounced to `/private`. Auth callback (+ gate page recovery) now mints `mw_private_access` via `POST /api/private-access/session` after `getUser()`.
- Build: `2026.07-unified.114`.

## 2026-07-23 — Free Coach week not Bundle paywall (`.113`)

- Victory → `/coach` showed brass “Coach chat is Super Bundle” above the free week. Chat lock demoted to a soft tip; `?ask=` shows free form cues. Session cards come first.
- Copy: free week (not lifetime taster). Build: `2026.07-unified.113`.

## 2026-07-23 — Logger UX density web+phone (`.112`)

- Active chrome: sticky compact header (timer/Finish), Plates/Discard overflow, coach tip one-liner, inline add-exercise; removed duplicate eyebrow + Coach Notes card.
- Exercise footer: Add Set + rest icon; Apply/Remove behind More. SetLogRow narrow overflow + md wider weight. Rest dock slightly tighter (`pb-36`).
- Build: `2026.07-unified.112`.

## 2026-07-23 — Dense mobile set logger (`.111`)

- Active logger phone density: cues off-card (Form guide + Info), overflow for Note/Swap/SS/Ask/Remove, Strong/Hevy nowrap reps × weight × Log, exercise stack `space-y-3`.
- FormGuideSheet footer: Ask about form → `/coach?ask=`.
- Build: `2026.07-unified.111`.

## 2026-07-23 — Horizon W wedge excellence (`.110`)

- **Policy:** Replaced H0 agent freeze with Horizon W — build Train→Today→Victory→Coach until founder phone sign-off; ≥10 beta is flip gate only ([ORCHESTRATION.md](ORCHESTRATION.md), [AGENTS.md](AGENTS.md), [CONTEXT.md](CONTEXT.md)).
- **W1–W4:** I-Day finishes into `/active`; Basic = first workout only; set row “More” disclosure; Victory stays in Coach/train; free weekly Coach (no lifetime taster lock); Today Coach dose line.
- Build: `2026.07-unified.110`. **Founder:** walk phone path and score excellence before recruiting.

## 2026-07-23 — Exercise as medicine thesis + habit-loop polish (`.109`)

- Docs: [docs/EXERCISE_AS_MEDICINE.md](docs/EXERCISE_AS_MEDICINE.md) (cites + claim table); vision / STRATEGY / YC / brand / LEGAL / social / beta wired; About + soft landing/Learn copy. Wedge unchanged (Train + Coach).
- Product: Coach week “dose” line; victory 1-tap feel → readiness; shame-free missed-day re-entry CTAs; Coach chat + insight claim hygiene.
- Build: `2026.07-unified.109` — promote www after Ready. Founder bottleneck still ≥10 beta + phone hero QA.

## 2026-07-22 — Landing FAQ raw keys (`.108`)

- FAQ used `t(key)` with no `defaultValue` while full catalogs hydrate after interaction/2.8s — showed `landingFaqFreeQ` etc.
- Fix: FAQ defaults on keys + bootstrap EN FAQ strings; hydrate ends with `changeLanguage` so UI refreshes.
- Build: `2026.07-unified.108` — promote www after Ready.

## 2026-07-22 — Emerald glow + homepage craft (`.107`)

- **Landing:** hero ambient orbs + stronger `.hero-field` emerald bloom; demo slot `card-elevated card-glow-emerald`; Win Score ring glow; `primary-action` emerald shadow; brand eyebrow live + emerald title accent; ≤1 glow (hero only).
- **Today:** Mission Score `ProgressRing` `glow`; shared `.ring-glow-emerald` bloom + SVG drop-shadow.
- Build: `2026.07-unified.107` — promote www after Ready.

## 2026-07-22 — Responsive layout + Today score presence (`.106`)

- **Landing:** narrow viewports center hero copy/CTA; landscape short-height compact 2-col; `.hero-copy` / `.hero-orient-grid` utilities.
- **Today:** Mission Score `ProgressRing` + readiness/strain/recovery `MetricsRow` above the fold (parity with HeroDemo); sparklines stay in Trends details; `today-shell` safe-area.
- Build: `2026.07-unified.106` — promote www after Ready.

## 2026-07-22 — Hero a11y + logic polish (`.105`)

- **Logic:** `workoutStore.hasHydrated` gates Active Start (persist wipe race); e2e waits for enabled Start + dismisses check-in.
- **a11y:** SessionCheckIn focus trap / Escape / Skip 44px; EmptyState + SetLogRow + Beta banner tap targets; rest `motion-reduce`; gate `role="alert"`; axe covers `/active`, `/private`, `/nutrition`.
- **Craft:** Today e2e asserts one `.primary-action`; BetaWelcomeBanner muted (no competing emerald chips).
- Build: `2026.07-unified.105` — promote www after Ready.

## 2026-07-22 — Horizon 0 agent unblock (CI + ship `.104`)

- **Ship:** D4 composure + red/blue S2 + build `2026.07-unified.104` to master (Deploy production should promote www).
- **CI:** CodeQL Analyze `continue-on-error` until Code scanning enabled; Aikido skip via env gate (no more 0s fail when secret unset).
- **Aikido triage:** issues feed still disabled — Phantom/Solana mapped in [SECURITY_AUDIT_TRIAGE.md](docs/SECURITY_AUDIT_TRIAGE.md) + [AIKIDO.md](docs/AIKIDO.md).
- **Founder still (agents do not mark done):** verify `/api/health` = `.104`; enable Code scanning; phone QA + ≥10 invites; Accept B; Sentry DSN; Aikido permissions + `AIKIDO_SECRET_KEY`.

## 2026-07-22 — Pre-launch red/blue S2 (security)

- **Red:** www `security-smoke` + `rate-limit-smoke` green; gate/premium/webhook/crypto/coach probes hold; hero e2e 11/11 + coach lock teasers pass.
- **Blue:** `private-access` → Upstash `rateLimitAsync`; `fuel/estimate-meal` requires `hasAppAccess`; school PIN GET removed; crypto confirm row-race; gate-smoke extended.
- **Founder still:** rotate `VERCEL_TOKEN`, enable CodeQL, promote `.104`+, Sentry DSN, invites + phone QA.
- Build label remains `2026.07-unified.104` (D4); promote after push.

## 2026-07-22 — D4 beta composure (founder override · `.104`)

- **Why:** Website still read as six-pillar magazine; late Today as dashboard — not beta/investor-ready after D0–D3 heroes.
- **Website:** Landing cut to ~5 bands (Hero · Coach · Free · FAQ · CTA); nav ghost Start; HeroDemo muted CTA; `/experience` off footer; kill “everything app” in metadata/About/Press/brand/manifest.
- **Bundle:** one story + one offer card; compare collapsed; no pillar tile farm / unlock link farm.
- **Web Today:** QuickLinks + accordion under one collapsed More; wedge encouragement copy.
- **Android:** Today secondary cards `elevated=false` — only session hero elevated+glow; FOUNDER_ACCEPT D4 prep note.
- Build: `2026.07-unified.104`. Founder: promote www · Accept B re-walk · beta ≥10.

## 2026-07-22 — Post-RFS next actions (agent slice)

- Positioning done → distribution > features. Agent-allowed: push e2e-critical Active/Fuel unblock; verify `npm run seed-coach-adapt-demo`; refresh [BETA_INVITE.md](docs/BETA_INVITE.md) status to `.103`.
- **Founder still owns (not marked done):** recruit ≥10, phone hero QA, film 60s demo, CDL Jul 24, Wave A + promote `.103`, public flip, YC Jul 27.
- No pillars / RFS product / F5.

## 2026-07-22 — Fall 2026 official RFS sync (docs)

- Aligns shipped positioning pack to [ycombinator.com/rfs](https://www.ycombinator.com/rfs): batch intro (healthcare / stay healthy seat), Consumer AI agent+token curve, Primer K-12 product ask vs pattern-only boundary.
- Updates: [docs/YC_THESIS.md](docs/YC_THESIS.md), [YC_ANSWERS.md](docs/applications/YC_ANSWERS.md), applications INDEX + ACCELERATOR_SPRINT pointers.
- No product/landing change. Stance unchanged: Primer pattern + Consumer timing; wedge = Train + Coach.

## 2026-07-22 — YC RFS positioning pack (Mission / Vision / Team Humanity)

- Locks three layers: Team Humanity north star · Primer + Consumer AI fundraising narrative · Train+Coach wedge (never collapse).
- [docs/YC_THESIS.md](docs/YC_THESIS.md): Mission/Vision/Values, Team Humanity pillar map, RFS fit matrix (claim/secondary/non-claim), Consumer AI why-now.
- [vision.md](vision.md): Mission & Vision header + Team Humanity fronts table; wedge vs constitution note updated.
- Sync: [YC_ANSWERS.md](docs/applications/YC_ANSWERS.md), [applications/INDEX.md](docs/applications/INDEX.md), [ACCELERATOR_SPRINT.md](docs/ACCELERATOR_SPRINT.md).
- No product/landing change; no Elon/Primer consumer branding. Horizon 0 unchanged.

## 2026-07-22 — Primer-shaped vision + YC thesis (docs)

- Interprets YC *The Primer* RFS as fundraising craft (privilege → possible → entry → greater ambition); maps to Train+Coach wedge + lifelong adaptive coach.
- Updates: [docs/YC_THESIS.md](docs/YC_THESIS.md) § Narrative arc + Problem/Solution/Why now; [vision.md](vision.md) “coach that grows with you”; STRATEGY positioning; [YC_ANSWERS.md](docs/applications/YC_ANSWERS.md) paste voice.
- No product/landing change; no consumer Primer/Stephenson branding. Horizon 0 scope unchanged.

## 2026-07-22 — CI e2e-critical unblock (hero Active + Fuel)

- **Root cause:** `SessionCheckInSheet` overlay + Zustand persist race wiped Start; tests still expected removed `Set logged!` toast; Fuel expand flaky.
- **Fix:** seed complete today's mind check-in in journey helpers; `startEmptyActiveWorkout` retry helper; assert Rest timer not toast; Fuel Coach expand with `toPass`; FuelMealPlanCard above free recipes; RestTimerBar `transition-[width]`; commit Linux `@visual` baselines.
- **Still founder-owned:** rotate `VERCEL_TOKEN`; enable CodeQL code scanning.
- Verify: 16/16 local mobile-chrome hero + logger-depth + premium-pillars.

## 2026-07-22 — Pre-launch craft sprint (web .103)

- **Track 1:** Ops docs — VERCEL_TOKEN rotate + CodeQL enable; hero quality bar verified (no named #1 phone-QA bug yet).
- **Track 2:** ProfilePage → profile cards (~299 lines); NutritionPage → FuelQuickLogPanel/MoreTools; lint hook warnings cleared.
- **Track 3 (D3 override):** `npm run check-token-sync`; danger token aligned; Fuel FAB demoted; Move/Mind/Learn one-emerald CTA; i18n Batch C IT/RU/KO/JA depth; DESIGN_ORCHESTRATION D3 in-progress→shipped.
- Build: `2026.07-unified.103` · promote www after CI Ready.

## 2026-07-22 — Design D-prelaunch (web .102 · Android 1.24.1)

- **Today:** Mission Score + coach line above fold; rings/sparklines/muscle in collapsed details.
- **Active:** mono session brief; readiness chrome demoted below sets; oversized RestTimerBar.
- **Victory:** one emerald next; History/Share quiet text links.
- **Landing:** HeroDemo dominant plane (no art wash / inset card).
- **Gate/Beta:** briefing chrome — forms without content-card stacks; beta steps as mono list.
- **Android:** Today Form+insight without elevated card; rest clock 80sp Text; Victory duration/sets Neutral (brass = volume honor).
- Build: `2026.07-unified.102` · Android `1.24.1` / versionCode 53.

---

## 2026-07-22 — Design D1+D2 founder override (web .101 · Android 1.24.0)

- **Override:** Horizon gates waived for conversion + retention emotion craft (excellence before beta/public).
- **D1 Landing:** brand in hero · one CTA · product proof only (no dual CTAs / PR sticker / experience link).
- **D1 Welcome:** 3 steps (welcome → profile → signin); mission folded into Begin; 3 questions (no days/week UI); cinematic mono progress.
- **D1 Bundle:** thin hero (one brass badge); pillar story before tabs; removed duplicate in-tab pillar grid.
- **D2 Victory:** web lock animation + brass volume + one next; Android volume as brass honor line.
- **D2 Today:** Mission Score + coach line under number; Android Form score + insight under number.
- **D2 Coach adapt:** glanceable (≤1 beat compact / ≤3 full).
- Build: `2026.07-unified.101` · Android `1.24.0` / versionCode 52.

---

## 2026-07-22 — Crypto rails thesis (docs)

- Added [docs/CRYPTO_RAILS_THESIS.md](docs/CRYPTO_RAILS_THESIS.md): MW uses stablecoin/Phantom as **payment rails**, not a crypto product pivot (YC/Nemil “best time to build” lens).
- Wired: YC_THESIS Why now + non-pitch · LAUNCH_RUNBOOK §4 · ORCHESTRATION/CONTEXT · INDEX + docs/INDEX.
- No product/code changes — rails remain `src/lib/cryptoCheckout/` + Phantom Lifetime verify on launch checklist.

---

## 2026-07-22 — Design Orchestration D0 (web .100 · Android 1.23.1)

- **OS:** [docs/DESIGN_ORCHESTRATION.md](docs/DESIGN_ORCHESTRATION.md) — emotion arc, quality bars, craft waves D0–D3; wired into INDEX + ORCHESTRATION Design lane + Android UX/INDEX.
- **Research:** Wave 7 steal/avoid/own synthesis in [docs/DESIGN_RESEARCH.md](docs/DESIGN_RESEARCH.md).
- **Web Today:** Single emerald CTA — demoted coach invite, Rankings QuickLink, Mission Score glow, journey/header primary chrome; muscle REC → brass.
- **Web Active:** PR = inline brass chip + haptic (no toast); RestTimerBar clock-in-ring; SetLogRow hide Apply/Use last when seeded.
- **Android:** Mission insight + rest dock glow demoted; floating PR chip removed; VIEW chip Neutral; Accept B agent prep for D0. Founder still owns Pass.
- **Review:** DESIGN_REVIEW D0 pass logged. D1/D2 horizon-gated (documented, not shipped).
- Build: `2026.07-unified.100` · Android `1.23.1` / versionCode 51.

---

## 2026-07-22 — Web .99: eslint CI cleanup

- Removed obsolete `@next/next/no-img-element` disables (rule not in flat config).
- Fixed OtpInput `aria-invalid` on `role="group"`; intentional autofocus disables for invite/OTP.
- Trimmed redundant guide i18n `useMemo` deps; BodyMetrics refresh ticks; unused Button import.
- GitHub Pro unblocked Actions; lint was the remaining `build-and-test` failure.
- Build: `2026.07-unified.99`. Verify: `npm run lint` + `npm run typecheck`.

---

## 2026-07-22 — Android 1.23.0: wedge UX overhaul (founder override)

- **Designsystem:** `MwMotion`, spacing/radius/color tokens, hero cards, stronger hub selected state; debug gallery extended; [UX.md](apps/android/UX.md) principles (one composition, brand-first Today, logger-first Active).
- **Screens:** Active current-set hero + Now/Up next/Done; Today Start hero above metrics; Victory single ritual card; Coach adapt first + week tiles; I-Day shorter copy; Account Preferences/sync above fold.
- **Nav:** stack transitions use `MwMotion` durations. Room/sync unchanged. No F5.
- Version `1.23.0` / versionCode 50. Founder re-walk Accept B before Internal.
- Verify: `./gradlew :app:assembleDebug :app:testDebugUnitTest` · `./scripts/release-smoke.sh` · `wedge-adb-walk.py`.

---

## 2026-07-22 — H0 beta sprint packaging (docs)

- **Founder path:** LAUNCH_RUNBOOK §1 billing annotation + §3 sprint to **2026-08-02**; BETA_INVITE sprint checklist; CONTEXT `## Now` framed as beta sprint.
- **Flip prep:** PUBLIC_FLIP_CHECKLIST marks growth/week4/rate-limit/build-label green on prod `.98`; `LAUNCH_STRICT` + Linux visual + CI still founder-blocked (secrets / billing / Sentry).
- **Agent:** no named tester confusion; `LAUNCH_STRICT` cannot run without `SUPABASE_SERVICE_ROLE_KEY` + `STRIPE_WEBHOOK_SECRET`. No product decoration.

---

## 2026-07-22 — Android 1.22.0: extract `:feature:auth` (F3.1 / F11)

- **Bridges:** `HealthConnectAccountBridge` + `CrashReportingBridge` registered from `MwApp`; HC writer + Sentry stay in `:app`.
- **Move:** `AuthScreen` / `AuthViewModel` / `AuthPrefsFeedback` (+ unit test) into `:feature:auth`; NavHost passes BuildConfig version/API labels.
- Version `1.22.0` / versionCode 49. F3.1 Done; F5 still gated. Verify: `./gradlew :app:assembleDebug :feature:auth:testDebugUnitTest :app:testDebugUnitTest`.

---

## 2026-07-22 — Web .98: launch smokes aligned with gate allowlist

- **gate-smoke:** `/welcome`, magazine PDF, `/locales` expected public while gated; `/log` still gated. Matches `.97` `PRIVATE_GATE_PUBLIC_PATHS`.
- **growth-smoke:** `/api/journey/welcome` without session accepts **403** (private gate) as well as 401/503.
- **Prod verify:** gate-smoke + growth-smoke green on www; rate-limit 429 OK; week4 digest dryRun OK. `LAUNCH_STRICT` still fails local check-env without founder `SUPABASE_SERVICE_ROLE_KEY` + `STRIPE_WEBHOOK_SECRET`.
- **Founder residual:** GH Actions billing · recruit ≥10 · Accept B · Wave A.
- Build: `2026.07-unified.98`.

---

## 2026-07-22 — Android 1.21.0: Accept enablement (F10)

- **Maestro:** Active immersive `assertNotVisible` Account tab (parity with wedge-adb-walk).
- **CI:** upload debug-signed `app-release.aab` artifact (`app-release-aab`, 7d); SHIP_INTERNAL notes Play still needs founder keystore.
- **Accept:** FOUNDER_ACCEPT **15-minute Accept B** short path (release-smoke → adb walk → manual spot → Pass/Fail table). Do not mark Pass.
- Version `1.21.0` / versionCode 48. F10 Done; F5 gated. Verify: `./gradlew :app:assembleDebug :app:testDebugUnitTest`.

---

## 2026-07-22 — Web .97 live on www (Vercel promote)

- Promoted ready master deploy `d0aa3ce` → Production via `vercel promote` (GH Actions still billing-blocked).
- Smoke: `/api/health` → `2026.07-unified.97`; `/welcome` + magazine PDF + `/locales/en/common.json` → 200; `/log` → 307 `/private`.
- Founder residual: clear GitHub spending limit / failed payment so CI runs again.

---

## 2026-07-22 — Android 1.20.0: CI release packaging + INDEX

- **CI:** android job runs `assembleRelease` + `bundleRelease` (debug-signed); Maestro/smoke greps Account + `release-smoke.sh`.
- **INDEX:** hub chrome notes; `./scripts/release-smoke.sh` in Commands; Accept B pointers.
- Version `1.20.0` / versionCode 47. F9 Done; F5 gated. Agent tree ready pending founder Accept B + www promote.

---

## 2026-07-22 — Android 1.19.0: pre-Internal readiness

- **Release smoke:** `scripts/release-smoke.sh` (assembleRelease + bundleRelease); PLAY_LISTING / SHIP_INTERNAL point at build.gradle + script; check-release-readiness runs release tasks.
- **Accept buffer:** wedge asserts Active immersive (no `Account tab`); store-assets documents `02b-account.png`.
- **Auth quality:** `AuthPrefsFeedback` + unit tests; Cloud sync card intro under Preferences.
- Version `1.19.0` / versionCode 46. F8 Done; F5 gated. Verify: `./gradlew :app:assembleDebug :app:testDebugUnitTest` + `./scripts/release-smoke.sh`.

---

## 2026-07-22 — Web .97: private-gate allowlist (welcome / magazine / locales)

- **Gate:** `/welcome`, `/magazine`, `/locales` added to `PRIVATE_GATE_PUBLIC_PATHS` so SEO “Start free” → I-Day, magazine PDFs, and HTTP i18n overlay work while `PRIVATE_MODE` stays on. `/log` / `/active` still gated.
- **Proxy:** matcher also skips `.pdf` static assets (belt with `/magazine` allowlist).
- **Tests:** `privateGate.test.ts` flipped; `/log` stays blocked. `npm run typecheck` + `npm test` (484).
- **Founder unblock (not agent):** clear GitHub Actions billing/spending limit · rotate `VERCEL_TOKEN` · `workflow_dispatch` Deploy production / Vercel Promote — www was stuck ~69 commits behind. Smoke: Profile `.97`; `/welcome` no 307; PDF + `/locales/*` 200 anonymous.
- Build: `2026.07-unified.97`.

---

## 2026-07-22 — Android 1.18.0: Accept-unblock after hub UX

- **Accept truth:** FOUNDER_ACCEPT hub checks + Preferences U0a/U0b (Units/Equipment off Today); More row paths for Progress/Routines/Library.
- **Smoke:** `wedge-adb-walk.py` + Maestro Account tab round-trip before Start workout.
- **Polish:** Account unit/equipment feedback messages; hub tab TalkBack `selected`; localized Account tab strings (ES/PT/FR).
- Version `1.18.0` / versionCode 45. F7 Done; F5 gated. Verify: `./gradlew :app:assembleDebug`.

---

## 2026-07-22 — Beyond the Basics v1.4 (web `.96`)

- **Editorial:** seven free sections gained callout/table/checklist teaching blocks; all **18** free sections now have ≥1 block. Originality log v1.4 rows; `magazineMeta` → **1.4**.
- **Reader:** shared `renderMagazineBody` on public + in-app chapters; denser `relatedExerciseIds` / `relatedLearnPathId`; public-safe practice CTAs (`.95` groundwork).
- **PDF:** `MAX_PAGES` 28→36; regenerated `public/magazine/beyond-the-basics.pdf` (~23 pages / ~610KB).
- **i18n:** guidebook content keys filled for all APP_LANGS; `i18n:parity` green; `export-locales`.
- Build: `2026.07-unified.96`. Verify: `npm run typecheck` + `npm run i18n:parity` + PDF page gate.

---

## 2026-07-22 — Web .95: public guide practice CTAs + magazine body

- Wire `/guide` chapters through `publicGuidePracticeCta` (anonymous CTAs → `/welcome` / `/exercises`, not gated pillar routes) + shared `renderMagazineBody`.
- In-app guidebook chapter page uses the same body renderer.
- Sync CONTEXT after Android 1.17 overwrote `## Now` to stale `.93`; build `2026.07-unified.95`.
- Verify: `npm run typecheck` + `npm test`.

---

## 2026-07-22 — Horizon 0 residual (.94): invite smoke, hero e2e, landing density, week4-smoke

- Invite printer + gate-smoke invitee SSR (`data-mw-invitee`); Mission Score e2e fail-closed; landing hero density; `npm run week4-smoke`.
- Build: `2026.07-unified.94` (commit `036cb03`).

---

## 2026-07-22 — Android 1.17.0: hub UX polish (Today · Coach · Account)

- **Hub chrome:** 3-tab bottom nav with icons; Account first-class; peer tabs `launchSingleTop` + `popUpTo(Today) { saveState }`.
- **Today declutter:** Units/Equipment moved to Account Preferences; one primary Start; Quick log ghost; Progress/Routines/Library in compact More row.
- **Motion/insets:** tab fade (~200ms) vs stack slide; `MwScreenScaffold(applyNavBarPadding)`; hub screens skip double nav-bar padding; Coach dead `onBack` removed.
- **Flow:** Victory Coach/Routines/Today hub-safe pops; History soft-delete lands on Today with hub.
- Version `1.17.0` / versionCode 44. Verify: `./gradlew :app:assembleDebug` (JAVA_HOME=Android Studio JBR). F5 still gated; F6 Done in [apps/android/BACKLOG.md](apps/android/BACKLOG.md).

---

## 2026-07-21 — Horizon 0 web readiness: invite gate + launch-verify + wedge copy

- **Invite → gate:** links land on `/private?invite=…` (no prod `?access=` unless `PRIVATE_ALLOW_QUERY_ACCESS`); invitee expands access form; admin prefers API `row.link`; [docs/BETA_INVITE.md](docs/BETA_INVITE.md) aligned.
- **Wedge copy:** Beta guide steps + banner + `/beta` cards push I-Day → Train → Mission Coach; Coach empty-state matches Generate CTA; ES/FR/PT/DE gate subtitles drop “everything app”.
- **Launch tooling:** `launch-verify` chains growth-smoke + rate-limit-smoke (`LAUNCH_STRICT` requires them); CI gate-smoke hard-fails when secrets set; growth + soft rate-limit jobs added.
- **Docs:** VISION_STATUS build `.93`; PROTECTION P0 synced to LAUNCH_RUNBOOK §2; DESIGN_REVIEW pass logged; removed stray `_probe_sync.ts`.
- Build: `2026.07-unified.93`. Verify: `npm run typecheck` + `npm test`.

---

## 2026-07-21 — Horizon 0 sprint: dispute shield landed + founder checklists + CI sync types

- Confirmed entity/dispute shield already on `master`; [CONTEXT.md](CONTEXT.md) boot file + `## Now` updated (founder still enables Dashboard dispute events / refunds custom text / Accept B).
- Founder clarity: [docs/LAUNCH_RUNBOOK.md](docs/LAUNCH_RUNBOOK.md) §4 webhook events + `/refunds` custom text + digest email; [apps/android/FOUNDER_ACCEPT.md](apps/android/FOUNDER_ACCEPT.md) Accept B → Play Internal pointer.
- CI: typed `RequireUserResult` on mobile sync prefs (+ workouts/customs/routines) so `npm run typecheck` stays green.
- Agents: no F5 / new pillars; founder beta + Stripe Dashboard + Play remain founder-owned.

---

## 2026-07-21 — Android 1.16.0: PR chip, soft-delete, Baseline Profile

- **F2.4:** In-session e1RM PR detect (`Progression.isPersonalRecord`) + brass “New PR” chip; patterned rest/PR haptics (`VibrationEffect` waveform); `VIBRATE` permission
- **F3.4:** History soft-delete → Room `deletedAt` + outbox tombstone; push queries include pending deletes (workouts/routines/customs)
- **F2.5:** `:benchmark` Macrobenchmark + `BaselineProfileGenerator`; `profileinstaller` + `:app:generateBaselineProfile`; CI `:benchmark:assemble`
- **Docs:** [BACKLOG.md](apps/android/BACKLOG.md) F2.4/F2.5/F3.4 Done; ARCHITECTURE/SHIP_INTERNAL Baseline notes
- Verify: `cd apps/android && ./gradlew :app:assembleDebug testDebugUnitTest :core:model:testDebugUnitTest :benchmark:assemble`

---

## 2026-07-21 — Repo operating system: boot file, doc consolidation, iOS playbook, departments

- **CONTEXT.md** (new, root): universal boot file — `## Now` status block (now the ONLY status home; ORCHESTRATION `## Where we are` points there), trap terms, hard rules. Update `## Now` on every ship, same commit as the LOG entry.
- **Tool pointers:** `CLAUDE.md`, `GEMINI.md` (root) + `apps/android/GEMINI.md` — thin pointers into CONTEXT → AGENTS → INDEX; Cursor rule updated. Never duplicate spine content into tool files.
- **Root consolidation (20 → 11 .md):** STRATEGY/PLAN/REDTEAM/JOURNEY/LAUNCH_RUNBOOK/ENV/PROTECTION/BETA_INVITE/VISION_STATUS/VERCEL_DEPLOY_CHECKLIST → `docs/`; ACCEPTABLE_USE → `docs/legal/`; SETUP → `docs/archive/` (stale banner). Full link sweep across md/ts/mjs/mdc/yaml incl. `docs/compliance/controls.yaml` evidence paths + compliance test. INDEX §4 lists the moves.
- **LOG rotation:** ≤15 entries at root (rule in header); 75 older entries → [docs/archive/log/LOG-2026-06_to_2026-07-20.md](docs/archive/log/LOG-2026-06_to_2026-07-20.md).
- **iOS:** `docs/IOS_DEFERRED.md` → [docs/IOS_PLAYBOOK.md](docs/IOS_PLAYBOOK.md) — still deferred; now a full open-the-lane spec (SwiftUI, OpenAPI contract, StoreKit→enrollments, wedge scope, lane rules).
- **Departments:** agent-lane table in [ORCHESTRATION.md](ORCHESTRATION.md) (Web/Android/iOS-closed/Design/Content-Book/Growth/Ops/Data — owner, entry doc, allowed paths).
- **Vision/book:** `vision.md` Decade map (metrics-gated); Beyond the Basics book plan in [docs/STRATEGY.md](docs/STRATEGY.md) (locale PDFs → premium cadence → KDP at Horizon 3).
- **Design:** [docs/DESIGN_REVIEW.md](docs/DESIGN_REVIEW.md) hero-flow audit checklist; DESIGN_SYSTEM `## Motion & interaction` expanded (duration tiers, no-CLS, Android parity).
- Verify: `npm run typecheck` + `npm test` green; stale-link grep clean; root .md count = 11.

---

## 2026-07-21 — Android platform rebuild (Hilt / UDF / feature modules)

- **Architecture:** [apps/android/ARCHITECTURE.md](apps/android/ARCHITECTURE.md); horizons A–E in [docs/ANDROID_NATIVE.md](docs/ANDROID_NATIVE.md)
- **Spine:** Hilt (`@HiltAndroidApp`, `AppModule`); ViewModels + `StateFlow` UiState; Room v2 (`set_logs`, `sync_outbox`); finish workout atomic + outbox flush
- **Logger craft (`:feature:active`):** exercise×sets, previous performance row, rest −15/+15, keep-screen-on, editable weight/reps
- **Modules:** `:feature:{active,today,coach,iday,victory}` + `:core:{common,model,data,network,designsystem}`
- **CI:** `.github/workflows/ci.yml` `android` job — `assembleDebug` + Active unit tests + Maestro file gate
- **API:** Production `/api/mobile/*` returns private-gate JSON (routes live); client uses Room when unauthorized
- Verify: `cd apps/android && ./gradlew :app:assembleDebug :feature:active:testDebugUnitTest`

---

## 2026-07-20 — Pre-revenue entity + Stripe dispute shield

- **Entity pack:** [docs/legal/ENTITY_RESEARCH.md](docs/legal/ENTITY_RESEARCH.md), [docs/legal/OPERATING_AGREEMENT_DRAFT.md](docs/legal/OPERATING_AGREEMENT_DRAFT.md), [docs/PRE_REVENUE_CHECKLIST.md](docs/PRE_REVENUE_CHECKLIST.md) (take-a-dollar gate)
- **Refunds visibility:** `UnlockButton` → 14-day + `/refunds`; Stripe Checkout custom-text steps in [docs/STRIPE_PREMIUM_SETUP.md](docs/STRIPE_PREMIUM_SETUP.md)
- **Dispute alerts:** webhook `charge.dispute.*` → `FOUNDER_DIGEST_EMAIL` via `stripeDisputeNotify`; [docs/STRIPE_DISPUTE_OPS.md](docs/STRIPE_DISPUTE_OPS.md); setup script event list updated
- **Evidence pack:** [docs/legal/STRIPE_DISPUTE_EVIDENCE_PACK.md](docs/legal/STRIPE_DISPUTE_EVIDENCE_PACK.md) — no auto-fight
- Founder: add dispute events on existing Stripe webhook; set `FOUNDER_DIGEST_EMAIL`; Dashboard Checkout custom text → `/refunds`

---

## 2026-07-20 — Android UX craft pass

- **Design system:** bundled Barlow Condensed / Inter / IBM Plex Mono; `MwScreenScaffold` navy+emerald glow; branded buttons, `MwSetRow`, `MwRestTimer`, enter fade + reduce-motion
- **Screens:** I-Day hero (no roadmap copy), Today one-job next session, Active Strong-like logger, Victory lock metrics, Coach briefing rows + refined adapt banner
- Wedge Maestro strings preserved (`Start mission`, `Start workout`, `Finish workout`, `Session locked`, …)
- Verify: `./gradlew :app:assembleDebug` · `python3 apps/android/scripts/wedge-adb-walk.py`

---

