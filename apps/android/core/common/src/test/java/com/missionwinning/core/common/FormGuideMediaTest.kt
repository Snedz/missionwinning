package com.missionwinning.core.common

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class FormGuideMediaTest {
    @Test
    fun hasMedia_forHeroMovements() {
        assertTrue(FormGuideMedia.hasMedia("bench-press"))
        assertTrue(FormGuideMedia.hasMedia("push-ups"))
        assertFalse(FormGuideMedia.hasMedia("unknown-lift"))
    }

    @Test
    fun url_matchesWebPublicPath() {
        assertEquals(
            "https://www.missionwinning.com/form-guides/air-squat.svg",
            FormGuideMedia.url("air-squat"),
        )
        assertNull(FormGuideMedia.url("nope"))
    }
}
