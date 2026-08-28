# app/

> One concern: Next.js App Router — thin route shells and API handlers.

## Read order

1. `app/(app)/layout.tsx` — authenticated app shell (`AppLayout`)
2. `app/layout.tsx` — root layout, fonts, metadata
3. `app/page.tsx` — landing (`/`) or private gate redirect
4. [INDEX.md at repo root](../../INDEX.md) — doc routing

## Route map (live)

### Primary tabs (`app/(app)/`)

| URL | Nav label | Page component |
|-----|-----------|----------------|
| `/log` | Today | `HomePage.tsx` |
| `/active` | Train | `ActiveWorkoutPage.tsx` |
| `/nutrition` | Fuel | `NutritionPage.tsx` |
| `/track` | Track | `TrackPage.tsx` — Quiet Track weight / tape (`.975`); walks / GPS in Show more |
| `/profile` | You | `ProfilePage.tsx` — the Athlete Page (identity · career line · badge shelf) |
| `/account` | Account | `AccountPage.tsx` — settings, notifications, billing, backup |

### Train deeper

| URL | Page component |
|-----|----------------|
| `/builder` | `BuilderPage.tsx` — write side of the official training catalog (templates). Not a shop. |
| `/coach` | `CoachPage.tsx` — **Mission Coach** (AI weekly plan) |
| `/library` | `LibraryPage.tsx` — official exercise catalog. Super Bundle deepens pro templates; never gates `logSet`. |
| `/history` | `HistoryPage.tsx` |
| `/leaderboard` | `LeaderboardPage.tsx` |
| `/benchmarks` | `BenchmarksPage.tsx` |

### Other pillars & info

| URL | Page component | Notes |
|-----|----------------|-------|
| `/move` | `MovePage.tsx` | Mobility + quiet rest-day walk / easy log (`.969`) |
| `/mind` | `MindPage.tsx` | Mind & recovery |
| `/learn` | `LearnPage.tsx` | Quiet Learn first-success intro (`.978`); catalog in Show more |
| `/learn/guide` | `GuidebookIndexPage.tsx` | Guidebook |
| `/coaching` | `CoachingPage.tsx` | Human 1:1 leftover form — not Mission Coach. Never a rail. |
| `/privacy` | `PrivacyPage.tsx` | Privacy policy |
| `/cookies` | `CookiesPage.tsx` | Cookie & device-storage inventory (data: `src/lib/cookiePolicy.ts`) |
| `/accessibility` | `AccessibilityPage.tsx` | Accessibility statement (EAA / WCAG 2.1 AA) |
| `/terms` | `TermsPage.tsx` | Terms of use |
| `/dmca` | `DmcaPage.tsx` | DMCA / copyright notices |
| `/refunds` | `RefundsPage.tsx` | Refunds & cancellation |
| `/help` | `HelpPage.tsx` | Leftover FAQ. Hairline items. Never a rail. |
| `/welcome` | `WelcomePage.tsx` | I-Day onboarding (also `app/welcome/`) |
| `/explore` | `ExplorePlacesPage.tsx` | Places pin-board (Decision 009). Quiet Account / More door. Not a shop. Not the training catalog. |
| `/calculators` | `CalculatorsPage.tsx` | Leftover 1RM / macros / plates. Quiet Account More-settings door. Never a rail. Not a shop. |
| `/programs` | `ProgramsPage.tsx` | Leftover education outlines. Unlock / price in Show all. Never a rail. Not a shop. |
| `/server` | `ServerPage.tsx` | Mission Server messenger (MSN rooms + presence). Signed-in rooms persist. More → You. Not a tab. `robots: noindex` |

### Outside `(app)` group

| URL | File |
|-----|------|
| `/` | `app/page.tsx` → teaser until the gate cookie; cookie → `.696` `LandingPage` (not cinematic). Gated + no cookie → `/private`. |
| `/bundle` | `app/bundle/page.tsx` → `BundlePage` (marketing chrome). Free-beta 307s to `/notify`. |
| `/notify` | `app/notify/page.tsx` → `NotifyPage` — Super Bundle email waitlist (checkout not live). Public while gated. `robots: noindex`. |
| `/compare` · `/compare/*` | **Removed (.668)** — permanent redirect to `/welcome` (no competitor comparison hub) |
| `/guide`, `/exercises` | Public SEO pages |
| `/press` | `app/press/page.tsx` → `PressPage` (brand & media kit) |
| `/changelog` | `app/changelog/page.tsx` → `ChangelogPage` (athlete release notes; marketing chrome) |
| `/guide` (Apex reader) | `GuidePublicIndexPage` — Contents sidebar + language switcher |
| `/guide/[chapter]` | `GuidePublicChapterPage` — same shell |
| `/guide/mission-winning-vs-:slug` | **Unpublished** — permanent redirect to `/welcome`. Named compare drafts live in ops. |
| `/guide/print` | Magazine print/PDF source (`GuideMagazinePrintPage`) — noindex |
| `/exercises/muscle/[group]`, `/exercises/equipment/[slug]` | Catalog hub indexes |
| `/paths`, `/paths/[id]` | Public Learn path teasers (in-app Learn stays `/learn`) |
| `/private` | `app/private/page.tsx` → `GateTeaser` → tight lock (`PrivateTeaserClient`: hero + notify + Enter with code). `CinematicWww` is not first paint. |
| `/offline` | `app/offline/page.tsx` |
| `/auth/callback` | `app/auth/callback/route.ts` (PKCE exchange + gate cookie) |

## API routes (`app/api/`)

| Prefix | Domain |
|--------|--------|
| `/api/coach/` | Daily insight, plan voice |
| `/api/premium/` | Gated content (recipes, programs, mobility, mind, guidebook) |
| `/api/fuel/` | Nutrition APIs (barcode, search, estimate) |
| `/api/school/` | Teacher class, PFT leaderboard |
| `/api/youth/` | COPPA consent |
| `/api/journey/` | Nudge emails |
| `/api/checkout`, `/api/billing-portal`, `/api/crypto-checkout/*`, `/api/stripe-webhook`, `/api/paypal-webhook` | Payments |
| `/api/private-access` | Dev gate |
| `/api/leads` | Waitlist / leads |
| `/api/cron/nudges` | Scheduled nudges |

## Related (not here)

- Page UI: `src/page-components/INDEX.md`
- Business logic: `src/lib/INDEX.md`
- Nav config: `src/lib/navConfig.ts`

## Do not open

- Deleted: `app/api/coach/plan/route.ts` — use `plan-voice` + client `src/lib/coach/`
- Empty ghost dirs were **removed** — signed-in page routes live under `app/(app)/`.
  **Exception (`.595`):** `app/about/`, `app/vision/`, and `app/changelog/` are real,
  deliberate top-level routes. They render marketing chrome (`PublicPageShell`), not
  the app shell, because the landing footer links to them from every public page — a
  visitor clicking "About" or "Changelog" must not land inside a signed-in nav rail.
  URLs are unchanged; route groups do not affect paths.
