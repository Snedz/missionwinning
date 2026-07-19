# src/lib/coach/

> One concern: Mission Coach — deterministic weekly training plan engine (client-side).

## Read order (engine pipeline)

1. `types.ts` — `CoachPlan`, `CoachContext`, `PlanSession`, `PlanExercise`
2. `schedulePrefs.ts` — days per week, preferred days (`mw_days_per_week`)
3. `equipment.ts` — `equipmentMatches`, `mapStorageEquipment`
4. `progression.ts` — `nextTargets` (RPE, stall, deload, % of e1RM `loadPct`)
5. `splitPlanner.ts` — `chooseSplit`, `mapToCalendar`, week start helpers
6. `selector.ts` — `pickExercises`, `buildSession` (passes `loadPct`)
7. `planEngine.ts` — `generateWeek`, `computeContextHash`
8. `adapt.ts` — `adaptPlan`, missed sessions, readiness swap, equipment change
9. `storage.ts` — `loadPlan`, `savePlan`, taster flags, device id
10. `contextBuilder.ts` — `readLocalCoachContext`, assembles from localStorage + history
11. `planVoiceServer.ts` — LLM/rules voice for weekly briefing (used by API route)
12. `rng.ts` — `mulberry32`, `hashString` (deterministic variety)
13. `adjust.ts` — free offline “adjust today” (time / bodyweight / avoid group; scales `loadPct`)
14. Related: `src/lib/coachChatServer.ts` — premium chat prompts + parse (API `/api/coach/chat`)
15. Related load math: `src/lib/workout/percentLoad.ts` — e1RM → weight from `loadPct`

## Optional LLM + ZDR

Shared client: `src/lib/coachLlmClient.ts` (also used by `coachDailyServer.ts` + chat).

- Prefer SpaceXAI/xAI + Console **Zero Data Retention** (team-wide). Header check: `x-zero-data-retention`.
- **Allowed:** one-shot OpenAI-compatible chat completions.
- **Forbidden under ZDR ops:** Files, Collections/RAG, Batch, deferred completions, stateful Responses (`store_messages` / `previous_response_id`).
- Env: `COACH_LLM_*` — see root `ENV.md`.

## Tests

| File | Covers |
|------|--------|
| `adjust.test.ts` | Time cap, bodyweight, avoid, revision, determinism |

## Tests (colocated)

| File | Covers |
|------|--------|
| `equipment.test.ts` | Equipment profile filtering |
| `progression.test.ts` | RPE, deload, stall, units |
| `splitPlanner.test.ts` | Splits 2–6 days, calendar |
| `selector.test.ts` | Familiarity, recovery ids, determinism |
| `planEngine.test.ts` | Golden personas, contextHash |
| `adapt.test.ts` | Missed, readiness, equipment |
| `planVoiceServer.test.ts` | Malformed LLM → rules fallback |

## UI & integration (not in this folder)

| Layer | Path |
|-------|------|
| Hook | `src/hooks/useCoachPlan.ts` |
| Page | `src/page-components/CoachPage.tsx` |
| Components | `src/components/coach/` |
| Route | `app/(app)/coach/page.tsx` |
| Voice API | `app/api/coach/plan-voice/route.ts` |
| Cloud sync | `src/lib/coachSync.ts` |
| Journey sync fields | `src/lib/journeySync.ts` (`coach_plan`, `coach_taster_used`) |

## Related (different “coach” meanings)

| Term | Path |
|------|------|
| Daily insight | `src/lib/coachDailyServer.ts` |
| Cross-pillar rules | `src/lib/crossPillarCoach.ts` |
| Human coaching leads | `/coaching`, `CoachingPage.tsx` |

## Do not open

- `src/lib/coachPlan.ts` — **deleted**
- `CoachPlanCard.tsx` — **deleted**
- `app/api/coach/plan/route.ts` — **deleted**
