package com.missionwinning.core.network

import kotlinx.serialization.Serializable

@Serializable
data class CoachPlanDto(
    val revision: Int,
    val weekStart: String,
    val daysPerWeek: Int,
    val sessions: List<PlanSessionDto>,
    val generatedAt: String,
    val contextHash: String,
    val equipmentProfile: String,
)

@Serializable
data class PlanSessionDto(
    val id: String,
    val dayOffset: Int,
    val kind: String,
    val name: String,
    val focusGroups: List<String> = emptyList(),
    val exercises: List<PlanExerciseDto> = emptyList(),
    val estMinutes: Int,
    val status: String,
)

@Serializable
data class PlanExerciseDto(
    val exerciseId: String,
    val sets: Int,
    val reps: Int,
    val weight: Double = 0.0,
    val whyKey: String = "",
)

@Serializable
data class AdaptBeatDto(
    val key: String,
    val defaultMessage: String,
    val count: Int? = null,
)

@Serializable
data class CoachPlanResponseDto(
    val plan: CoachPlanDto,
    val adaptBeats: List<AdaptBeatDto> = emptyList(),
    val hasAdaptSignal: Boolean = false,
)
