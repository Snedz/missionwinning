package com.missionwinning.core.data

import java.sql.DriverManager
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class WorkoutHistoryQueryTest {
    @Test
    fun completionUsesQualifyingWorkingSetFromTheSavedNonDeletedWorkout() {
        DriverManager.getConnection("jdbc:sqlite::memory:").use { db ->
            db.createStatement().use { sql ->
                sql.executeUpdate("CREATE TABLE workout_logs (id TEXT PRIMARY KEY, deletedAt TEXT, completedAt TEXT)")
                sql.executeUpdate(
                    """
                    CREATE TABLE set_logs (
                        id TEXT, exerciseId TEXT, workoutId TEXT, setIndex INTEGER, setKind TEXT, reps INTEGER,
                        weight REAL, weightUnit TEXT
                    )
                    """.trimIndent(),
                )
                sql.executeUpdate(
                    """
                    INSERT INTO workout_logs VALUES
                    ('saved', NULL, '2026-11-28'), ('deleted', '2026-11-29', '2026-11-28'),
                    ('other', NULL, '2026-11-29')
                    """.trimIndent(),
                )
                sql.executeUpdate(
                    """
                    INSERT INTO set_logs VALUES
                    ('eligible', 'goblet-squat', 'saved', 0, 'normal', 10, 60, 'lb'),
                    ('heavy-single', 'goblet-squat', 'saved', 1, 'normal', 1, 35, 'kg'),
                    ('warmup', 'goblet-squat', 'saved', 2, 'warmup', 10, 15, 'kg'),
                    ('bad-unit', 'goblet-squat', 'saved', 3, 'normal', 10, 100, 'unknown'),
                    ('deleted-set', 'goblet-squat', 'deleted', 0, 'normal', 10, 40, 'kg'),
                    ('other-set', 'goblet-squat', 'other', 0, 'normal', 10, 45, 'kg')
                    """.trimIndent(),
                )
            }
            val query = LATEST_WORKING_LOAD_SQL.replace(":exerciseIds", "?")
                .replace(":targetReps", "?").replace(":workoutId", "?")
            db.prepareStatement(query).use { sql ->
                sql.setString(1, "goblet-squat")
                sql.setInt(2, 10)
                fun load(workoutId: String?): String? {
                    sql.setString(3, workoutId)
                    sql.setString(4, workoutId)
                    return sql.executeQuery().use { rows -> if (rows.next()) rows.getString("id") else null }
                }
                assertEquals("eligible", load("saved"))
                assertNull(load("deleted"))
                assertEquals("other-set", load(null))
                sql.setInt(2, 12)
                assertNull(load("saved"))
            }
        }
    }

    @Test
    fun previousSetSkipsDeletedWorkoutAcrossAliasesAndKeepsUnlinkedHistory() {
        DriverManager.getConnection("jdbc:sqlite::memory:").use { db ->
            db.createStatement().use { sql ->
                sql.executeUpdate("CREATE TABLE workout_logs (id TEXT PRIMARY KEY, deletedAt TEXT)")
                sql.executeUpdate("CREATE TABLE set_logs (id TEXT, exerciseId TEXT, setIndex INTEGER, completedAt TEXT, workoutId TEXT)")
                sql.executeUpdate("INSERT INTO workout_logs VALUES ('active', NULL), ('deleted', '2026-05-19')")
                sql.executeUpdate(
                    """
                    INSERT INTO set_logs VALUES
                    ('valid', 'jump-squats', 0, '2026-05-17', 'active'),
                    ('removed', 'jump-squat', 0, '2026-05-18', 'deleted'),
                    ('unlinked', 'jump-squat', 1, '2026-05-16', ''),
                    ('removed-only', 'jump-squat', 2, '2026-05-18', 'deleted')
                    """.trimIndent(),
                )
            }
            val query = LATEST_SET_FOR_SQL.replace(":exerciseIds", "?, ?").replace(":setIndex", "?")
            db.prepareStatement(query).use { sql ->
                sql.setString(1, "jump-squats")
                sql.setString(2, "jump-squat")
                fun previousSet(index: Int): String? {
                    sql.setInt(3, index)
                    return sql.executeQuery().use { rows -> if (rows.next()) rows.getString("id") else null }
                }
                assertEquals("valid", previousSet(0))
                assertEquals("unlinked", previousSet(1))
                assertNull(previousSet(2))
            }
        }
    }
}
