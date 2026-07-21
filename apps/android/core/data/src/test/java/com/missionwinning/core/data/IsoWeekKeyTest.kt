package com.missionwinning.core.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate

class IsoWeekKeyTest {
    @Test
    fun currentIsoWeekKey_format() {
        val key = MwRepository.currentIsoWeekKey(LocalDate.of(2026, 7, 21))
        assertTrue(key.matches(Regex("""\d{4}-W\d{2}""")))
        assertEquals("2026-W30", key)
    }
}
