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

    @Query("DELETE FROM coach_plan")
    suspend fun clearCoachPlan()

    @Query("SELECT * FROM workout_logs WHERE deletedAt IS NULL ORDER BY completedAt DESC")
    suspend fun allWorkouts(): List<WorkoutLogEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWorkout(row: WorkoutLogEntity)

    @Query("SELECT COUNT(*) FROM workout_logs WHERE deletedAt IS NULL")
    suspend fun workoutCount(): Int

    @Query(
        """
        SELECT * FROM workout_logs
        WHERE deletedAt IS NULL
        ORDER BY completedAt DESC
        LIMIT :limit
        """,
    )
    suspend fun recentWorkouts(limit: Int): List<WorkoutLogEntity>

    @Query("SELECT * FROM workout_logs WHERE id = :id LIMIT 1")
    suspend fun workoutById(id: String): WorkoutLogEntity?

    @Query(
        """
        SELECT * FROM workout_logs
        WHERE deletedAt IS NULL AND completedAt >= :sinceIso
        ORDER BY completedAt DESC
        """,
    )
    suspend fun workoutsSince(sinceIso: String): List<WorkoutLogEntity>

    @Query(
        """
        SELECT * FROM workout_logs
        WHERE syncStatus IN ('pending', 'failed') AND deletedAt IS NULL
        ORDER BY completedAt ASC
        LIMIT :limit
        """,
    )
    suspend fun workoutsNeedingPush(limit: Int = 50): List<WorkoutLogEntity>

    @Query(
        """
        SELECT COUNT(*) FROM workout_logs
        WHERE syncStatus IN ('pending', 'failed') AND deletedAt IS NULL
        """,
    )
    suspend fun unsyncedWorkoutCount(): Int

    @Query(
        """
        SELECT COUNT(*) FROM workout_logs
        WHERE syncStatus = 'pending' AND deletedAt IS NULL
        """,
    )
    suspend fun pendingWorkoutCount(): Int

    @Query(
        """
        SELECT COUNT(*) FROM workout_logs
        WHERE syncStatus = 'failed' AND deletedAt IS NULL
        """,
    )
    suspend fun failedWorkoutCount(): Int

    @Query(
        """
        UPDATE workout_logs
        SET syncStatus = :status, revision = :revision, updatedAt = :updatedAt
        WHERE id = :id
        """,
    )
    suspend fun updateWorkoutSync(
        id: String,
        status: String,
        revision: Int,
        updatedAt: String,
    )

    @Query("DELETE FROM set_logs WHERE workoutId = :workoutId")
    suspend fun deleteSetsForWorkout(workoutId: String)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSetLog(row: SetLogEntity)

    @Query(
        """
        SELECT * FROM set_logs
        WHERE workoutId = :workoutId
        ORDER BY exerciseName ASC, setIndex ASC
        """,
    )
    suspend fun setsForWorkout(workoutId: String): List<SetLogEntity>

    @Query(
        """
        SELECT * FROM set_logs
        WHERE exerciseId = :exerciseId AND setIndex = :setIndex
        ORDER BY completedAt DESC
        LIMIT 1
        """,
    )
    suspend fun latestSetFor(exerciseId: String, setIndex: Int): SetLogEntity?

    @Query(
        """
        SELECT * FROM set_logs
        WHERE weight > 0
        ORDER BY completedAt DESC
        LIMIT :limit
        """,
    )
    suspend fun recentWeightedSets(limit: Int = 500): List<SetLogEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun enqueueOutbox(row: SyncOutboxEntity)

    @Query("SELECT * FROM sync_outbox ORDER BY createdAt ASC LIMIT :limit")
    suspend fun pendingOutbox(limit: Int = 20): List<SyncOutboxEntity>

    @Query("SELECT COUNT(*) FROM sync_outbox")
    suspend fun pendingOutboxCount(): Int

    @Query("DELETE FROM sync_outbox WHERE id = :id")
    suspend fun deleteOutbox(id: String)

    @Query("UPDATE sync_outbox SET attempts = attempts + 1 WHERE id = :id")
    suspend fun bumpOutboxAttempt(id: String)

    @Query("SELECT * FROM sync_outbox WHERE id = :id LIMIT 1")
    suspend fun outboxById(id: String): SyncOutboxEntity?

    @Query(
        """
        UPDATE sync_outbox SET attempts = :attempts WHERE id = :id
        """,
    )
    suspend fun setOutboxAttempts(id: String, attempts: Int)

    @Query("SELECT value FROM prefs WHERE `key` = :key LIMIT 1")
    suspend fun getPref(key: String): String?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun setPref(row: PrefEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertRoutine(row: RoutineEntity)

    @Query(
        """
        SELECT * FROM routines
        WHERE deletedAt IS NULL
        ORDER BY createdAt DESC
        """,
    )
    suspend fun allRoutines(): List<RoutineEntity>

    @Query("SELECT * FROM routines WHERE id = :id LIMIT 1")
    suspend fun routineById(id: String): RoutineEntity?

    @Query("DELETE FROM routines WHERE id = :id")
    suspend fun deleteRoutine(id: String)

    @Query(
        """
        SELECT * FROM routines
        WHERE syncStatus IN ('pending', 'failed') AND deletedAt IS NULL
        ORDER BY createdAt ASC
        LIMIT :limit
        """,
    )
    suspend fun routinesNeedingPush(limit: Int = 50): List<RoutineEntity>

    @Query(
        """
        UPDATE routines
        SET syncStatus = :status, revision = :revision, updatedAt = :updatedAt
        WHERE id = :id
        """,
    )
    suspend fun updateRoutineSync(
        id: String,
        status: String,
        revision: Int,
        updatedAt: String,
    )

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertCustomExercise(row: CustomExerciseEntity)

    @Query("SELECT * FROM custom_exercises ORDER BY name ASC")
    suspend fun allCustomExercises(): List<CustomExerciseEntity>

    @Query("SELECT * FROM custom_exercises WHERE id = :id LIMIT 1")
    suspend fun customExerciseById(id: String): CustomExerciseEntity?

    @Query("DELETE FROM custom_exercises WHERE id = :id")
    suspend fun deleteCustomExercise(id: String)

    @Query(
        """
        SELECT * FROM custom_exercises
        WHERE syncStatus IN ('pending', 'failed') AND deletedAt IS NULL
        ORDER BY createdAt ASC
        LIMIT :limit
        """,
    )
    suspend fun customsNeedingPush(limit: Int = 50): List<CustomExerciseEntity>

    @Query(
        """
        UPDATE custom_exercises
        SET syncStatus = :status, revision = :revision, updatedAt = :updatedAt
        WHERE id = :id
        """,
    )
    suspend fun updateCustomSync(
        id: String,
        status: String,
        revision: Int,
        updatedAt: String,
    )

    @Query(
        """
        UPDATE workout_logs SET syncStatus = 'pending', updatedAt = :now
        WHERE syncStatus = 'failed' AND deletedAt IS NULL
        """,
    )
    suspend fun resetFailedWorkoutsToPending(now: String)

    @Query(
        """
        UPDATE routines SET syncStatus = 'pending', updatedAt = :now
        WHERE syncStatus = 'failed' AND deletedAt IS NULL
        """,
    )
    suspend fun resetFailedRoutinesToPending(now: String)

    @Query(
        """
        UPDATE custom_exercises SET syncStatus = 'pending', updatedAt = :now
        WHERE syncStatus = 'failed' AND deletedAt IS NULL
        """,
    )
    suspend fun resetFailedCustomsToPending(now: String)

    @Query("UPDATE sync_outbox SET attempts = 0")
    suspend fun resetAllOutboxAttempts()

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertSessionDraft(row: SessionDraftEntity)

    @Query("SELECT * FROM session_drafts WHERE id = 1 LIMIT 1")
    suspend fun getSessionDraft(): SessionDraftEntity?

    @Query("DELETE FROM session_drafts WHERE id = 1")
    suspend fun clearSessionDraft()
}
