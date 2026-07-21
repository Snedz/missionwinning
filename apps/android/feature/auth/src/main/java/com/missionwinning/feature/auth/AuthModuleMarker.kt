package com.missionwinning.feature.auth

/**
 * Auth UI currently lives in `:app` (`com.missionwinning.app.feature.auth`) because it
 * depends on Play Billing / Health Connect / CrashReporting entry points.
 * This module reserves the Gradle coordinate for extraction once those move to core.
 */
object AuthModuleMarker
