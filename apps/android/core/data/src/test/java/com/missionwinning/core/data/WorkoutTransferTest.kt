package com.missionwinning.core.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class WorkoutTransferTest {

    @Test
    fun parseCsvRow_quotedCommas() {
        val row = WorkoutTransfer.parseCsvRow("""a,"b,c",d""")
        assertEquals(listOf("a", "b,c", "d"), row)
    }

    @Test
    fun parseHevy_sample() {
        val csv = """
            title,start_time,end_time,description,exercise_title,superset_id,exercise_notes,set_index,set_type,weight_lbs,reps,distance_miles,duration_seconds,rpe
            "Thursday Upper","28 Mar 2025, 17:29","28 Mar 2025, 18:52","","Bench Press",,"",0,"normal",135,8,,0,7
            "Thursday Upper","28 Mar 2025, 17:29","28 Mar 2025, 18:52","","Bench Press",,"",1,"normal",135,8,,0,
            "Thursday Upper","28 Mar 2025, 17:29","28 Mar 2025, 18:52","","Row",,"",0,"normal",95,10,,0,
        """.trimIndent()
        val result = WorkoutTransfer.parseCsv(csv, preferUnit = "lb")
        assertEquals("hevy", result.format)
        assertEquals(1, result.workouts.size)
        val w = result.workouts.first()
        assertEquals("Thursday Upper", w.workoutName)
        assertEquals(3, w.sets.size)
        val bench = w.sets.filter { it.exerciseName.contains("Bench", ignoreCase = true) }
        assertEquals(2, bench.size)
        assertEquals(8, bench.first().reps)
        assertTrue(bench.first().weight > 0)
        assertTrue(w.durationSeconds >= 30)
    }

    @Test
    fun parseMwNative_roundTripShape() {
        val csv = """
            workout_id,workout_name,completed_at,duration_seconds,weight_unit,exercise_id,exercise_name,set_index,reps,weight,rpe,set_kind,note,superset_group
            w1,Push Day,2026-07-01T12:00:00Z,1800,kg,bench,Bench,0,5,100,8,normal,paused,A
            w1,Push Day,2026-07-01T12:00:00Z,1800,kg,bench,Bench,1,5,100,,normal,,A
        """.trimIndent()
        val result = WorkoutTransfer.parseCsv(csv, preferUnit = "kg")
        assertEquals("mw", result.format)
        assertEquals(1, result.workouts.size)
        assertEquals(2, result.workouts.first().sets.size)
        assertEquals("A", result.workouts.first().sets.first().supersetGroup)
        assertEquals(8, result.workouts.first().sets.first().rpe)
    }

    @Test
    fun slugId_sanitizes() {
        assertEquals("bench-press", WorkoutTransfer.slugId("Bench Press"))
        assertTrue(WorkoutTransfer.slugId("  ").startsWith("ex-"))
    }

    @Test
    fun unrecognized_errors() {
        val r = WorkoutTransfer.parseCsv("foo,bar\n1,2")
        assertTrue(r.error != null)
        assertTrue(r.workouts.isEmpty())
    }
}
