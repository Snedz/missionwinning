package com.missionwinning.core.designsystem

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val MwDarkScheme = darkColorScheme(
    primary = MwColors.Emerald,
    onPrimary = MwColors.Text,
    secondary = MwColors.Brass,
    onSecondary = MwColors.Navy,
    background = MwColors.Navy,
    onBackground = MwColors.Text,
    surface = MwColors.NavyElevated,
    onSurface = MwColors.Text,
    onSurfaceVariant = MwColors.TextMuted,
    outline = MwColors.Border,
    error = Color(0xFFE85D5D),
)

@Composable
fun MissionWinningTheme(
    darkTheme: Boolean = true,
    content: @Composable () -> Unit,
) {
    // Product is navy-first; ignore light system for wedge v1
    val scheme = if (darkTheme || isSystemInDarkTheme()) MwDarkScheme else MwDarkScheme
    MaterialTheme(
        colorScheme = scheme,
        typography = MwTypography,
        content = content,
    )
}
