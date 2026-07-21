package com.missionwinning.core.data

import com.missionwinning.core.network.AdaptBeatDto
import com.missionwinning.core.network.CoachPlanDto
import com.missionwinning.core.network.CoachPlanResponseDto
import com.missionwinning.core.network.PlanExerciseDto
import com.missionwinning.core.network.PlanSessionDto
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.temporal.TemporalAdjusters

/** Offline seed mirroring packages/mw-core createSeedCoachPlan. */
object LocalCoachSeed {
    fun weekStartMonday(d: LocalDate = LocalDate.now()): String {
        val monday = d.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
        return monday.toString()
    }

    fun normalizeEquipment(raw: String): String =
        when (raw.trim().lowercase()) {
            "dumbbells", "db", "dumbbell" -> "dumbbells"
            "full-gym", "full_gym", "gym", "fullgym" -> "full-gym"
            else -> "bodyweight"
        }

    fun build(
        withAdaptDemo: Boolean = false,
        equipment: String = "bodyweight",
    ): CoachPlanResponseDto {
        val equip = normalizeEquipment(equipment)
        val weekStart = weekStartMonday()
        val revision = if (withAdaptDemo) 2 else 1
        var sessions = baseSessions(equip, withAdaptDemo)
        if (withAdaptDemo) {
            sessions = sessions.toMutableList().also {
                it[1] = it[1].copy(
                    kind = "recovery",
                    name = "Recovery (adapted)",
                    status = "swapped",
                    exercises = listOf(PlanExerciseDto("walk", 1, 20, whyKey = "adapt")),
                    estMinutes = 25,
                )
            }
        }
        val plan = CoachPlanDto(
            revision = revision,
            weekStart = weekStart,
            daysPerWeek = 3,
            sessions = sessions,
            generatedAt = java.time.Instant.now().toString(),
            contextHash = "seed-$equip-$revision",
            equipmentProfile = equip,
        )
        val beats = mutableListOf<AdaptBeatDto>()
        val missed = sessions.count { it.status == "missed" }
        val swapped = sessions.count { it.status == "swapped" }
        if (missed > 0) {
            beats += AdaptBeatDto(
                "coachAdaptMissedNote",
                if (missed == 1) {
                    "1 session missed earlier — remaining days re-spread so the week still fits."
                } else {
                    "$missed sessions missed earlier — remaining days re-spread so the week still fits."
                },
                missed,
            )
        }
        if (swapped > 0) {
            beats += AdaptBeatDto(
                "coachAdaptSwappedNote",
                if (swapped == 1) {
                    "1 day swapped to recovery from readiness / strain — from logs, not a wearable."
                } else {
                    "$swapped days swapped to recovery from readiness / strain — from logs, not a wearable."
                },
                swapped,
            )
        }
        return CoachPlanResponseDto(
            plan = plan,
            adaptBeats = beats,
            hasAdaptSignal = beats.isNotEmpty() || revision > 1,
        )
    }

    private fun baseSessions(equip: String, withAdaptDemo: Boolean): List<PlanSessionDto> {
        val (pushA, pushB, legsA, legsB, pullA, pullB) = when (equip) {
            "dumbbells" -> EquipmentMoves(
                "db-press", "db-fly", "goblet-squat", "db-rdl", "db-row", "db-curl",
            )
            "full-gym" -> EquipmentMoves(
                "bench-press", "cable-fly", "back-squat", "romanian-deadlift", "lat-pulldown", "barbell-row",
            )
            else -> EquipmentMoves(
                "pushup", "plank", "squat", "hip-hinge", "row", "chinup",
            )
        }
        return listOf(
            PlanSessionDto(
                id = "seed-mon",
                dayOffset = 0,
                kind = "strength",
                name = when (equip) {
                    "full-gym" -> "Push (barbell)"
                    "dumbbells" -> "Push (DB)"
                    else -> "Push + core"
                },
                focusGroups = listOf("chest", "shoulders"),
                exercises = listOf(
                    PlanExerciseDto(pushA, 3, 10),
                    PlanExerciseDto(pushB, 3, if (equip == "bodyweight") 40 else 12),
                ),
                estMinutes = 35,
                status = if (withAdaptDemo) "missed" else "planned",
            ),
            PlanSessionDto(
                id = "seed-wed",
                dayOffset = 2,
                kind = "strength",
                name = when (equip) {
                    "full-gym" -> "Legs (barbell)"
                    "dumbbells" -> "Legs (DB)"
                    else -> "Legs + hinge"
                },
                focusGroups = listOf("quads", "glutes"),
                exercises = listOf(
                    PlanExerciseDto(legsA, 3, 12),
                    PlanExerciseDto(legsB, 3, 10),
                ),
                estMinutes = 40,
                status = if (withAdaptDemo) "swapped" else "planned",
            ),
            PlanSessionDto(
                id = "seed-fri",
                dayOffset = 4,
                kind = "strength",
                name = when (equip) {
                    "full-gym" -> "Pull (machines)"
                    "dumbbells" -> "Pull (DB)"
                    else -> "Pull + carry"
                },
                focusGroups = listOf("back", "biceps"),
                exercises = listOf(
                    PlanExerciseDto(pullA, 3, 10),
                    PlanExerciseDto(pullB, 3, 6),
                ),
                estMinutes = 35,
                status = "planned",
            ),
        )
    }

    private data class EquipmentMoves(
        val pushA: String,
        val pushB: String,
        val legsA: String,
        val legsB: String,
        val pullA: String,
        val pullB: String,
    )

    fun markDone(plan: CoachPlanDto, sessionId: String): CoachPlanResponseDto {
        val sessions = plan.sessions.map {
            if (it.id == sessionId) it.copy(status = "done") else it
        }
        val next = plan.copy(
            sessions = sessions,
            revision = plan.revision + 1,
            generatedAt = java.time.Instant.now().toString(),
            contextHash = "${plan.contextHash}-done-$sessionId",
        )
        val done = sessions.count { it.status == "done" }
        val beats = listOf(
            AdaptBeatDto(
                "coachAdaptLoggedNote",
                "Week updated from workouts you already logged — plan revision bumped, no wearable required.",
                done,
            ),
        )
        return CoachPlanResponseDto(plan = next, adaptBeats = beats, hasAdaptSignal = true)
    }
}
