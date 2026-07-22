package com.missionwinning.feature.auth

/**
 * Optional crash-reporting so :feature:auth does not depend on Sentry / :app.
 * Registered from MwApp.
 */
object CrashReportingBridge {
    @Volatile
    var isConfigured: () -> Boolean = { false }

    @Volatile
    var setEnabled: ((Boolean) -> Unit)? = null
}
