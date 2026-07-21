package com.missionwinning.core.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "coach_plan")
data class CoachPlanEntity(
    @PrimaryKey val id: Int = 1,
    val json: String,
)

@Entity(tableName = "workout_logs")
data class WorkoutLogEntity(
    @PrimaryKey val id: String,
    val workoutName: String,
    val completedAt: String,
    val durationSeconds: Int,
    val setCount: Int,
    val totalVolume: Double,
    val sessionId: String?,
    /** pending | synced | failed (Room v8). */
    val syncStatus: String = "pending",
    val revision: Int = 1,
    val updatedAt: String = "",
    val deletedAt: String? = null,
    val weightUnit: String = "kg",
)

@Entity(tableName = "set_logs")
data class SetLogEntity(
    @PrimaryKey val id: String,
    val exerciseId: String,
    val exerciseName: String,
    val setIndex: Int,
    val reps: Int,
    val weight: Double,
    val completedAt: String,
    val sessionId: String?,
    /** Unit the weight was logged in (`kg` / `lb`). Used when converting previous performance. */
    val weightUnit: String = "kg",
    /** Parent [WorkoutLogEntity.id] for history detail (Room v4). */
    val workoutId: String = "",
    /** Optional RPE 6–10 (Room v5). Null = not logged. */
    val rpe: Int? = null,
    /** normal | warmup | failure | drop (Room v7). */
    val setKind: String = "normal",
)

@Entity(tableName = "sync_outbox")
data class SyncOutboxEntity(
    @PrimaryKey val id: String,
    val kind: String,
    val payloadJson: String,
    val createdAt: String,
    val attempts: Int = 0,
)

@Entity(tableName = "prefs")
data class PrefEntity(
    @PrimaryKey val key: String,
    val value: String,
)

/** Saved workout template. Exercise blueprint stored as JSON. */
@Entity(tableName = "routines")
data class RoutineEntity(
    @PrimaryKey val id: String,
    val name: String,
    val createdAt: String,
    val sourceWorkoutId: String? = null,
    /** JSON list of [RoutineExerciseDto]. */
    val exercisesJson: String,
    /** pending | synced | failed (Room v9). */
    val syncStatus: String = "pending",
    val revision: Int = 1,
    val updatedAt: String = "",
    val deletedAt: String? = null,
)
