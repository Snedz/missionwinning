package com.missionwinning.app.preview

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
    val workoutId: String,
    val plan: CoachPlanDto,
    val completedName: String,
    val targets: List<V2TargetChange>,
)

internal fun CoachPlanDto.nextSession(today: Int = WorkoutStats.mondayBasedOffset()): PlanSessionDto? =
    WorkoutStats.pickNextSession(sessions.filter { it.exercises.isNotEmpty() }, today, { it.dayOffset }, { it.status })

internal fun compareCompletedPlan(
    before: CoachPlanDto,
    after: CoachPlanDto,
    sessionId: String,
    workoutId: String,
): V2Change? {
    if (workoutId.isBlank() || before.weekStart != after.weekStart ||
        before.equipmentProfile != after.equipmentProfile || before.weightUnit != after.weightUnit ||
        after.revision != before.revision + 1 || after.contextHash != "${before.contextHash}-done-$sessionId"
    ) return null
    val originals = before.sessions.associateBy { it.id }
    val completed = originals[sessionId] ?: return null
    if (completed.status == "done" || after.sessions.none { it.id == sessionId && it.status == "done" }) return null
    val targets = after.sessions.filter { WorkoutStats.isOpenSessionStatus(it.status) }.flatMap { updated ->
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
    return V2Change(workoutId, after, completed.name, targets)
}
