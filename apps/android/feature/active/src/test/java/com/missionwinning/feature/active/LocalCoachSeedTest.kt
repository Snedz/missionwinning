package com.missionwinning.feature.active

import com.missionwinning.core.data.LocalCoachSeed
import com.missionwinning.core.model.ExerciseCatalog
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.Instant
import java.time.ZoneOffset

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
        val monday = Instant.parse("2026-05-18T12:00:00Z")
        val bw = LocalCoachSeed.build(equipment = "bodyweight", now = monday, zone = ZoneOffset.UTC)
        val db = LocalCoachSeed.build(equipment = "dumbbells", now = monday, zone = ZoneOffset.UTC)
        val gym = LocalCoachSeed.build(equipment = "full-gym", now = monday, zone = ZoneOffset.UTC)

        assertEquals("bodyweight", bw.plan.equipmentProfile)
        assertEquals("dumbbells", db.plan.equipmentProfile)
        assertEquals("full-gym", gym.plan.equipmentProfile)

        assertEquals(2, bw.plan.sessions.size)
        for (plan in listOf(bw.plan, db.plan, gym.plan)) {
            assertEquals(listOf(0, 3), plan.sessions.map { it.dayOffset })
            assertTrue(plan.sessions.all { it.name == "Full Body Strength" })
            assertTrue(plan.sessions.flatMap { it.exercises }.all {
                plan.equipmentProfile in requireNotNull(ExerciseCatalog.get(it.exerciseId)).equipment
            })
        }

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
