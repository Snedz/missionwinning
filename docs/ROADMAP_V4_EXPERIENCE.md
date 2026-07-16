# Roadmap v4 — The Experience Build

**Focus (founder-directed):** best-in-class user interface & website experience · interactive website · SEO growth engine · free guide positioning.
**Written:** 2026-07-04, after verifying `cursor/future-build-roadmap` (Mission Coach engine: 179/179 tests, build green, clean fast-forward onto `master`).
**Prior roadmaps:** v1 launch package → v2 pre-launch hardening → v3 Mission Coach. Companions: [STRATEGY.md](../STRATEGY.md) · [REDTEAM.md](../REDTEAM.md) · [LAUNCH_RUNBOOK.md](../LAUNCH_RUNBOOK.md) · [AGENTS.md](../AGENTS.md).

**On "rebuild if you have to":** we don't have to, and we shouldn't. Three roadmaps of verified work sit on a strict-TS, 179-test codebase with a design system already in place. What "far off from the best" actually means today is **inconsistency** — the public pages and newest surfaces (Coach, pillar shells) feel premium while older in-app surfaces (Library, Builder, parts of Today/Fuel) still feel utilitarian. v4 closes that gap surface-by-surface using the shells and tokens that already exist (`PillarPageShell`, `content-card`, eyebrow/display type). That is the rebuild — done as a series of shippable passes, not a teardown.

---

## Phase 0 — Land, fix, measure (orchestration; ~1 session)

1. **Merge the coach branch.** `cursor/future-build-roadmap` → `master` (verified: zero divergence, zero overlapping files, FF-clean). Vercel deploys automatically.
2. **Ship the repairs in this branch** (done alongside this doc):
   - `npm test` glob bug — only 34 of 179 tests were running locally **and in CI** (`sh` doesn't expand `**`); script now passes quoted globs so Node's runner resolves them.
   - **ISSA scrub** — 31 references removed from shipped code: guidebook `sourceRef`s, learn path subtitles, LearnPage/locale copy (EN + ES). Product now contains zero mentions. *Standing rule (REDTEAM A9): original wording only, no source branding, no verbatim passages — internal `sourceRef` fields stay topic-only.*
3. **Post-merge smoke:** `npm run e2e` against a prod build; Playwright screenshots of `/`, `/log`, `/coach`, `/learn` at 390px/1440px checked into the PR description.
4. **Baseline metrics before the UI work:** Lighthouse (mobile) on `/`, `/log`, `/coach`; PostHog funnel snapshot. v4 must not regress either.

## Phase 1 — In-app experience elevation (the core ask; 2–3 sessions)

*Goal: someone who lands on the beautiful marketing page and enters the app should feel zero drop in quality.*

**Wave 4 status (2026-07-16):** card tier ladder + primitives + shell + Today scorecard + Train chrome + pillar sweep elevation shipped. See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) tier table. Remaining ROADMAP items below stay future work (Library/Builder UX depth, Fuel quick-log).

1. ~~**Shell unification audit.**~~ **Partial ✓** — `PillarPageHeader` briefing-rule; AppHeader/Sidebar polish; pages use `content-card` / elevated heroes. Logger set-table untouched.
2. ~~**Today = command briefing.**~~ **Partial ✓** — `TodayDashboardHeader` → `card-elevated card-glow-emerald`; single primary CTA preserved; WeekStrip clinical icons + status/brass tokens.
3. **Library overhaul** (`src/page-components/LibraryPage.tsx`): search-first layout with sticky search + filter chips (muscle · equipment · level — data already on `Exercise`); tap → detail sheet (cues, alternatives with jump-links, personal history sparkline from `workoutHistory`, "Add to today's session" when a workout is active). Reuse `FormGuideSheet` pattern. *(Deferred — structure only elevated.)*
4. **Builder as a 3-step flow** (`BuilderPage.tsx`): Step 1 pick start → Step 2 arrange → Step 3 name + save/start. *(Deferred — chrome elevated; flow unchanged.)*
5. ~~**Motion system pass.**~~ **Partial ✓** — existing `ring-draw-in` / score-tick / week-strip-pulse / victory-reveal retained; reduced-motion gates unchanged.
6. ~~**Empty states as invitations.**~~ **Partial ✓** — shared `EmptyState` mono title treatment.
7. **Fuel quick-log.** Most-used foods row, "repeat yesterday", macro ring consistency. *(Deferred.)*
8. **Tests/edge cases:** e2e critical after elevation; Lighthouse `/log` ≥90.

## Phase 2 — Interactive website (the landing demos itself; 1–2 sessions)

