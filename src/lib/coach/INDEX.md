# src/lib/coach/

> One concern: Mission Coach — deterministic weekly training plan engine (client-side).

## Read order (engine pipeline)

1. `types.ts` — `CoachPlan`, `CoachContext`, `PlanSession`, `PlanExercise`
2. `schedulePrefs.ts` — days per week, preferred days (`mw_days_per_week`)
3. `equipment.ts` — `equipmentMatches` (optional Home gym kit overlay — filter only, never rank), `mapStorageEquipment`
4. `progression.ts` — `nextTargets` (RPE, stall, deload, % of e1RM `loadPct`, optional `loadZone` cap)
4b. `loadGuard.ts` — `capProgressionForZone`: a **high** ACWR band holds a rise. Cap-only at the set-weight layer; `light`/`unknown` are identity
5. `splitPlanner.ts` — `chooseSplit` (`loadZone` reaches here from context), `mapToCalendar`. `high` inserts one extra recovery day after the strain rules (same primitive as `strain ≥ 85`)
6. `selector.ts` — `pickExercises`, `buildSession` (passes `loadPct`, `ctx.loadZone`)
7. `planEngine.ts` — `generateWeek`, `computeContextHash`
8. `adapt.ts` — `adaptPlan`, missed sessions, readiness swap, equipment change
8b. `adaptSummary.ts` — re-exports from `packages/mw-core` (shared with Expo)
8c. `weekDose.ts` — plain-language weekly “dose” (session count · intent · minutes) for Coach UI
8c2. `weekRationale.ts` — log-cited why-this-week / adapt rationale (inputs · rule · effect) for Coach inspectability (`.693`)
8c3. `logCitation.ts` — the log fact under every Coach line, or `no-logs`; quotes a stored set, never infers (`.766`, survey clarity 2.56/5)
8d. `coachAdaptReentry.ts` — pure: adapt-banner re-entry is coach day vs freestyle Just Go
8e. `resolveCoachBossSessionId.ts` — which session gets filled Start on `/coach` (today pending else next)
8f. `coachChatClient.ts` — HTTP status → copy + stream `[[error:…]]` + slims log/week citations + `readCoachChatStream` (.445/.453)
8g. `agent/` — local RAG + MCP-shaped tools + ReAct loop for premium chat (ZDR one-shot only) — [agent/INDEX.md](agent/INDEX.md)
9. `storage.ts` — `loadPlan`, `savePlan`, taster flags, device id
10. `contextBuilder.ts` — `readLocalCoachContext`, assembles from localStorage + history
11. `planVoiceServer.ts` — LLM/rules voice for weekly briefing (used by API route)
12. `rng.ts` — `mulberry32`, `hashString` (deterministic variety)
13. `adjust.ts` — free offline “adjust today” (time / bodyweight / avoid group; scales `loadPct`)
14. Related: `src/lib/coachChatServer.ts` — premium chat ReAct + retrieve + parse (API `/api/coach/chat`)
15. Related load math: `src/lib/workout/percentLoad.ts` — e1RM → weight from `loadPct`

## Optional LLM + ZDR

Shared client: `src/lib/coachLlmClient.ts` (also used by `coachDailyServer.ts` + chat).

- Prefer SpaceXAI/xAI + Console **Zero Data Retention** (team-wide). Header check: `x-zero-data-retention`.
- Default model `grok-4.6` with `reasoning_effort=low` and live search off. High reasoning is a founder override.
- **Allowed:** one-shot OpenAI-compatible chat completions (including a ReAct loop of one-shots).
- **Forbidden under ZDR ops:** Files, Collections/RAG, Batch, deferred completions, stateful Responses (`store_messages` / `previous_response_id`).
- **Local RAG:** `src/lib/coach/agent/` retrieves over the catalog + guidebook summaries in-process. That is not vendor Collections.
- Env: `COACH_LLM_*` — see root `ENV.md`.

## Tests

| File | Covers |
|------|--------|
| `adaptSummary.test.ts` | Missed / swapped / revision beats for demo banner |
| `coachAdaptReentry.test.ts` | Adapt-banner re-entry is coach-prescribed vs Just Go |
| `resolveCoachBossSessionId.test.ts` | Boss Start pick + grid wiring |
| `coachChatClient.test.ts` | Status copy · stream tags · request context + panel wiring |
| `agent/*.test.ts` | Local corpus · BM25 retrieve · log/week slims · tools · MCP · ReAct · no social imports |
| `weekDose.test.ts` | Session counts + strength/mixed intent labels |
| `weekRationale.test.ts` | Log-cited adapt / why-this-week (inputs · rule · effect) + banner/page wiring |

## Tests (colocated)

| File | Covers |
|------|--------|
| `equipment.test.ts` | Equipment profile filtering + kit overlay (filter-only) |
| `progression.test.ts` | RPE, deload, stall, units |
| `splitPlanner.test.ts` | Splits 2–6 days, calendar |
| `selector.test.ts` | Familiarity, recovery ids, determinism |
| `planEngine.test.ts` | Golden personas, contextHash |
| `coachEval.test.ts` | GNT-2 U1 strain sweep + `loadZone` high ≠ steady |
| `coachEvalProgression.test.ts` | GNT-2 U2: clean last session raises load at `generateWeek` |
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
| Training load / ACWR band | `src/lib/coach/load.ts` — Foster sRPE + EWMA. **Descriptive, never predictive** (LEGAL_SAFETY §3a); ratio is `null` under 14 days. Reaches the plan only via `loadGuard.ts`, and only to hold a rise |
| Strength progress | `src/lib/coach/progress.ts` — `estimate1rm` is **the** 1RM estimator (Brzycki ≤10 / Epley 11–12, cap 12); PRs, plateaus. `stallSignal` is **the** stall truth (`stalled` \| `plateaued`), consumed by `progression.ts` *and* `debrief.ts` so they cannot disagree |
| Session debrief | `src/lib/coach/debrief.ts` — rules-composed lines, tone-tested via `reentryTone.ts` |
| Set arithmetic | `src/lib/workout/setMath.ts` — shared `roundToStep` / `workingSets` / `loadBearingSets` |
| Cross-platform set shape | `src/lib/sync/normalizeExercises.ts` — Android flat ⇄ web nested |
| Daily insight | `src/lib/coachDailyServer.ts` |
| Cross-pillar rules | `src/lib/crossPillarCoach.ts` |
| Human coaching leads | `/coaching`, `CoachingPage.tsx` |

## Do not open

- `src/lib/coachPlan.ts` — **deleted**
- `CoachPlanCard.tsx` — **deleted**
- `app/api/coach/plan/route.ts` — **deleted**
