package com.missionwinning.core.data

import com.missionwinning.core.network.CoachPlanDto
import com.missionwinning.core.network.PlanExerciseDto
import com.missionwinning.core.network.PlanSessionDto
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.Instant
import java.time.ZonedDateTime

class CoachParityTest {
    private val json = Json { ignoreUnknownKeys = true }

    @Test
    fun offlineSeedMatchesExactlyTheListedWebDifferences() {
        val fixture = requireNotNull(javaClass.getResourceAsStream("/coach-parity.json"))
            .bufferedReader().use { json.parseToJsonElement(it.readText()).jsonObject }
        assertEquals("1", fixture.getValue("version").jsonPrimitive.content)
        val cases = fixture.getValue("cases").jsonArray.map { it.jsonObject }
        assertEquals(expectedDifferences.keys.sorted(), cases.map { it.getValue("id").jsonPrimitive.content }.sorted())

        for (case in cases) {
            val id = case.getValue("id").jsonPrimitive.content
            val equipment = case.getValue("input").jsonObject.getValue("equipment").jsonPrimitive.content
            val web = json.decodeFromJsonElement(CoachPlanDto.serializer(), case.getValue("expectedPlan"))
            assertEquals(case.getValue("now").jsonPrimitive.content, web.generatedAt)

            // The Compose repository's cold offline path takes only equipment, not history,
            // preferred units, days/week, or the current web revision.
            val before = ZonedDateTime.now()
            val response = LocalCoachSeed.build(equipment = equipment)
            val after = ZonedDateTime.now()
            val native = response.plan
            val timestamp = Instant.parse(native.generatedAt)
            assertTrue(id, timestamp >= before.toInstant() && timestamp <= after.toInstant())
            assertTrue(id, native.weekStart in listOf(before, after).map {
                it.toLocalDate().with(java.time.DayOfWeek.MONDAY).toString()
            })
            assertTrue(id, response.adaptBeats.isEmpty() && !response.hasAdaptSignal)

            assertEquals(id, expectedDifferences.getValue(id), differenceFields(web, native))
            assertEquals(id, 1, native.revision)
            assertEquals(id, 3, native.daysPerWeek)
            assertEquals(id, "seed-$equipment-1", native.contextHash)
            assertEquals(id, nativeSessions.getValue(equipment), native.sessions)
        }
    }

    // Compare shared slots by display order; report extra slots via session-count.
    // Clock values are checked above rather than compared to the fixture's fixed clock.
    private fun differenceFields(web: CoachPlanDto, native: CoachPlanDto): Set<String> = buildSet {
        fun compare(field: String, webValue: Any, nativeValue: Any) {
            if (webValue != nativeValue) add(field)
        }
        compare("equipment", web.equipmentProfile, native.equipmentProfile)
        compare("revision", web.revision, native.revision)
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
            // Zero-filled seed vs unloaded web exercises is not itself a difference.
            compare("nonzero-loads", w.exercises.filter { it.weight != 0.0 }, n.exercises.filter { it.weight != 0.0 })
        }
    }

    private val seedVsGenerated = setOf(
        "context-hash", // Constant seed identifier vs history/context fingerprint.
        "session-ids", "day-offsets", // Fixed Monday/Wednesday/Friday vs week-derived IDs and scheduling.
        "session-names", "focus-groups", "estimates", // Push/legs/pull template vs web's full-body split.
        "exercise-ids", "sets", "reps", "rationale-keys", // Fixed prescriptions vs catalog-selected targets.
    )

    private val expectedDifferences = mapOf(
        "cold-start-bodyweight" to seedVsGenerated + setOf("days-per-week", "session-count"),
        "mixed-history-metric" to seedVsGenerated + setOf("revision", "nonzero-loads"),
        "mixed-history-imperial" to seedVsGenerated + setOf("revision", "nonzero-loads"),
    )

    private fun session(
        id: String, offset: Int, name: String, focus: List<String>, minutes: Int,
        first: String, firstReps: Int, second: String, secondReps: Int, secondWhy: String,
    ) = PlanSessionDto(
        "seed-$id", offset, "strength", name, focus,
        listOf(PlanExerciseDto(first, 3, firstReps, whyKey = "main"),
            PlanExerciseDto(second, 3, secondReps, whyKey = secondWhy)),
        minutes, "planned",
    )

    private val nativeSessions = mapOf(
        "bodyweight" to listOf(
            session("mon", 0, "Push + core", listOf("chest", "shoulders"), 35, "pushup", 10, "plank", 40, "balance"),
            session("wed", 2, "Legs + hinge", listOf("quads", "glutes"), 40, "squat", 12, "hip-hinge", 10, "progress"),
            session("fri", 4, "Pull + carry", listOf("back", "biceps"), 35, "row", 10, "chinup", 6, "balance"),
        ),
        "dumbbells" to listOf(
            session("mon", 0, "Push (DB)", listOf("chest", "shoulders"), 35, "db-press", 10, "db-fly", 12, "balance"),
            session("wed", 2, "Legs (DB)", listOf("quads", "glutes"), 40, "goblet-squat", 12, "db-rdl", 10, "progress"),
            session("fri", 4, "Pull (DB)", listOf("back", "biceps"), 35, "db-row", 10, "db-curl", 6, "balance"),
        ),
    )
}
