package com.missionwinning.core.data

import com.missionwinning.core.network.CoachPlanDto
import com.missionwinning.core.network.PlanExerciseDto
import com.missionwinning.core.network.PlanSessionDto
import com.missionwinning.core.model.WeightUnits
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.double
import kotlinx.serialization.json.int
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.Instant
import java.time.ZoneId
import kotlin.math.abs

class CoachParityTest {
    private val json = Json { ignoreUnknownKeys = true }

    @Test
    fun offlineCompletionMatchesWebProgression() {
        val fixture = requireNotNull(javaClass.getResourceAsStream("/coach-progression-parity.json"))
            .bufferedReader().use { json.parseToJsonElement(it.readText()).jsonObject }
        assertEquals(1, fixture.getValue("version").jsonPrimitive.int)
        val zone = ZoneId.of(fixture.getValue("timeZone").jsonPrimitive.content)
        val progressions = fixture.getValue("progressions").jsonArray.map { it.jsonObject }
        assertTrue("Expected progression fixtures", progressions.isNotEmpty())
        val mismatches = buildList {
            for (case in progressions) {
                val id = case.getValue("id").jsonPrimitive.content
                val webMove = case.getValue("exerciseId").jsonPrimitive.content
                val move = case["androidExerciseId"]?.jsonPrimitive?.content ?: webMove
                val unit = if (case.getValue("units").jsonPrimitive.content == "imperial") "lb" else "kg"
                val workoutId = case.getValue("workoutId").jsonPrimitive.content
                val history = case.getValue("history").jsonArray.map { it.jsonObject }
                val sets = history.flatMap { log ->
                    roomRows(log, unit).map {
                        val set = if (it.exerciseId == webMove) it.copy(exerciseId = move) else it
                        CoachProgressionSet(set, set.completedAt, log.getValue("durationSeconds").jsonPrimitive.int)
                    }
                }
                val expected = json.decodeFromJsonElement(PlanExerciseDto.serializer(), JsonObject(
                    case.getValue("expected").jsonObject + ("exerciseId" to JsonPrimitive(move)),
                ))
                val prescribed = PlanExerciseDto(move, 3, 5)
                val current = PlanSessionDto("mon", 0, "strength", "Monday", exercises = listOf(prescribed),
                    estMinutes = 30, status = "planned")
                val plan = CoachPlanDto(
                    revision = 1, weekStart = "2026-05-18", daysPerWeek = 3,
                    sessions = listOf(current, current.copy(id = "wed", dayOffset = 2),
                        current.copy(id = "fri", dayOffset = 4, status = "swapped")),
                    generatedAt = case.getValue("now").jsonPrimitive.content, contextHash = "offline-seed-test",
                    equipmentProfile = when (move) {
                        "push-ups" -> "bodyweight"
                        "assisted-pullup" -> "full-gym"
                        else -> "dumbbells"
                    }, weightUnit = unit,
                )
                val next = LocalCoachSeed.markDone(
                    plan, current.id, workoutId, sets, Instant.parse(plan.generatedAt), zone,
                ).plan
                assertEquals(id, current.copy(status = "done"), next.sessions.first())
                for (session in next.sessions.drop(1)) {
                    val actual = session.exercises.single()
                    if (actual.copy(weight = expected.weight) != expected || abs(actual.weight - expected.weight) > 1e-6) {
                        add("$id ${session.id}: web=$expected, Android=$actual")
                    }
                }
            }
        }
        assertTrue("${mismatches.size} mismatches in ${progressions.size * 2} prescriptions:\n" +
            mismatches.joinToString("\n"), mismatches.isEmpty())
    }

