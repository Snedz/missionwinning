package com.missionwinning.app.preview

import com.missionwinning.core.network.CoachPlanDto
import com.missionwinning.core.network.PlanExerciseDto
import com.missionwinning.core.network.PlanSessionDto
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class V2PlanTest {
    private val move = PlanExerciseDto("goblet-squat", sets = 3, reps = 10, weight = 22.5)
    private val first = PlanSessionDto("first", 0, "strength", "First", exercises = listOf(move), estMinutes = 25, status = "planned")
    private val second = first.copy(id = "second", dayOffset = 1, name = "Second")
    private val before = CoachPlanDto(1, "2026-11-23", 2, listOf(first, second), "before", "local", "dumbbells", "kg")
    private val after = before.copy(
        revision = 2,
        generatedAt = "after",
        contextHash = "local-done-first",
        sessions = listOf(first.copy(status = "done"), second.copy(exercises = listOf(move.copy(weight = 27.5)))),
    )

    @Test fun defaultsToLegacyAndReleaseNeverConsumesDebugOptIn() {
        assertFalse(ShellPreview.enabled(debug = true, savedOptIn = false, requested = null))
        assertTrue(ShellPreview.enabled(debug = true, savedOptIn = false, requested = true))
        assertTrue(ShellPreview.enabled(debug = true, savedOptIn = true, requested = null))
        assertFalse(ShellPreview.enabled(debug = true, savedOptIn = true, requested = false))
        assertFalse(ShellPreview.enabled(debug = false, savedOptIn = true, requested = true))
    }

    @Test fun emptyPrescriptionIsNotANextWorkout() {
        val plan = before.copy(sessions = listOf(first.copy(exercises = emptyList()), second))
        assertEquals(second, plan.nextSession(today = 0))
        assertNull(plan.copy(sessions = listOf(first.copy(exercises = emptyList()))).nextSession(today = 0))
    }

    @Test fun victoryUsesActualOpenTargetsForLoggedMovementsOnly() {
        val pushups = PlanExerciseDto("pushup", sets = 3, reps = 5)
        val lunges = PlanExerciseDto("db-lunges", sets = 1, reps = 6, weight = 30.0)
        val plan = before.copy(sessions = listOf(
            first.copy(status = "done", exercises = listOf(pushups.copy(reps = 4), lunges.copy(weight = 25.0))),
            second.copy(exercises = listOf(pushups, move)),
            second.copy(id = "third", dayOffset = 2, exercises = listOf(lunges)),
        ))
        assertEquals(
            listOf(pushups, lunges),
            plan.nextTargetsFor(listOf("pushup", "db-lunges", "db-lunges", "not-in-plan"), today = 1),
        )
        assertTrue(plan.nextTargetsFor(emptyList(), today = 1).isEmpty())
    }

    @Test fun victoryUsesTheSameSessionPriorityAsTodayAndIgnoresMisses() {
        val plan = before.copy(sessions = listOf(
            first.copy(status = "missed", exercises = listOf(PlanExerciseDto("pushup", sets = 3, reps = 5))),
            second,
            second.copy(id = "today", dayOffset = 2, status = "swapped", exercises = listOf(move.copy(weight = 30.0))),
        ))
        assertEquals(listOf(move.copy(weight = 30.0)), plan.nextTargetsFor(listOf("pushup", move.exerciseId), today = 2))
    }

    @Test fun detectsActualBeforeAfterTargetsOnAnOpenSession() {
        val change = requireNotNull(compareCompletedPlan(before, after, "first", "saved-id"))
        assertEquals("saved-id", change.workoutId)
        assertEquals("First", change.completedName)
        val target = change.targets.single()
        assertEquals(22.5, target.before.weight, 0.0)
        assertEquals(27.5, target.after.weight, 0.0)
        assertEquals("Second", target.sessionName)
        assertEquals(1, target.dayOffset)
    }

    @Test fun noReceiptForUnrelatedRevisionUnitSwitchOrMissingSave() {
        assertNull(compareCompletedPlan(before, after.copy(contextHash = "another-change"), "first", "saved"))
        assertNull(compareCompletedPlan(before, after.copy(weekStart = "2026-11-30"), "first", "saved"))
        assertNull(compareCompletedPlan(before, after.copy(weightUnit = "lb"), "first", "saved"))
        assertNull(compareCompletedPlan(before, after, "first", ""))
        assertNull(compareCompletedPlan(before.copy(sessions = listOf(first.copy(status = "done"), second)), after, "first", "saved"))
    }

    @Test fun completionAloneDoesNotImplyAChangedPrescription() {
        val completed = after.copy(sessions = listOf(first.copy(status = "done"), second))
        val change = requireNotNull(compareCompletedPlan(before, completed, "first", "saved"))
        assertTrue(change.targets.isEmpty())
    }

    @Test fun rebuildComparesRealOpenTargetsWithoutClaimingWhatCausedThem() {
        val rebuilt = before.copy(
            contextHash = "reseed",
            sessions = listOf(first, second.copy(exercises = listOf(move.copy(sets = 1, weight = 30.0)))),
        )
        val change = requireNotNull(compareRebuiltPlan(before, rebuilt))
        assertNull(change.completedName)
        assertNull(change.workoutId)
        assertEquals(30.0, change.targets.single().after.weight, 0.0)
        assertEquals(1, change.targets.single().after.sets)
        assertNull(compareRebuiltPlan(before, before.copy(contextHash = "regenerated")))
        assertNull(compareRebuiltPlan(before, rebuilt.copy(equipmentProfile = "bodyweight")))
    }
}
