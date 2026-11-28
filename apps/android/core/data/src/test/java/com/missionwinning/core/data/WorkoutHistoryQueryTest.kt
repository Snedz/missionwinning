package com.missionwinning.core.data

import java.sql.DriverManager
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class WorkoutHistoryQueryTest {
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
