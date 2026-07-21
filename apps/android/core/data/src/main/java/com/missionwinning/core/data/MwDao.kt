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

    @Query("SELECT COUNT(*) FROM workout_logs")
    suspend fun workoutCount(): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSetLog(row: SetLogEntity)

    @Query(
        """
        SELECT * FROM set_logs
        WHERE exerciseId = :exerciseId AND setIndex = :setIndex
        ORDER BY completedAt DESC
        LIMIT 1
        """,
    )
    suspend fun latestSetFor(exerciseId: String, setIndex: Int): SetLogEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun enqueueOutbox(row: SyncOutboxEntity)

    @Query("SELECT * FROM sync_outbox ORDER BY createdAt ASC LIMIT :limit")
    suspend fun pendingOutbox(limit: Int = 20): List<SyncOutboxEntity>

    @Query("DELETE FROM sync_outbox WHERE id = :id")
    suspend fun deleteOutbox(id: String)

    @Query("UPDATE sync_outbox SET attempts = attempts + 1 WHERE id = :id")
    suspend fun bumpOutboxAttempt(id: String)

    @Query("SELECT value FROM prefs WHERE `key` = :key LIMIT 1")
    suspend fun getPref(key: String): String?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun setPref(row: PrefEntity)
}
