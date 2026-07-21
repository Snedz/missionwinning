package com.missionwinning.core.model

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class CoachDepthTest {
    @Test
    fun free_limitsPremiumCards() {
        val free = CoachDepth.insightCards(
            adaptBeats = listOf(
                "coachAdaptMissedNote" to "1 missed",
                "coachAdaptSwappedNote" to "1 swapped",
            ),
            hasAdaptSignal = true,
            revision = 2,
            equipment = "bodyweight",
            doneCount = 1,
            openCount = 2,
            missedCount = 1,
            swappedCount = 1,
            premium = false,
        )
        assertTrue(free.none { it.premiumOnly })
        assertTrue(free.size <= 3)
        assertTrue(free.any { it.key == "week-snapshot" })
    }

    @Test
    fun premium_includesDepthAndBeats() {
        val prem = CoachDepth.insightCards(
            adaptBeats = listOf(
                "coachAdaptMissedNote" to "1 missed",
                "coachAdaptSwappedNote" to "1 swapped",
            ),
            hasAdaptSignal = true,
            revision = 3,
            equipment = "full-gym",
            doneCount = 0,
            openCount = 2,
            missedCount = 1,
            swappedCount = 1,
            premium = true,
        )
        assertTrue(prem.any { it.key == "premium-depth" })
        assertTrue(prem.any { it.key.startsWith("beat-") })
        assertTrue(prem.any { it.key == "recovery-bias" })
    }

    @Test
    fun sessionWhy_premiumDeeper() {
        val free = CoachDepth.sessionWhy(
            sessionId = "s1",
            name = "Push",
            kind = "strength",
            status = "planned",
            focusGroups = listOf("chest"),
            exerciseWhyKeys = emptyList(),
            estMinutes = 35,
            premium = false,
        )
        val prem = CoachDepth.sessionWhy(
            sessionId = "s1",
            name = "Push",
            kind = "strength",
            status = "planned",
            focusGroups = listOf("chest"),
            exerciseWhyKeys = listOf("adapt"),
            estMinutes = 35,
            premium = true,
        )
        assertTrue(free.detail.contains("Free offline") || free.detail.contains("min"))
        assertTrue(prem.detail.contains("adapt") || prem.detail.contains("rewritten"))
        assertEquals("chest", free.focusLine)
    }

    @Test
    fun whyKeyLabel() {
        assertEquals("Adapted move", CoachDepth.whyKeyLabel("adapt"))
        assertFalse(CoachDepth.whyKeyLabel("").orEmpty().isNotEmpty())
    }
}
