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
    ],
    version = 4,
    exportSchema = false,
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

        fun get(context: Context): MwDatabase =
            instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(
                    context.applicationContext,
                    MwDatabase::class.java,
                    "mw.db",
                )
                    .addMigrations(MIGRATION_1_2, MIGRATION_2_3, MIGRATION_3_4)
                    .build()
                    .also { instance = it }
            }
    }
}
