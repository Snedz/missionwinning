package com.missionwinning.core.model

import java.time.LocalDate

/**
 * Pure schedule / streak helpers — unit-testable without Android runtime.
 */
object WorkoutStats {
    fun isOpenSessionStatus(status: String): Boolean =
        status == "planned" || status == "swapped"

    /**
     * Prefer open session on [todayOffset] (Mon=0), else first open session in list order.
     */
    fun <T> pickNextSession(
        sessions: List<T>,
        todayOffset: Int,
        dayOffset: (T) -> Int,
        status: (T) -> String,
    ): T? {
        val open = sessions.filter { isOpenSessionStatus(status(it)) }
        return open.firstOrNull { dayOffset(it) == todayOffset } ?: open.firstOrNull()
    }

    /**
     * Consecutive calendar days with activity ending on [today] (or yesterday if today empty).
     */
    fun streakDays(activeDates: Set<LocalDate>, today: LocalDate = LocalDate.now()): Int {
        if (activeDates.isEmpty()) return 0
        var cursor = today
        if (cursor !in activeDates) {
            cursor = cursor.minusDays(1)
            if (cursor !in activeDates) return 0
        }
        var streak = 0
        while (cursor in activeDates) {
            streak++
            cursor = cursor.minusDays(1)
        }
        return streak
    }

    /** Mon=0 … Sun=6 for the given date. */
    fun mondayBasedOffset(date: LocalDate = LocalDate.now()): Int =
        (date.dayOfWeek.value + 6) % 7

    data class WeekTotals(
        val workoutCount: Int,
        val setCount: Int,
        val totalVolume: Double,
        val durationSeconds: Int,
    ) {
        val minutes: Int get() = (durationSeconds / 60).coerceAtLeast(0)
    }

    fun weekTotals(
        workoutCount: Int,
        setCount: Int,
        totalVolume: Double,
        durationSeconds: Int,
    ): WeekTotals = WeekTotals(workoutCount, setCount, totalVolume, durationSeconds)
}
