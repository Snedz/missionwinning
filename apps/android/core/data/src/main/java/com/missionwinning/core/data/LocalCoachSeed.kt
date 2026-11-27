package com.missionwinning.core.data

import com.missionwinning.core.model.ExerciseCatalog
import com.missionwinning.core.model.WeightUnits
import com.missionwinning.core.network.AdaptBeatDto
import com.missionwinning.core.network.CoachPlanDto
import com.missionwinning.core.network.CoachPlanResponseDto
import com.missionwinning.core.network.PlanExerciseDto
import com.missionwinning.core.network.PlanSessionDto
import java.time.DayOfWeek
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.temporal.TemporalAdjusters
import kotlin.math.round
import kotlin.math.roundToInt

/** Conservative offline fallback; the server remains authoritative for full planning. */
object LocalCoachSeed {
    private const val HISTORY_SEED_PREFIX = "offline-seed-"
    private const val FIND_WORKING_WEIGHT = "coachFindWorkingWeight"
    private val fullBodyGroups = listOf("Chest", "Back", "Legs", "Shoulders", "Arms", "Core")

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
        history: List<SetLogEntity> = emptyList(),
        weightUnit: String = "kg",
        now: Instant = Instant.now(),
        zone: ZoneId = ZoneId.systemDefault(),
    ): CoachPlanResponseDto {
        val equip = normalizeEquipment(equipment)
        val today = now.atZone(zone).toLocalDate()
        val weekStart = weekStartMonday(today)
        if (!withAdaptDemo) return buildOffline(equip, history, weightUnit, now, today, weekStart)

        val revision = 2
        val sessions = demoSessions(equip).toMutableList().also {
            it[1] = it[1].copy(
                kind = "recovery",
                name = "Recovery (adapted)",
                status = "swapped",
                focusGroups = listOf("recovery", "walk"),
                exercises = listOf(
                    PlanExerciseDto("walk", 1, 20, whyKey = "adapt"),
                    PlanExerciseDto("plank", 2, 30, whyKey = "recover"),
                ),
                estMinutes = 25,
            )
        }
        val plan = CoachPlanDto(
            revision = revision,
            weekStart = weekStart,
            daysPerWeek = 3,
            sessions = sessions,
            generatedAt = now.toString(),
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
        beats += AdaptBeatDto(
            "coachAdaptEquipmentNote",
            "Equipment profile “$equip” kept moves train-anywhere friendly while recovery days protect the streak.",
            1,
        )
        return CoachPlanResponseDto(
            plan = plan,
            adaptBeats = beats,
            hasAdaptSignal = beats.isNotEmpty() || revision > 1,
        )
    }

    fun isOfflinePlan(plan: CoachPlanDto): Boolean = plan.contextHash.startsWith(HISTORY_SEED_PREFIX)

    fun needsWorkingWeight(exercise: PlanExerciseDto): Boolean =
        exercise.weight == 0.0 && exercise.whyKey == FIND_WORKING_WEIGHT

    private fun buildOffline(
        equip: String,
        history: List<SetLogEntity>,
        weightUnit: String,
        now: Instant,
        today: LocalDate,
        weekStart: String,
    ): CoachPlanResponseDto {
        val unit = WeightUnits.normalize(weightUnit)
        val workingSets = history.mapNotNull { set ->
            val at = runCatching { Instant.parse(set.completedAt) }.getOrNull()
            if (set.setKind != "normal" || set.reps < 1 || !set.weight.isFinite() || set.weight < 0 ||
                set.weightUnit !in setOf("kg", "lb") || at == null || at > now) null
            else set to at
        }.sortedWith(compareByDescending<Pair<SetLogEntity, Instant>> { it.second }
            .thenByDescending { it.first.workoutId }.thenByDescending { it.first.setIndex }.thenByDescending { it.first.id })
            .map { it.first }
        val latestByExercise = workingSets.filter { set ->
            val move = catalogMove(set.exerciseId)
            move != null && equip in move.equipment &&
                (equip != "bodyweight" || move.isBodyweight && set.weight == 0.0)
        }.groupBy { it.exerciseId }.mapValues { (_, sets) ->
            val latest = sets.first()
            sets.filter { it.workoutId == latest.workoutId }
        }

        val defaults = when (equip) {
            "full-gym" -> listOf("back-squat", "bench-press", "barbell-row")
            "dumbbells" -> listOf("goblet-squat", "db-press", "db-row")
            else -> listOf("squat", "pushup", "row")
        }
        val families = listOf(setOf("quads", "glutes"), setOf("chest", "shoulders"), setOf("back"))
        val used = mutableSetOf<String>()
        val exercises = defaults.mapIndexed { index, fallback ->
            val familiar = latestByExercise.entries.firstOrNull { (id, _) ->
                id !in used && catalogMove(id)?.muscleGroups?.any { it in families[index] } == true
            }
            val id = familiar?.key ?: fallback
            used += id
            val sets = familiar?.value
            val latest = sets?.first()
            if (sets != null && latest != null) {
                val converted = WeightUnits.convertExact(latest.weight, latest.weightUnit, unit)
                val weight = if (latest.weightUnit == unit) converted
                else (round(converted * 100) / 100).takeIf { it > 0.0 } ?: converted
                PlanExerciseDto(id, sets.size.coerceIn(1, 3), latest.reps.coerceIn(1, 12), weight, "coachWhyHold")
            } else {
                val why = if (ExerciseCatalog.get(id)?.isBodyweight == true) "coachWhyBodyweightReps"
                else FIND_WORKING_WEIGHT
                PlanExerciseDto(id, 3, 5, whyKey = why)
            }
        }
        val offsets = if (workingSets.isEmpty()) listOf(0, 3) else listOf(0, 2, 4)
        val floor = today.dayOfWeek.value - 1
        val count = minOf(offsets.size, 7 - floor)
        val scheduledDays = when {
            offsets.first() >= floor -> offsets
            count == 1 -> listOf(floor)
            else -> List(count) { floor + (it * (6 - floor).toDouble() / (count - 1)).roundToInt() }
        }
        val sessions = scheduledDays.map { day ->
            PlanSessionDto(
                id = "$weekStart-d$day",
                dayOffset = day,
                kind = "strength",
                name = "Full Body Strength",
                focusGroups = fullBodyGroups,
                exercises = exercises,
                estMinutes = exercises.sumOf { it.sets * 8 }.coerceIn(20, 60),
                status = "planned",
            )
        }
        return CoachPlanResponseDto(
            plan = CoachPlanDto(
                revision = 1,
                weekStart = weekStart,
                daysPerWeek = offsets.size,
                sessions = sessions,
                generatedAt = now.toString(),
                contextHash = "$HISTORY_SEED_PREFIX$equip-$weekStart",
                equipmentProfile = equip,
                weightUnit = unit,
            ),
        )
    }

    private fun catalogMove(exerciseId: String) =
        ExerciseCatalog.get(if (exerciseId == "lunges") "lunge" else exerciseId)

    private fun demoSessions(equip: String): List<PlanSessionDto> {
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
                    PlanExerciseDto(pushA, 3, 10, whyKey = "main"),
                    PlanExerciseDto(pushB, 3, if (equip == "bodyweight") 40 else 12, whyKey = "balance"),
                ),
                estMinutes = 35,
                status = "missed",
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
                    PlanExerciseDto(legsA, 3, 12, whyKey = "main"),
                    PlanExerciseDto(legsB, 3, 10, whyKey = "progress"),
                ),
                estMinutes = 40,
                status = "swapped",
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
                    PlanExerciseDto(pullA, 3, 10, whyKey = "main"),
                    PlanExerciseDto(pullB, 3, 6, whyKey = "balance"),
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