    @Test
    fun offlineStarterSelectionMatchesWebWithOnlyListedPlanDifferences() {
        val fixture = requireNotNull(javaClass.getResourceAsStream("/coach-parity.json"))
            .bufferedReader().use { json.parseToJsonElement(it.readText()).jsonObject }
        assertEquals("1", fixture.getValue("version").jsonPrimitive.content)
        val cases = fixture.getValue("cases").jsonArray.map { it.jsonObject }
        assertEquals(expectedDifferences.keys.sorted(), cases.map { it.getValue("id").jsonPrimitive.content }.sorted())
        val zone = ZoneId.of(fixture.getValue("timeZone").jsonPrimitive.content)
        val histories = fixture.getValue("histories").jsonObject
        val selectionMismatches = mutableListOf<String>()

        for (case in cases) {
            val id = case.getValue("id").jsonPrimitive.content
            val input = case.getValue("input").jsonObject
            val equipment = input.getValue("equipment").jsonPrimitive.content
            val unit = if (input.getValue("units").jsonPrimitive.content == "imperial") "lb" else "kg"
            val now = Instant.parse(case.getValue("now").jsonPrimitive.content)
            val history = histories.getValue(case.getValue("historyId").jsonPrimitive.content).jsonArray
                .flatMap { roomRows(it.jsonObject, unit) }
            val web = json.decodeFromJsonElement(CoachPlanDto.serializer(), case.getValue("expectedPlan"))
            val response = LocalCoachSeed.build(equipment = equipment, history = history, weightUnit = unit, now = now, zone = zone)
            val native = response.plan
            assertTrue(id, response.adaptBeats.isEmpty() && !response.hasAdaptSignal)
            assertEquals(id, unit, native.weightUnit)
            val mismatchesBefore = selectionMismatches.size
            for ((webSession, nativeSession) in web.sessions.zip(native.sessions)) {
                for (slot in 0 until maxOf(webSession.exercises.size, nativeSession.exercises.size)) {
                    val expected = webSession.exercises.getOrNull(slot)?.exerciseId
                    val actual = nativeSession.exercises.getOrNull(slot)?.exerciseId
                    if (expected != actual) {
                        selectionMismatches.add("$id ${webSession.id} #${slot + 1}: web=$expected, Android=$actual")
                    }
                }
            }
            if (selectionMismatches.size != mismatchesBefore) continue
            assertEquals(id, expectedDifferences.getValue(id), differenceFields(web, native, unit))
            assertEquals(id, 1, native.revision)
            if (history.isNotEmpty()) {
                val last = history.first { it.workoutId == "dumbbells-lb" && it.setIndex == 1 }
                for (session in native.sessions) {
                    val exercise = session.exercises.single { it.exerciseId == last.exerciseId }
                    assertEquals(id, WeightUnits.convertExact(last.weight, last.weightUnit, unit), exercise.weight, 0.005)
                    assertEquals(id, 2, exercise.sets)
                    assertEquals(id, last.reps, exercise.reps)
                    assertEquals(id, "coachWhyHold", exercise.whyKey)
                }
            }
        }
        assertTrue("${selectionMismatches.size} starter exercise-selection mismatches:\n" +
            selectionMismatches.joinToString("\n"), selectionMismatches.isEmpty())
    }

    @Test
    fun seedHoldsRecentNormalWorkAndDoesNotUseWarmupsFailuresDropsOrFutureSets() {
        val now = Instant.parse("2026-05-20T12:00:00Z")
        val base = SetLogEntity(
            id = "work-0", exerciseId = "db-floor-press", exerciseName = "Dumbbell floor press",
            setIndex = 0, reps = 8, weight = 15.0, completedAt = "2026-05-19T12:00:00Z",
            sessionId = null, weightUnit = "kg", workoutId = "recent",
        )
        val history = listOf(
            base.copy(id = "prior", workoutId = "prior", completedAt = "2026-05-18T12:00:00Z", weight = 40.0),
            base.copy(id = "future", workoutId = "future", completedAt = "2026-05-21T12:00:00Z", weight = 90.0),
            base.copy(id = "warm", setIndex = 2, setKind = "warmup", weight = 99.0),
            base.copy(id = "failure", setIndex = 3, setKind = "failure", weight = 88.0),
            base.copy(id = "drop", setIndex = 4, setKind = "drop", weight = 77.0),
            base,
            base.copy(id = "work-1", setIndex = 1, reps = 7, weight = 12.5),
        )
        val plan = LocalCoachSeed.build(equipment = "dumbbells", history = history, now = now, zone = ZoneId.of("UTC")).plan
        val press = plan.sessions.first().exercises.single { it.exerciseId == "db-floor-press" }
        assertEquals(12.5, press.weight, 0.0)
        assertEquals(7, press.reps)
        assertEquals(2, press.sets)
        val unlogged = plan.sessions.first().exercises.filterNot { it.exerciseId == "db-floor-press" }
        assertEquals(2, unlogged.size)
        assertTrue(unlogged.all { it.weight == 0.0 })
        val withoutGear = LocalCoachSeed.build(history = history, now = now, zone = ZoneId.of("UTC")).plan
        assertTrue(withoutGear.sessions.flatMap { it.exercises }.none { it.weight > 0 || it.exerciseId == "db-floor-press" })
    }

