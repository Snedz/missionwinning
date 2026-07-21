package com.missionwinning.core.model

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SetKindTest {
    @Test
    fun fromCode_defaultsAndParses() {
        assertEquals(SetKind.Normal, SetKind.fromCode(null))
        assertEquals(SetKind.Normal, SetKind.fromCode(""))
        assertEquals(SetKind.Normal, SetKind.fromCode("bogus"))
        assertEquals(SetKind.Warmup, SetKind.fromCode("warmup"))
        assertEquals(SetKind.Failure, SetKind.fromCode("FAILURE"))
        assertEquals(SetKind.Drop, SetKind.fromCode("drop"))
    }

    @Test
    fun volumeAndPr_matchWebRules() {
        assertTrue(SetKind.countsTowardVolume(SetKind.Normal))
        assertFalse(SetKind.countsTowardVolume(SetKind.Warmup))
        assertTrue(SetKind.countsTowardVolume(SetKind.Failure))
        assertTrue(SetKind.countsTowardVolume(SetKind.Drop))

        assertTrue(SetKind.countsTowardPr(SetKind.Normal))
        assertFalse(SetKind.countsTowardPr(SetKind.Warmup))
        assertTrue(SetKind.countsTowardPr(SetKind.Failure))
        assertFalse(SetKind.countsTowardPr(SetKind.Drop))
    }

    @Test
    fun cycle_rotatesFourKinds() {
        assertEquals(SetKind.Warmup, SetKind.cycle(SetKind.Normal))
        assertEquals(SetKind.Failure, SetKind.cycle(SetKind.Warmup))
        assertEquals(SetKind.Drop, SetKind.cycle(SetKind.Failure))
        assertEquals(SetKind.Normal, SetKind.cycle(SetKind.Drop))
    }

    @Test
    fun labels() {
        assertEquals("W", SetKind.shortLabel(SetKind.Warmup))
        assertEquals("", SetKind.shortLabel(SetKind.Normal))
        assertEquals("Warmup", SetKind.displayLabel(SetKind.Warmup))
        assertEquals("Working", SetKind.displayLabel(SetKind.Normal))
    }
}

