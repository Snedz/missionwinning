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
| `/track` | Track | `TrackPage.tsx` |
| `/profile` | You | `ProfilePage.tsx` |

### Train deeper

| URL | Page component |
|-----|----------------|
| `/builder` | `BuilderPage.tsx` |
| `/coach` | `CoachPage.tsx` — **Mission Coach** (AI weekly plan) |
| `/library` | `LibraryPage.tsx` |
| `/history` | `HistoryPage.tsx` |
| `/leaderboard` | `LeaderboardPage.tsx` |
| `/benchmarks` | `BenchmarksPage.tsx` |

### Other pillars & info

| URL | Page component | Notes |
|-----|----------------|-------|
| `/move` | `MovePage.tsx` | Mobility |
| `/mind` | `MindPage.tsx` | Mind & recovery |
| `/learn` | `LearnPage.tsx` | Education |
| `/learn/guide` | `GuidebookIndexPage.tsx` | Guidebook |
| `/coaching` | `CoachingPage.tsx` | **Human** coaching leads — not AI Coach |
| `/welcome` | `WelcomePage.tsx` | I-Day onboarding (also `app/welcome/`) |

### Outside `(app)` group

| URL | File |
|-----|------|
| `/` | `app/page.tsx` → `LandingPage` |
| `/bundle` | `app/bundle/page.tsx` → `BundlePage` (marketing chrome) |
| `/compare` | `app/compare/page.tsx` → `ComparePage` (marketing chrome) |
| `/compare/[slug]` | `CompareStoryPage` — forge / freeletics / spreadsheet |
| `/guide`, `/exercises` | Public SEO pages |
| `/guide` (Apex reader) | `GuidePublicIndexPage` — Contents sidebar + language switcher |
| `/guide/[chapter]` | `GuidePublicChapterPage` — same shell |
| `/guide/print` | Magazine print/PDF source (`GuideMagazinePrintPage`) — noindex |
| `/exercises/muscle/[group]`, `/exercises/equipment/[slug]` | Catalog hub indexes |
| `/paths`, `/paths/[id]` | Public Learn path teasers (in-app Learn stays `/learn`) |
| `/private` | `app/private/page.tsx` |
| `/offline` | `app/offline/page.tsx` |
| `/auth/callback` | `app/auth/callback/page.tsx` |

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
- Empty ghost dirs (`app/about/`, etc.) were **removed** — all page routes live under `app/(app)/`
