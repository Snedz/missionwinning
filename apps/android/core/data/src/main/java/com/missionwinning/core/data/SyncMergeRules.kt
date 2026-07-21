package com.missionwinning.core.data

/**
 * Pure sync merge / outbox policy — unit-tested without Room.
 * Used by [SyncEngine]; keep behavior identical when changing the engine.
 */
object SyncMergeRules {
    const val MAX_ATTEMPTS = SyncEngine.MAX_ATTEMPTS
    const val STATUS_PENDING = SyncEngine.STATUS_PENDING
    const val STATUS_SYNCED = SyncEngine.STATUS_SYNCED
    const val STATUS_FAILED = SyncEngine.STATUS_FAILED

    /** Outbox row should be dead-lettered (and workout marked failed). */
    fun isDeadLetter(attempts: Int, maxAttempts: Int = MAX_ATTEMPTS): Boolean =
        attempts >= maxAttempts

    /**
     * Whether pull-merge should skip applying a remote workout because local is authoritative.
     * Local pending/failed always wins until push ACK.
     */
    fun shouldSkipRemoteForLocalPending(localSyncStatus: String?): Boolean =
        localSyncStatus == STATUS_PENDING || localSyncStatus == STATUS_FAILED

    /**
     * Whether remote revision is stale relative to local (do not overwrite).
     * Matches SyncEngine: remoteRev = max(1, remote); skip when remoteRev <= local.revision.
     */
    fun isRemoteStale(localRevision: Int, remoteRevision: Int): Boolean =
        remoteRevision.coerceAtLeast(1) <= localRevision

    /**
     * Resolve identity for a remote workout row.
     */
    fun resolveClientId(clientId: String?, serverId: String?): String? =
        clientId?.takeIf { it.isNotBlank() } ?: serverId?.takeIf { it.isNotBlank() }

    fun isRemoteDeleted(deletedAt: String?): Boolean =
        !deletedAt.isNullOrBlank()

    /**
     * Kind accepted as a workout outbox row.
     */
    fun isWorkoutOutboxKind(kind: String): Boolean =
        kind == SyncEngine.KIND_WORKOUT_REF || kind == MwRepository.KIND_WORKOUT

    fun isRoutineOutboxKind(kind: String): Boolean =
        kind == SyncEngine.KIND_ROUTINE_REF
}
