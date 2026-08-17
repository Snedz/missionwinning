# src/components/journey/

> Mission journey UX — I-Day through Commissioned.

## Components

| File | Purpose |
|------|---------|
| `JourneyHero.tsx` | Phase hero banner — **two forms**, on `useIsCompact()`. Lean `dock="start"` is one word: Start / Resume / Repeat last / this session. Never I-Day. Never Just Go lecture. |
| `JourneyGuard.tsx` | Redirect if I-Day incomplete |
| `CommandersIntent.tsx` | Goal statement card |
| `TodaySection.tsx` | Journey block on Today |
| `TodayQuickLinks.tsx` | Phase-appropriate links |
| `CommissioningCeremony.tsx` | Commissioned celebration |
| `FirstStepsCard.tsx` | First-steps checklist card on Today (segment progress, dismissible) |
| `FirstStepsSheet.tsx` | The full list — ruled rows, each with a reason line |

## Related

| Layer | Path |
|-------|------|
| Pages | `WelcomePage.tsx`, `HomePage.tsx` |
| Hook | `useMissionJourney.ts` |
| Lib | `missionJourney.ts`, `journeySync.ts` |
| Doc | `JOURNEY.md` |

## Phase naming

Journey "Phase 0–3" ≠ build phases in `PLAN.md`.
