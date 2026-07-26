# CONTEXT.md — boot file (read first, every tool)

One screen of truth for any AI tool or human joining cold. Read this, then [AGENTS.md](AGENTS.md), then [INDEX.md](INDEX.md). Keep `## Now` current: update it on every ship, in the same commit as the [LOG.md](LOG.md) entry.

---

## What this is

**Mission Winning** · www.missionwinning.com · "Train Anywhere. Win Daily."

> Adaptive AI coaching for train-anywhere athletes — free offline logging (no account), weekly plans from logs alone (no wearable). Super Bundle adds Coach depth and the other pillars — it never gates the logger.

- Six pillars — Train · Fuel · Move · Mind · Track · Learn — unified by the Mission Score. Constitution: [vision.md](vision.md). Pitch the **Train + Mission Coach wedge**, never "everything app" ([docs/YC_THESIS.md](docs/YC_THESIS.md)). Evidence thesis (structured exercise vs vague advice — not a depression product): [docs/EXERCISE_AS_MEDICINE.md](docs/EXERCISE_AS_MEDICINE.md). Crypto is a **payment rail** (Lifetime USDC), not the product ([docs/CRYPTO_RAILS_THESIS.md](docs/CRYPTO_RAILS_THESIS.md)).
- Surfaces: Next.js 16 PWA (repo root) · native Android Compose ([apps/android](apps/android), v1.24.1) · iOS deferred ([docs/IOS_PLAYBOOK.md](docs/IOS_PLAYBOOK.md)) · "Beyond the Basics" guidebook (`/guide` + magazine PDF).
- Solo founder + AI agents. Founder owns users, money, legal, secrets, `PRIVATE_MODE`. Agents own code, tests, perf, docs — inside horizon gates.

---

## Now (2026-07-26 · web `2026.07-unified.146` · Android `1.24.1`)

> The ONLY "where we are" block in the repo — [ORCHESTRATION.md](ORCHESTRATION.md) points here.

