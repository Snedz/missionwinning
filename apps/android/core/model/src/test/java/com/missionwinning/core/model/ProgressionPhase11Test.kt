package com.missionwinning.core.model

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate

class ProgressionPhase11Test {
    private val today = LocalDate.of(2026, 7, 21)

    @Test
    fun volumeByDay_fillsWindow() {
        val workouts = listOf(
            "2026-07-21T12:00:00Z" to 1000.0,
            "2026-07-19T12:00:00Z" to 500.0,
        )
        val days = Progression.volumeByDay(workouts, dayCount = 7, today = today)
        assertEquals(7, days.size)
        assertEquals(today, days.last().date)
        assertEquals(1000.0, days.last().volume, 0.0)
        assertEquals(1, days.last().workoutCount)
        val mon = days.find { it.date == LocalDate.of(2026, 7, 19) }
        assertEquals(500.0, mon!!.volume, 0.0)
    }

    @Test
    fun heatMap_levelsRestAndWork() {
        val days = listOf(
            Progression.DayVolume(today.minusDays(2), 0.0, 0),
            Progression.DayVolume(today.minusDays(1), 100.0, 1),
            Progression.DayVolume(today, 1000.0, 1),
        )
        val heat = Progression.heatMap(days)
        assertEquals(0, heat[0].level)
        assertTrue(heat[1].level in 1..3)
        assertEquals(4, heat[2].level)
    }

    @Test
    fun readiness_boostsStreak() {
        val strong = Progression.readinessFromLogs(
            streakDays = 5,
            workoutsThisWeek = 3,
            volumeThisWeek = 10_000.0,
            volumeLastWeek = 9_000.0,
            daysSinceLastWorkout = 0,
        )
        val cold = Progression.readinessFromLogs(
            streakDays = 0,
            workoutsThisWeek = 0,
            volumeThisWeek = 0.0,
            volumeLastWeek = 0.0,
            daysSinceLastWorkout = 10,
        )
        assertTrue(strong.score > cold.score)
        assertTrue(strong.score >= 60)
    }

    @Test
    fun weeklyVolumes_includesEmptyWeeks() {
        val bars = Progression.weeklyVolumes(
            workouts = listOf("2026-07-21T12:00:00Z" to 2000.0),
            weekCount = 4,
            today = today,
        )
        assertEquals(4, bars.size)
        assertTrue(bars.last().volume >= 2000.0 - 0.01)
    }
}
