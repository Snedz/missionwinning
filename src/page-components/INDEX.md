# src/page-components/

> One concern: Full-page UI — one component per route (fat pages).

## Read order

1. [app/INDEX.md](../../app/INDEX.md) — URL → page mapping
2. The page file for your route (table below)

## Pages by pillar

### Today & journey

| File | Route |
|------|-------|
| `HomePage.tsx` | `/log` (Today) | House desk — one Start, week as work. Not Lean. |
| `TodayDesk.tsx` | `/log` desk | Date + session + one Start. Week / Generate stay off first paint. |
| `WelcomePage.tsx` | `/welcome` |
| `LandingPage.tsx` | `/` |

### Train

| File | Route |
|------|-------|
| `ActiveWorkoutPage.tsx` | `/active` | House compose canvas + sidecar (rest / skip / jot). First paint writes today's session in `useLayoutEffect` and paints a set table before hydrate. Live session is name + table + rest; elapsed pauses (`.1001`); plates / jot / HR in Show all |
| `BuilderPage.tsx` | `/builder` | Write side of the official training catalog. First paint is Blank workout; program templates in Show all. Builder Show all extras is house leftover (fold chrome only — ProgramTemplatesPanel internals stay). Not a shop. |
| `HistoryPage.tsx` | `/history` | First paint is the session list; calendar / charts / journal in Show all. History Show all extras is house leftover (fold chrome only). Finished log can be edited then Saved (`.997`). While editing, lifts can be reordered; Save still confirms (`.1034`). Past session they typed can be Saved as a new log (`.1000`). Duplicate names can be merged (`.1002`). One finished session can be deleted after confirm (`.1003`) and restored (`.1006`). A finished log can be named (`.1007`). Search the list by name, date, or lift (`.1008`) — search is house-field. Export the live diary as a file (`.1011`). Import that file after confirm (`.1013`). Open a session to save that one log as a file (`.1016`). Tap a live month day to open those rows (`.1018`). Empty month day can log onto that date (`.1028`). Save this month writes the calendar month on screen (`.1029`). Repeat this session copies the sets they logged into the one live Start (`.1026`). Move to another day re-dates that same finished log (`.1027`). Copy to another day mints a new row; the original stays (`.1030`). After paging months, **This month** jumps back to the current local month and today (`.1031`). A trained calendar day shows how many live sessions, not a fire (`.1032`). The month on screen shows how many live sessions, not a fire (`.1033`). The logged session clock can be edited (seconds or mm:ss) without changing the date or sets (`.1035`). A finished log can take a private session note (`.1046`) — own Save, not the set editor. While editing, a lift can be replaced; the sets stay; Save still confirms (`.1036`). While editing, a forgotten lift can be added (empty 0/0); Save still confirms (`.1037`). While editing with two or more lifts, **Remove lift** drops that movement; the last remaining lift is delete-session (`.1038`). While editing, a set's kind can be retagged (W / D / F / work); Save still confirms (`.1039`). While editing, optional 1–10 RPE on a finished set; empty is valid; Save still confirms (`.1040`). While editing, optional 0–5 RIR on a finished set; empty is valid; Save still confirms (`.1041`). While editing a one-sided lift, optional L / R / Alt on a finished set; empty is valid; a squat never gets a side; Save still confirms (`.1042`). While editing, optional e-p-c tempo on a finished set; empty is valid; `311` invents nothing; Save still confirms (`.1043`). While editing a weight lift, optional % of a known 1-rep max on a finished set; empty is valid; `0` / `101` invent nothing; kg is not rewritten from %; Save still confirms (`.1044`). While editing, optional per-lift diary on a finished exercise; empty is valid; over-cap truncates at 200; Save still confirms (`.1045`). While editing two or more lifts, **Superset w/ next** pairs this lift with the next; **Unlink superset** clears this lift's group; Save still confirms (`.1047`). Week 1 can start from a chosen date — older sessions stay (`.1005`). |
| `LibraryPage.tsx` | `/library` | Official exercise catalog. House catalog states (muscle chips) + short first-paint list; posters / templates / merge in Show all. Duplicate names can be merged (`.1002`). A name can be hidden from Add / search (`.1004`). Hidden / Unhide first-paint is a house leftover only when a name is hidden — empty is honest. Search is house-field. Library pick bar is house leftover. Library Show all extras is house leftover (fold chrome only — posters / merge stay). |
| `BenchmarksPage.tsx` | `/benchmarks` |
| `LeaderboardPage.tsx` | `/leaderboard` |

