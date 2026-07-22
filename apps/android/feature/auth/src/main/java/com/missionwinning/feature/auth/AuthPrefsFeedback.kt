package com.missionwinning.feature.auth

/**
 * Pure copy helpers for Account Preferences feedback (unit-tested; used by [AuthViewModel]).
 */
object AuthPrefsFeedback {
    fun normalizeWeightUnit(unit: String): String =
        if (unit.equals("lb", ignoreCase = true)) "lb" else "kg"

    fun weightUnitMessage(normalizedUnit: String): String =
        if (normalizedUnit == "lb") "Weight unit: pounds" else "Weight unit: kilograms"

    fun equipmentLabel(profile: String): String =
        when (profile) {
            "dumbbells" -> "Dumbbells"
            "full-gym" -> "Full gym"
            else -> "Bodyweight"
        }

    fun reseedSuccessMessage(profile: String): String =
        "Week plan reseeded for ${equipmentLabel(profile)}"
}
