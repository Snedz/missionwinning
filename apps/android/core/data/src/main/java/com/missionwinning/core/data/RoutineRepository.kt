package com.missionwinning.core.data

import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.UUID

/**
 * Saved workout templates (routines) with cloud sync hooks.
 */
class RoutineRepository(
    private val db: MwDatabase,
    private val sync: SyncCoordinator,
) {
    private val dao = db.dao()
    private val json = Json { ignoreUnknownKeys = true }

    suspend fun allRoutines(): List<RoutineEntity> = dao.allRoutines()

    suspend fun routineById(id: String): RoutineEntity? = dao.routineById(id)

    suspend fun deleteRoutine(id: String) {
        val existing = dao.routineById(id) ?: return
        val now = java.time.Instant.now().toString()
        dao.upsertRoutine(
            existing.copy(
                deletedAt = now,
                updatedAt = now,
                revision = existing.revision + 1,
                syncStatus = SyncEngine.STATUS_PENDING,
            ),
        )
        sync.enqueueRoutine(id)
        sync.flushOutbox()
    }

    fun parseRoutineExercises(exercisesJson: String): List<RoutineExerciseDto> =
        runCatching {
            json.decodeFromString(
                kotlinx.serialization.builtins.ListSerializer(RoutineExerciseDto.serializer()),
                exercisesJson,
            )
        }.getOrDefault(emptyList())

    suspend fun saveRoutineFromWorkout(workoutId: String, nameOverride: String? = null): String? {
        val workout = dao.workoutById(workoutId) ?: return null
        val sets = dao.setsForWorkout(workoutId)
        if (sets.isEmpty()) return null
        val grouped = sets.groupBy { it.exerciseId }
        val exercises = grouped.map { (exId, rows) ->
            val ordered = rows.sortedBy { it.setIndex }
            val last = ordered.last()
            RoutineExerciseDto(
                exerciseId = exId,
                exerciseName = last.exerciseName.ifBlank { exId },
                sets = ordered.size.coerceIn(1, 12),
                targetReps = last.reps.coerceIn(1, 99),
                lastWeight = last.weight.coerceAtLeast(0.0),
            )
        }
        if (exercises.isEmpty()) return null
        val id = UUID.randomUUID().toString()
        val now = java.time.Instant.now().toString()
        val name = nameOverride?.takeIf { it.isNotBlank() }
            ?: workout.workoutName.ifBlank { "Routine" }
        dao.upsertRoutine(
            RoutineEntity(
                id = id,
                name = name,
                createdAt = now,
                sourceWorkoutId = workoutId,
                exercisesJson = json.encodeToString(
                    kotlinx.serialization.builtins.ListSerializer(RoutineExerciseDto.serializer()),
                    exercises,
                ),
                syncStatus = SyncEngine.STATUS_PENDING,
                revision = 1,
                updatedAt = now,
                deletedAt = null,
            ),
        )
        sync.enqueueRoutine(id)
        sync.flushOutbox()
        return id
    }
}
