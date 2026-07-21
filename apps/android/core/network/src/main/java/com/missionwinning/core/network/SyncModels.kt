package com.missionwinning.core.network

import kotlinx.serialization.Serializable

@Serializable
data class SyncSetDto(
    val id: String,
    val exerciseId: String,
    val exerciseName: String = "",
    val setIndex: Int,
    val reps: Int,
    val weight: Double,
    val completedAt: String,
    val sessionId: String? = null,
    val weightUnit: String = "kg",
    val rpe: Int? = null,
    val setKind: String = "normal",
)

@Serializable
data class SyncWorkoutDto(
    /** Local Room workout id; may be null on legacy server rows. */
    val clientId: String? = null,
    val workoutName: String,
    val completedAt: String,
    val durationSeconds: Int,
    val setCount: Int,
    val totalVolume: Double,
    val sessionId: String? = null,
    val weightUnit: String = "kg",
    val revision: Int = 1,
    val updatedAt: String? = null,
    val deletedAt: String? = null,
    val sets: List<SyncSetDto> = emptyList(),
    val serverId: String? = null,
)

@Serializable
data class SyncPushRequestDto(
    val workouts: List<SyncWorkoutDto>,
)

@Serializable
data class SyncAckDto(
    val clientId: String = "",
    val serverId: String = "",
    val revision: Int = 1,
    val updatedAt: String = "",
    val status: String = "ok",
    val error: String? = null,
)

@Serializable
data class SyncPushResponseDto(
    val ok: Boolean = true,
    val acks: List<SyncAckDto> = emptyList(),
)

@Serializable
data class SyncPullResponseDto(
    val items: List<SyncWorkoutDto> = emptyList(),
    val nextCursor: String? = null,
)
