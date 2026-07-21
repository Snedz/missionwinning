package com.missionwinning.feature.today

/**
 * Optional steps read so :feature:today does not depend on Health Connect / :app.
 * Registered from MwApp.
 */
object HealthConnectStepsBridge {
    @Volatile
    var reader: (suspend () -> Long?)? = null

    suspend fun readStepsToday(): Long? {
        val r = reader ?: return null
        return runCatching { r() }.getOrNull()
    }
}
