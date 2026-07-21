package com.missionwinning.core.model

import java.time.LocalDate
import java.time.ZoneId

/**
 * Pure progression helpers — PRs, volume series, heat map, readiness (no Android deps).
 * Not medical advice: readiness is a habit heuristic from logs only.
 */
object Progression {
    data class SetSample(
        val exerciseId: String,
        val exerciseName: String,
        val weight: Double,
        val reps: Int,
        val completedAt: String,
        val weightUnit: String = "kg",
        val kind: SetKind = SetKind.Normal,
    )

    data class PersonalRecord(
        val exerciseId: String,
        val exerciseName: String,
        val weight: Double,
        val reps: Int,
        val estimated1rm: Double,
        val completedAt: String,
        val weightUnit: String,
    )

    data class VolumeBar(
        val label: String,
        val volume: Double,
    )

    data class DayVolume(
        val date: LocalDate,
        val volume: Double,
        val workoutCount: Int,
    )

    data class HeatCell(
        val date: LocalDate,
        /** 0 = rest … 4 = hard day (relative to max in window). */
        val level: Int,
        val volume: Double,
        val workoutCount: Int,
    )

    data class ReadinessSnapshot(
        /** 0–100 habit score from logs (not medical readiness). */
        val score: Int,
        val label: String,
        val detail: String,
    )

    /** Epley estimated 1RM. */
    fun estimated1rm(weight: Double, reps: Int): Double {
        if (weight <= 0) return 0.0
        if (reps <= 1) return weight
        return weight * (1.0 + reps / 30.0)
    }

    /**
     * Best estimated 1RM per exercise from weighted sets.
     * Sorted by e1rm descending.
     */
    fun personalRecords(sets: List<SetSample>, limit: Int = 20): List<PersonalRecord> {
        val best = linkedMapOf<String, PersonalRecord>()
        for (s in sets) {
            if (!SetKind.countsTowardPr(s.kind)) continue
            if (s.weight <= 0 || s.reps <= 0) continue
            val e1 = estimated1rm(s.weight, s.reps)
            val prev = best[s.exerciseId]
            if (prev == null || e1 > prev.estimated1rm + 1e-6) {
                best[s.exerciseId] = PersonalRecord(
                    exerciseId = s.exerciseId,
                    exerciseName = s.exerciseName.ifBlank { s.exerciseId },
                    weight = s.weight,
                    reps = s.reps,
                    estimated1rm = e1,
                    completedAt = s.completedAt,
                    weightUnit = s.weightUnit,
                )
            }
        }
        return best.values.sortedByDescending { it.estimated1rm }.take(limit)
    }

    /**
     * Normalize bar heights to 0f..1f for drawing.
     */
    fun barFractions(volumes: List<Double>): List<Float> {
        val max = volumes.maxOrNull()?.takeIf { it > 0 } ?: return volumes.map { 0f }
        return volumes.map { (it / max).toFloat().coerceIn(0f, 1f) }
    }

    /**
     * Aggregate workout volume by calendar day for [dayCount] days ending [today] (oldest first).
     * [completedAtIso] / [volume] pairs from Room workout logs.
     */
    fun volumeByDay(
        workouts: List<Pair<String, Double>>,
        dayCount: Int = 28,
        today: LocalDate = LocalDate.now(),
        zone: ZoneId = ZoneId.systemDefault(),
    ): List<DayVolume> {
        val start = today.minusDays((dayCount - 1).toLong())
        val byDay = mutableMapOf<LocalDate, Pair<Double, Int>>()
        for ((iso, vol) in workouts) {
            val day = runCatching {
                java.time.Instant.parse(iso).atZone(zone).toLocalDate()
            }.getOrNull() ?: continue
            if (day.isBefore(start) || day.isAfter(today)) continue
            val cur = byDay[day] ?: (0.0 to 0)
            byDay[day] = (cur.first + vol.coerceAtLeast(0.0)) to (cur.second + 1)
        }
        return (0 until dayCount).map { i ->
            val d = start.plusDays(i.toLong())
            val pair = byDay[d]
            DayVolume(
                date = d,
                volume = pair?.first ?: 0.0,
                workoutCount = pair?.second ?: 0,
            )
        }
    }

