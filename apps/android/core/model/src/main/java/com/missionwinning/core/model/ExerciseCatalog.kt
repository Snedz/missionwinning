package com.missionwinning.core.model

/**
 * Offline exercise library — Phase 1 logger parity.
 * IDs match LocalCoachSeed / mw-core seed plan where possible.
 */
data class ExerciseDef(
    val id: String,
    val name: String,
    /** Equipment profiles that can perform this move. */
    val equipment: Set<String>,
    val muscleGroups: List<String> = emptyList(),
    val isBodyweight: Boolean = false,
)

object ExerciseCatalog {
    private val BW = "bodyweight"
    private val DB = "dumbbells"
    private val GYM = "full-gym"

    val all: List<ExerciseDef> = listOf(
        // Bodyweight core
        e("pushup", "Push-up", setOf(BW, DB, GYM), listOf("chest", "triceps"), true),
        e("plank", "Plank", setOf(BW, DB, GYM), listOf("core"), true),
        e("squat", "Bodyweight squat", setOf(BW), listOf("quads", "glutes"), true),
        e("hip-hinge", "Hip hinge (bodyweight)", setOf(BW), listOf("hamstrings", "glutes"), true),
        e("row", "Inverted row / table row", setOf(BW), listOf("back"), true),
        e("chinup", "Chin-up", setOf(BW, GYM), listOf("back", "biceps"), true),
        e("pullup", "Pull-up", setOf(BW, GYM), listOf("back"), true),
        e("dip", "Dip", setOf(BW, GYM), listOf("chest", "triceps"), true),
        e("lunge", "Walking lunge", setOf(BW, DB, GYM), listOf("quads", "glutes"), true),
        e("glute-bridge", "Glute bridge", setOf(BW, DB, GYM), listOf("glutes"), true),
        e("side-plank", "Side plank", setOf(BW, DB, GYM), listOf("core"), true),
        e("burpee", "Burpee", setOf(BW), listOf("full body"), true),
        e("jumping-jack", "Jumping jack", setOf(BW), listOf("cardio"), true),
        e("mountain-climber", "Mountain climber", setOf(BW), listOf("core", "cardio"), true),
        e("walk", "Brisk walk", setOf(BW, DB, GYM), listOf("cardio"), true),
        e("hollow-hold", "Hollow body hold", setOf(BW, GYM), listOf("core"), true),
        // Dumbbell
        e("db-press", "Dumbbell bench press", setOf(DB, GYM), listOf("chest")),
        e("db-fly", "Dumbbell fly", setOf(DB, GYM), listOf("chest")),
        e("db-row", "Dumbbell row", setOf(DB, GYM), listOf("back")),
        e("db-curl", "Dumbbell curl", setOf(DB, GYM), listOf("biceps")),
        e("db-rdl", "Dumbbell RDL", setOf(DB, GYM), listOf("hamstrings", "glutes")),
        e("goblet-squat", "Goblet squat", setOf(DB, GYM), listOf("quads", "glutes")),
        e("db-shoulder-press", "Dumbbell shoulder press", setOf(DB, GYM), listOf("shoulders")),
        e("db-lateral-raise", "Lateral raise", setOf(DB, GYM), listOf("shoulders")),
        e("db-lunges", "Dumbbell lunge", setOf(DB, GYM), listOf("quads", "glutes")),
        e("db-tricep-extension", "Overhead tricep extension", setOf(DB, GYM), listOf("triceps")),
        // Full gym
        e("bench-press", "Barbell bench press", setOf(GYM), listOf("chest")),
        e("cable-fly", "Cable fly", setOf(GYM), listOf("chest")),
        e("back-squat", "Back squat", setOf(GYM), listOf("quads", "glutes")),
        e("romanian-deadlift", "Romanian deadlift", setOf(GYM), listOf("hamstrings", "glutes")),
        e("deadlift", "Conventional deadlift", setOf(GYM), listOf("posterior")),
        e("lat-pulldown", "Lat pulldown", setOf(GYM), listOf("back")),
        e("barbell-row", "Barbell row", setOf(GYM), listOf("back")),
        e("overhead-press", "Overhead press", setOf(GYM), listOf("shoulders")),
        e("leg-press", "Leg press", setOf(GYM), listOf("quads")),
        e("leg-curl", "Lying leg curl", setOf(GYM), listOf("hamstrings")),
        e("calf-raise", "Calf raise", setOf(DB, GYM), listOf("calves")),
        e("face-pull", "Face pull", setOf(GYM), listOf("rear delts")),
        e("hip-thrust", "Barbell hip thrust", setOf(GYM), listOf("glutes")),
        e("main", "Main lift", setOf(BW, DB, GYM), listOf("full body")),
    )

    private val byId: Map<String, ExerciseDef> = all.associateBy { it.id }

    fun get(id: String): ExerciseDef? = byId[normalizeId(id)]

    fun displayName(id: String): String {
        val key = normalizeId(id)
        return byId[key]?.name ?: humanize(key)
    }

    fun search(query: String, equipment: String? = null): List<ExerciseDef> {
        val q = query.trim().lowercase()
        val equip = equipment?.let { normalizeEquip(it) }
        return all.filter { def ->
            val equipOk = equip == null || equip in def.equipment
            val textOk = q.isEmpty() ||
                def.name.lowercase().contains(q) ||
                def.id.contains(q) ||
                def.muscleGroups.any { it.contains(q) }
            equipOk && textOk
        }
    }

    fun forEquipment(equipment: String): List<ExerciseDef> =
        search(query = "", equipment = equipment)

    private fun e(
        id: String,
        name: String,
        equipment: Set<String>,
        muscles: List<String>,
        bodyweight: Boolean = false,
    ) = ExerciseDef(id, name, equipment, muscles, bodyweight)

    private fun normalizeId(id: String): String =
        id.trim().lowercase().replace('_', '-')

    private fun normalizeEquip(raw: String): String =
        when (raw.trim().lowercase()) {
            "dumbbells", "db", "dumbbell" -> DB
            "full-gym", "full_gym", "gym", "fullgym" -> GYM
            else -> BW
        }

    private fun humanize(id: String): String =
        id.replace('-', ' ').replaceFirstChar { it.uppercase() }
}