    @Test
    fun dumbbellsSeedDoesNotAddGearFromHistoryOrTheAdaptDemo() {
        val history = listOf(
            "dumbbell-fly", "db-fly", "banded-dislocate", "kettlebell-swing", "db-press",
            "bench-dip", "pull-ups", "db-floor-press",
        )
            .map { id ->
                SetLogEntity(
                    id = id, exerciseId = id, exerciseName = id, setIndex = 0, reps = 6,
                    weight = 20.0, completedAt = "2026-05-17T12:00:00Z",
                    sessionId = null, weightUnit = "kg", workoutId = id,
                )
            }
        val blocked = history.dropLast(1).map { it.exerciseId }.toSet()
        for (demo in listOf(false, true)) {
            val plan = LocalCoachSeed.build(
                withAdaptDemo = demo, equipment = "dumbbells", history = history,
                now = Instant.parse("2026-05-18T12:00:00Z"), zone = ZoneId.of("UTC"),
            ).plan
            val ids = plan.sessions.flatMap { it.exercises.map { e -> e.exerciseId } }.toSet()
            assertEquals("demo=$demo", emptySet<String>(), ids.intersect(blocked))
            if (!demo) assertTrue("a compatible history lift should be retained", "db-floor-press" in ids)
        }
    }

    @Test
    fun dumbbellsSeedDoesNotPrescribeSyncedBenchFly() {
        val history = listOf(SetLogEntity(
            id = "fly", exerciseId = "dumbbell-fly", exerciseName = "Dumbbell Fly", setIndex = 0,
            reps = 10, weight = 15.0, completedAt = "2026-05-17T12:00:00Z", sessionId = null,
            weightUnit = "kg", workoutId = "recent",
        ))
        val plan = LocalCoachSeed.build(
            equipment = "dumbbells", history = history,
            now = Instant.parse("2026-05-18T12:00:00Z"), zone = ZoneId.of("UTC"),
        ).plan
        assertTrue("synced bench fly returned to the plan",
            plan.sessions.flatMap { it.exercises }.none { it.exerciseId == "dumbbell-fly" })
    }

    @Test
    fun manualAndPlannerJumpSquatIdsShareOneTargetAndOneHistory() {
        val manual = SetLogEntity(
            id = "manual", exerciseId = "jump-squat", exerciseName = "Jump squat",
            setIndex = 1, reps = 8, weight = 0.0, completedAt = "2026-05-17T12:00:00Z",
            sessionId = null, weightUnit = "kg", workoutId = "recent",
        )
        val planner = manual.copy(id = "plan", exerciseId = "jump-squats", setIndex = 0, reps = 6)
        val push = manual.copy(id = "push", exerciseId = "pushup", completedAt = "2026-05-16T12:00:00Z")
        val plan = LocalCoachSeed.build(
            history = listOf(manual, planner, push),
            now = Instant.parse("2026-05-18T12:00:00Z"), zone = ZoneId.of("UTC"),
        ).plan
        for (session in plan.sessions) {
            val jumps = session.exercises.filter { it.exerciseId in setOf("jump-squat", "jump-squats") }
            assertEquals(listOf("jump-squats"), jumps.map { it.exerciseId })
            assertEquals(8, jumps.single().reps)
            assertEquals(2, jumps.single().sets)
        }
    }

