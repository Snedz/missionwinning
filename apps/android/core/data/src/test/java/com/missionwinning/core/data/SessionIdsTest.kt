package com.missionwinning.core.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class SessionIdsTest {

    @Test
    fun routineAndFreeformPrefixes() {
        val r = SessionIds.routineSessionId("abc")
        assertEquals("routine:abc", r)
        assertTrue(SessionIds.isRoutineSession(r))
        assertFalse(SessionIds.isCoachSession(r))
        assertEquals("abc", SessionIds.routineIdFromSession(r))

        val f = SessionIds.freeformSessionId()
        assertTrue(SessionIds.isFreeformSession(f))
        assertFalse(SessionIds.isCoachSession(f))
        assertNull(SessionIds.routineIdFromSession(f))
    }

    @Test
    fun coachSession_isPlainId() {
        assertTrue(SessionIds.isCoachSession("session-uuid-1"))
        assertFalse(SessionIds.isCoachSession(""))
        assertFalse(SessionIds.isCoachSession("routine:x"))
        assertFalse(SessionIds.isCoachSession("freeform:x"))
    }

    @Test
    fun mwRepository_delegatesSessionHelpers() {
        assertTrue(MwRepository.isCoachSession("plan-day-1"))
        assertEquals("routine:r1", MwRepository.routineSessionId("r1"))
    }
}
