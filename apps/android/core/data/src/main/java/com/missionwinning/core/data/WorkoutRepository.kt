package com.missionwinning.core.data

import androidx.room.withTransaction
import com.missionwinning.core.model.SetKind
import java.util.UUID

/**
 * Workout logs + set rows. Room is SoT; finishes enqueue sync via [SyncCoordinator].
 */
class WorkoutRepository(
    private val db: MwDatabase,
    private val prefs: PrefsRepository,
    private val sync: SyncCoordinator,
) {
    private val dao = db.dao()

    suspend fun previousSet(exerciseId: String, setIndex: Int): SetLogEntity? =
        dao.latestSetFor(exerciseId, setIndex)

    suspend fun finishWorkout(
        workoutName: String,
        durationSeconds: Int,
        sets: List<SetLogEntity>,
        sessionId: String?,
    ): FinishWorkoutResult {
        val id = UUID.randomUUID().toString()
        val volume = sets.sumOf { row ->
            if (SetKind.countsTowardVolume(SetKind.fromCode(row.setKind))) {
                row.weight * row.reps
            } else {
                0.0
            }
        }
        val now = java.time.Instant.now().toString()
        val unit = prefs.weightUnit()
        val stampedSets = sets.map { it.copy(workoutId = id) }
        val workout = WorkoutLogEntity(
            id = id,
            workoutName = workoutName,
            completedAt = now,
            durationSeconds = durationSeconds,
            setCount = stampedSets.size,
            totalVolume = volume,
            sessionId = sessionId,
            syncStatus = SyncEngine.STATUS_PENDING,
            revision = 1,
            updatedAt = now,
            deletedAt = null,
            weightUnit = unit,
        )
        val outbox = SyncOutboxEntity(
            id = UUID.randomUUID().toString(),
            kind = SyncEngine.KIND_WORKOUT_REF,
            payloadJson = id,
            createdAt = now,
            attempts = 0,
        )
        db.withTransaction {
            dao.insertWorkout(workout)
            stampedSets.forEach { dao.insertSetLog(it) }
            dao.enqueueOutbox(outbox)
        }
        sync.flushOutbox()
        return FinishWorkoutResult(
            workoutId = id,
            workoutCount = dao.workoutCount(),
            totalVolume = volume,
        )
    }

    suspend fun workoutById(id: String): WorkoutLogEntity? = dao.workoutById(id)

    suspend fun setsForWorkout(workoutId: String): List<SetLogEntity> =
        dao.setsForWorkout(workoutId)

    suspend fun recentWeightedSets(limit: Int = 500): List<SetLogEntity> =
        dao.recentWeightedSets(limit.coerceIn(1, 2000))

    suspend fun workoutCount(): Int = dao.workoutCount()

    suspend fun recentWorkouts(limit: Int = 5): List<WorkoutLogEntity> =
        dao.recentWorkouts(limit.coerceIn(1, 20))

    suspend fun workoutsSince(sinceIso: String): List<WorkoutLogEntity> =
        dao.workoutsSince(sinceIso)

    suspend fun workoutStreakDays(): Int {
        val logs = dao.recentWorkouts(120)
        if (logs.isEmpty()) return 0
        val zone = java.time.ZoneId.systemDefault()
        val days = logs.mapNotNull { row ->
            runCatching {
                java.time.Instant.parse(row.completedAt).atZone(zone).toLocalDate()
            }.getOrNull()
        }.toSet()
        return com.missionwinning.core.model.WorkoutStats.streakDays(days)
    }
}
