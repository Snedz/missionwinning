package com.missionwinning.app.preview

import com.missionwinning.core.model.ExerciseCatalog
import com.missionwinning.core.model.WorkoutStats
import com.missionwinning.core.network.CoachPlanDto
import com.missionwinning.core.network.PlanExerciseDto
import com.missionwinning.core.network.PlanSessionDto

internal data class V2TargetChange(
    val sessionName: String,
    val before: PlanExerciseDto,
    val after: PlanExerciseDto,
)

internal data class V2Change(
    val workoutId: String?,
    val plan: CoachPlanDto,
    val completedName: String?,
    val targets: List<V2TargetChange>,
)

internal fun CoachPlanDto.nextSession(today: Int = WorkoutStats.mondayBasedOffset()): PlanSessionDto? =
    WorkoutStats.pickNextSession(sessions.filter { it.exercises.isNotEmpty() }, today, { it.dayOffset }, { it.status })

internal fun CoachPlanDto.nextTargetsFor(
    loggedExerciseIds: List<String>,
    today: Int = WorkoutStats.mondayBasedOffset(),
): List<PlanExerciseDto> {
    val open = sessions.filter { WorkoutStats.isOpenSessionStatus(it.status) }
    val next = nextSession(today)
    val byExercise = (listOfNotNull(next) + open.filter { it != next })
        .flatMap { it.exercises }
        .groupBy { ExerciseCatalog.canonicalCoachId(it.exerciseId) }
    return loggedExerciseIds.map(ExerciseCatalog::canonicalCoachId).distinct()
        .mapNotNull { byExercise[it]?.firstOrNull() }
}

internal fun compareCompletedPlan(
    before: CoachPlanDto,
    after: CoachPlanDto,
    sessionId: String,
    workoutId: String,
): V2Change? {
    if (workoutId.isBlank() || !before.isComparableTo(after) ||
        after.revision != before.revision + 1 || after.contextHash != "${before.contextHash}-done-$sessionId"
    ) return null
    val completed = before.sessions.find { it.id == sessionId } ?: return null
    if (completed.status == "done" || after.sessions.none { it.id == sessionId && it.status == "done" }) return null
    return V2Change(workoutId, after, completed.name, changedTargets(before, after))
}

internal fun compareRebuiltPlan(before: CoachPlanDto, after: CoachPlanDto): V2Change? {
    if (!before.isComparableTo(after)) return null
    val targets = changedTargets(before, after)
    return if (targets.isEmpty()) null else V2Change(null, after, null, targets)
}

private fun CoachPlanDto.isComparableTo(other: CoachPlanDto) =
    weekStart == other.weekStart && equipmentProfile == other.equipmentProfile && weightUnit == other.weightUnit

private fun changedTargets(before: CoachPlanDto, after: CoachPlanDto): List<V2TargetChange> {
    val originals = before.sessions.associateBy { it.id }
    return after.sessions.filter { WorkoutStats.isOpenSessionStatus(it.status) }.flatMap { updated ->
        val original = originals[updated.id]
        if (original == null || !WorkoutStats.isOpenSessionStatus(original.status)) return@flatMap emptyList()
        updated.exercises.mapNotNull { exercise ->
            val old = original.exercises.singleOrNull { it.exerciseId == exercise.exerciseId } ?: return@mapNotNull null
            if (updated.exercises.count { it.exerciseId == exercise.exerciseId } != 1) return@mapNotNull null
            if (old.sets == exercise.sets && old.reps == exercise.reps && old.weight == exercise.weight) null
            else if (old.weight != exercise.weight && after.weightUnit !in setOf("kg", "lb")) null
            else V2TargetChange(updated.name, old, exercise)
        }
    }
}
