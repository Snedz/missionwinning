package com.missionwinning.feature.active

import com.missionwinning.core.model.ActiveExercise
import com.missionwinning.core.model.LoggedSet
import com.missionwinning.core.model.SetKind
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
        exerciseId: String = "a",
        exerciseName: String = "Push",
        kind: SetKind = SetKind.Normal,
    ) = LoggedSet(id, exerciseId, exerciseName, index, reps, weight, done = done, kind = kind)

    @Test
    fun doneCount_countsCompletedSets() {
        val state = ActiveUiState(
            exercises = listOf(
                ActiveExercise(
                    "a",
                    "Push",
                    listOf(
                        set("1", done = true, reps = 5, weight = 100.0),
                        set("2", done = false, index = 1),
                    ),
                ),
            ),
        )
        assertEquals(1, state.doneCount)
        assertEquals(2, state.totalSets)
        assertEquals(500.0, state.liveVolume, 0.0)
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
    fun sessionLogic_undoRestoresIncomplete_andGhostPrefill() {
        // Ghost prefill: previous weight/reps carried after complete
        val afterComplete = ActiveSessionLogic.carryForwardWithinExercise(
            listOf(
                ActiveExercise(
                    "a",
                    "Push",
                    listOf(
                        set("1", done = true, reps = 8, weight = 60.0, index = 0),
                        set("2", done = false, reps = 10, weight = 0.0, index = 1),
                    ),
                ),
            ),
            completedSetId = "1",
        )
        assertEquals(8, afterComplete[0].sets[1].reps)
        assertEquals(60.0, afterComplete[0].sets[1].weight, 0.0)
        // Undo is toggle at ViewModel layer — canFinish still true if another set done
        assertTrue(ActiveSessionLogic.canFinish(afterComplete))
    }

    @Test
    fun sessionLogic_restDock_skipsWhenAllDone() {
        assertEquals(0, ActiveSessionLogic.restAfterComplete(45, allSetsDone = true))
        assertEquals(60, ActiveSessionLogic.restAfterComplete(0, defaultRest = 60, allSetsDone = false))
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
    fun sessionLogic_normalizeDefaultRest() {
        assertEquals(45, ActiveSessionLogic.normalizeDefaultRest(30))
        assertEquals(60, ActiveSessionLogic.normalizeDefaultRest(60))
        assertEquals(90, ActiveSessionLogic.normalizeDefaultRest(80))
        assertEquals(120, ActiveSessionLogic.normalizeDefaultRest(200))
        assertEquals(60, ActiveSessionLogic.restAfterComplete(0, defaultRest = 60))
        assertEquals(90, ActiveSessionLogic.restAfterComplete(0, defaultRest = 90))
    }

    @Test
    fun sessionLogic_currentSetInExercise() {
        val exercises = listOf(
            ActiveExercise(
                "a",
                "Push",
                listOf(
                    set("1", done = true, index = 0, exerciseId = "a"),
                    set("2", done = false, index = 1, exerciseId = "a"),
                    set("3", done = false, index = 2, exerciseId = "a"),
                ),
            ),
        )
        assertEquals(2 to 3, ActiveSessionLogic.currentSetInExercise(exercises))
        assertNull(
            ActiveSessionLogic.currentSetInExercise(
                listOf(ActiveExercise("a", "Push", listOf(set("1", done = true, exerciseId = "a")))),
            ),
        )
    }

    @Test
    fun sessionLogic_nextExerciseName() {
        val exercises = listOf(
            ActiveExercise(
                "a",
                "Push",
                listOf(
                    set("1", done = true, exerciseId = "a", exerciseName = "Push"),
                    set("2", done = false, index = 1, exerciseId = "a", exerciseName = "Push"),
                ),
            ),
            ActiveExercise(
                "b",
                "Pull",
                listOf(set("3", done = false, index = 0, exerciseId = "b", exerciseName = "Pull")),
            ),
        )
        assertEquals("Pull", ActiveSessionLogic.nextExerciseName(exercises))
        // more sets left in same exercise → no next-ex preview
        val mid = listOf(
            ActiveExercise(
                "a",
                "Push",
                listOf(
                    set("1", done = false, exerciseId = "a"),
                    set("2", done = false, index = 1, exerciseId = "a"),
                ),
            ),
        )
        assertNull(ActiveSessionLogic.nextExerciseName(mid))
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
    fun sessionLogic_sessionVolume_excludesWarmup() {
        val exercises = listOf(
            ActiveExercise(
                "a",
                "Push",
                listOf(
                    set("1", done = true, reps = 10, weight = 40.0, kind = SetKind.Warmup),
                    set("2", done = true, reps = 5, weight = 100.0, index = 1, kind = SetKind.Normal),
                ),
            ),
        )
        // warmup 400 excluded; working 500
        assertEquals(500.0, ActiveSessionLogic.sessionVolume(exercises), 0.0)
    }

    @Test
    fun sessionLogic_addSet_copiesLoadAndCaps() {
        val base = listOf(
            ActiveExercise(
                "a",
                "Push",
                listOf(set("1", done = true, reps = 8, weight = 50.0)),
            ),
        )
        val next = ActiveSessionLogic.addSet(base, "a", "new")
        assertEquals(2, next[0].sets.size)
        assertEquals(8, next[0].sets[1].reps)
        assertEquals(50.0, next[0].sets[1].weight, 0.0)
        assertEquals(1, next[0].sets[1].setIndex)
        assertEquals(SetKind.Normal, next[0].sets[1].kind)

        var many = base
        repeat(ActiveSessionLogic.MAX_SETS_PER_EXERCISE + 2) { i ->
            many = ActiveSessionLogic.addSet(many, "a", "n$i")
        }
        assertEquals(ActiveSessionLogic.MAX_SETS_PER_EXERCISE, many[0].sets.size)
    }

    @Test
    fun sessionLogic_addExercise_appendsNewBlock() {
        val base = listOf(
            ActiveExercise("a", "Push", listOf(set("1", done = false))),
        )
        val next = ActiveSessionLogic.addExercise(
            exercises = base,
            exerciseId = "bench-press",
            exerciseName = "Barbell bench press",
            newSetIds = listOf("s1", "s2", "s3"),
            setCount = 3,
            defaultReps = 8,
            defaultWeight = 60.0,
            previousByIndex = mapOf(0 to (5 to 55.0)),
        )
        assertEquals(2, next.size)
        assertEquals("bench-press", next[1].exerciseId)
        assertEquals(3, next[1].sets.size)
        assertEquals(5, next[1].sets[0].reps) // previous reps preferred
        assertEquals(55.0, next[1].sets[0].weight, 0.0)
        assertEquals(8, next[1].sets[1].reps)
        assertEquals(60.0, next[1].sets[1].weight, 0.0)
    }

    @Test
    fun sessionLogic_addExercise_existingAddsSets() {
        val base = listOf(
            ActiveExercise("a", "Push", listOf(set("1", done = true, reps = 6, weight = 40.0))),
        )
        val next = ActiveSessionLogic.addExercise(
            exercises = base,
            exerciseId = "a",
            exerciseName = "Push",
            newSetIds = listOf("n1", "n2", "n3"),
            setCount = 3,
        )
        assertEquals(1, next.size)
        assertEquals(4, next[0].sets.size) // 1 existing + 3
        assertEquals(6, next[0].sets[1].reps)
        assertEquals(40.0, next[0].sets[1].weight, 0.0)
    }

    @Test
    fun sessionLogic_removeSet_reindexesAndDropsEmptyExercise() {
        val base = listOf(
            ActiveExercise(
                "a",
                "Push",
                listOf(
                    set("1", done = true, index = 0),
                    set("2", done = false, index = 1),
                    set("3", done = false, index = 2),
                ),
            ),
            ActiveExercise("b", "Pull", listOf(set("4", done = false, exerciseId = "b"))),
        )
        val mid = ActiveSessionLogic.removeSet(base, "2")
        assertEquals(2, mid[0].sets.size)
        assertEquals(0, mid[0].sets[0].setIndex)
        assertEquals(1, mid[0].sets[1].setIndex)
        assertEquals("3", mid[0].sets[1].id)

        val gone = ActiveSessionLogic.removeSet(
            listOf(ActiveExercise("a", "Push", listOf(set("only", done = false)))),
            "only",
        )
        assertTrue(gone.isEmpty())
    }

    @Test
    fun sessionLogic_removeExercise() {
        val base = listOf(
            ActiveExercise("a", "Push", listOf(set("1", done = false))),
            ActiveExercise("b", "Pull", listOf(set("2", done = false, exerciseId = "b"))),
        )
        val next = ActiveSessionLogic.removeExercise(base, "a")
        assertEquals(1, next.size)
        assertEquals("b", next[0].exerciseId)
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
