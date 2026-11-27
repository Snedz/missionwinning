package com.missionwinning.core.data

import com.missionwinning.core.network.CoachPlanDto
import com.missionwinning.core.model.WeightUnits
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
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
    fun offlineSeedMatchesExactlyTheListedWebDifferences() {
        val fixture = requireNotNull(javaClass.getResourceAsStream("/coach-parity.json"))
            .bufferedReader().use { json.parseToJsonElement(it.readText()).jsonObject }
        assertEquals("1", fixture.getValue("version").jsonPrimitive.content)
        val cases = fixture.getValue("cases").jsonArray.map { it.jsonObject }
        assertEquals(expectedDifferences.keys.sorted(), cases.map { it.getValue("id").jsonPrimitive.content }.sorted())
        val zone = ZoneId.of(fixture.getValue("timeZone").jsonPrimitive.content)
        val histories = fixture.getValue("histories").jsonObject

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
    }

    @Test
    fun seedHoldsRecentNormalWorkAndDoesNotUseWarmupsFailuresDropsOrFutureSets() {
        val now = Instant.parse("2026-05-20T12:00:00Z")
        val base = SetLogEntity(
            id = "work-0", exerciseId = "db-press", exerciseName = "Dumbbell bench press",
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
        val press = plan.sessions.first().exercises.single { it.exerciseId == "db-press" }
        assertEquals(12.5, press.weight, 0.0)
        assertEquals(7, press.reps)
        assertEquals(2, press.sets)
        val unlogged = plan.sessions.first().exercises.single { it.exerciseId == "db-row" }
        assertEquals("coachFindWorkingWeight", unlogged.whyKey)
        assertEquals(0.0, unlogged.weight, 0.0)
        val withoutGear = LocalCoachSeed.build(history = history, now = now, zone = ZoneId.of("UTC")).plan
        assertTrue(withoutGear.sessions.flatMap { it.exercises }.none { it.weight > 0 || it.exerciseId == "db-press" })
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
            equipment = "dumbbells", now = now, zone = ZoneId.of("America/New_York"),
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
            compare("exercise-ids", w.exercises.map { it.exerciseId }, n.exercises.map { it.exerciseId })
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

    private val offlineVsWeb = setOf(
        "context-hash", // Offline source marker, not the web readiness/load context fingerprint.
        "exercise-ids", // Small native equipment template rather than the ranked web catalog.
    )

    private val expectedDifferences = mapOf(
        "cold-start-bodyweight" to offlineVsWeb,
        // A fresh seed starts at revision 1. Unlogged dumbbell lifts ask for a working
        // weight rather than selecting the unloaded bodyweight alternatives in web.
        "mixed-history-metric" to offlineVsWeb + setOf("revision", "rationale-keys"),
        "mixed-history-imperial" to offlineVsWeb + setOf("revision", "rationale-keys"),
    )
}
