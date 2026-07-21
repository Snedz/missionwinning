package com.missionwinning.core.data

import com.missionwinning.core.network.MobileApiClient
import com.missionwinning.core.network.WorkoutLogRequestDto
import kotlinx.serialization.json.Json

/**
 * Façade over [SyncEngine] + outbox status. Room remains SoT; network never owns UI.
 */
class SyncCoordinator(
    private val db: MwDatabase,
    private val api: MobileApiClient?,
    private val syncEngine: SyncEngine?,
) {
    private val dao = db.dao()
    private val json = Json { ignoreUnknownKeys = true }

    suspend fun enqueueRoutine(routineId: String) {
        syncEngine?.enqueueRoutine(routineId)
    }

    suspend fun enqueueWorkout(workoutId: String) {
        syncEngine?.enqueueWorkout(workoutId)
    }

    /** Unsynced finished workouts (pending/failed), not raw outbox row count. */
    suspend fun pendingSyncCount(): Int = dao.unsyncedWorkoutCount()

    suspend fun outboxStatus(): OutboxStatus {
        val pending = dao.pendingWorkoutCount()
        val failed = dao.failedWorkoutCount()
        val rows = dao.pendingOutboxCount()
        val last = dao.getPref(KEY_LAST_SYNC_SUCCESS)
        return OutboxStatus(
            pendingWorkouts = pending,
            failedWorkouts = failed,
            outboxRows = rows,
            lastSuccessAt = last,
        )
    }

    suspend fun flushOutboxAndCount(): Int {
        flushOutbox()
        return pendingSyncCount()
    }

    suspend fun flushOutbox() {
        val engine = syncEngine
        if (engine != null) {
            val remaining = engine.syncAll()
            if (remaining == 0) {
                markSyncSuccess()
            }
            return
        }
        // Fallback: legacy summary push if SyncEngine not wired (widgets / tests)
        val client = api ?: return
        val pending = dao.pendingOutbox()
        var anyOk = false
        for (row in pending) {
            if (row.kind == SyncEngine.KIND_WORKOUT_REF) {
                val workout = dao.workoutById(row.payloadJson.trim()) ?: run {
                    dao.deleteOutbox(row.id)
                    continue
                }
                val ok = runCatching {
                    client.logWorkout(
                        workout.workoutName,
                        workout.durationSeconds,
                        workout.setCount,
                        workout.totalVolume,
                        workout.sessionId,
                    ).getOrThrow()
                }.isSuccess
                if (ok) {
                    anyOk = true
                    dao.updateWorkoutSync(
                        workout.id,
                        SyncEngine.STATUS_SYNCED,
                        workout.revision,
                        java.time.Instant.now().toString(),
                    )
                    dao.deleteOutbox(row.id)
                } else {
                    dao.bumpOutboxAttempt(row.id)
                }
            } else if (row.kind == MwRepository.KIND_WORKOUT) {
                val ok = runCatching {
                    val req = json.decodeFromString(WorkoutLogRequestDto.serializer(), row.payloadJson)
                    client.logWorkout(
                        req.workoutName,
                        req.durationSeconds,
                        req.setCount,
                        req.totalVolume,
                        req.sessionId,
                    ).getOrThrow()
                }.isSuccess
                if (ok) {
                    anyOk = true
                    dao.deleteOutbox(row.id)
                } else {
                    dao.bumpOutboxAttempt(row.id)
                }
            } else {
                dao.deleteOutbox(row.id)
            }
        }
        if (anyOk && dao.unsyncedWorkoutCount() == 0) {
            markSyncSuccess()
        }
    }

    /** Full pull+push for signed-in restore. */
    suspend fun syncNow(): Int = flushOutboxAndCount()

    private suspend fun markSyncSuccess() {
        dao.setPref(
            PrefEntity(KEY_LAST_SYNC_SUCCESS, java.time.Instant.now().toString()),
        )
    }

    companion object {
        const val KEY_LAST_SYNC_SUCCESS = "sync_last_success_at"
    }
}
