package com.missionwinning.core.designsystem

/**
 * Shared motion durations (ms) for hub / logger / ritual transitions.
 * Respect [LocalReduceMotion] — callers should skip animation when reduced.
 */
object MwMotion {
    /** Hub peer-tab fade */
    const val HubTabMs = 200
    /** Stack push (Today → Active) */
    const val RoutePushMs = 320
    /** Stack pop */
    const val RoutePopMs = 280
    /** Screen enter fade (Today, I-Day) */
    const val EnterFadeMs = 420
    /** Victory lock scale */
    const val VictoryLockMs = 420
    /** Set-complete / PR micro pulse */
    const val PulseMs = 180
}
