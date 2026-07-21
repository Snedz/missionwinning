package com.missionwinning.core.model

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ExerciseCatalogTest {
    @Test
    fun displayName_knownIds() {
        assertEquals("Push-up", ExerciseCatalog.displayName("pushup"))
        assertEquals("Barbell bench press", ExerciseCatalog.displayName("bench-press"))
        assertEquals("Goblet squat", ExerciseCatalog.displayName("goblet-squat"))
    }

    @Test
    fun displayName_unknownHumanizes() {
        assertEquals("Custom move", ExerciseCatalog.displayName("custom-move"))
    }

    @Test
    fun search_byMuscleAndEquipment() {
        val chest = ExerciseCatalog.search("chest", equipment = "full-gym")
        assertTrue(chest.any { it.id == "bench-press" })
        val bw = ExerciseCatalog.forEquipment("bodyweight")
        assertTrue(bw.all { "bodyweight" in it.equipment })
        assertTrue(bw.size >= 10)
    }

    @Test
    fun seedIds_areCatalogued() {
        val seed = listOf(
            "pushup", "plank", "squat", "hip-hinge", "row", "chinup",
            "db-press", "db-fly", "goblet-squat", "db-rdl", "db-row", "db-curl",
            "bench-press", "cable-fly", "back-squat", "romanian-deadlift",
            "lat-pulldown", "barbell-row", "walk",
        )
        seed.forEach { id ->
            assertTrue("missing $id", ExerciseCatalog.get(id) != null)
        }
    }
}
