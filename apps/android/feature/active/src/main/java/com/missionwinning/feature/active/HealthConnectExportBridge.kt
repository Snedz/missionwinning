package com.missionwinning.feature.active

/**
 * Optional bridge so :feature:active does not depend on Health Connect.
 * :app registers the real writer at process start.
 */
object HealthConnectExportBridge {
    data class SessionExport(
        val title: String,
        val durationSeconds: Int,
        val totalVolume: Double = 0.0,
        val setCount: Int = 0,
        val weightUnit: String = "kg",
    )

    @Volatile
    var writer: (suspend (SessionExport) -> Boolean)? = null

    suspend fun write(
        title: String,
        durationSeconds: Int,
        totalVolume: Double = 0.0,
        setCount: Int = 0,
        weightUnit: String = "kg",
    ): Boolean {
        val w = writer ?: return false
        return runCatching {
            w(
                SessionExport(
                    title = title,
                    durationSeconds = durationSeconds,
                    totalVolume = totalVolume,
                    setCount = setCount,
                    weightUnit = weightUnit,
                ),
            )
        }.getOrDefault(false)
    }
}
