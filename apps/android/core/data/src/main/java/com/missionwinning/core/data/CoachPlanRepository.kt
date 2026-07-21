package com.missionwinning.core.data

import com.missionwinning.core.network.CoachPlanResponseDto
import com.missionwinning.core.network.MobileApiClient
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

/**
 * Weekly coach plan cache (Room) + network seed/adapt. Never hosts planEngine.
 */
class CoachPlanRepository(
    private val db: MwDatabase,
    private val api: MobileApiClient?,
    private val prefs: PrefsRepository,
) {
    private val dao = db.dao()
    private val json = Json { ignoreUnknownKeys = true }

    suspend fun setEquipmentAndReseed(profile: String): CoachPlanResponseDto {
        val equip = LocalCoachSeed.normalizeEquipment(profile)
        prefs.setEquipmentProfile(equip)
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
     * @param preferNetwork when true, try HTTP first; on failure use Room then seed.
     */
    suspend fun ensureCoachPlan(preferNetwork: Boolean = true): CoachPlanResponseDto {
        val equip = prefs.equipmentProfile()
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
        val equip = prefs.equipmentProfile()
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

    suspend fun forceReseedPlan(): CoachPlanResponseDto {
        dao.clearCoachPlan()
        val equip = prefs.equipmentProfile()
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

    private suspend fun savePlanResponse(resp: CoachPlanResponseDto) {
        dao.upsertCoachPlan(
            CoachPlanEntity(json = json.encodeToString(CoachPlanResponseDto.serializer(), resp)),
        )
    }
}
