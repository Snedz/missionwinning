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
