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
) {
    private val dao = db.dao()
    private val json = Json { ignoreUnknownKeys = true }

    suspend fun isIdayDone(): Boolean = dao.getPref(KEY_IDAY) == "1"

    suspend fun markIdayDone() {
        dao.setPref(PrefEntity(KEY_IDAY, "1"))
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
    ): Int {
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
        val stampedSets = sets.map { it.copy(workoutId = id) }
        val workout = WorkoutLogEntity(
            id = id,
            workoutName = workoutName,
            completedAt = now,
            durationSeconds = durationSeconds,
            setCount = stampedSets.size,
            totalVolume = volume,
            sessionId = sessionId,
        )
        val payload = json.encodeToString(
            WorkoutLogRequestDto.serializer(),
            WorkoutLogRequestDto(
                workoutName = workoutName,
                durationSeconds = durationSeconds,
                setCount = stampedSets.size,
                totalVolume = volume,
                sessionId = sessionId,
            ),
        )
        val outbox = SyncOutboxEntity(
            id = UUID.randomUUID().toString(),
            kind = KIND_WORKOUT,
            payloadJson = payload,
            createdAt = now,
        )
        db.withTransaction {
            dao.insertWorkout(workout)
            stampedSets.forEach { dao.insertSetLog(it) }
            dao.enqueueOutbox(outbox)
        }
        flushOutbox()
        return dao.workoutCount()
    }

    suspend fun workoutById(id: String): WorkoutLogEntity? = dao.workoutById(id)

    suspend fun setsForWorkout(workoutId: String): List<SetLogEntity> =
        dao.setsForWorkout(workoutId)

    suspend fun recentWeightedSets(limit: Int = 500): List<SetLogEntity> =
        dao.recentWeightedSets(limit.coerceIn(1, 2000))

    suspend fun allRoutines(): List<RoutineEntity> = dao.allRoutines()

    suspend fun routineById(id: String): RoutineEntity? = dao.routineById(id)

    suspend fun deleteRoutine(id: String) {
        dao.deleteRoutine(id)
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
            ),
        )
        return id
    }

    /** @deprecated Prefer [finishWorkout] */
    suspend fun appendWorkout(
        workoutName: String,
        durationSeconds: Int,
        setCount: Int,
        totalVolume: Double,
        sessionId: String?,
    ): Int {
        val unit = weightUnit()
        val synthetic = (0 until setCount).map { i ->
            SetLogEntity(
                id = UUID.randomUUID().toString(),
                exerciseId = "session",
                exerciseName = workoutName,
                setIndex = i,
                reps = 10,
                weight = if (setCount > 0) totalVolume / (setCount * 10.0) else 0.0,
                completedAt = java.time.Instant.now().toString(),
                sessionId = sessionId,
                weightUnit = unit,
            )
        }
        return finishWorkout(workoutName, durationSeconds, synthetic, sessionId)
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

    suspend fun pendingSyncCount(): Int = dao.pendingOutboxCount()

    /** Flush outbox; returns remaining pending count after attempt. */
    suspend fun flushOutboxAndCount(): Int {
        flushOutbox()
        return pendingSyncCount()
    }

    suspend fun flushOutbox() {
        val client = api ?: return
        val pending = dao.pendingOutbox()
        for (row in pending) {
            val ok = when (row.kind) {
                KIND_WORKOUT -> {
                    runCatching {
                        val req = json.decodeFromString(WorkoutLogRequestDto.serializer(), row.payloadJson)
                        client.logWorkout(
                            req.workoutName,
                            req.durationSeconds,
                            req.setCount,
                            req.totalVolume,
                            req.sessionId,
                        ).getOrThrow()
                    }.isSuccess
                }
                else -> true
            }
            if (ok) {
                dao.deleteOutbox(row.id)
            } else {
                dao.bumpOutboxAttempt(row.id)
            }
        }
    }

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
        const val KIND_WORKOUT = "workout"
        /** Active sessionId prefix when starting a saved routine (not a coach session). */
        const val ROUTINE_SESSION_PREFIX = "routine:"
        const val DEFAULT_API_BASE = "https://www.missionwinning.com"

        fun isRoutineSession(sessionId: String): Boolean =
            sessionId.startsWith(ROUTINE_SESSION_PREFIX)

        fun routineSessionId(routineId: String): String =
            ROUTINE_SESSION_PREFIX + routineId

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
