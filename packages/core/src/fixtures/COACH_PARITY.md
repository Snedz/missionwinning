# Shared Coach plan fixtures

[`coach-parity.json`](coach-parity.json) is the version 1 contract for the history-aware notebook planner. `npm test -w packages/core` runs it against the same `generateNotebookWeek` entry point used by the v2 web notebook. It compares the entire plan, including calendar offsets, ordered exercise IDs, prescriptions, and rationale keys.

- `histories` maps names to newest-first completed workout arrays. Each case looks up its input by `historyId`. These records are synthetic and use the web backup's history shape. A set's `weightUnit` overrides its workout's `weightUnit`; untagged history falls back to the input preference. Ignore records marked `deletedAt`.
- `input` provides the equipment, days per week, `metric` or `imperial` units, and plan revision. Freeze the clock at `now` in the top-level `timeZone`. In the result, `weekStart` is a local Monday date and `dayOffset` is a zero-based calendar offset. `generatedAt` is an instant.
- `expectedPlan` is a plan object, not the mobile response envelope. `weightUnit` labels every prescription in that plan. The cases cover a cold start and the same mixed kg/lb history read in both preferences, with a deleted row excluded and midweek scheduling.

## Consuming in Compose

Copy the same JSON into the Android network or Coach module's `src/test/resources` and read it as a Kotlin serialization `JsonObject`. For each entry in `cases`, decode its `expectedPlan` using the existing decoder with `ignoreUnknownKeys = true`:

```kotlin
val fixture = json.parseToJsonElement(resourceText).jsonObject
for (entry in fixture.getValue("cases").jsonArray) {
    val expected = entry.jsonObject.getValue("expectedPlan")
    val plan = json.decodeFromJsonElement<CoachPlanDto>(expected)
    // Use plan in the existing Coach rendering/presentation tests.
}
```

An HTTP-response test can wrap the same object as `{"plan": expectedPlan, "adaptBeats": [], "hasAdaptSignal": false}` and decode `CoachPlanResponseDto`. The current DTO ignores optional fields such as `weightUnit` and `loadPct`; tests verifying those fields must read the raw JSON or add optional fields to the DTO. Do not infer kg for a fixture explicitly marked lb.

This suite does not run Kotlin or assert that the existing Android seed endpoint personalizes from history. `/api/mobile/coach/plan` still serves its legacy seed/bootstrap contract. The fixtures let Compose test decoding and rendering of the same plans before wiring up any history-aware endpoint or shared engine.
