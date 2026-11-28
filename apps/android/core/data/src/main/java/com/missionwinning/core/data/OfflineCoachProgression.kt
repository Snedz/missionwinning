package com.missionwinning.core.data

import androidx.room.Embedded
import com.missionwinning.core.model.ExerciseCatalog
import com.missionwinning.core.model.OfflineCoachCatalog
import com.missionwinning.core.model.WeightUnits
import com.missionwinning.core.network.PlanExerciseDto
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.temporal.ChronoUnit
import kotlin.math.roundToInt

data class CoachProgressionSet(
    @Embedded val set: SetLogEntity,
    val workoutCompletedAt: String,
    val workoutDurationSeconds: Int,
)

internal object OfflineCoachProgression {
    private const val MIN_REPS = 4
    private const val MAX_REPS = 6
    private const val HOLD = "coachWhyHold"
    private const val DELOAD = "coachWhyDeload"

    private data class WorkingSet(val row: CoachProgressionSet, val weight: Double) {
        val dose: Int get() = when (row.set.rpe) {
            null -> 7
            in Int.MIN_VALUE..6 -> 5
            in 7..8 -> 7
            else -> 9
        }
        val reps get() = row.set.reps
        val tonnage get() = weight * reps
        val countsForEstimate get() = row.set.setKind != "failure"
        fun estimatedMax(): Double? {
            if (!countsForEstimate || weight <= 0 || reps > 12) return null
            val estimate = when {
                reps == 1 -> (weight * 10).roundToInt() / 10.0
                reps <= 10 -> (weight * (36.0 / (37 - reps))).roundToInt().toDouble()
                else -> (weight * (1 + reps / 30.0)).roundToInt().toDouble()
            }
            return estimate.takeIf { it > 0 }
        }
    }

    private data class Workout(val id: String, val at: Instant, val sets: List<WorkingSet>) {
        fun day(zone: ZoneId) = at.atZone(zone).toLocalDate()
    }

    fun fromCompletion(
        history: List<CoachProgressionSet>,
        workoutId: String,
        unit: String,
        now: Instant,
        zone: ZoneId,
    ): Map<String, PlanExerciseDto> {
        val workouts = history.groupBy { it.set.workoutId }.mapNotNull { (id, rows) ->
            val at = runCatching { Instant.parse(rows.first().workoutCompletedAt) }.getOrNull()
            if (at == null || at > now) return@mapNotNull null
            val sets = rows.asSequence().filter {
                it.set.setKind != "warmup" && it.set.reps > 0 && it.set.weight.isFinite() &&
                    it.set.weight >= 0 && it.set.weightUnit in setOf("kg", "lb")
            }.sortedWith(compareBy({ it.set.setIndex }, { it.set.id })).map {
                val weight = WeightUnits.convertExact(it.set.weight, it.set.weightUnit, unit)
                WorkingSet(it, (weight * 100).roundToInt() / 100.0)
            }.toList()
            Workout(id, at, sets).takeIf { sets.isNotEmpty() }
        }.sortedWith(compareByDescending<Workout> { it.at }.thenByDescending { it.id })
        val justLogged = workouts.firstOrNull { it.id == workoutId } ?: return emptyMap()
        val highLoad = highLoad(workouts, now.atZone(zone).toLocalDate(), zone)
        return justLogged.sets.groupBy { ExerciseCatalog.canonicalCoachId(it.row.set.exerciseId) }
            .mapValues { (id, latest) ->
                val exposures = workouts.mapNotNull { workout ->
                    val matched = workout.sets.filter { ExerciseCatalog.canonicalCoachId(it.row.set.exerciseId) == id }
                    (workout.day(zone) to matched).takeIf { matched.isNotEmpty() }
                }
                prescription(id, latest, exposures, unit, highLoad)
            }
    }

