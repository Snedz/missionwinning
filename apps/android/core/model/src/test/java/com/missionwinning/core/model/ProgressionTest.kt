package com.missionwinning.core.model

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ProgressionTest {
    @Test
    fun estimated1rm_epley() {
        assertEquals(100.0, Progression.estimated1rm(100.0, 1), 0.01)
        // 100 × (1 + 5/30) = 116.67
        assertEquals(116.67, Progression.estimated1rm(100.0, 5), 0.05)
        assertEquals(0.0, Progression.estimated1rm(0.0, 10), 0.0)
    }

    @Test
    fun personalRecords_picksBestE1rmPerExercise() {
        val sets = listOf(
            Progression.SetSample("bench-press", "Bench", 100.0, 5, "2026-01-01T00:00:00Z"),
            Progression.SetSample("bench-press", "Bench", 110.0, 3, "2026-01-08T00:00:00Z"),
            Progression.SetSample("squat", "Squat", 140.0, 5, "2026-01-02T00:00:00Z"),
            Progression.SetSample("pushup", "Push-up", 0.0, 20, "2026-01-03T00:00:00Z"),
        )
        val prs = Progression.personalRecords(sets)
        assertEquals(2, prs.size)
        val bench = prs.first { it.exerciseId == "bench-press" }
        // 110 × (1+3/30) ≈ 121 vs 100×(1+5/30)≈116.7
        assertTrue(bench.weight == 110.0)
        assertEquals("squat", prs[0].exerciseId) // higher e1rm first roughly
    }

    @Test
    fun barFractions_normalize() {
        assertEquals(listOf(0.5f, 1f, 0.25f), Progression.barFractions(listOf(50.0, 100.0, 25.0)))
        assertEquals(listOf(0f, 0f), Progression.barFractions(listOf(0.0, 0.0)))
    }
}
