package com.missionwinning.core.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase

@Database(
    entities = [
        CoachPlanEntity::class,
        WorkoutLogEntity::class,
        PrefEntity::class,
        SetLogEntity::class,
        SyncOutboxEntity::class,
        RoutineEntity::class,
        CustomExerciseEntity::class,
        SessionDraftEntity::class,
    ],
    version = 11,
    exportSchema = true,
)
abstract class MwDatabase : RoomDatabase() {
    abstract fun dao(): MwDao

    companion object {
        @Volatile private var instance: MwDatabase? = null

        private val MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL(
                    """
                    CREATE TABLE IF NOT EXISTS set_logs (
                        id TEXT NOT NULL PRIMARY KEY,
                        exerciseId TEXT NOT NULL,
                        exerciseName TEXT NOT NULL,
                        setIndex INTEGER NOT NULL,
                        reps INTEGER NOT NULL,
                        weight REAL NOT NULL,
                        completedAt TEXT NOT NULL,
                        sessionId TEXT
                    )
                    """.trimIndent(),
                )
                db.execSQL(
                    """
                    CREATE TABLE IF NOT EXISTS sync_outbox (
                        id TEXT NOT NULL PRIMARY KEY,
                        kind TEXT NOT NULL,
                        payloadJson TEXT NOT NULL,
                        createdAt TEXT NOT NULL,
                        attempts INTEGER NOT NULL
                    )
                    """.trimIndent(),
                )
            }
        }

        private val MIGRATION_2_3 = object : Migration(2, 3) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL(
                    "ALTER TABLE set_logs ADD COLUMN weightUnit TEXT NOT NULL DEFAULT 'kg'",
                )
            }
        }

        private val MIGRATION_3_4 = object : Migration(3, 4) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL(
                    "ALTER TABLE set_logs ADD COLUMN workoutId TEXT NOT NULL DEFAULT ''",
                )
            }
        }

        private val MIGRATION_4_5 = object : Migration(4, 5) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("ALTER TABLE set_logs ADD COLUMN rpe INTEGER")
            }
        }

        private val MIGRATION_5_6 = object : Migration(5, 6) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL(
                    """
                    CREATE TABLE IF NOT EXISTS routines (
                        id TEXT NOT NULL PRIMARY KEY,
                        name TEXT NOT NULL,
                        createdAt TEXT NOT NULL,
                        sourceWorkoutId TEXT,
                        exercisesJson TEXT NOT NULL
                    )
                    """.trimIndent(),
                )
            }
        }

        private val MIGRATION_6_7 = object : Migration(6, 7) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL(
                    "ALTER TABLE set_logs ADD COLUMN setKind TEXT NOT NULL DEFAULT 'normal'",
                )
            }
        }

        /**
         * Sync v2 columns + re-enqueue all local workouts for full-fidelity push
         * (legacy-claim safe on server).
         */
        private val MIGRATION_7_8 = object : Migration(7, 8) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL(
                    "ALTER TABLE workout_logs ADD COLUMN syncStatus TEXT NOT NULL DEFAULT 'pending'",
                )
                db.execSQL(
                    "ALTER TABLE workout_logs ADD COLUMN revision INTEGER NOT NULL DEFAULT 1",
                )
                db.execSQL(
                    "ALTER TABLE workout_logs ADD COLUMN updatedAt TEXT NOT NULL DEFAULT ''",
                )
                db.execSQL("ALTER TABLE workout_logs ADD COLUMN deletedAt TEXT")
                db.execSQL(
                    "ALTER TABLE workout_logs ADD COLUMN weightUnit TEXT NOT NULL DEFAULT 'kg'",
                )
                // Backfill updatedAt from completedAt when empty
                db.execSQL(
                    """
                    UPDATE workout_logs
                    SET updatedAt = completedAt
                    WHERE updatedAt = '' OR updatedAt IS NULL
                    """.trimIndent(),
                )
                // Clear stale summary outbox rows; re-enqueue workout refs
                db.execSQL("DELETE FROM sync_outbox")
                db.execSQL(
                    """
                    INSERT INTO sync_outbox (id, kind, payloadJson, createdAt, attempts)
                    SELECT
                        id,
                        'workout_ref',
                        id,
                        completedAt,
                        0
                    FROM workout_logs
                    WHERE deletedAt IS NULL
                    """.trimIndent(),
                )
            }
        }

        /** Routine cloud sync fields + re-enqueue all local routines. */
        private val MIGRATION_8_9 = object : Migration(8, 9) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL(
                    "ALTER TABLE routines ADD COLUMN syncStatus TEXT NOT NULL DEFAULT 'pending'",
                )
                db.execSQL(
                    "ALTER TABLE routines ADD COLUMN revision INTEGER NOT NULL DEFAULT 1",
                )
                db.execSQL(
                    "ALTER TABLE routines ADD COLUMN updatedAt TEXT NOT NULL DEFAULT ''",
                )
                db.execSQL("ALTER TABLE routines ADD COLUMN deletedAt TEXT")
                db.execSQL(
                    """
                    UPDATE routines
                    SET updatedAt = createdAt
                    WHERE updatedAt = '' OR updatedAt IS NULL
                    """.trimIndent(),
                )
                db.execSQL(
                    """
                    INSERT INTO sync_outbox (id, kind, payloadJson, createdAt, attempts)
                    SELECT
                        'r-' || id,
                        'routine_ref',
                        id,
                        createdAt,
                        0
                    FROM routines
                    WHERE deletedAt IS NULL
                    """.trimIndent(),
                )
            }
        }

        /** Set notes + superset group + custom exercises (Phase 10 logger craft). */
        private val MIGRATION_9_10 = object : Migration(9, 10) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL(
                    "ALTER TABLE set_logs ADD COLUMN note TEXT NOT NULL DEFAULT ''",
                )
                db.execSQL(
                    "ALTER TABLE set_logs ADD COLUMN supersetGroup TEXT NOT NULL DEFAULT ''",
                )
                db.execSQL(
                    """
                    CREATE TABLE IF NOT EXISTS custom_exercises (
                        id TEXT NOT NULL PRIMARY KEY,
                        name TEXT NOT NULL,
                        createdAt TEXT NOT NULL,
                        equipment TEXT NOT NULL,
                        muscleGroups TEXT NOT NULL
                    )
                    """.trimIndent(),
                )
            }
        }

        /** Indexes + custom sync fields + session draft (F1/F2 orchestration). */
        private val MIGRATION_10_11 = object : Migration(10, 11) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("CREATE INDEX IF NOT EXISTS index_workout_logs_syncStatus ON workout_logs(syncStatus)")
                db.execSQL("CREATE INDEX IF NOT EXISTS index_workout_logs_updatedAt ON workout_logs(updatedAt)")
                db.execSQL("CREATE INDEX IF NOT EXISTS index_set_logs_workoutId ON set_logs(workoutId)")
                db.execSQL("CREATE INDEX IF NOT EXISTS index_sync_outbox_createdAt ON sync_outbox(createdAt)")
                db.execSQL("CREATE INDEX IF NOT EXISTS index_routines_syncStatus ON routines(syncStatus)")
                db.execSQL(
                    "ALTER TABLE custom_exercises ADD COLUMN syncStatus TEXT NOT NULL DEFAULT 'pending'",
                )
                db.execSQL(
                    "ALTER TABLE custom_exercises ADD COLUMN revision INTEGER NOT NULL DEFAULT 1",
                )
                db.execSQL(
                    "ALTER TABLE custom_exercises ADD COLUMN updatedAt TEXT NOT NULL DEFAULT ''",
                )
                db.execSQL("ALTER TABLE custom_exercises ADD COLUMN deletedAt TEXT")
                db.execSQL(
                    "CREATE INDEX IF NOT EXISTS index_custom_exercises_syncStatus ON custom_exercises(syncStatus)",
                )
                db.execSQL(
                    """
                    CREATE TABLE IF NOT EXISTS session_drafts (
                        id INTEGER NOT NULL PRIMARY KEY,
                        sessionId TEXT NOT NULL,
                        workoutName TEXT NOT NULL,
                        startedAtMs INTEGER NOT NULL,
                        weightUnit TEXT NOT NULL,
                        json TEXT NOT NULL,
                        updatedAt TEXT NOT NULL
                    )
                    """.trimIndent(),
                )
            }
        }

        fun get(context: Context): MwDatabase =
            instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(
                    context.applicationContext,
                    MwDatabase::class.java,
                    "mw.db",
                )
                    .addMigrations(
                        MIGRATION_1_2,
                        MIGRATION_2_3,
                        MIGRATION_3_4,
                        MIGRATION_4_5,
                        MIGRATION_5_6,
                        MIGRATION_6_7,
                        MIGRATION_7_8,
                        MIGRATION_8_9,
                        MIGRATION_9_10,
                        MIGRATION_10_11,
                    )
                    .build()
                    .also { instance = it }
            }
    }
}
