package com.missionwinning.core.data

import androidx.room.withTransaction
import com.missionwinning.core.network.MobileApiClient
import com.missionwinning.core.network.SyncRoutineDto
import com.missionwinning.core.network.SyncRoutineExerciseDto
import com.missionwinning.core.network.SyncSetDto
import com.missionwinning.core.network.SyncWorkoutDto
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.UUID

/**
 * Full-fidelity workout + routine sync.
 * Push pending entities (built from Room at send time), then cursor pull-merge.
 */
class SyncEngine(
    private val db: MwDatabase,
    private val api: MobileApiClient?,
    private val authRepository: AuthRepository?,
) {
    private val dao = db.dao()
    private val json = Json { ignoreUnknownKeys = true }

    /**
     * @return remaining unsynced workout count after attempt.
     */
    suspend fun syncAll(): Int {
        if (api == null) return dao.unsyncedWorkoutCount()
        // Need a session for cloud sync
        val token = authRepository?.ensureFreshAccessToken()
        if (token.isNullOrBlank() && authRepository != null) {
            return dao.unsyncedWorkoutCount()
        }
        // Anonymous with cookie may still push via legacy; sync v2 requires Bearer
        if (authRepository?.accessTokenOrNull().isNullOrBlank()) {
            return dao.unsyncedWorkoutCount()
        }

        pushPending()
        pullMerge()
        pushRoutines()
        pullRoutines()
        return dao.unsyncedWorkoutCount()
    }

    suspend fun enqueueRoutine(routineId: String) {
        val now = java.time.Instant.now().toString()
        dao.enqueueOutbox(
            SyncOutboxEntity(
                id = "r-${UUID.randomUUID()}",
                kind = KIND_ROUTINE_REF,
                payloadJson = routineId,
                createdAt = now,
                attempts = 0,
            ),
        )
    }

    suspend fun enqueueWorkout(workoutId: String) {
        val now = java.time.Instant.now().toString()
        dao.enqueueOutbox(
            SyncOutboxEntity(
                id = UUID.randomUUID().toString(),
                kind = KIND_WORKOUT_REF,
                payloadJson = workoutId,
                createdAt = now,
                attempts = 0,
            ),
        )
    }

    private suspend fun pushPending() {
        val client = api ?: return
        // Drain outbox refs first (cap attempts)
        val outbox = dao.pendingOutbox(limit = 50)
        for (row in outbox) {
            if (row.kind == KIND_ROUTINE_REF) continue
            if (!SyncMergeRules.isWorkoutOutboxKind(row.kind)) {
                dao.deleteOutbox(row.id)
                continue
            }
            if (SyncMergeRules.isDeadLetter(row.attempts, MAX_ATTEMPTS)) {
                val workoutId = row.payloadJson.trim()
                if (workoutId.isNotBlank()) {
                    val w = dao.workoutById(workoutId)
                    if (w != null) {
                        dao.updateWorkoutSync(
                            id = w.id,
                            status = STATUS_FAILED,
                            revision = w.revision,
                            updatedAt = w.updatedAt.ifBlank { w.completedAt },
                        )
                    }
                }
                dao.deleteOutbox(row.id)
                continue
            }
        }

        val pending = dao.workoutsNeedingPush(50)
        if (pending.isEmpty()) {
            // Clear orphan outbox rows
            outbox.filter { SyncMergeRules.isWorkoutOutboxKind(it.kind) }
                .forEach { dao.deleteOutbox(it.id) }
            return
        }

        val payloads = pending.map { w ->
            val sets = dao.setsForWorkout(w.id)
            toSyncDto(w, sets)
        }.filter { !it.clientId.isNullOrBlank() }

        val result = client.pushWorkouts(payloads)
        result.onSuccess { resp ->
            for (ack in resp.acks) {
                val id = ack.clientId
                if (id.isBlank()) continue
                if (ack.status == "error") {
                    dao.bumpOutboxForWorkout(id)
                    val w = dao.workoutById(id)
                    if (w != null && SyncMergeRules.isDeadLetter(dao.outboxAttemptsFor(id), MAX_ATTEMPTS)) {
                        dao.updateWorkoutSync(id, STATUS_FAILED, w.revision, w.updatedAt)
                    }
                    continue
                }
                dao.updateWorkoutSync(
                    id = id,
                    status = STATUS_SYNCED,
                    revision = ack.revision.coerceAtLeast(1),
                    updatedAt = ack.updatedAt.ifBlank {
                        java.time.Instant.now().toString()
                    },
                )
                dao.clearOutboxForWorkout(id)
            }
        }.onFailure {
            // Bump all pending outbox attempts
            for (w in pending) {
                dao.bumpOutboxForWorkout(w.id)
            }
        }
    }

    private suspend fun pullMerge() {
        val client = api ?: return
        var cursor = dao.getPref(KEY_SYNC_CURSOR) ?: "1970-01-01T00:00:00.000Z"
        var guard = 0
        while (guard++ < 20) {
            val page = client.pullWorkouts(since = cursor, limit = 100).getOrElse { return }
            if (page.items.isEmpty()) break
            for (item in page.items) {
                mergeRemote(item)
            }
            val next = page.nextCursor
            if (next.isNullOrBlank() || next == cursor) {
                // Advance to last item updatedAt even if nextCursor null
                page.items.lastOrNull()?.updatedAt?.let { cursor = it }
                dao.setPref(PrefEntity(KEY_SYNC_CURSOR, cursor))
                break
            }
            cursor = next
            dao.setPref(PrefEntity(KEY_SYNC_CURSOR, cursor))
        }
    }

    private suspend fun mergeRemote(item: SyncWorkoutDto) {
        val clientId = SyncMergeRules.resolveClientId(item.clientId, item.serverId) ?: return

        val local = dao.workoutById(clientId)
        val remoteRev = item.revision.coerceAtLeast(1)
        val remoteDeleted = SyncMergeRules.isRemoteDeleted(item.deletedAt)

        if (local != null) {
            // Local pending always wins until acked
            if (SyncMergeRules.shouldSkipRemoteForLocalPending(local.syncStatus)) {
                return
            }
            if (remoteDeleted) {
                db.withTransaction {
                    dao.insertWorkout(
                        local.copy(
                            deletedAt = item.deletedAt,
                            revision = maxOf(local.revision, remoteRev),
                            updatedAt = item.updatedAt ?: local.updatedAt,
                            syncStatus = STATUS_SYNCED,
                        ),
                    )
                }
                return
            }
            if (SyncMergeRules.isRemoteStale(local.revision, remoteRev)) return
        }

        if (remoteDeleted && local == null) {
            // Remote tombstone for unknown id — store soft row so we don't re-pull noise
            dao.insertWorkout(
                WorkoutLogEntity(
                    id = clientId,
                    workoutName = item.workoutName,
                    completedAt = item.completedAt,
                    durationSeconds = item.durationSeconds,
                    setCount = item.setCount,
                    totalVolume = item.totalVolume,
                    sessionId = item.sessionId,
                    syncStatus = STATUS_SYNCED,
                    revision = remoteRev,
                    updatedAt = item.updatedAt ?: item.completedAt,
                    deletedAt = item.deletedAt,
                    weightUnit = item.weightUnit,
                ),
            )
            return
        }

        if (remoteDeleted) return

        val unit = item.weightUnit.ifBlank { "kg" }
        val workout = WorkoutLogEntity(
            id = clientId,
            workoutName = item.workoutName,
            completedAt = item.completedAt,
            durationSeconds = item.durationSeconds,
            setCount = item.setCount,
            totalVolume = item.totalVolume,
            sessionId = item.sessionId,
            syncStatus = STATUS_SYNCED,
            revision = remoteRev,
            updatedAt = item.updatedAt ?: item.completedAt,
            deletedAt = null,
            weightUnit = unit,
        )
        val sets = item.sets.map { s ->
            SetLogEntity(
                id = s.id.ifBlank { UUID.randomUUID().toString() },
                exerciseId = s.exerciseId,
                exerciseName = s.exerciseName,
                setIndex = s.setIndex,
                reps = s.reps,
                weight = s.weight,
                completedAt = s.completedAt,
                sessionId = s.sessionId,
                weightUnit = s.weightUnit.ifBlank { unit },
                workoutId = clientId,
                rpe = s.rpe,
                setKind = s.setKind.ifBlank { "normal" },
            )
        }
        db.withTransaction {
            dao.insertWorkout(workout)
            dao.deleteSetsForWorkout(clientId)
            sets.forEach { dao.insertSetLog(it) }
        }
    }

    private fun toSyncDto(w: WorkoutLogEntity, sets: List<SetLogEntity>): SyncWorkoutDto =
        SyncWorkoutDto(
            clientId = w.id, // non-null local id
            workoutName = w.workoutName,
            completedAt = w.completedAt,
            durationSeconds = w.durationSeconds,
            setCount = w.setCount,
            totalVolume = w.totalVolume,
            sessionId = w.sessionId,
            weightUnit = w.weightUnit.ifBlank { "kg" },
            revision = w.revision.coerceAtLeast(1),
            updatedAt = w.updatedAt.ifBlank { w.completedAt },
            deletedAt = w.deletedAt,
            sets = sets.map { s ->
                SyncSetDto(
                    id = s.id,
                    exerciseId = s.exerciseId,
                    exerciseName = s.exerciseName,
                    setIndex = s.setIndex,
                    reps = s.reps,
                    weight = s.weight,
                    completedAt = s.completedAt,
                    sessionId = s.sessionId,
                    weightUnit = s.weightUnit,
                    rpe = s.rpe,
                    setKind = s.setKind,
                )
            },
        )

    private suspend fun MwDao.bumpOutboxForWorkout(workoutId: String) {
        pendingOutbox(100)
            .filter { it.payloadJson.trim() == workoutId || it.id == workoutId }
            .forEach { bumpOutboxAttempt(it.id) }
        // Ensure a ref row exists
        val has = pendingOutbox(100).any { it.payloadJson.trim() == workoutId }
        if (!has) {
            enqueueOutbox(
                SyncOutboxEntity(
                    id = UUID.randomUUID().toString(),
                    kind = KIND_WORKOUT_REF,
                    payloadJson = workoutId,
                    createdAt = java.time.Instant.now().toString(),
                    attempts = 1,
                ),
            )
        }
    }

    private suspend fun MwDao.outboxAttemptsFor(workoutId: String): Int =
        pendingOutbox(100)
            .filter { it.payloadJson.trim() == workoutId }
            .maxOfOrNull { it.attempts } ?: 0

    private suspend fun MwDao.clearOutboxForWorkout(workoutId: String) {
        pendingOutbox(100)
            .filter { it.payloadJson.trim() == workoutId }
            .forEach { deleteOutbox(it.id) }
    }

    private suspend fun pushRoutines() {
        val client = api ?: return
        val pending = dao.routinesNeedingPush(50)
        if (pending.isEmpty()) return
        val payloads = pending.map { r ->
            val exercises = runCatching {
                json.decodeFromString(
                    kotlinx.serialization.builtins.ListSerializer(RoutineExerciseDto.serializer()),
                    r.exercisesJson,
                )
            }.getOrDefault(emptyList())
            SyncRoutineDto(
                clientId = r.id,
                name = r.name,
                createdAt = r.createdAt,
                sourceWorkoutId = r.sourceWorkoutId,
                exercises = exercises.map {
                    SyncRoutineExerciseDto(
                        exerciseId = it.exerciseId,
                        exerciseName = it.exerciseName,
                        sets = it.sets,
                        targetReps = it.targetReps,
                        lastWeight = it.lastWeight,
                    )
                },
                revision = r.revision.coerceAtLeast(1),
                updatedAt = r.updatedAt.ifBlank { r.createdAt },
                deletedAt = r.deletedAt,
            )
        }.filter { !it.clientId.isNullOrBlank() }

        client.pushRoutines(payloads).onSuccess { resp ->
            for (ack in resp.acks) {
                val id = ack.clientId
                if (id.isBlank()) continue
                if (ack.status == "error") continue
                dao.updateRoutineSync(
                    id = id,
                    status = STATUS_SYNCED,
                    revision = ack.revision.coerceAtLeast(1),
                    updatedAt = ack.updatedAt.ifBlank { java.time.Instant.now().toString() },
                )
                dao.pendingOutbox(100)
                    .filter { it.kind == KIND_ROUTINE_REF && it.payloadJson.trim() == id }
                    .forEach { dao.deleteOutbox(it.id) }
            }
        }
    }

    private suspend fun pullRoutines() {
        val client = api ?: return
        var cursor = dao.getPref(KEY_ROUTINE_SYNC_CURSOR) ?: "1970-01-01T00:00:00.000Z"
        var guard = 0
        while (guard++ < 20) {
            val page = client.pullRoutines(since = cursor, limit = 100).getOrElse { return }
            if (page.items.isEmpty()) break
            for (item in page.items) {
                mergeRemoteRoutine(item)
            }
            val next = page.nextCursor
            if (next.isNullOrBlank() || next == cursor) {
                page.items.lastOrNull()?.updatedAt?.let { cursor = it }
                dao.setPref(PrefEntity(KEY_ROUTINE_SYNC_CURSOR, cursor))
                break
            }
            cursor = next
            dao.setPref(PrefEntity(KEY_ROUTINE_SYNC_CURSOR, cursor))
        }
    }

    private suspend fun mergeRemoteRoutine(item: SyncRoutineDto) {
        val clientId = item.clientId?.takeIf { it.isNotBlank() } ?: return
        val local = dao.routineById(clientId)
        val remoteRev = item.revision.coerceAtLeast(1)
        val remoteDeleted = SyncMergeRules.isRemoteDeleted(item.deletedAt)

        if (local != null) {
            if (SyncMergeRules.shouldSkipRemoteForLocalPending(local.syncStatus)) return
            if (remoteDeleted) {
                dao.upsertRoutine(
                    local.copy(
                        deletedAt = item.deletedAt,
                        revision = maxOf(local.revision, remoteRev),
                        updatedAt = item.updatedAt ?: local.updatedAt,
                        syncStatus = STATUS_SYNCED,
                    ),
                )
                return
            }
            if (SyncMergeRules.isRemoteStale(local.revision, remoteRev)) return
        }

        if (remoteDeleted) {
            dao.upsertRoutine(
                RoutineEntity(
                    id = clientId,
                    name = item.name,
                    createdAt = item.createdAt ?: item.updatedAt.orEmpty(),
                    sourceWorkoutId = item.sourceWorkoutId,
                    exercisesJson = "[]",
                    syncStatus = STATUS_SYNCED,
                    revision = remoteRev,
                    updatedAt = item.updatedAt.orEmpty(),
                    deletedAt = item.deletedAt,
                ),
            )
            return
        }

        val exercisesJson = json.encodeToString(
            kotlinx.serialization.builtins.ListSerializer(RoutineExerciseDto.serializer()),
            item.exercises.map {
                RoutineExerciseDto(
                    exerciseId = it.exerciseId,
                    exerciseName = it.exerciseName,
                    sets = it.sets,
                    targetReps = it.targetReps,
                    lastWeight = it.lastWeight,
                )
            },
        )
        dao.upsertRoutine(
            RoutineEntity(
                id = clientId,
                name = item.name,
                createdAt = item.createdAt ?: item.updatedAt.orEmpty(),
                sourceWorkoutId = item.sourceWorkoutId,
                exercisesJson = exercisesJson,
                syncStatus = STATUS_SYNCED,
                revision = remoteRev,
                updatedAt = item.updatedAt ?: java.time.Instant.now().toString(),
                deletedAt = null,
            ),
        )
    }

    companion object {
        const val KIND_WORKOUT_REF = "workout_ref"
        const val KIND_ROUTINE_REF = "routine_ref"
        const val STATUS_PENDING = "pending"
        const val STATUS_SYNCED = "synced"
        const val STATUS_FAILED = "failed"
        const val MAX_ATTEMPTS = 8
        const val KEY_SYNC_CURSOR = "sync_pull_cursor"
        const val KEY_ROUTINE_SYNC_CURSOR = "routine_sync_pull_cursor"
    }
}
