package com.missionwinning.core.data

import androidx.room.withTransaction
import com.missionwinning.core.model.SetKind
import com.missionwinning.core.network.CoachPlanResponseDto
import com.missionwinning.core.network.MobileApiClient
import com.missionwinning.core.network.WorkoutLogRequestDto
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.UUID

class MwRepository(
    private val db: MwDatabase,
    private val api: MobileApiClient?,
    private val syncEngine: SyncEngine? = null,
) {
    private val dao = db.dao()
    private val json = Json { ignoreUnknownKeys = true }

    suspend fun isIdayDone(): Boolean = dao.getPref(KEY_IDAY) == "1"

    suspend fun markIdayDone() {
        dao.setPref(PrefEntity(KEY_IDAY, "1"))
    }

    /** Crash reporting on by default when DSN configured; user can disable in Account. */
    suspend fun crashReportingEnabled(): Boolean = dao.getPref(KEY_CRASH_REPORTING) != "0"

    suspend fun setCrashReportingEnabled(enabled: Boolean) {
        dao.setPref(PrefEntity(KEY_CRASH_REPORTING, if (enabled) "1" else "0"))
    }

    /** Anonymous weekly install pulse — off until I-Day opt-in. */
    suspend fun telemetryOptIn(): Boolean = dao.getPref(KEY_TELEMETRY_OPT_IN) == "1"

    suspend fun setTelemetryOptIn(enabled: Boolean) {
        dao.setPref(PrefEntity(KEY_TELEMETRY_OPT_IN, if (enabled) "1" else "0"))
        if (enabled) ensureInstallId()
    }

    /** Health Connect exercise write after finish — off by default. */
    suspend fun healthConnectExportEnabled(): Boolean =
        dao.getPref(KEY_HEALTH_CONNECT) == "1"

    suspend fun setHealthConnectExportEnabled(enabled: Boolean) {
        dao.setPref(PrefEntity(KEY_HEALTH_CONNECT, if (enabled) "1" else "0"))
    }

    suspend fun ensureInstallId(): String {
        val existing = dao.getPref(KEY_INSTALL_ID)
        if (!existing.isNullOrBlank()) return existing
        val id = UUID.randomUUID().toString()
        dao.setPref(PrefEntity(KEY_INSTALL_ID, id))
        return id
    }

    /**
     * Send at most one heartbeat per ISO week when opted in.
     * @return true if a network call was made successfully.
     */
    suspend fun maybeSendWeeklyHeartbeat(appVersion: String): Boolean {
        if (!telemetryOptIn()) return false
        val week = currentIsoWeekKey()
        if (dao.getPref(KEY_LAST_HEARTBEAT_WEEK) == week) return false
        val client = api ?: return false
        val installId = ensureInstallId()
        val ok = client.postTelemetryHeartbeat(installId, week, appVersion).isSuccess
        if (ok) {
            dao.setPref(PrefEntity(KEY_LAST_HEARTBEAT_WEEK, week))
        }
        return ok
    }

    suspend fun weightUnit(): String = dao.getPref(KEY_WEIGHT_UNIT) ?: "kg"

    suspend fun setWeightUnit(unit: String) {
        dao.setPref(PrefEntity(KEY_WEIGHT_UNIT, unit))
    }

    /** Default rest after completing a set (seconds). Allowed: 45, 60, 90, 120. */
    suspend fun defaultRestSeconds(): Int {
        val raw = dao.getPref(KEY_DEFAULT_REST)?.toIntOrNull() ?: 60
        return normalizeRestSeconds(raw)
    }

    suspend fun setDefaultRestSeconds(seconds: Int) {
        dao.setPref(PrefEntity(KEY_DEFAULT_REST, normalizeRestSeconds(seconds).toString()))
    }

    /** Rest-end vibration (default on). */
    suspend fun restVibrateEnabled(): Boolean = dao.getPref(KEY_REST_VIBRATE) != "0"

    suspend fun setRestVibrateEnabled(enabled: Boolean) {
        dao.setPref(PrefEntity(KEY_REST_VIBRATE, if (enabled) "1" else "0"))
    }

    /** Rest-end short beep (default off). */
    suspend fun restBeepEnabled(): Boolean = dao.getPref(KEY_REST_BEEP) == "1"

    suspend fun setRestBeepEnabled(enabled: Boolean) {
        dao.setPref(PrefEntity(KEY_REST_BEEP, if (enabled) "1" else "0"))
    }

    suspend fun equipmentProfile(): String =
        LocalCoachSeed.normalizeEquipment(dao.getPref(KEY_EQUIPMENT) ?: "bodyweight")

    suspend fun setEquipmentProfile(profile: String) {
        dao.setPref(PrefEntity(KEY_EQUIPMENT, LocalCoachSeed.normalizeEquipment(profile)))
    }

    /**
     * Change equipment and rebuild the offline (or network) week plan so Today/Coach match.
     */
    suspend fun setEquipmentAndReseed(profile: String): CoachPlanResponseDto {
        val equip = LocalCoachSeed.normalizeEquipment(profile)
        setEquipmentProfile(equip)
        val plan = if (api != null) {
            api.postCoachPlan(equipment = equip, withAdaptDemo = false)
                .getOrElse { LocalCoachSeed.build(equipment = equip) }
        } else {
            LocalCoachSeed.build(equipment = equip)
        }
        savePlanResponse(plan)
        return plan
    }

    /**
     * @param preferNetwork when true, try HTTP coach plan first (and cache it); on failure use Room then seed.
     *                      when false, Room cache / local seed only (Active start path).
     */
    suspend fun ensureCoachPlan(preferNetwork: Boolean = true): CoachPlanResponseDto {
        val equip = equipmentProfile()
        if (preferNetwork && api != null) {
            api.fetchCoachPlan(equipment = equip).getOrNull()?.let { remote ->
                savePlanResponse(remote)
                return remote
            }
        }
        dao.getCoachPlan()?.let {
            return json.decodeFromString(CoachPlanResponseDto.serializer(), it.json)
        }
        val local = LocalCoachSeed.build(withAdaptDemo = false, equipment = equip)
        savePlanResponse(local)
        return local
    }

    suspend fun seedAdaptDemo(): CoachPlanResponseDto {
        val equip = equipmentProfile()
        val demo = if (api != null) {
            api.postCoachPlan(equipment = equip, withAdaptDemo = true)
                .getOrElse { LocalCoachSeed.build(withAdaptDemo = true, equipment = equip) }
        } else {
            LocalCoachSeed.build(withAdaptDemo = true, equipment = equip)
        }
        savePlanResponse(demo)
        return demo
    }

    suspend fun markSessionDone(sessionId: String): CoachPlanResponseDto {
        val current = ensureCoachPlan(preferNetwork = false)
        val next = if (api != null) {
            api.adaptPlan(current.plan, sessionId).getOrElse {
                LocalCoachSeed.markDone(current.plan, sessionId)
            }
        } else {
            LocalCoachSeed.markDone(current.plan, sessionId)
        }
        savePlanResponse(next)
        return next
    }

    suspend fun previousSet(exerciseId: String, setIndex: Int): SetLogEntity? =
        dao.latestSetFor(exerciseId, setIndex)

    /**
     * Persist workout + set rows atomically; enqueue workout sync (Room is SoT).
     */
    suspend fun finishWorkout(
        workoutName: String,
        durationSeconds: Int,
        sets: List<SetLogEntity>,
        sessionId: String?,
    ): FinishWorkoutResult {
        val id = UUID.randomUUID().toString()
        // Warmups do not count toward session volume (Hevy/Strong parity).
        val volume = sets.sumOf { row ->
            if (SetKind.countsTowardVolume(SetKind.fromCode(row.setKind))) {
                row.weight * row.reps
            } else {
                0.0
            }
        }
        val now = java.time.Instant.now().toString()
        val unit = weightUnit()
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
        flushOutbox()
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

    suspend fun allRoutines(): List<RoutineEntity> = dao.allRoutines()

    suspend fun routineById(id: String): RoutineEntity? = dao.routineById(id)

    suspend fun deleteRoutine(id: String) {
        val existing = dao.routineById(id) ?: return
        val now = java.time.Instant.now().toString()
        // Soft-delete so cloud tombstone can propagate
        dao.upsertRoutine(
            existing.copy(
                deletedAt = now,
                updatedAt = now,
                revision = existing.revision + 1,
                syncStatus = SyncEngine.STATUS_PENDING,
            ),
        )
        syncEngine?.enqueueRoutine(id)
        flushOutbox()
    }

    fun parseRoutineExercises(exercisesJson: String): List<RoutineExerciseDto> =
        runCatching {
            json.decodeFromString(
                kotlinx.serialization.builtins.ListSerializer(RoutineExerciseDto.serializer()),
                exercisesJson,
            )
        }.getOrDefault(emptyList())

    /**
     * Save a routine from a finished workout’s set logs (grouped by exercise).
     * @return new routine id, or null if no sets to save.
     */
    suspend fun saveRoutineFromWorkout(workoutId: String, nameOverride: String? = null): String? {
        val workout = dao.workoutById(workoutId) ?: return null
        val sets = dao.setsForWorkout(workoutId)
        if (sets.isEmpty()) return null
        val grouped = sets.groupBy { it.exerciseId }
        val exercises = grouped.map { (exId, rows) ->
            val ordered = rows.sortedBy { it.setIndex }
            val last = ordered.last()
            RoutineExerciseDto(
                exerciseId = exId,
                exerciseName = last.exerciseName.ifBlank { exId },
                sets = ordered.size.coerceIn(1, 12),
                targetReps = last.reps.coerceIn(1, 99),
                lastWeight = last.weight.coerceAtLeast(0.0),
            )
        }
        if (exercises.isEmpty()) return null
        val id = UUID.randomUUID().toString()
        val now = java.time.Instant.now().toString()
        val name = nameOverride?.takeIf { it.isNotBlank() }
            ?: workout.workoutName.ifBlank { "Routine" }
        dao.upsertRoutine(
            RoutineEntity(
                id = id,
                name = name,
                createdAt = now,
                sourceWorkoutId = workoutId,
                exercisesJson = json.encodeToString(
                    kotlinx.serialization.builtins.ListSerializer(RoutineExerciseDto.serializer()),
                    exercises,
                ),
                syncStatus = SyncEngine.STATUS_PENDING,
                revision = 1,
                updatedAt = now,
                deletedAt = null,
            ),
        )
        syncEngine?.enqueueRoutine(id)
        flushOutbox()
        return id
    }

    suspend fun workoutCount(): Int = dao.workoutCount()

    suspend fun recentWorkouts(limit: Int = 5): List<WorkoutLogEntity> =
        dao.recentWorkouts(limit.coerceIn(1, 20))

    /** Workouts completed on or after [sinceIso] (ISO-8601 instant string). */
    suspend fun workoutsSince(sinceIso: String): List<WorkoutLogEntity> =
        dao.workoutsSince(sinceIso)

    /**
     * Consecutive calendar days with ≥1 workout ending today (or yesterday if today empty).
     */
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

    /**
     * Drop cached plan and rebuild from network (if available) or local seed.
     * Lab/founder tool — also used after equipment change via [setEquipmentAndReseed].
     */
    suspend fun forceReseedPlan(): CoachPlanResponseDto {
        dao.clearCoachPlan()
        val equip = equipmentProfile()
        val plan = if (api != null) {
            api.fetchCoachPlan(equipment = equip).getOrElse {
                api.postCoachPlan(equipment = equip, withAdaptDemo = false)
                    .getOrElse { LocalCoachSeed.build(equipment = equip) }
            }
        } else {
            LocalCoachSeed.build(equipment = equip)
        }
        savePlanResponse(plan)
        return plan
    }

    /** Unsynced finished workouts (pending/failed), not outbox row count. */
    suspend fun pendingSyncCount(): Int = dao.unsyncedWorkoutCount()

    /** Flush outbox / sync engine; returns remaining unsynced workout count. */
    suspend fun flushOutboxAndCount(): Int {
        flushOutbox()
        return pendingSyncCount()
    }

    suspend fun flushOutbox() {
        val engine = syncEngine
        if (engine != null) {
            engine.syncAll()
            return
        }
        // Fallback: legacy summary push if SyncEngine not wired
        val client = api ?: return
        val pending = dao.pendingOutbox()
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
            } else if (row.kind == KIND_WORKOUT) {
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
                if (ok) dao.deleteOutbox(row.id) else dao.bumpOutboxAttempt(row.id)
            } else {
                dao.deleteOutbox(row.id)
            }
        }
    }

    /** Full pull+push for signed-in restore (call after verify OTP). */
    suspend fun syncNow(): Int = flushOutboxAndCount()

    private suspend fun savePlanResponse(resp: CoachPlanResponseDto) {
        dao.upsertCoachPlan(
            CoachPlanEntity(json = json.encodeToString(CoachPlanResponseDto.serializer(), resp)),
        )
    }

    companion object {
        const val KEY_IDAY = "iday_done"
        const val KEY_WEIGHT_UNIT = "weight_unit"
        const val KEY_EQUIPMENT = "equipment_profile"
        const val KEY_DEFAULT_REST = "default_rest_seconds"
        const val KEY_REST_VIBRATE = "rest_vibrate"
        const val KEY_REST_BEEP = "rest_beep"
        const val KEY_CRASH_REPORTING = "crash_reporting"
        const val KEY_TELEMETRY_OPT_IN = "telemetry_opt_in"
        const val KEY_INSTALL_ID = "install_id"
        const val KEY_LAST_HEARTBEAT_WEEK = "telemetry_last_week"
        const val KEY_HEALTH_CONNECT = "health_connect_export"
        const val KIND_WORKOUT = "workout"

        fun currentIsoWeekKey(
            now: java.time.LocalDate = java.time.LocalDate.now(),
        ): String {
            val week = now.get(java.time.temporal.WeekFields.ISO.weekOfWeekBasedYear())
            val year = now.get(java.time.temporal.WeekFields.ISO.weekBasedYear())
            return "%04d-W%02d".format(year, week)
        }
        /** Active sessionId prefix when starting a saved routine (not a coach session). */
        const val ROUTINE_SESSION_PREFIX = "routine:"
        /** Empty / freeform log (not tied to a coach day). */
        const val FREEFORM_SESSION_PREFIX = "freeform:"
        const val DEFAULT_API_BASE = "https://www.missionwinning.com"

        fun isRoutineSession(sessionId: String): Boolean =
            sessionId.startsWith(ROUTINE_SESSION_PREFIX)

        fun isFreeformSession(sessionId: String): Boolean =
            sessionId.startsWith(FREEFORM_SESSION_PREFIX)

        /** Coach week sessions only — not routines or freeform logs. */
        fun isCoachSession(sessionId: String): Boolean =
            sessionId.isNotBlank() && !isRoutineSession(sessionId) && !isFreeformSession(sessionId)

        fun routineSessionId(routineId: String): String =
            ROUTINE_SESSION_PREFIX + routineId

        fun freeformSessionId(): String =
            FREEFORM_SESSION_PREFIX + UUID.randomUUID().toString()

        fun routineIdFromSession(sessionId: String): String? =
            if (isRoutineSession(sessionId)) sessionId.removePrefix(ROUTINE_SESSION_PREFIX) else null

        fun normalizeRestSeconds(seconds: Int): Int = when {
            seconds <= 45 -> 45
            seconds <= 60 -> 60
            seconds <= 90 -> 90
            else -> 120
        }
    }
}
