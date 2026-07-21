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
    /** Optional set note (Phase 10). */
    val note: String = "",
    /** Superset group letter A–D or empty. */
    val supersetGroup: String = "",
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

@Serializable
data class SyncRoutineExerciseDto(
    val exerciseId: String,
    val exerciseName: String = "",
    val sets: Int = 3,
    val targetReps: Int = 10,
    val lastWeight: Double = 0.0,
)

@Serializable
data class SyncRoutineDto(
    val clientId: String? = null,
    val name: String,
    val createdAt: String? = null,
    val sourceWorkoutId: String? = null,
    val exercises: List<SyncRoutineExerciseDto> = emptyList(),
    val revision: Int = 1,
    val updatedAt: String? = null,
    val deletedAt: String? = null,
    val serverId: String? = null,
)

@Serializable
data class SyncRoutinePushRequestDto(
    val routines: List<SyncRoutineDto>,
)

@Serializable
data class SyncRoutinePushResponseDto(
    val ok: Boolean = true,
    val acks: List<SyncAckDto> = emptyList(),
)

@Serializable
data class SyncRoutinePullResponseDto(
    val items: List<SyncRoutineDto> = emptyList(),
    val nextCursor: String? = null,
)

@Serializable
data class SyncCustomExerciseDto(
    val clientId: String? = null,
    val name: String,
    val createdAt: String? = null,
    val equipment: String = "any",
    val muscleGroups: String = "",
    val revision: Int = 1,
    val updatedAt: String? = null,
    val deletedAt: String? = null,
    val serverId: String? = null,
)

@Serializable
data class SyncCustomPushRequestDto(
    val exercises: List<SyncCustomExerciseDto>,
)

@Serializable
data class SyncCustomPushResponseDto(
    val ok: Boolean = true,
    val acks: List<SyncAckDto> = emptyList(),
)

@Serializable
data class SyncCustomPullResponseDto(
    val items: List<SyncCustomExerciseDto> = emptyList(),
    val nextCursor: String? = null,
)

@Serializable
data class SyncPrefsDto(
    val weightUnit: String = "kg",
    val defaultRestSeconds: Int = 60,
    val equipment: String = "bodyweight",
    val barWeightKg: Double = 20.0,
    val barWeightLb: Double = 45.0,
    val revision: Int = 1,
    val updatedAt: String? = null,
)

@Serializable
data class SyncPrefsPushRequestDto(
    val prefs: SyncPrefsDto,
)

@Serializable
data class SyncPrefsPullResponseDto(
    val prefs: SyncPrefsDto? = null,
)
