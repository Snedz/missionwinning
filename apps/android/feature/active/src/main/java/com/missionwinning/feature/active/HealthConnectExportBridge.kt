package com.missionwinning.feature.active

/**
 * Optional bridge so :feature:active does not depend on Health Connect.
 * :app registers the real writer at process start.
 */
object HealthConnectExportBridge {
    @Volatile
    var writer: (suspend (title: String, durationSeconds: Int) -> Boolean)? = null

    suspend fun write(title: String, durationSeconds: Int): Boolean {
        val w = writer ?: return false
        return runCatching { w(title, durationSeconds) }.getOrDefault(false)
    }
}
