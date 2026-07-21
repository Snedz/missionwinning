package com.missionwinning.core.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class OutboxStatusTest {

    @Test
    fun needsAttention_whenPendingOrFailed() {
        assertFalse(OutboxStatus().needsAttention)
        assertTrue(OutboxStatus(pendingWorkouts = 1).needsAttention)
        assertTrue(OutboxStatus(failedWorkouts = 1).needsAttention)
        assertTrue(OutboxStatus(outboxRows = 2).needsAttention)
    }

    @Test
    fun summaryLine_failedFirst() {
        val s = OutboxStatus(pendingWorkouts = 2, failedWorkouts = 1)
        assertTrue(s.summaryLine.contains("failed"))
        assertTrue(s.summaryLine.contains("Retry"))
    }

    @Test
    fun summaryLine_pendingOnly() {
        val s = OutboxStatus(pendingWorkouts = 3)
        assertTrue(s.summaryLine.contains("waiting"))
    }

    @Test
    fun summaryLine_caughtUp() {
        val s = OutboxStatus(lastSuccessAt = "2026-07-21T12:00:00Z")
        assertEquals("All caught up", s.summaryLine)
    }

    @Test
    fun summaryLine_neverSynced() {
        assertTrue(OutboxStatus().summaryLine.contains("sign in"))
    }
}