    private fun prescription(
        id: String,
        latest: List<WorkingSet>,
        exposures: List<Pair<LocalDate, List<WorkingSet>>>,
        unit: String,
        highLoad: Boolean,
    ): PlanExerciseDto {
        val webMove = OfflineCoachCatalog.byId[id]
        val nativeMove = ExerciseCatalog.get(id)
        val bodyweight = webMove?.bodyweight ?: nativeMove?.isBodyweight ?: true
        val reps = latest.map { it.reps }.average().roundToInt()
        val lastWeight = latest.first().weight
        val deload = stallWhy(exposures) ?: DELOAD.takeIf { latest.all { it.dose == 9 } }
        val loggedWeight = latest.first().row.set.let { WeightUnits.convertExact(it.weight, it.weightUnit, unit) }
        val assisted = id.contains("assisted", ignoreCase = true) ||
            (webMove?.name ?: nativeMove?.name)?.contains("assisted", ignoreCase = true) == true
        if (deload != null && (bodyweight || assisted)) {
            val reducedReps = (reps * 0.9).roundToInt().coerceAtLeast(MIN_REPS).coerceAtMost(reps)
            return PlanExerciseDto(id, latest.size, reducedReps, loggedWeight, deload)
        }
        val max = if (!bodyweight && lastWeight > 0) {
            exposures.asSequence().flatMap { it.second }.mapNotNull { it.estimatedMax() }.maxOrNull()
        } else null
        val basePct = max?.let { (lastWeight / it * 100).takeIf { pct -> pct in 50.0..95.0 } ?: 75.0 }
        val step = WeightUnits.step(unit)
        fun snap(weight: Double) = (weight / step).roundToInt() * step
        fun materialize(pct: Double?) = if (pct != null && max != null) snap(max * (pct / 100)) else lastWeight
        val hold = PlanExerciseDto(id, latest.size, reps, materialize(basePct), HOLD)

        if (deload != null) return hold.copy(
            weight = if (basePct != null && max != null) {
                minOf(loggedWeight, materialize(minOf(basePct, loggedWeight / max * 100) * 0.9))
            } else minOf(loggedWeight, snap(loggedWeight * 0.9)),
            whyKey = deload,
        )
        if (latest.count { it.dose == 9 } >= 2) return hold.copy(whyKey = "coachWhyHoldHard")

        var nextPct = basePct
        val next = when {
            latest.all { it.dose == 5 } && bodyweight -> {
                val nextReps = (reps + if (reps < MAX_REPS) 2 else 0).coerceAtMost(MAX_REPS)
                hold.copy(reps = nextReps, whyKey = if (nextReps > reps) "coachWhyRepProgress" else HOLD)
            }
            latest.all { it.dose == 5 } -> {
                nextPct = basePct?.let { (it + 2.5).coerceAtMost(95.0) }
                hold.copy(weight = if (nextPct != null) materialize(nextPct) else snap(lastWeight + step),
                    whyKey = "coachWhyLoadUp")
            }
            latest.any { it.dose == 7 } ->
                if (reps < MAX_REPS) hold.copy(reps = reps + 1, whyKey = "coachWhyRepProgress") else hold
            reps >= MAX_REPS && bodyweight ->
                hold.copy(reps = (reps + 1).coerceAtMost(MAX_REPS + 2), whyKey = "coachWhyRepProgress")
            reps >= MAX_REPS -> {
                nextPct = basePct?.let { (it + 2.5).coerceAtMost(95.0) }
                hold.copy(reps = MIN_REPS, weight = if (nextPct != null) materialize(nextPct) else snap(lastWeight + step),
                    whyKey = "coachWhyLoadUp")
            }
            else -> hold
        }
        val pctIncreased = hold.weight > 0 && next.weight > 0 && nextPct != null && basePct != null &&
            nextPct.roundToInt() > basePct.roundToInt()
        return if (highLoad && (next.weight > hold.weight + 1e-6 || next.reps > hold.reps || pctIncreased)) {
            hold.copy(whyKey = "coachWhySteadyWeek")
        } else next
    }

    private fun stallWhy(exposures: List<Pair<LocalDate, List<WorkingSet>>>): String? {
        val days = exposures.groupBy({ it.first }, { it.second }).toSortedMap().values
            .map { groups -> groups.flatten().filter { it.countsForEstimate } }
        val estimates = days.mapNotNull { sets -> sets.mapNotNull { it.estimatedMax() }.maxOrNull() }
        if (estimates.isEmpty()) {
            val reps = days.mapNotNull { sets -> sets.maxOfOrNull { it.reps } }.takeLast(3)
            return DELOAD.takeIf { reps.size == 3 && reps.distinct().size == 1 }
        }
        val sinceBest = estimates.lastIndex - estimates.indexOf(estimates.max())
        if (sinceBest >= 4) return "coachWhyPlateauDeload"
        val recent = estimates.takeLast(3)
        return DELOAD.takeIf { sinceBest >= 2 && recent.max() - recent.min() <= 0.5 }
    }

    private fun highLoad(workouts: List<Workout>, today: LocalDate, zone: ZoneId): Boolean {
        if (ChronoUnit.DAYS.between(workouts.last().day(zone), today) + 1 < 14) return false
        val from = today.minusDays(56)
        val daily = workouts.filter { !it.day(zone).isBefore(from) }.groupingBy { it.day(zone) }
            .fold(0.0) { total, workout ->
                val tonnage = workout.sets.sumOf { it.tonnage }
                val rpe = if (tonnage > 0) workout.sets.sumOf { it.dose * it.tonnage } / tonnage
                    else workout.sets.map { it.dose }.average()
                val minutes = (workout.sets.first().row.workoutDurationSeconds / 60.0).roundToInt().coerceAtLeast(0)
                total + (rpe * minutes).roundToInt()
            }
        var acute = 0.0
        var chronic = 0.0
        for (offset in 0L..56L) {
            val load = daily[from.plusDays(offset)] ?: 0.0
            acute = 0.25 * load + 0.75 * acute
            chronic = (2.0 / 29) * load + (1 - 2.0 / 29) * chronic
        }
        return chronic > 0 && acute / chronic > 1.3
    }
}
