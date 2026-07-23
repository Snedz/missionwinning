package com.missionwinning.core.designsystem

import android.content.res.Configuration
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalConfiguration

/**
 * Width-based window size classes (Material Adaptive / fold-friendly).
 * Prefer width over orientation — unfolded Fold → Expanded even on "phone" devices.
 *
 * Compact  < 600dp  — phone portrait / narrow
 * Medium   600–839  — tablet portrait / landscape phone / half-fold
 * Expanded ≥ 840    — tablet landscape / unfolded fold / desktop
 */
enum class MwWidthSizeClass {
    Compact,
    Medium,
    Expanded,
}

fun calculateMwWidthSizeClass(widthDp: Int): MwWidthSizeClass = when {
    widthDp < 600 -> MwWidthSizeClass.Compact
    widthDp < 840 -> MwWidthSizeClass.Medium
    else -> MwWidthSizeClass.Expanded
}

fun calculateMwWidthSizeClass(configuration: Configuration): MwWidthSizeClass =
    calculateMwWidthSizeClass(configuration.screenWidthDp)

@Composable
fun rememberMwWidthSizeClass(): MwWidthSizeClass {
    val configuration = LocalConfiguration.current
    return remember(configuration.screenWidthDp) {
        calculateMwWidthSizeClass(configuration.screenWidthDp)
    }
}

/** Max content width for overlays by size class (dp). */
fun MwWidthSizeClass.overlayMaxWidthDp(): Int = when (this) {
    MwWidthSizeClass.Compact -> Int.MAX_VALUE // full bleed bottom sheet
    MwWidthSizeClass.Medium -> 560
    MwWidthSizeClass.Expanded -> 720
}