1. **Hero live demo — "log a set in the hero."** Replace the static briefing card with an interactive toy: three demo set-rows; each tap logs a set → readiness/strain rings animate, Win Score ticks up, third tap fires the PR toast + "That's the loop. Yours is free." CTA. Client component, code-split, `requestIdleCallback`-mounted, zero data written, keyboard accessible. Files: `src/components/landing/HeroDemo.tsx`, wired into `LandingPage.tsx`.
2. **Scroll-driven journey.** The I-Day → Basic → Readiness → Commissioned section animates a progress line + step reveals on scroll (IntersectionObserver + CSS transitions; static fallback for reduced-motion/no-JS).
3. **Coach adaptation demo.** Small animated `WeekStrip` mock cycling: full week → "Monday missed" → plan re-spreads. Communicates the differentiator (day-level adaptation) without words. Reuses real `WeekStrip` with scripted props.
4. **Guide teaser row.** Three guidebook chapter cards (real titles) → `/guide/*` (Phase 3). "The entire foundations guide is free. No email wall."
5. **Performance budget:** interactive bundles lazy; hero demo ≤15KB gz; Lighthouse mobile ≥90 maintained (measured in Phase 0 baseline, re-measured per PR).
6. **Edge cases:** no-JS (SSR renders static hero card fallback); touch vs pointer; RTL (demo mirrors); reduced-motion (all three demos render final-state static).

## Phase 3 — Free guide + SEO engine (compounding acquisition; 2 sessions)

*Positioning decision (recommended, matches "make the guide free"): the entire 6-chapter foundations guidebook is free forever and **public** — it becomes the acquisition moat. The 4 specialist chapters + programs + Coach stay premium (that's the bundle's substance).*

1. **Public guide routes:** `app/guide/page.tsx` (index) + `app/guide/[chapter]/page.tsx` — marketing shell (not app shell), statically rendered, readable logged-out, Article JSON-LD, TOC, prev/next, inline CTAs into `/welcome`. Content from `src/data/guidebook/chapters.ts` (single source with in-app `/learn`). Slugs from chapter ids.
2. **Exercise pages — 217 URLs from data we already own:** `app/exercises/page.tsx` (browsable index, filterable) + `app/exercises/[id]/page.tsx`: name, muscles, equipment, level, cues, form guide (from `formGuides.ts` where available), alternatives (linked), HowTo JSON-LD, "Track this exercise free" CTA. `generateStaticParams` from `EXERCISES`. This is the long-tail SEO engine ("how to do X" queries) at near-zero content cost.
3. **Routing/gating:** add `/guide` + `/exercises` to `PUBLIC_PATHS_WHILE_GATED` (marketing surfaces) and to `sitemap.ts`; internal link mesh: guide ↔ exercises ↔ `/compare` ↔ landing.
4. **Static rendering:** these routes opt out of `force-dynamic` (export their own `dynamic = 'force-static'`/`revalidate`) — verify the PWA shell is unaffected (only marketing routes change).
5. **Measurement:** PostHog events `guide_read`, `exercise_page_viewed`, `public_cta_clicked`; Search Console verification post-launch; STRATEGY.md gets an SEO KPI (indexed pages, weekly organic sessions).
6. **Edge cases/tests:** invalid slugs → branded 404; guide readable with JS disabled; JSON-LD validates (unit test renders + parses schema); duplicate exercise names disambiguated by id; locale — public pages EN-only v1 with `lang="en"` (i18n later per PRE_LAUNCH tiers).

## Phase 4 — Quality gates (continuous)

1. **Screenshot matrix** in `scripts/e2e-smoke.mjs`: {`/`, `/log`, `/coach`, `/library`, `/builder`, `/guide/first-chapter`, `/exercises/squats`} × {390, 1440} — artifacts on every PR.
2. **Lighthouse budget check** (script or CI job): mobile perf/PWA/a11y ≥90 on `/` and `/log`; fail-soft warning on regression.
3. **A11y pass:** focus-visible audit on all new interactive elements (hero demo, chips, sheets); contrast check on brass-on-dark text; `aria-live` on demo score ticks.

## Sequencing

| Order | Work | Ships when |
|---|---|---|
| 0 | Merge coach branch + this branch (fixes + doc) | immediately |
| 1 | Phase 1.1–1.2 (shells + Today) | first UI PR |
| 2 | Phase 1.3–1.7 (Library, Builder, motion, empty states, Fuel) | 1–2 PRs |
| 3 | Phase 2 (interactive landing) | after Phase 1.1 tokens settle |
| 4 | Phase 3 (guide + exercises SEO) | parallel-safe with Phase 2 |
| 5 | Phase 4 gates | wired into CI alongside |

**Unchanged do-not-build list:** native apps, wearables, more languages pre-PMF, GPS, video production, America track re-enable. **Unchanged critical path:** the founder ops in LAUNCH_RUNBOOK (beta cohort → gates → `PRIVATE_MODE=false`) — v4 makes the product better while that happens, not instead of it.

## Verification (per phase)

- Every PR: `npm test` (now genuinely 179+), `npm run build`, `npm run e2e`, screenshot diffs eyeballed.
- Phase 1: before/after screenshots per page; no Lighthouse regression on `/log`.
- Phase 2: hero demo keyboard-operable; reduced-motion renders static; bundle-size check.
- Phase 3: `curl` public routes logged-out (200, content present, JSON-LD present); sitemap includes new URLs; gated mode still protects the app shell.
