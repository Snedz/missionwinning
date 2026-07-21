package com.missionwinning.core.data

import androidx.room.withTransaction
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

    suspend fun equipmentProfile(): String = dao.getPref(KEY_EQUIPMENT) ?: "bodyweight"

    suspend fun setEquipmentProfile(profile: String) {
        dao.setPref(PrefEntity(KEY_EQUIPMENT, profile))
    }

    suspend fun ensureCoachPlan(preferNetwork: Boolean = true): CoachPlanResponseDto {
        dao.getCoachPlan()?.let {
            return json.decodeFromString(CoachPlanResponseDto.serializer(), it.json)
        }
        if (preferNetwork && api != null) {
            api.fetchCoachPlan().getOrNull()?.let { remote ->
                savePlanResponse(remote)
                return remote
            }
        }
        val local = LocalCoachSeed.build(withAdaptDemo = false)
        savePlanResponse(local)
        return local
    }

    suspend fun seedAdaptDemo(): CoachPlanResponseDto {
        val demo = if (api != null) {
            api.postCoachPlan(withAdaptDemo = true).getOrElse { LocalCoachSeed.build(true) }
        } else {
            LocalCoachSeed.build(true)
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
        val volume = sets.sumOf { it.weight * it.reps }
        val now = java.time.Instant.now().toString()
        val workout = WorkoutLogEntity(
            id = id,
            workoutName = workoutName,
            completedAt = now,
            durationSeconds = durationSeconds,
            setCount = sets.size,
            totalVolume = volume,
            sessionId = sessionId,
        )
        val payload = json.encodeToString(
            WorkoutLogRequestDto.serializer(),
            WorkoutLogRequestDto(
                workoutName = workoutName,
                durationSeconds = durationSeconds,
                setCount = sets.size,
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
            sets.forEach { dao.insertSetLog(it) }
            dao.enqueueOutbox(outbox)
        }
        flushOutbox()
        return dao.workoutCount()
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
        const val KIND_WORKOUT = "workout"
        const val DEFAULT_API_BASE = "https://www.missionwinning.com"
    }
}