    @Test
    fun legacyFamiliarityIsRankedWithoutBiasFromWorkoutRecency() {
        val ids = listOf("back-squat", "db-curl", "db-hammer-curl", "bench-press")
        val history = ids.mapIndexed { index, id ->
            SetLogEntity(
                id = id, exerciseId = id, exerciseName = id, setIndex = 0, reps = 6,
                weight = 20.0, completedAt = "2026-05-1${index + 4}T12:00:00Z",
                sessionId = null, weightUnit = "kg", workoutId = id,
            )
        }
        fun picks(rows: List<SetLogEntity>) = LocalCoachSeed.build(
            equipment = "full-gym", history = rows,
            now = Instant.parse("2026-05-18T12:00:00Z"), zone = ZoneId.of("UTC"),
        ).plan.sessions.map { session -> session.exercises.map { it.exerciseId } }

        val original = picks(history)
        val reversed = picks(history.mapIndexed { index, row ->
            row.copy(completedAt = history[history.lastIndex - index].completedAt)
        })
        assertEquals(original, reversed)
        assertTrue(original.all { it.first() == "bench-press" })
    }

    @Test
    fun bodyweightSeedUsesOlderUnweightedHistoryWhenLatestWorkoutWasWeighted() {
        val now = Instant.parse("2026-05-20T12:00:00Z")
        val unweighted = SetLogEntity(
            id = "bodyweight-0", exerciseId = "chinup", exerciseName = "Chin-up",
            setIndex = 0, reps = 9, weight = 0.0, completedAt = "2026-05-18T12:00:00Z",
            sessionId = null, workoutId = "unweighted",
        )
        val history = listOf(
            unweighted.copy(id = "weighted-0", workoutId = "weighted", completedAt = "2026-05-19T12:00:00Z", weight = 10.0, reps = 4),
            unweighted,
            unweighted.copy(id = "bodyweight-1", setIndex = 1, reps = 7),
        )
        val zone = ZoneId.of("UTC")
        val bodyweight = LocalCoachSeed.build(equipment = "bodyweight", history = history, now = now, zone = zone)
        val pull = bodyweight.plan.sessions.first().exercises.first { it.exerciseId in setOf("chinup", "row") }
        assertEquals("chinup", pull.exerciseId)
        assertEquals(7, pull.reps)
        assertEquals(2, pull.sets)
        assertEquals(0.0, pull.weight, 0.0)
        val gym = LocalCoachSeed.build(equipment = "full-gym", history = history, now = now, zone = zone)
        val weighted = gym.plan.sessions.first().exercises.single { it.exerciseId == "chinup" }
        assertEquals(4, weighted.reps)
        assertEquals(1, weighted.sets)
        assertEquals(10.0, weighted.weight, 0.0)
    }

    @Test
    fun coldStartOnLocalSundayNeverSchedulesInThePastOrInventsALoad() {
        val now = Instant.parse("2026-05-25T01:00:00Z")
        val response = LocalCoachSeed.build(
            equipment = "full-gym", now = now, zone = ZoneId.of("America/New_York"),
        )
        assertEquals("2026-05-18", response.plan.weekStart)
        assertEquals(listOf(6), response.plan.sessions.map { it.dayOffset })
        assertTrue(response.plan.sessions.single().exercises.all {
            it.weight == 0.0 && it.whyKey == "coachFindWorkingWeight"
        })
    }

