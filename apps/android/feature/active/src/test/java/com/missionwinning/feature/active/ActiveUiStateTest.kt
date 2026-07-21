package com.missionwinning.feature.active

import com.missionwinning.core.model.ActiveExercise
import com.missionwinning.core.model.LoggedSet
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ActiveUiStateTest {
    private fun set(
        id: String,
        done: Boolean,
        reps: Int = 10,
        weight: Double = 0.0,
        index: Int = 0,
    ) = LoggedSet(id, "a", "Push", index, reps, weight, done = done)

    @Test
    fun doneCount_countsCompletedSets() {
        val state = ActiveUiState(
            exercises = listOf(
                ActiveExercise(
                    "a",
                    "Push",
                    listOf(
                        set("1", done = true),
                        set("2", done = false, index = 1),
                    ),
                ),
            ),
        )
        assertEquals(1, state.doneCount)
        assertEquals(2, state.totalSets)
    }

    @Test
    fun sessionLogic_canFinish_requiresAtLeastOneDone() {
        val empty = listOf(
            ActiveExercise("a", "Push", listOf(set("1", done = false))),
        )
        assertFalse(ActiveSessionLogic.canFinish(empty))
        val one = listOf(
            ActiveExercise("a", "Push", listOf(set("1", done = true))),
        )
        assertTrue(ActiveSessionLogic.canFinish(one))
    }

    @Test
    fun sessionLogic_defaultsFromPrevious() {
        assertEquals(8, ActiveSessionLogic.defaultReps(10, 8))
        assertEquals(10, ActiveSessionLogic.defaultReps(10, null))
        assertEquals(40.0, ActiveSessionLogic.defaultWeight(40.0), 0.0)
        assertEquals(0.0, ActiveSessionLogic.defaultWeight(null), 0.0)
    }

    @Test
    fun sessionLogic_restAdjustAndCurrentSet() {
        assertEquals(75, ActiveSessionLogic.adjustRest(60, 15))
        assertEquals(0, ActiveSessionLogic.adjustRest(10, -30))
        assertEquals(60, ActiveSessionLogic.restAfterComplete(0))
        assertEquals(45, ActiveSessionLogic.restAfterComplete(45))

        val exercises = listOf(
            ActiveExercise(
                "a",
                "Push",
                listOf(set("1", done = true), set("2", done = false, index = 1)),
            ),
        )
        assertEquals("2", ActiveSessionLogic.currentSetId(exercises))
        assertNull(
            ActiveSessionLogic.currentSetId(
                listOf(ActiveExercise("a", "Push", listOf(set("1", done = true)))),
            ),
        )
    }

    @Test
    fun sessionLogic_completedSetsForPersist() {
        val exercises = listOf(
            ActiveExercise(
                "a",
                "Push",
                listOf(set("1", done = true, reps = 5), set("2", done = false, index = 1)),
            ),
        )
        val done = ActiveSessionLogic.completedSetsForPersist(exercises)
        assertEquals(1, done.size)
        assertEquals(5, done[0].reps)
    }

    @Test
    fun sessionLogic_durationFloor() {
        val now = 1_000_000L
        assertEquals(30, ActiveSessionLogic.durationSeconds(now - 5_000L, now))
        assertEquals(120, ActiveSessionLogic.durationSeconds(now - 120_000L, now))
    }

    @Test
    fun sessionLogic_weightUnitConvertAndStep() {
        assertEquals("lb", ActiveSessionLogic.normalizeUnit("lbs"))
        assertEquals("kg", ActiveSessionLogic.normalizeUnit("KG"))
        assertEquals(2.5, ActiveSessionLogic.weightStep("kg"), 0.0)
        assertEquals(5.0, ActiveSessionLogic.weightStep("lb"), 0.0)
        val lb = ActiveSessionLogic.convertWeight(100.0, "kg", "lb")
        assertTrue(lb > 220.0 && lb < 221.0)
        val kg = ActiveSessionLogic.convertWeight(lb, "lb", "kg")
        assertEquals(100.0, kg, 0.01)
    }
}
