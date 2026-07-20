package com.missionwinning.core.data

import android.content.Context
import com.missionwinning.core.network.CoachPlanResponseDto
import com.missionwinning.core.network.MobileApiClient
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.UUID

class MwRepository(
    context: Context,
    private val api: MobileApiClient? = null,
) {
    private val dao = MwDatabase.get(context).dao()
    private val json = Json { ignoreUnknownKeys = true }

    suspend fun isIdayDone(): Boolean = dao.getPref(KEY_IDAY) == "1"

    suspend fun markIdayDone() {
        dao.setPref(PrefEntity(KEY_IDAY, "1"))
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

    suspend fun appendWorkout(
        workoutName: String,
        durationSeconds: Int,
        setCount: Int,
        totalVolume: Double,
        sessionId: String?,
    ): Int {
        val id = UUID.randomUUID().toString()
        dao.insertWorkout(
            WorkoutLogEntity(
                id = id,
                workoutName = workoutName,
                completedAt = java.time.Instant.now().toString(),
                durationSeconds = durationSeconds,
                setCount = setCount,
                totalVolume = totalVolume,
                sessionId = sessionId,
            ),
        )
        api?.logWorkout(workoutName, durationSeconds, setCount, totalVolume, sessionId)
        return dao.allWorkouts().size
    }

    suspend fun workoutCount(): Int = dao.allWorkouts().size

    private suspend fun savePlanResponse(resp: CoachPlanResponseDto) {
        dao.upsertCoachPlan(
            CoachPlanEntity(json = json.encodeToString(CoachPlanResponseDto.serializer(), resp)),
        )
    }

    companion object {
        const val KEY_IDAY = "iday_done"
        const val DEFAULT_API_BASE = "https://www.missionwinning.com"
    }
}