### Mission Coach (AI)

| File | Route | Notes |
|------|-------|-------|
| `CoachPage.tsx` | `/coach` | Weekly AI plan — empty + Generate, or this week’s session (`.1062`). Week strip, dose, live voice, next-day cite, Show all, chat, and Super Bundle taster unmounted. `generateWeek` stays the week writer via `useCoachPlan`. |
| `CoachingPage.tsx` | `/coaching` | Human 1:1 leftover form — not Mission Coach. Never a rail. |

### Fuel / Move / Mind / Track / Learn

| File | Route |
|------|-------|
| `NutritionPage.tsx` | `/nutrition` (Fuel) — empty + Log meal, or today's meals. FuelLogSheet is the writer. Remaining / notepad / Show more / recipes stay off first paint. |
| `MovePage.tsx` | `/move` — quiet rest-day walk / easy log first paint (`.969`); quiet log and flow list are house leftovers. Extra tools in Show all |
| `MindPage.tsx` | `/mind` | First paint is check-in + breathe; both are house leftovers. Sessions in Show all |
| `TrackPage.tsx` | `/track` | First paint is weight / tape (`.975`); metrics card is house leftover. Walks / GPS in Show more |
| `LearnPage.tsx` | `/learn` | First paint is the free `sb-0` intro (`.978`); intro is house leftover. Other paths in Show more |
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
| `ProgramsPage.tsx` | `/programs` | Leftover education outlines; Unlock / price in Show all. Never a rail. Not a shop. |
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
| `AccountPage.tsx` | `/account` — settings leftover; sign-in / return / prefs first; Explore / more / help are house-card |
| `ExplorePlacesPage.tsx` | `/explore` — places leftover; board + pin list first; Add a place is house-card. Quiet Account door. Not a shop. |
| `PrivacyPage.tsx` | `/privacy` — leftover policy; jump chips + house-card sections. Never a rail. |
| `CookiesPage.tsx` | `/cookies` — leftover inventory; overview + table first. Never a rail. |
| `AccessibilityPage.tsx` | `/accessibility` — leftover accessibility; jump chips + house-card sections. Never a rail. |
| `TermsPage.tsx` | `/terms` — leftover terms; jump chips + house-card sections. Never a rail. |
| `DmcaPage.tsx` | `/dmca` — leftover DMCA; jump chips + house-card sections. Never a rail. |
| `RefundsPage.tsx` | `/refunds` — leftover refunds; jump chips + house-card sections. Never a rail. |
| `UsagePolicyPage.tsx` | `/usage` — leftover usage; jump chips + house-card sections. Never a rail. |
| `SupportedRegionsPage.tsx` | `/regions` — leftover regions; jump chips + house-card sections. Never a rail. |
| `ServiceTermsPage.tsx` | `/service-terms` — leftover service terms; jump chips + house-card sections. Never a rail. |
| `HelpPage.tsx` | `/help` — leftover FAQ; hairline items. Never a rail. |
| `FeedbackPage.tsx` | `/feedback` |
| `AssessmentsPage.tsx` | `/assessments` — leftover form; one filled submit; stage prompts in Show all. Account door. |
| `CalculatorsPage.tsx` | `/calculators` — leftover tools; 1RM / macros / plates first; premium in Show all. Account More-settings door. Never a rail. |
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
