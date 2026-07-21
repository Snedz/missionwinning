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
        assertEquals(0, ActiveSessionLogic.restAfterComplete(0, allSetsDone = true))
        assertEquals(0, ActiveSessionLogic.restAfterComplete(45, allSetsDone = true))

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
    fun sessionLogic_currentExerciseIndex() {
        val exercises = listOf(
            ActiveExercise(
                "a",
                "Push",
                listOf(set("1", done = true), set("2", done = false, index = 1)),
            ),
            ActiveExercise(
                "b",
                "Pull",
                listOf(set("3", done = false, index = 0)),
            ),
        )
        assertEquals(1, ActiveSessionLogic.currentExerciseIndex(exercises))
        assertEquals(2, ActiveSessionLogic.exerciseCount(exercises))
        val done = listOf(
            ActiveExercise("a", "Push", listOf(set("1", done = true))),
        )
        assertNull(ActiveSessionLogic.currentExerciseIndex(done))
    }

    @Test
    fun sessionLogic_carryForwardWithinExercise() {
        val exercises = listOf(
            ActiveExercise(
                "a",
                "Push",
                listOf(
                    set("1", done = true, reps = 8, weight = 40.0, index = 0),
                    set("2", done = false, reps = 10, weight = 0.0, index = 1),
                    set("3", done = false, reps = 10, weight = 0.0, index = 2),
                ),
            ),
            ActiveExercise(
                "b",
                "Pull",
                listOf(set("4", done = false, reps = 12, weight = 0.0, index = 0)),
            ),
        )
        val next = ActiveSessionLogic.carryForwardWithinExercise(exercises, "1")
        val pushSets = next[0].sets
        assertEquals(8, pushSets[1].reps)
        assertEquals(40.0, pushSets[1].weight, 0.0)
        // only next incomplete of same exercise
        assertEquals(10, pushSets[2].reps)
        assertEquals(0.0, pushSets[2].weight, 0.0)
        // other exercise untouched
        assertEquals(12, next[1].sets[0].reps)
        assertTrue(ActiveSessionLogic.allDone(
            listOf(ActiveExercise("a", "Push", listOf(set("1", done = true)))),
        ))
        assertFalse(ActiveSessionLogic.allDone(exercises))
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
        // 100 kg → ~220.5 lb → snaps to 5 lb plate step
        val lb = ActiveSessionLogic.convertWeight(100.0, "kg", "lb")
        assertEquals(220.0, lb, 0.0)
        val kg = ActiveSessionLogic.convertWeight(lb, "lb", "kg")
        assertEquals(100.0, kg, 0.01)
        assertEquals("100", ActiveSessionLogic.formatWeight(100.0))
        assertEquals("2.5", ActiveSessionLogic.formatWeight(2.5))
        assertEquals("100 kg", ActiveSessionLogic.formatWeightWithUnit(100.0, "kg"))
    }

    @Test
    fun sessionLogic_sessionVolume() {
        val exercises = listOf(
            ActiveExercise(
                "a",
                "Push",
                listOf(
                    set("1", done = true, reps = 5, weight = 100.0),
                    set("2", done = true, reps = 5, weight = 100.0, index = 1),
                    set("3", done = false, reps = 5, weight = 100.0, index = 2),
                ),
            ),
        )
        assertEquals(1000.0, ActiveSessionLogic.sessionVolume(exercises), 0.0)
    }

    @Test
    fun sessionLogic_previousWeightInUnit_convertsStoredUnit() {
        assertNull(ActiveSessionLogic.previousWeightInUnit(null, "kg", "lb"))
        // 100 kg stored → display lb → 220 (plate step)
        assertEquals(
            220.0,
            ActiveSessionLogic.previousWeightInUnit(100.0, "kg", "lb")!!,
            0.0,
        )
        // 220 lb stored → display kg → 100
        assertEquals(
            100.0,
            ActiveSessionLogic.previousWeightInUnit(220.0, "lb", "kg")!!,
            0.01,
        )
        // same unit, no change
        assertEquals(
            100.0,
            ActiveSessionLogic.previousWeightInUnit(100.0, "kg", "kg")!!,
            0.0,
        )
        // legacy null unit treated as kg
        assertEquals(
            220.0,
            ActiveSessionLogic.previousWeightInUnit(100.0, null, "lb")!!,
            0.0,
        )
    }
}
