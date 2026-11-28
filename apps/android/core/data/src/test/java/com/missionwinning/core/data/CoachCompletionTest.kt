package com.missionwinning.core.data

import com.missionwinning.core.model.WeightUnits
import com.missionwinning.core.network.CoachPlanDto
import com.missionwinning.core.network.PlanExerciseDto
import com.missionwinning.core.network.PlanSessionDto
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Test

class CoachCompletionTest {
    @Test
    fun offlineCompletionCarriesForwardWorkingLoadOnlyIntoRemainingMatchingExercises() = runBlocking {
        val squat = PlanExerciseDto("goblet-squat", 2, 10, 22.5, "coachWhyHold")
        val row = PlanExerciseDto("db-row", 3, 8, 17.5)
        val pushUp = PlanExerciseDto("push-ups", 1, 5, 0.0, "coachWhyBodyweightReps")
        val missed = session("missed", 0, "missed", squat)
        val previous = session("previous", 1, "done", squat)
        val current = session("current", 2, "planned", squat)
        val future = session("future", 4, "planned", squat, row, pushUp)
        val tougher = session("tougher", 6, "swapped", squat.copy(reps = 12))
        val plan = CoachPlanDto(
            revision = 3, weekStart = "2026-11-23", daysPerWeek = 5,
            sessions = listOf(missed, previous, current, future, tougher),
            generatedAt = "2026-11-24T12:00:00Z", contextHash = "offline-seed-test",
            equipmentProfile = "dumbbells", weightUnit = "kg",
        )
        val stored = SetLogEntity(
            id = "working", exerciseId = squat.exerciseId, exerciseName = "Goblet squat",
            setIndex = 0, reps = 10, weight = 27.5, completedAt = "2026-11-25T12:00:00Z",
            sessionId = current.id, workoutId = "saved",
        )

        for (logged in listOf(stored, stored.copy(weight = 60.0, weightUnit = "lb"))) {
            val next = LocalCoachSeed.markDone(plan, current.id) { exerciseId, targetReps ->
                logged.takeIf { it.exerciseId == exerciseId && it.reps >= targetReps }
            }.plan
            val expected = WeightUnits.convertExact(logged.weight, logged.weightUnit, "kg")
            assertEquals(expected, next.sessions[3].exercises.first().weight, 0.000001)
            assertEquals(
                listOf(missed, previous, current.copy(status = "done"),
                    future.copy(exercises = listOf(squat.copy(weight = expected), row, pushUp)), tougher),
                next.sessions,
            )
            assertEquals(plan.revision + 1, next.revision)
            assertEquals("kg", next.weightUnit)
        }
    }

    private fun session(id: String, day: Int, status: String, vararg exercises: PlanExerciseDto) =
        PlanSessionDto(id, day, "strength", id, exercises = exercises.toList(), estMinutes = 30, status = status)
}
