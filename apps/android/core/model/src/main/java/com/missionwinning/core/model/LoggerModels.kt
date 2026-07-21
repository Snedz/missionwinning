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
    /** Optional RPE 6–10 (local-first coach signal). */
    val rpe: Int? = null,
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

    /** Snap to the unit's plate step (2.5 kg / 5 lb). */
    fun roundToStep(value: Double, unit: String): Double {
        val s = step(unit)
        if (s <= 0.0) return value.coerceAtLeast(0.0)
        return (kotlin.math.round(value / s) * s).coerceAtLeast(0.0)
    }

    fun convert(value: Double, fromUnit: String, toUnit: String): Double {
        val from = normalize(fromUnit)
        val to = normalize(toUnit)
        if (from == to) return value
        val raw = when {
            from == "kg" && to == "lb" -> value * KG_TO_LB
            from == "lb" && to == "kg" -> value / KG_TO_LB
            else -> value
        }
        return roundToStep(raw, to)
    }

    /** Compact display: 100, 2.5, 12.5 — no long floats. */
    fun format(value: Double): String {
        val v = if (value < 0) 0.0 else value
        if (kotlin.math.abs(v - v.toLong()) < 1e-6) return v.toLong().toString()
        val tenths = kotlin.math.round(v * 10.0) / 10.0
        return if (kotlin.math.abs(tenths - tenths.toLong()) < 1e-6) {
            tenths.toLong().toString()
        } else {
            String.format(java.util.Locale.US, "%.1f", tenths)
        }
    }

    fun formatWithUnit(value: Double, unit: String): String =
        "${format(value)} ${normalize(unit)}"
}
