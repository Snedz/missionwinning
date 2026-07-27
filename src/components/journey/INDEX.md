# src/components/journey/

> Mission journey UX — I-Day through Commissioned.

## Components

| File | Purpose |
|------|---------|
| `JourneyHero.tsx` | Phase hero banner — **two forms**, on `useIsCompact()`: an inline red field with kicker + full title + description at `md+` (desktop handoff), a docked field whose button label *is* the title on compact (mobile handoff) |
| `JourneyGuard.tsx` | Redirect if I-Day incomplete |
| `CommandersIntent.tsx` | Goal statement card |
| `TodaySection.tsx` | Journey block on Today |
| `TodayQuickLinks.tsx` | Phase-appropriate links |
| `CommissioningCeremony.tsx` | Commissioned celebration |
| `BetaWelcomeBanner.tsx` | Beta cohort banner |

## Related

| Layer | Path |
|-------|------|
| Pages | `WelcomePage.tsx`, `HomePage.tsx` |
| Hook | `useMissionJourney.ts` |
| Lib | `missionJourney.ts`, `journeySync.ts` |
| Doc | `JOURNEY.md` |

## Phase naming

Journey "Phase 0–3" ≠ build phases in `PLAN.md`.
