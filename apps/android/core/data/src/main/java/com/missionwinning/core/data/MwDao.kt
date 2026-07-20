package com.missionwinning.core.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface MwDao {
    @Query("SELECT * FROM coach_plan WHERE id = 1 LIMIT 1")
    suspend fun getCoachPlan(): CoachPlanEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertCoachPlan(row: CoachPlanEntity)

    @Query("SELECT * FROM workout_logs ORDER BY completedAt DESC")
    suspend fun allWorkouts(): List<WorkoutLogEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWorkout(row: WorkoutLogEntity)

    @Query("SELECT value FROM prefs WHERE `key` = :key LIMIT 1")
    suspend fun getPref(key: String): String?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun setPref(row: PrefEntity)
}
