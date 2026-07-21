package com.missionwinning.core.data

import com.missionwinning.core.model.ExerciseCatalog
import com.missionwinning.core.model.ExerciseDef
import java.util.UUID

/**
 * User-defined exercises stored offline (free forever). Sync via [SyncEngine] when signed in.
 */
class CustomExerciseRepository(
    private val db: MwDatabase,
    private val sync: SyncCoordinator? = null,
) {
    private val dao = db.dao()

    suspend fun all(): List<CustomExerciseEntity> =
        dao.allCustomExercises().filter { it.deletedAt == null }

    suspend fun asExerciseDefs(): List<ExerciseDef> =
        all().map { it.toDef() }

    /**
     * Built-in catalog + custom, filtered like [ExerciseCatalog.search].
     * Custom matches appear first when the query is empty.
     */
    suspend fun search(query: String, equipment: String? = null, muscle: String? = null): List<ExerciseDef> {
        val muscleKey = muscle?.trim()?.lowercase()?.takeIf { it.isNotEmpty() }
        val custom = asExerciseDefs().filter { def ->
            val equipOk = equipment == null ||
                equipment == "any" ||
                "any" in def.equipment ||
                equipment in def.equipment
            val muscleOk = muscleKey == null ||
                def.muscleGroups.any { it.lowercase().contains(muscleKey) }
            val q = query.trim().lowercase()
            val textOk = q.isEmpty() ||
                def.name.lowercase().contains(q) ||
                def.id.contains(q) ||
                def.muscleGroups.any { it.contains(q) }
            equipOk && muscleOk && textOk
        }
        val builtIn = ExerciseCatalog.search(query, equipment, muscle)
        val seen = mutableSetOf<String>()
        val out = ArrayList<ExerciseDef>(custom.size + builtIn.size)
        for (d in custom + builtIn) {
            if (seen.add(d.id)) out.add(d)
        }
        return out
    }

    suspend fun create(name: String, equipment: String = "any"): CustomExerciseEntity? {
        val trimmed = name.trim()
        if (trimmed.isBlank()) return null
        val id = "custom-${UUID.randomUUID()}"
        val now = java.time.Instant.now().toString()
        val row = CustomExerciseEntity(
            id = id,
            name = trimmed,
            createdAt = now,
            equipment = normalizeEquip(equipment),
            muscleGroups = "",
            syncStatus = SyncEngine.STATUS_PENDING,
            revision = 1,
            updatedAt = now,
            deletedAt = null,
        )
        dao.upsertCustomExercise(row)
        sync?.let {
            // Prefer SyncEngine enqueue when available
            runCatching {
                // SyncCoordinator does not expose engine; use outbox via flush after mark
            }
        }
        // Enqueue via SyncEngine through SyncCoordinator flush path: store outbox ref
        dao.enqueueOutbox(
            SyncOutboxEntity(
                id = "c-${UUID.randomUUID()}",
                kind = SyncEngine.KIND_CUSTOM_REF,
                payloadJson = id,
                createdAt = now,
                attempts = 0,
            ),
        )
        runCatching { sync?.flushOutbox() }
        return row
    }

    suspend fun delete(id: String) {
        val existing = dao.customExerciseById(id) ?: return
        val now = java.time.Instant.now().toString()
        dao.upsertCustomExercise(
            existing.copy(
                deletedAt = now,
                updatedAt = now,
                syncStatus = SyncEngine.STATUS_PENDING,
                revision = existing.revision + 1,
            ),
        )
        dao.enqueueOutbox(
            SyncOutboxEntity(
                id = "c-${UUID.randomUUID()}",
                kind = SyncEngine.KIND_CUSTOM_REF,
                payloadJson = id,
                createdAt = now,
                attempts = 0,
            ),
        )
        runCatching { sync?.flushOutbox() }
    }

    suspend fun displayName(id: String): String {
        dao.customExerciseById(id)?.name?.let { return it }
        return ExerciseCatalog.displayName(id)
    }

    private fun CustomExerciseEntity.toDef(): ExerciseDef {
        val equip = when (equipment) {
            "bodyweight" -> setOf("bodyweight", "dumbbells", "full-gym")
            "dumbbells" -> setOf("dumbbells", "full-gym")
            "full-gym" -> setOf("full-gym")
            else -> setOf("bodyweight", "dumbbells", "full-gym")
        }
        val muscles = muscleGroups.split(',')
            .map { it.trim() }
            .filter { it.isNotEmpty() }
        return ExerciseDef(
            id = id,
            name = name,
            equipment = equip,
            muscleGroups = muscles.ifEmpty { listOf("custom") },
            isBodyweight = equipment == "bodyweight",
        )
    }

    private fun normalizeEquip(raw: String): String = when (raw.lowercase()) {
        "bodyweight", "bw" -> "bodyweight"
        "dumbbells", "db" -> "dumbbells"
        "full-gym", "gym" -> "full-gym"
        else -> "any"
    }
}
