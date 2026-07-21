package com.missionwinning.core.model

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate

class WorkoutStatsTest {
    private data class Sess(val day: Int, val status: String)

    @Test
    fun pickNextSession_prefersToday() {
        val sessions = listOf(
            Sess(0, "done"),
            Sess(2, "planned"),
            Sess(4, "planned"),
        )
        val next = WorkoutStats.pickNextSession(
            sessions,
            todayOffset = 4,
            dayOffset = { it.day },
            status = { it.status },
        )
        assertEquals(4, next?.day)
    }

    @Test
    fun pickNextSession_fallsBackToFirstOpen() {
        val sessions = listOf(
            Sess(0, "done"),
            Sess(2, "planned"),
            Sess(4, "swapped"),
        )
        val next = WorkoutStats.pickNextSession(
            sessions,
            todayOffset = 1,
            dayOffset = { it.day },
            status = { it.status },
        )
        assertEquals(2, next?.day)
    }

    @Test
    fun pickNextSession_noneOpen() {
        val sessions = listOf(Sess(0, "done"), Sess(2, "missed"))
        assertNull(
            WorkoutStats.pickNextSession(
                sessions,
                todayOffset = 0,
                dayOffset = { it.day },
                status = { it.status },
            ),
        )
    }

    @Test
    fun streakDays_countsBackwardsIncludingToday() {
        val today = LocalDate.of(2026, 7, 21)
        val days = setOf(
            today,
            today.minusDays(1),
            today.minusDays(2),
            today.minusDays(5),
        )
        assertEquals(3, WorkoutStats.streakDays(days, today))
    }

    @Test
    fun streakDays_allowsMissTodayUsesYesterday() {
        val today = LocalDate.of(2026, 7, 21)
        val days = setOf(today.minusDays(1), today.minusDays(2))
        assertEquals(2, WorkoutStats.streakDays(days, today))
    }

    @Test
    fun streakDays_zeroWhenGap() {
        val today = LocalDate.of(2026, 7, 21)
        assertEquals(0, WorkoutStats.streakDays(setOf(today.minusDays(3)), today))
        assertEquals(0, WorkoutStats.streakDays(emptySet(), today))
    }

    @Test
    fun mondayBasedOffset_mondayIsZero() {
        assertEquals(0, WorkoutStats.mondayBasedOffset(LocalDate.of(2026, 7, 20))) // Monday
        assertEquals(6, WorkoutStats.mondayBasedOffset(LocalDate.of(2026, 7, 19))) // Sunday
    }

    @Test
    fun isOpenSessionStatus() {
        assertTrue(WorkoutStats.isOpenSessionStatus("planned"))
        assertTrue(WorkoutStats.isOpenSessionStatus("swapped"))
        assertEquals(false, WorkoutStats.isOpenSessionStatus("done"))
    }
}
