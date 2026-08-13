# src/page-components/

> One concern: Full-page UI — one component per route (fat pages).

## Read order

1. [app/INDEX.md](../../app/INDEX.md) — URL → page mapping
2. The page file for your route (table below)

## Pages by pillar

### Today & journey

| File | Route |
|------|-------|
| `HomePage.tsx` | `/log` (Today) |
| `WelcomePage.tsx` | `/welcome` |
| `LandingPage.tsx` | `/` |

### Train

| File | Route |
|------|-------|
| `ActiveWorkoutPage.tsx` | `/active` |
| `BuilderPage.tsx` | `/builder` |
| `HistoryPage.tsx` | `/history` |
| `LibraryPage.tsx` | `/library` |
| `BenchmarksPage.tsx` | `/benchmarks` |
| `LeaderboardPage.tsx` | `/leaderboard` |

### Mission Coach (AI)

| File | Route | Notes |
|------|-------|-------|
| `CoachPage.tsx` | `/coach` | Weekly AI plan |
| `CoachingPage.tsx` | `/coaching` | **Human** lead form — not AI Coach |

### Fuel / Move / Mind / Track / Learn

| File | Route |
|------|-------|
| `NutritionPage.tsx` | `/nutrition` (Fuel) — shell + state; logging UI in `src/components/nutrition/` |
| `MovePage.tsx` | `/move` |
| `MindPage.tsx` | `/mind` |
| `TrackPage.tsx` | `/track` |
| `LearnPage.tsx` | `/learn` |
| `GuidebookIndexPage.tsx` | `/learn/guide` |
| `GuidebookChapterPage.tsx` | `/learn/guide/[chapterId]` |
| `GuidePublicIndexPage.tsx` | `/guide` — Apex shell + Contents |
| `GuidePublicChapterPage.tsx` | `/guide/[chapter]` — Apex shell |
| `GuideMagazinePrintPage.tsx` | `/guide/print` (PDF source) |

### Premium & marketing

| File | Route |
|------|-------|
| `BundlePage.tsx` | `/bundle` |
| `LearnPathsPublicIndexPage.tsx` | `/paths` |
| `LearnPathPublicPage.tsx` | `/paths/[id]` |
| `ExerciseMuscleHubPage.tsx` | `/exercises/muscle/[group]` |
| `ExerciseEquipmentHubPage.tsx` | `/exercises/equipment/[slug]` |
| `ProgramsPage.tsx` | `/programs` |
| `AboutPage.tsx` | `/about` |
| `PressPage.tsx` | `/press` — brand & media kit |
| `VisionPage.tsx` | `/vision` |

### School / PFT / America

| File | Route |
|------|-------|
| `FitnessTestPage.tsx` | `/fitness-test` |
| `AmericaPage.tsx` | `/america` |
| `TeacherClassPage.tsx` | `/school/class/[code]` |
| `JoinClassPage.tsx` | `/join/class/[code]` |

### Account & legal

| File | Route |
|------|-------|
| `ProfilePage.tsx` | `/profile` — the Athlete Page: identity, career line, badge shelf |
| `AccountPage.tsx` | `/account` — settings; cards in `src/components/profile/` |
| `TransparencyPage.tsx` | `/account/transparency` — Visibility report (download JSON + text) |
| `UnderTheHoodPage.tsx` | `/account/under-the-hood` — BOOSTS / PENALTIES weights |
| `PrivacyPage.tsx` | `/privacy` |
| `CookiesPage.tsx` | `/cookies` |
| `AccessibilityPage.tsx` | `/accessibility` |
| `TermsPage.tsx` | `/terms` |
| `DmcaPage.tsx` | `/dmca` |
| `RefundsPage.tsx` | `/refunds` |
| `FeedbackPage.tsx` | `/feedback` |
| `AssessmentsPage.tsx` | `/assessments` |
| `CalculatorsPage.tsx` | `/calculators` |
| `BetaStartPage.tsx` | `/beta` |
| `AuthCallbackPage.tsx` | **Removed** — OAuth is `app/auth/callback/route.ts` |
| `YouthConsentConfirmPage.tsx` | `/youth/consent/confirm` |

## Pattern

`app/(app)/foo/page.tsx` is thin:

```tsx
import { FooPage } from '@/page-components/FooPage';
export default function FooRoute() { return <FooPage />; }
```

## Related (not here)

- Shared UI: `src/components/INDEX.md`
- Logic: `src/lib/INDEX.md`
