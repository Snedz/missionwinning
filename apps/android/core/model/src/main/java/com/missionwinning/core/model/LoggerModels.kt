package com.missionwinning.core.model

import androidx.compose.runtime.Immutable

@Immutable
data class LoggedSet(
    val id: String,
    val exerciseId: String,
    val exerciseName: String,
    val setIndex: Int,
    val reps: Int,
    val weight: Double,
    val done: Boolean = false,
    val previousReps: Int? = null,
    val previousWeight: Double? = null,
)

@Immutable
data class ActiveExercise(
    val exerciseId: String,
    val name: String,
    val sets: List<LoggedSet>,
)

@Immutable
data class WeightUnit(val code: String) {
    companion object {
        val Kg = WeightUnit("kg")
        val Lb = WeightUnit("lb")
    }
}

/** Shared weight unit helpers (no Android UI deps). */
object WeightUnits {
    private const val KG_TO_LB = 2.2046226218

    fun normalize(unit: String): String =
        if (unit.equals("lb", ignoreCase = true) || unit.equals("lbs", ignoreCase = true)) "lb" else "kg"

    fun step(unit: String): Double = if (normalize(unit) == "lb") 5.0 else 2.5

    fun convert(value: Double, fromUnit: String, toUnit: String): Double {
        val from = normalize(fromUnit)
        val to = normalize(toUnit)
        if (from == to) return value
        return when {
            from == "kg" && to == "lb" -> value * KG_TO_LB
            from == "lb" && to == "kg" -> value / KG_TO_LB
            else -> value
        }
    }
}
