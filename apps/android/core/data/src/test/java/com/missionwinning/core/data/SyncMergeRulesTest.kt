package com.missionwinning.core.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class SyncMergeRulesTest {

    @Test
    fun deadLetter_atCeiling() {
        assertFalse(SyncMergeRules.isDeadLetter(0))
        assertFalse(SyncMergeRules.isDeadLetter(7))
        assertTrue(SyncMergeRules.isDeadLetter(8))
        assertTrue(SyncMergeRules.isDeadLetter(9))
        assertTrue(SyncMergeRules.isDeadLetter(8, maxAttempts = 8))
        assertFalse(SyncMergeRules.isDeadLetter(5, maxAttempts = 8))
    }

    @Test
    fun localPending_skipsRemote() {
        assertTrue(SyncMergeRules.shouldSkipRemoteForLocalPending(SyncMergeRules.STATUS_PENDING))
        assertTrue(SyncMergeRules.shouldSkipRemoteForLocalPending(SyncMergeRules.STATUS_FAILED))
        assertFalse(SyncMergeRules.shouldSkipRemoteForLocalPending(SyncMergeRules.STATUS_SYNCED))
        assertFalse(SyncMergeRules.shouldSkipRemoteForLocalPending(null))
    }

    @Test
    fun remoteStale_whenRevisionNotHigher() {
        assertTrue(SyncMergeRules.isRemoteStale(localRevision = 3, remoteRevision = 3))
        assertTrue(SyncMergeRules.isRemoteStale(localRevision = 3, remoteRevision = 2))
        assertFalse(SyncMergeRules.isRemoteStale(localRevision = 3, remoteRevision = 4))
        // remote coerced to ≥1; local 0 always accepts remote rev 0/1
        assertFalse(SyncMergeRules.isRemoteStale(localRevision = 0, remoteRevision = 0))
        assertFalse(SyncMergeRules.isRemoteStale(localRevision = 0, remoteRevision = 1))
        assertTrue(SyncMergeRules.isRemoteStale(localRevision = 1, remoteRevision = 0))
    }

    @Test
    fun resolveClientId_prefersClientThenServer() {
        assertEquals("c1", SyncMergeRules.resolveClientId("c1", "s1"))
        assertEquals("s1", SyncMergeRules.resolveClientId(null, "s1"))
        assertEquals("s1", SyncMergeRules.resolveClientId("  ", "s1"))
        assertNull(SyncMergeRules.resolveClientId(null, null))
        assertNull(SyncMergeRules.resolveClientId("", ""))
    }

    @Test
    fun remoteDeleted() {
        assertTrue(SyncMergeRules.isRemoteDeleted("2026-01-01T00:00:00Z"))
        assertFalse(SyncMergeRules.isRemoteDeleted(null))
        assertFalse(SyncMergeRules.isRemoteDeleted(""))
    }

    @Test
    fun outboxKinds() {
        assertTrue(SyncMergeRules.isWorkoutOutboxKind(SyncEngine.KIND_WORKOUT_REF))
        assertTrue(SyncMergeRules.isWorkoutOutboxKind(MwRepository.KIND_WORKOUT))
        assertFalse(SyncMergeRules.isWorkoutOutboxKind(SyncEngine.KIND_ROUTINE_REF))
        assertTrue(SyncMergeRules.isRoutineOutboxKind(SyncEngine.KIND_ROUTINE_REF))
        assertFalse(SyncMergeRules.isRoutineOutboxKind(SyncEngine.KIND_WORKOUT_REF))
    }
}
