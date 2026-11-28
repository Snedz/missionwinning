package com.missionwinning.core.model

data class OfflineCoachMove(
    val id: String,
    val name: String,
    val primary: Int,
    val equipmentMask: Int,
    val compound: Boolean,
    val strength: Boolean,
    val bodyweight: Boolean,
) {
    fun supports(profile: String): Boolean {
        val index = profiles.indexOf(profile)
        return index >= 0 && equipmentMask and (1 shl index) != 0
    }

    internal fun toExerciseDef(legacy: ExerciseDef?) = ExerciseDef(
        id = id,
        name = legacy?.name ?: name,
        equipment = legacy?.equipment.orEmpty() + profiles.filter(::supports),
        muscleGroups = legacy?.muscleGroups ?: listOf(focusGroups[primary].lowercase()),
        isBodyweight = legacy?.isBodyweight ?: bodyweight,
    )

    companion object {
        private val profiles = listOf("bodyweight", "dumbbells", "full-gym")
        val focusGroups = listOf("Chest", "Back", "Legs", "Shoulders", "Arms", "Core")
    }
}
