package com.missionwinning.feature.active

import com.missionwinning.core.model.ActiveExercise
import com.missionwinning.core.model.LoggedSet

/**
 * Pure helpers for Active logger — unit-tested without Android runtime.
 */
object ActiveSessionLogic {
    const val DEFAULT_REST_SECONDS = 60
    const val REST_STEP = 15
    const val MIN_DURATION_SECONDS = 30

    fun doneCount(exercises: List<ActiveExercise>): Int =
        exercises.sumOf { ex -> ex.sets.count { it.done } }

    fun totalSets(exercises: List<ActiveExercise>): Int =
        exercises.sumOf { it.sets.size }

    fun canFinish(exercises: List<ActiveExercise>): Boolean =
        doneCount(exercises) > 0

    fun allDone(exercises: List<ActiveExercise>): Boolean {
        val total = totalSets(exercises)
        return total > 0 && doneCount(exercises) == total
    }

    fun currentSetId(exercises: List<ActiveExercise>): String? =
        exercises.flatMap { it.sets }.firstOrNull { !it.done }?.id

    fun defaultReps(planReps: Int, previousReps: Int?): Int =
        (previousReps ?: planReps).coerceIn(1, 99)

    fun defaultWeight(previousWeight: Double?): Double =
        (previousWeight ?: 0.0).coerceAtLeast(0.0)

    /**
     * Rest after completing a set. Skip rest when the session is fully logged.
     * If a rest is already ticking, keep it (unless all done).
     */
    fun restAfterComplete(
        currentRest: Int,
        defaultRest: Int = DEFAULT_REST_SECONDS,
        allSetsDone: Boolean = false,
    ): Int {
        if (allSetsDone) return 0
        return if (currentRest > 0) currentRest else defaultRest
    }

    /**
     * After a set is marked done, copy its weight/reps onto the next incomplete set
     * of the same exercise (standard logger carry-forward).
     */
    fun carryForwardWithinExercise(
        exercises: List<ActiveExercise>,
        completedSetId: String,
    ): List<ActiveExercise> {
        val completed = exercises.flatMap { it.sets }.find { it.id == completedSetId } ?: return exercises
        if (!completed.done) return exercises
        val next = exercises.flatMap { it.sets }
            .firstOrNull { !it.done && it.exerciseId == completed.exerciseId }
            ?: return exercises
        return exercises.map { ex ->
            ex.copy(
                sets = ex.sets.map { s ->
                    if (s.id == next.id) {
                        s.copy(
                            reps = completed.reps.coerceIn(1, 99),
                            weight = completed.weight.coerceAtLeast(0.0),
                        )
                    } else {
                        s
                    }
                },
            )
        }
    }

    fun adjustRest(current: Int, delta: Int): Int =
        (current + delta).coerceAtLeast(0)

    fun completedSetsForPersist(exercises: List<ActiveExercise>): List<LoggedSet> =
        exercises.flatMap { it.sets }.filter { it.done }

    fun durationSeconds(startedAtMs: Long, nowMs: Long = System.currentTimeMillis()): Int =
        ((nowMs - startedAtMs) / 1000).toInt().coerceAtLeast(MIN_DURATION_SECONDS)

    fun convertWeight(value: Double, fromUnit: String, toUnit: String): Double =
        com.missionwinning.core.model.WeightUnits.convert(value, fromUnit, toUnit)

    fun weightStep(unit: String): Double =
        com.missionwinning.core.model.WeightUnits.step(unit)

    fun normalizeUnit(unit: String): String =
        com.missionwinning.core.model.WeightUnits.normalize(unit)

    fun formatWeight(value: Double): String =
        com.missionwinning.core.model.WeightUnits.format(value)

    fun formatWeightWithUnit(value: Double, unit: String): String =
        com.missionwinning.core.model.WeightUnits.formatWithUnit(value, unit)

    /** Session volume = sum(weight × reps) for completed sets. */
    fun sessionVolume(exercises: List<ActiveExercise>): Double =
        completedSetsForPersist(exercises).sumOf { it.weight * it.reps }

    /**
     * Convert a stored previous weight into the display unit for this session.
     * Legacy rows without unit are treated as [storedUnit] default `kg`.
     */
    fun previousWeightInUnit(
        storedWeight: Double?,
        storedUnit: String?,
        displayUnit: String,
    ): Double? {
        if (storedWeight == null) return null
        val from = normalizeUnit(storedUnit ?: "kg")
        val to = normalizeUnit(displayUnit)
        return convertWeight(storedWeight, from, to)
    }
}
