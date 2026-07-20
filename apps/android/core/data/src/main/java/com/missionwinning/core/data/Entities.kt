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
)

@Entity(tableName = "prefs")
data class PrefEntity(
    @PrimaryKey val key: String,
    val value: String,
)
