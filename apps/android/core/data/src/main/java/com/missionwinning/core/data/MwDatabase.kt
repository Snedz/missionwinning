package com.missionwinning.core.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [CoachPlanEntity::class, WorkoutLogEntity::class, PrefEntity::class],
    version = 1,
    exportSchema = false,
)
abstract class MwDatabase : RoomDatabase() {
    abstract fun dao(): MwDao

    companion object {
        @Volatile private var instance: MwDatabase? = null

        fun get(context: Context): MwDatabase =
            instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(
                    context.applicationContext,
                    MwDatabase::class.java,
                    "mw.db",
                ).build().also { instance = it }
            }
    }
}
