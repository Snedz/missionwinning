package com.missionwinning.app.nav

object Routes {
    const val BOOT = "boot"
    const val IDAY = "iday"
    const val TODAY = "today"
    const val COACH = "coach"
    const val AUTH = "auth"
    const val CATALOG = "catalog"
    const val HISTORY = "history/{workoutId}"
    const val ACTIVE = "active/{sessionId}/{name}/{sets}"
    const val VICTORY = "victory/{name}/{sets}/{duration}/{workouts}/{volume}/{unit}"

    fun history(workoutId: String) = "history/${workoutId.encode()}"

    fun active(sessionId: String, name: String, sets: Int) =
        "active/${sessionId.encode()}/${name.encode()}/$sets"

    fun victory(
        name: String,
        sets: Int,
        duration: Int,
        workouts: Int,
        volume: Int = 0,
        unit: String = "kg",
    ) = "victory/${name.encode()}/$sets/$duration/$workouts/$volume/${unit.encode()}"

    private fun String.encode() = java.net.URLEncoder.encode(this, Charsets.UTF_8.name())
}
