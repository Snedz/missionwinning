package com.missionwinning.core.data

/**
 * Snapshot of local sync health for Account / Today.
 * Free offline logger is unaffected — this is visibility only.
 */
data class OutboxStatus(
    /** Workouts with syncStatus pending (not yet acked). */
    val pendingWorkouts: Int = 0,
    /** Workouts that hit the attempt ceiling (dead-lettered). */
    val failedWorkouts: Int = 0,
    /** Rows still in sync_outbox table. */
    val outboxRows: Int = 0,
    /** ISO-8601 of last successful full sync, if known. */
    val lastSuccessAt: String? = null,
    /** Last pull/push summary line. */
    val lastSyncSummary: String? = null,
    /** Last local-vs-remote conflict note (routines/workouts). */
    val lastConflictNote: String? = null,
    /** Recent conflict notes (newest first), for Account inbox. */
    val conflictInbox: List<String> = emptyList(),
    val workoutCount: Int = 0,
) {
    val needsAttention: Boolean get() = failedWorkouts > 0 || pendingWorkouts > 0 || outboxRows > 0

    val summaryLine: String
        get() = when {
            failedWorkouts > 0 ->
                "$failedWorkouts failed · $pendingWorkouts pending · tap Retry"
            pendingWorkouts > 0 || outboxRows > 0 ->
                "$pendingWorkouts workout(s) waiting to sync"
            lastSyncSummary != null ->
                lastSyncSummary
            lastSuccessAt != null ->
                "All caught up"
            else ->
                "No cloud sync yet — sign in to back up"
        }
}
