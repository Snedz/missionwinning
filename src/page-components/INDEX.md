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
| `NutritionPage.tsx` | `/nutrition` (Fuel) |
| `MovePage.tsx` | `/move` |
| `MindPage.tsx` | `/mind` |
| `TrackPage.tsx` | `/track` |
| `LearnPage.tsx` | `/learn` |
| `GuidebookIndexPage.tsx` | `/learn/guide` |
| `GuidebookChapterPage.tsx` | `/learn/guide/[chapterId]` |

### Premium & marketing

| File | Route |
|------|-------|
| `BundlePage.tsx` | `/bundle` |
| `ComparePage.tsx` | `/compare` |
| `CompareStoryPage.tsx` | `/compare/[slug]` |
| `LearnPathsPublicIndexPage.tsx` | `/paths` |
| `LearnPathPublicPage.tsx` | `/paths/[id]` |
| `ExerciseMuscleHubPage.tsx` | `/exercises/muscle/[group]` |
| `ExerciseEquipmentHubPage.tsx` | `/exercises/equipment/[slug]` |
| `ProgramsPage.tsx` | `/programs` |
| `AboutPage.tsx` | `/about` |
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
| `ProfilePage.tsx` | `/profile` |
| `PrivacyPage.tsx` | `/privacy` |
| `TermsPage.tsx` | `/terms` |
| `FeedbackPage.tsx` | `/feedback` |
| `AssessmentsPage.tsx` | `/assessments` |
| `CalculatorsPage.tsx` | `/calculators` |
| `BetaStartPage.tsx` | `/beta` |
| `AuthCallbackPage.tsx` | `/auth/callback` |
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
