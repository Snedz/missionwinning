package com.missionwinning.core.data

import com.missionwinning.core.network.CoachPlanDto
import com.missionwinning.core.network.PlanExerciseDto
import com.missionwinning.core.network.PlanSessionDto
import org.junit.Assert.assertEquals
import org.junit.Test
import java.time.Instant
import java.time.ZoneOffset

class CoachCompletionTest {
    @Test
    fun offlineCompletionCarriesForwardWorkingLoadOnlyIntoRemainingMatchingExercises() {
        val squat = PlanExerciseDto("goblet-squat", 2, 10, 22.5, "coachWhyHold")
        val row = PlanExerciseDto("db-row", 3, 8, 17.5)
        val pushUp = PlanExerciseDto("push-ups", 1, 5, 0.0, "coachWhyBodyweightReps")
        val missed = session("missed", 0, "missed", squat)
        val previous = session("previous", 1, "done", squat)
        val earlier = session("earlier", 2, "planned", squat)
        val earlierSwapped = session("earlier-swapped", 3, "swapped", squat)
        val overdue = session("overdue", 1, "planned", squat)
        val current = session("current", 4, "planned", squat)
        val future = session("future", 5, "planned", squat, row, pushUp)
        val tougher = session("tougher", 6, "swapped", squat.copy(reps = 12))
        val plan = CoachPlanDto(
            revision = 3, weekStart = "2026-11-23", daysPerWeek = 5,
            sessions = listOf(missed, previous, overdue, earlier, earlierSwapped, current, future, tougher),
            generatedAt = "2026-11-24T12:00:00Z", contextHash = "offline-seed-test",
            equipmentProfile = "dumbbells", weightUnit = "kg",
        )
        val stored = SetLogEntity(
            id = "working", exerciseId = squat.exerciseId, exerciseName = "Goblet squat",
            setIndex = 0, reps = 10, weight = 27.5, completedAt = "2026-11-25T12:00:00Z",
            sessionId = current.id, workoutId = "saved",
        )

        for (logged in listOf(stored, stored.copy(weight = 60.0, weightUnit = "lb"))) {
            val next = LocalCoachSeed.markDone(
                plan, current.id, logged.workoutId, listOf(CoachProgressionSet(logged, logged.completedAt, 60)),
                Instant.parse(logged.completedAt), ZoneOffset.UTC,
            ).plan
            val expected = 27.5
            val target = squat.copy(sets = 1, weight = expected)
            assertEquals(expected, next.sessions.first { it.id == future.id }.exercises.first().weight, 0.000001)
            assertEquals(expected, next.sessions.first { it.id == earlier.id }.exercises.first().weight, 0.000001)
            assertEquals(
                listOf(
                    missed,
                    previous,
                    overdue,
                    earlier.copy(exercises = listOf(target)),
                    earlierSwapped.copy(exercises = listOf(target)),
                    current.copy(status = "done"),
                    future.copy(exercises = listOf(target, row, pushUp)),
                    tougher.copy(exercises = listOf(target)),
                ),
                next.sessions,
            )
            assertEquals(plan.revision + 1, next.revision)
            assertEquals("kg", next.weightUnit)
        }
    }

    private fun session(id: String, day: Int, status: String, vararg exercises: PlanExerciseDto) =
        PlanSessionDto(id, day, "strength", id, exercises = exercises.toList(), estMinutes = 30, status = status)
}
