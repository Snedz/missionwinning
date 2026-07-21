package com.missionwinning.core.data

/**
 * Outcome of a sync / pull cycle for Account UX honesty (Phase 12).
 */
data class SyncRunResult(
    val remainingUnsynced: Int = 0,
    val workoutPagesPulled: Int = 0,
    val workoutsMerged: Int = 0,
    val routinePagesPulled: Int = 0,
    val routinesMerged: Int = 0,
    val conflictsSkipped: Int = 0,
    val lastConflictNote: String? = null,
    val error: String? = null,
) {
    val summaryLine: String
        get() = buildString {
            if (error != null) {
                append(error)
                return@buildString
            }
            if (workoutPagesPulled > 0 || workoutsMerged > 0) {
                append("Pulled $workoutsMerged workout(s) in $workoutPagesPulled page(s)")
            } else {
                append("Pull complete · no new workouts")
            }
            if (routinesMerged > 0) {
                append(" · $routinesMerged routine(s)")
            }
            if (conflictsSkipped > 0) {
                append(" · $conflictsSkipped local pending kept")
            }
            if (remainingUnsynced > 0) {
                append(" · $remainingUnsynced still pending push")
            }
        }
}
