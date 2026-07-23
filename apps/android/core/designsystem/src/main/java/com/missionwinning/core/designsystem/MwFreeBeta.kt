package com.missionwinning.core.designsystem

/**
 * Free-first beta window (web NEXT_PUBLIC_FREE_BETA parity).
 * Hide Play subscribe / Super Bundle upsell until business payments live.
 * Flip to false when Play Billing + business Stripe are ready.
 */
object MwFreeBeta {
    const val ENABLED: Boolean = true
}
