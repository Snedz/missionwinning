package com.missionwinning.core.common

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class WearProtocolTest {
    @Test
    fun roundTripActive() {
        val snap = ActiveSessionHub.Snapshot(
            active = true,
            workoutName = "Push Day",
            sessionId = "s1",
            doneSets = 2,
            totalSets = 9,
            restDeadlineMs = 1_700_000_000_000L,
            currentSetId = "set-3",
            exerciseName = "Bench",
            setIndex = 2,
            reps = 8,
            weight = 60.0,
            weightUnit = "kg",
            streakDays = 4,
        )
        val decoded = WearProtocol.decodeActive(WearProtocol.encodeActive(snap))
        assertNotNull(decoded)
        assertEquals(snap.workoutName, decoded!!.workoutName)
        assertEquals(snap.currentSetId, decoded.currentSetId)
        assertEquals(snap.reps, decoded.reps)
        assertEquals(snap.weight, decoded.weight, 0.0)
        assertEquals(snap.restDeadlineMs, decoded.restDeadlineMs)
        assertTrue(decoded.active)
    }

    @Test
    fun roundTripComplete() {
        val bytes = WearProtocol.encodeComplete("abc", 10, 42.5)
        val triple = WearProtocol.decodeComplete(bytes)
        assertNotNull(triple)
        assertEquals("abc", triple!!.first)
        assertEquals(10, triple.second)
        assertEquals(42.5, triple.third, 0.0)
    }
}
