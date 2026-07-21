package com.missionwinning.feature.active

import com.missionwinning.core.data.LocalCoachSeed
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class LocalCoachSeedTest {
    @Test
    fun normalizeEquipment_aliases() {
        assertEquals("bodyweight", LocalCoachSeed.normalizeEquipment("Bodyweight"))
        assertEquals("dumbbells", LocalCoachSeed.normalizeEquipment("db"))
        assertEquals("full-gym", LocalCoachSeed.normalizeEquipment("gym"))
        assertEquals("full-gym", LocalCoachSeed.normalizeEquipment("full_gym"))
    }

    @Test
    fun build_variesByEquipment() {
        val bw = LocalCoachSeed.build(equipment = "bodyweight")
        val db = LocalCoachSeed.build(equipment = "dumbbells")
        val gym = LocalCoachSeed.build(equipment = "full-gym")

        assertEquals("bodyweight", bw.plan.equipmentProfile)
        assertEquals("dumbbells", db.plan.equipmentProfile)
        assertEquals("full-gym", gym.plan.equipmentProfile)

        assertEquals(3, bw.plan.sessions.size)
        assertTrue(bw.plan.sessions.any { it.name.contains("Push", ignoreCase = true) })
        assertTrue(db.plan.sessions.any { it.name.contains("DB", ignoreCase = true) })
        assertTrue(gym.plan.sessions.any { it.name.contains("barbell", ignoreCase = true) })

        val bwEx = bw.plan.sessions.flatMap { it.exercises }.map { it.exerciseId }.toSet()
        val dbEx = db.plan.sessions.flatMap { it.exercises }.map { it.exerciseId }.toSet()
        assertFalse(bwEx == dbEx)
    }

    @Test
    fun markDone_bumpsRevisionAndStatus() {
        val plan = LocalCoachSeed.build(equipment = "bodyweight").plan
        val sessionId = plan.sessions.first().id
        val next = LocalCoachSeed.markDone(plan, sessionId)
        assertEquals(plan.revision + 1, next.plan.revision)
        assertTrue(next.hasAdaptSignal)
        assertEquals("done", next.plan.sessions.first { it.id == sessionId }.status)
    }
}