    /**
     * Heat map levels 0–4 from day volumes (relative to max in window).
     */
    fun heatMap(days: List<DayVolume>): List<HeatCell> {
        val maxVol = days.maxOfOrNull { it.volume }?.takeIf { it > 0 } ?: 0.0
        return days.map { d ->
            val level = when {
                d.workoutCount == 0 && d.volume <= 0 -> 0
                maxVol <= 0 -> when {
                    d.workoutCount >= 2 -> 3
                    d.workoutCount == 1 -> 2
                    else -> 0
                }
                else -> {
                    val ratio = (d.volume / maxVol).coerceIn(0.0, 1.0)
                    when {
                        ratio >= 0.85 || d.workoutCount >= 2 -> 4
                        ratio >= 0.55 -> 3
                        ratio >= 0.25 -> 2
                        else -> 1
                    }.coerceAtLeast(if (d.workoutCount > 0) 1 else 0)
                }
            }
            HeatCell(date = d.date, level = level, volume = d.volume, workoutCount = d.workoutCount)
        }
    }

    /**
     * Habit-style "readiness" from logs only (not wearable / not medical).
     * Higher when streak is healthy and this week isn't drastically over last week.
     */
    fun readinessFromLogs(
        streakDays: Int,
        workoutsThisWeek: Int,
        volumeThisWeek: Double,
        volumeLastWeek: Double,
        daysSinceLastWorkout: Int?,
    ): ReadinessSnapshot {
        var score = 55
        score += when {
            streakDays >= 7 -> 20
            streakDays >= 4 -> 14
            streakDays >= 2 -> 8
            streakDays == 1 -> 4
            else -> 0
        }
        score += when {
            workoutsThisWeek >= 4 -> 12
            workoutsThisWeek == 3 -> 10
            workoutsThisWeek == 2 -> 6
            workoutsThisWeek == 1 -> 3
            else -> -4
        }
        if (volumeLastWeek > 0 && volumeThisWeek > volumeLastWeek * 1.35) {
            score -= 10 // sharp volume spike — suggest recovery focus
        } else if (volumeLastWeek > 0 && volumeThisWeek >= volumeLastWeek * 0.85) {
            score += 6
        }
        when (daysSinceLastWorkout) {
            null -> score -= 5
            0, 1 -> score += 5
            2, 3 -> score += 2
            in 4..6 -> score -= 4
            else -> score -= 10
        }
        score = score.coerceIn(0, 100)
        val label = when {
            score >= 80 -> "Primed"
            score >= 60 -> "Solid"
            score >= 40 -> "Steady"
            score >= 25 -> "Rebuild"
            else -> "Rest bias"
        }
        val detail = when {
            daysSinceLastWorkout != null && daysSinceLastWorkout >= 7 ->
                "It's been a week+ — a short session rebuilds the streak."
            volumeLastWeek > 0 && volumeThisWeek > volumeLastWeek * 1.35 ->
                "Volume is up sharply vs last week — quality over ego load."
            streakDays >= 4 ->
                "Streak strong. Keep showing up; Coach adapts from logs."
            workoutsThisWeek == 0 ->
                "No sessions this week yet — start today's plan or quick log."
            else ->
                "From your logs only (no wearable). Train free offline anytime."
        }
        return ReadinessSnapshot(score = score, label = label, detail = detail)
    }

    /** ISO week key YYYY-Www for grouping. */
    fun isoWeekKey(date: LocalDate): String {
        val week = date.get(java.time.temporal.WeekFields.ISO.weekOfWeekBasedYear())
        val year = date.get(java.time.temporal.WeekFields.ISO.weekBasedYear())
        return "%04d-W%02d".format(year, week)
    }

    /**
     * Last [weekCount] ISO weeks of volume (oldest first), including empty weeks.
     */
    fun weeklyVolumes(
        workouts: List<Pair<String, Double>>,
        weekCount: Int = 8,
        today: LocalDate = LocalDate.now(),
        zone: ZoneId = ZoneId.systemDefault(),
    ): List<VolumeBar> {
        val thisWeekStart = today.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY))
        val weeks = (0 until weekCount).map { i ->
            val start = thisWeekStart.minusWeeks((weekCount - 1 - i).toLong())
            start to isoWeekKey(start)
        }
        val byWeek = mutableMapOf<String, Double>()
        for ((iso, vol) in workouts) {
            val day = runCatching {
                java.time.Instant.parse(iso).atZone(zone).toLocalDate()
            }.getOrNull() ?: continue
            val key = isoWeekKey(day)
            byWeek[key] = (byWeek[key] ?: 0.0) + vol.coerceAtLeast(0.0)
        }
        return weeks.map { (start, key) ->
            VolumeBar(
                label = start.format(java.time.format.DateTimeFormatter.ofPattern("M/d")),
                volume = byWeek[key] ?: 0.0,
            )
        }
    }
}
