# src/page-components/

> One concern: Full-page UI — one component per route (fat pages).

## Read order

1. [app/INDEX.md](../../app/INDEX.md) — URL → page mapping
2. The page file for your route (table below)

## Pages by pillar

### Today & journey

| File | Route |
|------|-------|
| `HomePage.tsx` | `/log` (Today) | Summary first paint in every phase — date, pins, one Start |
| `WelcomePage.tsx` | `/welcome` |
| `LandingPage.tsx` | `/` |

### Train

| File | Route |
|------|-------|
| `ActiveWorkoutPage.tsx` | `/active` | Live session is name + table + rest; elapsed pauses (`.1001`); plates / jot / HR in Show all |
| `BuilderPage.tsx` | `/builder` | First paint is Blank workout; program templates in Show all |
| `HistoryPage.tsx` | `/history` | First paint is the session list; calendar / charts / journal in Show all. Finished log can be edited then Saved (`.997`). While editing, lifts can be reordered; Save still confirms (`.1034`). Past session they typed can be Saved as a new log (`.1000`). Duplicate names can be merged (`.1002`). One finished session can be deleted after confirm (`.1003`) and restored (`.1006`). A finished log can be named (`.1007`). Search the list by name, date, or lift (`.1008`). Export the live diary as a file (`.1011`). Import that file after confirm (`.1013`). Open a session to save that one log as a file (`.1016`). Tap a live month day to open those rows (`.1018`). Empty month day can log onto that date (`.1028`). Save this month writes the calendar month on screen (`.1029`). Repeat this session copies the sets they logged into the one live Start (`.1026`). Move to another day re-dates that same finished log (`.1027`). Copy to another day mints a new row; the original stays (`.1030`). After paging months, **This month** jumps back to the current local month and today (`.1031`). A trained calendar day shows how many live sessions, not a fire (`.1032`). The month on screen shows how many live sessions, not a fire (`.1033`). The logged session clock can be edited (seconds or mm:ss) without changing the date or sets (`.1035`). While editing, a lift can be replaced; the sets stay; Save still confirms (`.1036`). While editing, a forgotten lift can be added (empty 0/0); Save still confirms (`.1037`). While editing with two or more lifts, **Remove lift** drops that movement; the last remaining lift is delete-session (`.1038`). While editing, a set's kind can be retagged (W / D / F / work); Save still confirms (`.1039`). While editing, optional 1–10 RPE on a finished set; empty is valid; Save still confirms (`.1040`). While editing, optional 0–5 RIR on a finished set; empty is valid; Save still confirms (`.1041`). While editing a one-sided lift, optional L / R / Alt on a finished set; empty is valid; a squat never gets a side; Save still confirms (`.1042`). Week 1 can start from a chosen date — older sessions stay (`.1005`). |
| `LibraryPage.tsx` | `/library` | First paint is a pick list; posters / templates in Show all. Duplicate names can be merged (`.1002`). A name can be hidden from Add / search (`.1004`). |
| `BenchmarksPage.tsx` | `/benchmarks` |
| `LeaderboardPage.tsx` | `/leaderboard` |

### Mission Coach (AI)

| File | Route | Notes |
|------|-------|-------|
| `CoachPage.tsx` | `/coach` | Weekly AI plan — first paint is this week’s session; house in Show all |
| `CoachingPage.tsx` | `/coaching` | **Human** lead form — not AI Coach |

### Fuel / Move / Mind / Track / Learn

| File | Route |
|------|-------|
| `NutritionPage.tsx` | `/nutrition` (Fuel) — shell + state; logging UI in `src/components/nutrition/`; this week's restock in Show more (`.965`) |
| `MovePage.tsx` | `/move` — quiet rest-day walk / easy log first paint (`.969`); flows stay |
| `MindPage.tsx` | `/mind` | First paint is check-in + breathe; sessions in Show all |
| `TrackPage.tsx` | `/track` | First paint is weight / tape (`.975`); walks / GPS in Show more |
| `LearnPage.tsx` | `/learn` | First paint is the free `sb-0` intro (`.978`); other paths in Show more |
| `GuidebookIndexPage.tsx` | `/learn/guide` |
| `GuidebookChapterPage.tsx` | `/learn/guide/[chapterId]` |
| `GuidePublicIndexPage.tsx` | `/guide` — Apex shell + Contents |
| `GuidePublicChapterPage.tsx` | `/guide/[chapter]` — Apex shell |
| `GuideMagazinePrintPage.tsx` | `/guide/print` (PDF source) |

### Premium & marketing

| File | Route |
|------|-------|
| `BundlePage.tsx` | `/bundle` |
| `NotifyPage.tsx` | `/notify` — Super Bundle waitlist (Get notified; no checkout) |
| `LearnPathsPublicIndexPage.tsx` | `/paths` |
| `LearnPathPublicPage.tsx` | `/paths/[id]` |
| `ExerciseMuscleHubPage.tsx` | `/exercises/muscle/[group]` |
| `ExerciseEquipmentHubPage.tsx` | `/exercises/equipment/[slug]` |
| `ProgramsPage.tsx` | `/programs` |
| `AboutPage.tsx` | `/about` |
| `ChangelogPage.tsx` | `/changelog` — athlete release notes |
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
| `ServerPage.tsx` | `/server` — Mission Server messenger (rooms + presence). Not a Today tab |
| `AccountPage.tsx` | `/account` — settings; cards in `src/components/profile/` |
| `ExplorePlacesPage.tsx` | `/explore` — places pin-board (quiet; not Today) |
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