- **Horizon W — wedge excellence.** Web craft 1–6 + **Fuel estimate accuracy** (edit-before-log, better NL match, honest photo sources).
- **Logger reliability (`.123`):** fixed `/active` **Start Workout stuck disabled** (zustand ran `onRehydrateStorage` inside `create()` → swallowed TDZ error → `hasHydrated` never true). Web now on **sync v2** (`clientId`/`revision`/tombstones) behind a **durable outbox** — [src/lib/sync/INDEX.md](src/lib/sync/INDEX.md); all device writes go through [src/lib/storage/INDEX.md](src/lib/storage/INDEX.md). Hero + offline e2e now gate every PR.
- **Free-first beta (~4 weeks):** LLC + EIN pending — **no Bundle UI** + **full depth unlocked** + **full More nav** (journey train-only deferred) ([docs/FREE_BETA.md](docs/FREE_BETA.md)).
- **Surface parking (`.124`):** `NEXT_PUBLIC_SURFACES` ([src/lib/surface.ts](src/lib/surface.ts), [docs/ENV.md](docs/ENV.md)) parks non-wedge surfaces — **america · school · wearables · leaderboard · cryptoRails · paypal off by default**; six pillars stay on. `=wedge` parks the secondary pillars too (founder call). Parked = out of nav, 404 in `proxy.ts`, out of sitemap. Nothing deleted. Hero e2e passes in full wedge mode, so **the free logger is provably never gated**.
- **First 90 seconds (`.125`):** cold visitor → logged set is now a **budget test** (`tests/e2e/first-90.spec.ts`, 6 taps, no interstitial, one primary CTA, every logger control ≥44px — the ± steppers were 36px). Re-entry after a gap is calm and smaller, not a broken streak ([src/lib/reentry.ts](src/lib/reentry.ts)). `first_set_logged` carries `secondsFromStart`.
- **Homepage rebuild (`.126`):** `/` was the only page ignoring the briefing type system in `src/index.css`, so its H1 rendered in **Inter not Barlow Condensed**. Now on `.display-hero` / `.eyebrow`, restructured as the product loop (log → adapt → anywhere → free → start). Signature: [`LogToPlanHero`](src/components/landing/LogToPlanHero.tsx) runs the **real** `suggestNextSetTarget` engine — no hardcoded dashboard numbers. `CoachAdaptDemo` is visitor-driven, not an auto-carousel. Audience page at `/compare/test-prep`.
- **Quality pass (`.127`):** **`npm run a11y` green (10/10, was 8 failing + flaky)** — emerald split into `--primary` (accent on navy, 7.08:1) and `--primary-fill` (white text, 5.38:1) since no single value serves both; `--muted-foreground` 58→62%. Every declared `OutboxKind` now has a handler (`fuel.plan` removed — it writes to device storage, not a cloud). Cross-device **edits and deletes propagate** via the `updated_at` cursor. **`npm run gate`** runs the whole CI gate locally while Actions is blocked. Storage ratchet 59→53.
- **Storage ratchet empty (`.128`):** all 53 remaining files migrated to [safeStorage](src/lib/storage/INDEX.md) — `LEGACY_DIRECT_STORAGE` **deleted** from `eslint.config.js`, so a bare `localStorage` call is now a plain lint error with no allowlist to join (only `src/lib/backup.ts` stays exempt, since it must prefix-scan `mw_*` at runtime). ~200 call sites; ~40 hand-rolled `try/catch` and ~35 SSR guards **removed** rather than added, because `safeStorage` is SSR-safe and never throws. Every key resolves through `STORAGE_KEYS`.
- **Public site is one site (`.129`):** **94 of 219 advertised exercise URLs were 404ing** — `generateStaticParams` read the exercise catalog without awaiting the lazy extended modules, so only ~126 prerendered while `/exercises` linked to all of them. Sitemap now 273 URLs / 0 non-200 (was 95 non-200), with a `@gate` test that fetches every one. Then the UI: [`PublicPageShell`](src/components/public/PublicPageShell.tsx) replaces `PublicSeoHeader` across the ~250 SEO URLs whose `h1` rendered in **Inter** — the same defect `.126` fixed on `/` alone. Briefing type, one measure for header + body, one emerald CTA above the fold, full footer with legal + medical disclaimer (previously on 3 of ~270 public URLs). New [`PublicNavMenu`](src/components/public/PublicNavMenu.tsx) on Radix Dialog: at 390px the nav had **no links at all**. Global `:focus-visible` — there was none, and axe does not test it, which is why a11y was green while WCAG 2.4.7 failed. `scripts/check-display-type.mjs` stops `text-*` utilities nullifying `.display-*` clamps (10 sites did). Gates: `@gate` 16→25, `@a11y` 10→20. **`viewportFit: 'cover'` deliberately deferred** — no sticky header is inset-guarded, so it would create the bug it looks like it fixes.
- **Modernist rebrand (`.130`–`.131`):** founder-commissioned full rebrand (design handoff 2026-07-25 — paper/ink/**one red**, Archivo only, radius 0, 2px rules, light-only; override recorded in [docs/DESIGN_ORCHESTRATION.md](docs/DESIGN_ORCHESTRATION.md) wave D5). `.130` restyled `/private` (the whole public site while gated). `.131` is the **global token swap**: one `:root` flip in [src/index.css](src/index.css), Archivo only, whole Tailwind radius scale → 0, glows/gradients/shadows retired, ink-square mark + favicon/PWA icons + OG re-ink, form-guide SVGs re-inked (repo still had the navy set), DESIGN_SYSTEM/brand-guidelines rewritten. **Red is three tokens** (`--accent-poster` #ec3013 fills+chrome · `--primary-fill` #dd2b0f button fills · `--primary` #ae1800 small text) — paper inverts the `.127` contrast math; small red text is never poster red. **Android sync paused** (founder call) — Android rebrands after web; `check-token-sync` pins web values, motion still enforced. Beta testers see restyled-but-not-recut app screens until Phase 3. `.132` recut the shared public shell; `.133` the landing (flat hero, checkable stat row, numbered sections, red poster close). `.134` added the public /calculators/{1rm,tdee,strength-standards} SEO routes (new strengthStandards ladder lib, registered in sitemap+gate+smoke). `.135` recut the SEO furniture (square filter tags, 2px compare table w/ tinted MW column, guide TOC case). `.136` opened Phase 3 on the app: nav active = 2px red top rule, all blur+shadow gone (28→0), pills squared, coach week strip honest. `.137` re-inked the guidebook cover (PDF rebuilt, 27pp); `.138` shipped the three Modernist HTML emails + the first beta-invite sender. **Rebrand build complete** — stack #89–97 awaits review; founder owns `MAIL_POSTAL_ADDRESS`, photography, wordmark, and the `PRIVATE_MODE` flip.
- **Modernist primitives (`.139`):** Phase A of the **second** handoff (`design_handoff_missionwinning_modernist` — the 13 signed-in screens the first one left). Its tokens already matched `.131`, so this is the primitives layer: both ramps (`--neutral-*`, `--accent-*`, with 100/600/700 **aliasing** the semantic roles so they cannot drift), **`ProgressRing` deleted** in favour of [`ScoreNumeral`](src/components/ui/ScoreNumeral.tsx) + [`MeterBar`](src/components/ui/MeterBar.tsx), and the glow/texture classes gone for `card-boss` · `card-section` · `is-active-row` · `seg`. Found and fixed a **pre-existing** WCAG 1.4.1 failure — `npm run a11y` was really **18/20**, because `text-primary hover:underline` (56 sites) distinguishes links by hue alone at rest (1.27:1). Now 20/20. **Poster red is not a ramp step** — it sits between 500 and 600; don't "simplify" it to `accent-500`.
- **App shell grouped (`.140`):** rail + mobile tabs both from **`railGroupsForNav()`** ([src/lib/navConfig.ts](src/lib/navConfig.ts)) — the 13 handoff screens as **Mission · Pillars · Toolkit**, declared as hrefs so label/icon keep one definition and parked surfaces still filter out. Rail scrolls (icon-only at 72px, 2px rule instead of labels); tabs scroll horizontally because 13 at `flex-1` is 29px each on a 375px phone. OPEN BETA tag gated on `isFreeBeta()`. **Two handoff values overridden for contrast** — group labels `neutral-500` and inactive tabs `neutral-600` are 10px on paper at ~2.4:1 and 3.84:1, both now `muted-foreground`; a11y caught it at 13/20. Coach keeps its live label "AI weekly plan" — the mock's "Coach" is shorthand, and the handoff says copy is unchanged.
- **Today recut (`.141`):** first screen of the second handoff. The boss panel on Today is the **red field** — [`JourneyHero`](src/components/journey/JourneyHero.tsx) is now `.poster-field` with its `.primary-action` inverting to paper, so `first-90`'s one-CTA count holds. The field is **`--primary` #ae1800, not poster #ec3013, and that is forced**: it carries an 11px kicker and 14px sub-line needing 4.5:1, and *nothing* on #ec3013 reaches 4.5:1 — pure white is 4.19. `MetricsRow` absorbed the Mission Score into **one band of four** (red numeral leads; 2 cols on a phone). The streak was rendering **twice** — dashboard copy removed, meta row keeps it. Deltas are muted ink in both directions, which is the handoff's own answer.
- **Logger recut (`.142`):** Train. Found **the last pre-rebrand colour in the app** — [`src/lib/workout/setKind.ts`](src/lib/workout/setKind.ts) still held amber/rose/violet/emerald on dark-theme `*-950` grounds, so completed set rows rendered a green wash on paper; it survived `.131` because it lives in `lib/`, not `components/`. Set kind is a **tag** now, not a row tint. Live row = `is-active-row`; PR = **honor tier** (accent-800 + ★). Rest dock is the **ink panel** (neutral-900, 72px clock, accent-400 meter). Plates promoted from the overflow menu to the header. Superset edge is red, not blue. Plate dialog gained the handoff's quick-target chips. **`logger-depth` matches `/^log$/i`, so the mock's "Log set" label was NOT adopted.**
- **Coach recut (`.143`):** ADAPTED banner is accent-100 behind a red edge; sessions are a **2-col grid** with today marked by a red top rule + the screen's one elevation (`isToday` threaded from `CoachPage`, which already had `todayOffset`). Amber `--status-warn` borders and warning text collapse to the one red. **The mock's 'missed → Thu' annotation still does not ship** — the plan engine records no reshape target, so it would be invented.
- **History recut (`.144`):** found **three chart files that were never rebranded** — Recharts takes colour as *props*, not classes, so emerald/amber literals survived every class-name grep, and [`Benchmarks1RMChart`](src/components/benchmarks/Benchmarks1RMChart.tsx) was still **fully dark theme** (navy tooltip, light-grey axis text ~2:1 on paper). All tokenised. Muscle heatmap is now one hue deepening (accent-100→400) rather than jumping to amber at the top step. Two 1RM series distinguished by accent vs ink, not a second hue.
- **Photo slots (`.145`):** [`GrayscalePhoto`](src/components/marketing/GrayscalePhoto.tsx) owns ratio + desaturation so layout does not shift when real photos land — filling one is a file swap (`/public/photo/<name>.{avif,webp}` + `base`). Ships as **named placeholders**, not stand-in images: the captions are the shot brief. Placed in landing §03, **not the hero** — that slot is `LogToPlanHero` running the real engine, which beats a photo of someone else training. **Wedge-four redesign complete (A–G, `.139`–`.145`); the remaining 9 screens are the next tranche, gated on founder review.**
- **Fuel + runners (`.146`):** Fuel was the last big pocket (41 hits, 17 files) — radius/hairlines/tints/`status-warn` all systematised; week bars are poster·fill·neutral because amber for "over target" implied a severity the app does not assign. **Cherry-picked the spawned FAB-overlap fix `b5f53548`** so this restyles the fixed layout, and its spec still guards it. **[`GuidedStepPlayer`](src/components/session/GuidedStepPlayer.tsx) goes ink while running** (shared by Move + Mind — one change, both screens): 44px countdown, step dots, accent-400 meter, **red `.poster-field` completion banner**. Breathing anchor is now a **square**, ink — the last round object in the app. New `onInk`/`onInkSolid` Button variants + `MeterBar tone="ink"`.
- **Media system:** Google Flow · Scout mascot — [docs/MEDIA_SYSTEM.md](docs/MEDIA_SYSTEM.md).
- **Ops:** prod ships via **Vercel Deploy Hook + GitHub webhook** (unmetered, no Actions) — [docs/VERCEL_DEPLOY_CHECKLIST.md](docs/VERCEL_DEPLOY_CHECKLIST.md) §1.1; `deploy-production` is now **manual-only** fallback. **Actions is currently blocked** (every workflow fails in <5s with no logs = billing) → the PR gate is inert, so run **`npm run gate`** locally until cleared. **Secrets program** + pre-public scrub shipped — [docs/SECRETS.md](docs/SECRETS.md); OSS public-ready (AGPL + CoC) — founder flips GitHub Public — [docs/OPEN_SOURCE.md](docs/OPEN_SOURCE.md). Promote **`.138`**; keep Supabase Site URL on www.
- Agents **must** ship wedge habit-loop + free acquisition. Refuse new pillars / America / locale farms / F5.
- **Founder:** Accept B on Android + phone excellence → invites → YC F26. **Wire the Deploy Hook webhook** ([checklist §1.1](docs/VERCEL_DEPLOY_CHECKLIST.md)) then promote `.138`; clear Actions billing to restore the PR gate. **Before any list email: set `MAIL_POSTAL_ADDRESS`** (CAN-SPAM footer — confirm the Bizee TX registered-agent address is publishable as a business address, else PO box/CMRA; same address closes the DMCA agent row) — [LEGAL_SAFETY.md](docs/LEGAL_SAFETY.md) §3. Before Public: `npm run secrets:scan`, enable GitHub secret scanning + push protection.

---

## Read next

[AGENTS.md](AGENTS.md) (conventions · glossary · commands) → [INDEX.md](INDEX.md) (task → doc routing · stale paths §4) → [ORCHESTRATION.md](ORCHESTRATION.md) (horizons · gates · departments) → the folder `INDEX.md` where you'll work.

---

## Trap terms (full glossary: AGENTS.md)

| Term | Means |
|------|-------|
| Mission Coach | AI plan engine — `src/lib/coach/`, `/coach` (≠ `/coaching` human-lead form) |
| Today | Route `/log` (`HomePage.tsx`), nav label "Today" |
| Train | Route `/active` — the logger |
| Fuel | Route `/nutrition` |
| Journey phase 0–3 | UX arc ([docs/JOURNEY.md](docs/JOURNEY.md)) ≠ build phases A–I ([docs/PLAN.md](docs/PLAN.md)) ≠ PFT G1–G8 |
| Horizon 0–3 | What may be built now — [ORCHESTRATION.md](ORCHESTRATION.md) |
| Wedge | Train + Mission Coach — the go-to-market story |
| Super Bundle | The one premium sub: $11.99/mo · $59/yr founders · $149 lifetime |
| PRIVATE_MODE | Site gate — only the founder flips it |
| mw-core | [packages/mw-core](packages/mw-core) — pure TS shared coach/workout logic |

---

## Commands

`npm run typecheck` · `npm test` · `npm run build` · `npm run lint` — full list in AGENTS.md §Commands.
Android: `cd apps/android && ./gradlew :app:assembleDebug`.

---

## Hard rules

1. **Horizon rule** — Horizon W: build wedge excellence (Train/Today/Victory/Coach). No new pillars/locales/America/F5 without explicit founder override. ≥10 beta only after excellence sign-off.
2. **The free logger is never gated. Ever.**
3. Agents never flip `PRIVATE_MODE`, never invent traction numbers, never mark founder tasks done.
4. Do not open stale/deleted paths — [INDEX.md](INDEX.md) §4.
5. Docs match reality: every ship updates [LOG.md](LOG.md) + this file's `## Now` (+ build label).
