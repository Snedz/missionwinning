package com.missionwinning.core.model

/**
 * Pure progression helpers — PRs and volume series (no Android deps).
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
}
