package com.missionwinning.core.data

import kotlinx.serialization.Serializable

@Serializable
data class RoutineExerciseDto(
    val exerciseId: String,
    val exerciseName: String,
    val sets: Int,
    val targetReps: Int,
    val lastWeight: Double = 0.0,
)