    private fun roomRows(log: JsonObject, unit: String): List<SetLogEntity> {
        // Mirror the Room read's exclusion of tombstoned parent workouts. Individual set units win.
        if (log["deletedAt"]?.jsonPrimitive?.contentOrNull != null) return emptyList()
        val id = log.getValue("id").jsonPrimitive.content
        return log.getValue("exercises").jsonArray.flatMap { jsonExercise ->
            val exercise = jsonExercise.jsonObject
            val exerciseId = exercise.getValue("exerciseId").jsonPrimitive.content
            exercise.getValue("sets").jsonArray.mapIndexed { index, jsonSet ->
                val set = jsonSet.jsonObject
                SetLogEntity(
                    id = "$id:$exerciseId:$index",
                    exerciseId = exerciseId,
                    exerciseName = exerciseId,
                    setIndex = index,
                    reps = set.getValue("reps").jsonPrimitive.int,
                    weight = set.getValue("weight").jsonPrimitive.double,
                    completedAt = log.getValue("completedAt").jsonPrimitive.content,
                    sessionId = null,
                    weightUnit = set["weightUnit"]?.jsonPrimitive?.contentOrNull
                        ?: log["weightUnit"]?.jsonPrimitive?.contentOrNull ?: unit,
                    workoutId = id,
                    rpe = when (set["rpe"]?.jsonPrimitive?.contentOrNull) {
                        "easy" -> 6
                        "med" -> 7
                        "hard" -> 9
                        else -> null
                    },
                    setKind = set["kind"]?.jsonPrimitive?.contentOrNull ?: "normal",
                )
            }
        }
    }

    // Compare shared slots by display order; report extra slots via session-count.
    private fun differenceFields(web: CoachPlanDto, native: CoachPlanDto, unit: String): Set<String> = buildSet {
        fun compare(field: String, webValue: Any, nativeValue: Any) {
            if (webValue != nativeValue) add(field)
        }
        compare("equipment", web.equipmentProfile, native.equipmentProfile)
        compare("revision", web.revision, native.revision)
        compare("week-start", web.weekStart, native.weekStart)
        compare("generated-at", Instant.parse(web.generatedAt), Instant.parse(native.generatedAt))
        compare("days-per-week", web.daysPerWeek, native.daysPerWeek)
        compare("context-hash", web.contextHash, native.contextHash)
        compare("session-count", web.sessions.size, native.sessions.size)
        for ((w, n) in web.sessions.zip(native.sessions)) {
            compare("session-ids", w.id, n.id)
            compare("day-offsets", w.dayOffset, n.dayOffset)
            compare("session-kinds", w.kind, n.kind)
            compare("session-names", w.name, n.name)
            compare("focus-groups", w.focusGroups, n.focusGroups)
            compare("estimates", w.estMinutes, n.estMinutes)
            compare("statuses", w.status, n.status)
            // Lists include order/size; compare prescriptions separately so each gap is measured.
            compare("sets", w.exercises.map { it.sets }, n.exercises.map { it.sets })
            compare("reps", w.exercises.map { it.reps }, n.exercises.map { it.reps })
            compare("rationale-keys", w.exercises.map { it.whyKey }, n.exercises.map { it.whyKey })
            val webLoads = w.exercises.filter { it.weight > 0 }.associate { it.exerciseId to it.weight }
            val nativeLoads = n.exercises.filter { it.weight > 0 }.associate { it.exerciseId to it.weight }
            // Web rounds to a progression increment; native carries the logged physical load.
            if (webLoads.keys != nativeLoads.keys || webLoads.any { (id, weight) ->
                    abs(WeightUnits.convertExact(weight - nativeLoads.getValue(id), unit, "kg")) > 0.1
                }) add("nonzero-loads")
        }
    }

    // Offline source marker, not the web readiness/load context fingerprint.
    private val offlineVsWeb = setOf("context-hash")

    private val expectedDifferences = mapOf(
        "cold-start-bodyweight" to offlineVsWeb,
        "cold-start-dumbbells" to offlineVsWeb,
        // Fresh offline seeds start at revision 1.
        "mixed-history-metric" to offlineVsWeb + "revision",
        "mixed-history-imperial" to offlineVsWeb + "revision",
    )
}
