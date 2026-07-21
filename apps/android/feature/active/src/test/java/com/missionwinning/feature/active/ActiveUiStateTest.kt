package com.missionwinning.feature.active

import com.missionwinning.core.model.ActiveExercise
import com.missionwinning.core.model.LoggedSet
import org.junit.Assert.assertEquals
import org.junit.Test

class ActiveUiStateTest {
    @Test
    fun doneCount_countsCompletedSets() {
        val state = ActiveUiState(
            exercises = listOf(
                ActiveExercise(
                    "a",
                    "Push",
                    listOf(
                        LoggedSet("1", "a", "Push", 0, 10, 0.0, done = true),
                        LoggedSet("2", "a", "Push", 1, 10, 0.0, done = false),
                    ),
                ),
            ),
        )
        assertEquals(1, state.doneCount)
        assertEquals(2, state.totalSets)
    }
}
