package com.missionwinning.core.data

import com.missionwinning.core.model.ExerciseCatalog
import com.missionwinning.core.model.ExerciseDef
import java.util.UUID

/**
 * User-defined exercises stored offline (free forever). Not a sync entity yet —
 * ids are stable UUIDs so workout set rows remain portable.
 */
class CustomExerciseRepository(
    private val db: MwDatabase,
) {
    private val dao = db.dao()

    suspend fun all(): List<CustomExerciseEntity> = dao.allCustomExercises()

    suspend fun asExerciseDefs(): List<ExerciseDef> =
        all().map { it.toDef() }

    /**
     * Built-in catalog + custom, filtered like [ExerciseCatalog.search].
     * Custom matches appear first when the query is empty.
     */
    suspend fun search(query: String, equipment: String? = null): List<ExerciseDef> {
        val custom = asExerciseDefs().filter { def ->
            val equipOk = equipment == null ||
                equipment == "any" ||
                "any" in def.equipment ||
                equipment in def.equipment
            val q = query.trim().lowercase()
            val textOk = q.isEmpty() ||
                def.name.lowercase().contains(q) ||
                def.id.contains(q) ||
                def.muscleGroups.any { it.contains(q) }
            equipOk && textOk
        }
        val builtIn = ExerciseCatalog.search(query, equipment)
        // Prefer custom order first, then built-in (dedupe by id)
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
        )
        dao.upsertCustomExercise(row)
        return row
    }

    suspend fun delete(id: String) {
        dao.deleteCustomExercise(id)
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
