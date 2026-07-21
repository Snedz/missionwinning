package com.missionwinning.core.model

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class PlateCalculatorTest {
    @Test
    fun barOnly_whenTargetEqualsBar() {
        val r = PlateCalculator.platesPerSide(20.0, "kg", barWeight = 20.0)
        assertTrue(r.platesPerSide.isEmpty())
        assertTrue(r.achievable)
    }

    @Test
    fun classic100kg_twoSides() {
        // (100-20)/2 = 40 → greedy 25 + 15
        val r = PlateCalculator.platesPerSide(100.0, "kg", barWeight = 20.0)
        assertTrue(r.achievable)
        assertEquals(40.0, r.platesPerSide.sum(), 0.01)
        assertEquals(listOf(25.0, 15.0), r.platesPerSide)
    }

    @Test
    fun lb_standard() {
        val r = PlateCalculator.platesPerSide(135.0, "lb", barWeight = 45.0)
        // (135-45)/2 = 45 → one 45 plate per side
        assertEquals(listOf(45.0), r.platesPerSide)
        assertTrue(r.achievable)
    }

    @Test
    fun formatPerSide() {
        val s = PlateCalculator.formatPerSide(listOf(25.0, 25.0, 10.0), "kg")
        assertTrue(s.contains("2×25"))
        assertTrue(s.contains("10"))
    }
}
