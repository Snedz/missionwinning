package com.missionwinning.core.data

import androidx.room.withTransaction
import java.util.UUID

/**
 * Bulk import/export of workout history (Phase 12).
 * Import writes Room SoT + enqueues sync when signed-in later.
 */
class WorkoutImportRepository(
    private val db: MwDatabase,
    private val sync: SyncCoordinator,
) {
    private val dao = db.dao()

    data class ImportSummary(
        val imported: Int,
        val sets: Int,
        val format: String,
        val skippedRows: Int,
        val error: String? = null,
    )

    suspend fun importCsv(csvText: String, preferUnit: String): ImportSummary {
        val parsed = WorkoutTransfer.parseCsv(csvText, preferUnit)
        if (parsed.error != null && parsed.workouts.isEmpty()) {
            return ImportSummary(0, 0, parsed.format, parsed.skippedRows, parsed.error)
        }
        var setTotal = 0
        val now = java.time.Instant.now().toString()
        db.withTransaction {
            for (w in parsed.workouts) {
                val id = UUID.randomUUID().toString()
                val workout = WorkoutLogEntity(
                    id = id,
                    workoutName = w.workoutName,
                    completedAt = w.completedAtIso,
                    durationSeconds = w.durationSeconds,
                    setCount = w.setCount,
                    totalVolume = w.totalVolume,
                    sessionId = "import:${parsed.format}",
                    syncStatus = SyncEngine.STATUS_PENDING,
                    revision = 1,
                    updatedAt = now,
                    deletedAt = null,
                    weightUnit = w.weightUnit,
                )
                dao.insertWorkout(workout)
                w.sets.forEachIndexed { idx, s ->
                    dao.insertSetLog(
                        SetLogEntity(
                            id = UUID.randomUUID().toString(),
                            exerciseId = s.exerciseId,
                            exerciseName = s.exerciseName,
                            setIndex = if (s.setIndex >= 0) s.setIndex else idx,
                            reps = s.reps.coerceIn(0, 999),
                            weight = s.weight.coerceAtLeast(0.0),
                            completedAt = w.completedAtIso,
                            sessionId = workout.sessionId,
                            weightUnit = s.weightUnit,
                            workoutId = id,
                            rpe = s.rpe,
                            setKind = s.setKind,
                            note = s.note,
                            supersetGroup = s.supersetGroup,
                        ),
                    )
                    setTotal++
                }
                dao.enqueueOutbox(
                    SyncOutboxEntity(
                        id = UUID.randomUUID().toString(),
                        kind = SyncEngine.KIND_WORKOUT_REF,
                        payloadJson = id,
                        createdAt = now,
                        attempts = 0,
                    ),
                )
            }
        }
        // Best-effort push if signed in
        runCatching { sync.flushOutbox() }
        return ImportSummary(
            imported = parsed.workouts.size,
            sets = setTotal,
            format = parsed.format,
            skippedRows = parsed.skippedRows,
            error = parsed.error,
        )
    }

    suspend fun exportAllPairs(limit: Int = 2000): List<Pair<WorkoutLogEntity, List<SetLogEntity>>> {
        val workouts = dao.recentWorkouts(limit.coerceIn(1, 5000))
        return workouts.map { w -> w to dao.setsForWorkout(w.id) }
    }

    suspend fun exportMwCsv(limit: Int = 2000): String =
        WorkoutTransfer.toMwCsv(exportAllPairs(limit))

    suspend fun exportHevyCsv(limit: Int = 2000): String =
        WorkoutTransfer.toHevyCsv(exportAllPairs(limit))

    suspend fun exportJson(limit: Int = 2000): String =
        WorkoutTransfer.toJsonSummary(exportAllPairs(limit))
}
