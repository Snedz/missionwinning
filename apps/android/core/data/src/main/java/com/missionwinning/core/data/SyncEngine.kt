package com.missionwinning.core.data

import androidx.room.withTransaction
import com.missionwinning.core.network.MobileApiClient
import com.missionwinning.core.network.SyncCustomExerciseDto
import com.missionwinning.core.network.SyncPrefsDto
import com.missionwinning.core.network.SyncRoutineDto
import com.missionwinning.core.network.SyncRoutineExerciseDto
import com.missionwinning.core.network.SyncSetDto
import com.missionwinning.core.network.SyncWorkoutDto
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.UUID
import kotlin.system.measureTimeMillis

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
    /** Single-flight: Worker + Account Retry + Today must not race. */
    private val syncMutex = Mutex()

    private var lastConflicts = 0
    private var lastConflictNote: String? = null
    private var lastWorkoutPages = 0
    private var lastWorkoutsMerged = 0
    private var lastRoutinePages = 0
    private var lastRoutinesMerged = 0
    private var lastCustomPages = 0
    private var lastCustomsMerged = 0

    /**
     * @return remaining unsynced workout count after attempt.
     */
    suspend fun syncAll(): Int = syncDetailed().remainingUnsynced

    /** Full push/pull with page + conflict stats for Account UX. */
    suspend fun syncDetailed(): SyncRunResult = syncMutex.withLock {
        lastConflicts = 0
        lastConflictNote = null
        lastWorkoutPages = 0
        lastWorkoutsMerged = 0
        lastRoutinePages = 0
        lastRoutinesMerged = 0
        lastCustomPages = 0
        lastCustomsMerged = 0
        if (api == null) {
            return@withLock SyncRunResult(remainingUnsynced = dao.unsyncedWorkoutCount())
        }
        val token = authRepository?.ensureFreshAccessToken()
        if (token.isNullOrBlank() && authRepository != null) {
            return@withLock SyncRunResult(
                remainingUnsynced = dao.unsyncedWorkoutCount(),
                error = "Sign in to sync cloud history",
            )
        }
        if (authRepository?.accessTokenOrNull().isNullOrBlank()) {
            return@withLock SyncRunResult(
                remainingUnsynced = dao.unsyncedWorkoutCount(),
                error = "Sign in to sync cloud history",
            )
        }

        var pushError: String? = null
        val elapsed = measureTimeMillis {
            pushError = runCatching {
                pushPending()
                pullMerge()
                pushRoutines()
                pullRoutines()
                pushCustoms()
                pullCustoms()
                pushPrefs()
                pullPrefs()
            }.exceptionOrNull()?.message
        }

        val remaining = dao.unsyncedWorkoutCount()
        val result = SyncRunResult(
            remainingUnsynced = remaining,
            workoutPagesPulled = lastWorkoutPages,
            workoutsMerged = lastWorkoutsMerged,
            routinePagesPulled = lastRoutinePages,
            routinesMerged = lastRoutinesMerged,
            customPagesPulled = lastCustomPages,
            customsMerged = lastCustomsMerged,
            conflictsSkipped = lastConflicts,
            lastConflictNote = lastConflictNote,
            error = pushError,
            durationMs = elapsed,
        )
        dao.setPref(PrefEntity(KEY_LAST_SYNC_SUMMARY, result.summaryLine))
        if (lastConflictNote != null) {
            dao.setPref(PrefEntity(KEY_LAST_CONFLICT_NOTE, lastConflictNote!!))
            appendConflictInbox(lastConflictNote!!)
        }
        runCatching {
            api?.postTelemetryHeartbeat(
                installId = dao.getPref(MwRepository.KEY_INSTALL_ID) ?: UUID.randomUUID().toString(),
                weekKey = java.time.LocalDate.now().toString().take(7),
                appVersion = "sync:${elapsed}ms:c$lastConflicts:p$lastWorkoutPages",
            )
        }
        result
    }

    /** Reset dead-lettered workouts/routines/customs so Retry can push again. */
    suspend fun prepareRetry() = syncMutex.withLock {
        val now = java.time.Instant.now().toString()
        dao.resetFailedWorkoutsToPending(now)
        dao.resetFailedRoutinesToPending(now)
        dao.resetFailedCustomsToPending(now)
        dao.resetAllOutboxAttempts()
        for (w in dao.workoutsNeedingPush(100)) {
            val existing = dao.pendingOutbox(100).any {
                SyncMergeRules.isWorkoutOutboxKind(it.kind) && it.payloadJson.trim() == w.id
            }
            if (!existing) enqueueWorkout(w.id)
        }
        for (r in dao.routinesNeedingPush(100)) {
            val existing = dao.pendingOutbox(100).any {
                it.kind == KIND_ROUTINE_REF && it.payloadJson.trim() == r.id
            }
            if (!existing) enqueueRoutine(r.id)
        }
        for (c in dao.customsNeedingPush(100)) {
            val existing = dao.pendingOutbox(100).any {
                it.kind == KIND_CUSTOM_REF && it.payloadJson.trim() == c.id
            }
            if (!existing) enqueueCustom(c.id)
        }
    }

    suspend fun conflictInbox(): List<String> {
        val raw = dao.getPref(KEY_CONFLICT_INBOX) ?: return emptyList()
        return runCatching {
            json.decodeFromString<List<String>>(raw)
        }.getOrDefault(emptyList())
    }

    private suspend fun appendConflictInbox(note: String) {
        val prev = conflictInbox().toMutableList()
        prev.add(0, note)
        val trimmed = prev.distinct().take(20)
        dao.setPref(PrefEntity(KEY_CONFLICT_INBOX, json.encodeToString(trimmed)))
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

    suspend fun enqueueCustom(customId: String) {
        val now = java.time.Instant.now().toString()
        dao.enqueueOutbox(
            SyncOutboxEntity(
                id = "c-${UUID.randomUUID()}",
                kind = KIND_CUSTOM_REF,
                payloadJson = customId,
                createdAt = now,
                attempts = 0,
            ),
        )
    }

    private suspend fun pushCustoms() {
        val client = api ?: return
        val pending = dao.customsNeedingPush(50)
        if (pending.isEmpty()) return
        val payloads = pending.map { c ->
            SyncCustomExerciseDto(
                clientId = c.id,
                name = c.name,
                createdAt = c.createdAt,
                equipment = c.equipment,
                muscleGroups = c.muscleGroups,
                revision = c.revision.coerceAtLeast(1),
                updatedAt = c.updatedAt.ifBlank { c.createdAt },
                deletedAt = c.deletedAt,
            )
        }.filter { !it.clientId.isNullOrBlank() }
        client.pushCustoms(payloads).onSuccess { resp ->
            for (ack in resp.acks) {
                val id = ack.clientId
                if (id.isBlank() || ack.status == "error") continue
                dao.updateCustomSync(
                    id = id,
                    status = STATUS_SYNCED,
                    revision = ack.revision.coerceAtLeast(1),
                    updatedAt = ack.updatedAt.ifBlank { java.time.Instant.now().toString() },
                )
                dao.pendingOutbox(100)
                    .filter { it.kind == KIND_CUSTOM_REF && it.payloadJson.trim() == id }
                    .forEach { dao.deleteOutbox(it.id) }
            }
        }
    }

    private suspend fun pullCustoms() {
        val client = api ?: return
        var cursor = dao.getPref(KEY_CUSTOM_SYNC_CURSOR) ?: "1970-01-01T00:00:00.000Z"
        var guard = 0
        while (guard++ < 50) {
            val page = client.pullCustoms(since = cursor, limit = 100).getOrElse { return }
            lastCustomPages++
            if (page.items.isEmpty()) break
            for (item in page.items) {
                mergeRemoteCustom(item)
            }
            val next = page.nextCursor
            if (next.isNullOrBlank() || next == cursor) {
                page.items.lastOrNull()?.updatedAt?.let { cursor = it }
                dao.setPref(PrefEntity(KEY_CUSTOM_SYNC_CURSOR, cursor))
                break
            }
            cursor = next
            dao.setPref(PrefEntity(KEY_CUSTOM_SYNC_CURSOR, cursor))
        }
    }

    private suspend fun mergeRemoteCustom(item: SyncCustomExerciseDto) {
        val clientId = item.clientId?.takeIf { it.isNotBlank() } ?: return
        val local = dao.customExerciseById(clientId)
        val remoteRev = item.revision.coerceAtLeast(1)
        val remoteDeleted = SyncMergeRules.isRemoteDeleted(item.deletedAt)
        if (local != null) {
            if (SyncMergeRules.shouldSkipRemoteForLocalPending(local.syncStatus)) {
                lastConflicts++
                lastConflictNote =
                    "Kept local custom “${local.name}” (pending) over cloud rev $remoteRev"
                return
            }
            if (SyncMergeRules.isRemoteStale(local.revision, remoteRev) && !remoteDeleted) return
        }
        dao.upsertCustomExercise(
            CustomExerciseEntity(
                id = clientId,
                name = item.name,
                createdAt = item.createdAt ?: item.updatedAt.orEmpty(),
                equipment = item.equipment,
                muscleGroups = item.muscleGroups,
                syncStatus = STATUS_SYNCED,
                revision = remoteRev,
                updatedAt = item.updatedAt.orEmpty(),
                deletedAt = item.deletedAt,
            ),
        )
        lastCustomsMerged++
    }

    private suspend fun pushPrefs() {
        val client = api ?: return
        val localRev = dao.getPref(KEY_PREFS_REVISION)?.toIntOrNull() ?: 1
        val prefs = SyncPrefsDto(
            weightUnit = dao.getPref(MwRepository.KEY_WEIGHT_UNIT) ?: "kg",
            defaultRestSeconds = dao.getPref(MwRepository.KEY_DEFAULT_REST)?.toIntOrNull() ?: 60,
            equipment = dao.getPref(MwRepository.KEY_EQUIPMENT) ?: "bodyweight",
            barWeightKg = dao.getPref(MwRepository.KEY_BAR_KG)?.toDoubleOrNull() ?: 20.0,
            barWeightLb = dao.getPref(MwRepository.KEY_BAR_LB)?.toDoubleOrNull() ?: 45.0,
            revision = localRev,
            updatedAt = java.time.Instant.now().toString(),
        )
        client.pushPrefs(prefs).onSuccess {
            dao.setPref(PrefEntity(KEY_PREFS_REVISION, localRev.toString()))
        }
    }

    private suspend fun pullPrefs() {
        val client = api ?: return
        val remote = client.pullPrefs().getOrNull()?.prefs ?: return
        val localRev = dao.getPref(KEY_PREFS_REVISION)?.toIntOrNull() ?: 0
        if (remote.revision <= localRev) return
        dao.setPref(PrefEntity(MwRepository.KEY_WEIGHT_UNIT, remote.weightUnit))
        dao.setPref(PrefEntity(MwRepository.KEY_DEFAULT_REST, remote.defaultRestSeconds.toString()))
        dao.setPref(PrefEntity(MwRepository.KEY_EQUIPMENT, remote.equipment))
        dao.setPref(PrefEntity(MwRepository.KEY_BAR_KG, remote.barWeightKg.toString()))
        dao.setPref(PrefEntity(MwRepository.KEY_BAR_LB, remote.barWeightLb.toString()))
        dao.setPref(PrefEntity(KEY_PREFS_REVISION, remote.revision.toString()))
    }

    private suspend fun pushPending() {
        val client = api ?: return
        // Drain outbox refs first (cap attempts)
        val outbox = dao.pendingOutbox(limit = 50)
        for (row in outbox) {
            if (row.kind == KIND_ROUTINE_REF || row.kind == KIND_CUSTOM_REF) continue
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
        // Phase 12: more pages for large histories (5000 workouts @ 100/page)
        while (guard++ < 50) {
            val page = client.pullWorkouts(since = cursor, limit = 100).getOrElse { return }
            lastWorkoutPages++
            if (page.items.isEmpty()) break
            for (item in page.items) {
                mergeRemote(item)
            }
            val next = page.nextCursor
            if (next.isNullOrBlank() || next == cursor) {
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
                lastConflicts++
                lastConflictNote =
                    "Kept local “${local.workoutName}” (pending) over cloud rev $remoteRev"
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
                lastWorkoutsMerged++
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
            lastWorkoutsMerged++
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
                note = s.note,
                supersetGroup = s.supersetGroup,
            )
        }
        db.withTransaction {
            dao.insertWorkout(workout)
            dao.deleteSetsForWorkout(clientId)
            sets.forEach { dao.insertSetLog(it) }
        }
        lastWorkoutsMerged++
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
                    note = s.note,
                    supersetGroup = s.supersetGroup,
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
        while (guard++ < 50) {
            val page = client.pullRoutines(since = cursor, limit = 100).getOrElse { return }
            lastRoutinePages++
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
            if (SyncMergeRules.shouldSkipRemoteForLocalPending(local.syncStatus)) {
                lastConflicts++
                lastConflictNote =
                    "Kept local routine “${local.name}” (pending) over cloud rev $remoteRev"
                return
            }
            if (remoteDeleted) {
                dao.upsertRoutine(
                    local.copy(
                        deletedAt = item.deletedAt,
                        revision = maxOf(local.revision, remoteRev),
                        updatedAt = item.updatedAt ?: local.updatedAt,
                        syncStatus = STATUS_SYNCED,
                    ),
                )
                lastRoutinesMerged++
                return
            }
            if (SyncMergeRules.isRemoteStale(local.revision, remoteRev)) return
            // Remote wins with higher revision while local was synced
            if (remoteRev > local.revision && !remoteDeleted) {
                lastConflictNote =
                    "Updated routine “${item.name}” from cloud (rev $remoteRev > local ${local.revision})"
            }
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
            lastRoutinesMerged++
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
        lastRoutinesMerged++
    }

    companion object {
        const val KIND_WORKOUT_REF = "workout_ref"
        const val KIND_ROUTINE_REF = "routine_ref"
        const val KIND_CUSTOM_REF = "custom_ref"
        const val STATUS_PENDING = "pending"
        const val STATUS_SYNCED = "synced"
        const val STATUS_FAILED = "failed"
        const val MAX_ATTEMPTS = 8
        const val KEY_SYNC_CURSOR = "sync_pull_cursor"
        const val KEY_ROUTINE_SYNC_CURSOR = "routine_sync_pull_cursor"
        const val KEY_CUSTOM_SYNC_CURSOR = "custom_sync_pull_cursor"
        const val KEY_PREFS_REVISION = "cloud_prefs_revision"
        const val KEY_LAST_SYNC_SUMMARY = "sync_last_summary"
        const val KEY_LAST_CONFLICT_NOTE = "sync_last_conflict"
        const val KEY_CONFLICT_INBOX = "sync_conflict_inbox"
    }
}
