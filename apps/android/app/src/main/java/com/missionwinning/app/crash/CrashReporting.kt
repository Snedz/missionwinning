package com.missionwinning.app.crash

import android.app.Application
import com.missionwinning.app.BuildConfig
import io.sentry.Sentry
import io.sentry.SentryEvent
import io.sentry.SentryOptions
import io.sentry.android.core.SentryAndroid

/**
 * Crash-only Sentry. No PII, no AAID, no performance traces by default.
 * Disabled when DSN empty or user toggles off in Account.
 */
object CrashReporting {
    @Volatile
    private var initialized = false

    fun init(app: Application, userEnabled: Boolean) {
        val dsn = BuildConfig.SENTRY_DSN.trim()
        if (dsn.isEmpty()) {
            initialized = false
            return
        }
        if (!userEnabled) {
            // Keep SDK off when user declined
            if (initialized) {
                Sentry.close()
                initialized = false
            }
            return
        }
        if (initialized) return
        SentryAndroid.init(app) { options ->
            options.dsn = dsn
            options.isEnabled = true
            options.sampleRate = 1.0
            options.tracesSampleRate = 0.0
            options.profilesSampleRate = 0.0
            options.isSendDefaultPii = false
            options.isEnableAutoSessionTracking = false
            options.isAttachScreenshot = false
            options.isAttachViewHierarchy = false
            options.isEnableUserInteractionTracing = false
            options.setBeforeSend { event: SentryEvent, _: Any? ->
                // Never attach user identity
                event.user = null
                event.request = null
                // Drop breadcrumbs that might hold free-text
                event.breadcrumbs = null
                event
            }
            options.setDiagnosticLevel(io.sentry.SentryLevel.ERROR)
            options.environment = if (BuildConfig.DEBUG) "debug" else "release"
            options.release = "com.missionwinning.app@${BuildConfig.VERSION_NAME}+${BuildConfig.VERSION_CODE}"
            // ANR + slow frames still useful; no network performance spans
            options.isAnrEnabled = true
        }
        initialized = true
    }

    fun setEnabled(app: Application, enabled: Boolean) {
        if (!enabled) {
            if (initialized) {
                Sentry.close()
                initialized = false
            }
            return
        }
        init(app, userEnabled = true)
    }

    fun isConfigured(): Boolean = BuildConfig.SENTRY_DSN.isNotBlank()
}
