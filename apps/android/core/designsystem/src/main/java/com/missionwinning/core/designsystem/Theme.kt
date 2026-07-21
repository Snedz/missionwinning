package com.missionwinning.core.designsystem

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

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
    error = MwColors.Danger,
)

@Composable
fun MissionWinningTheme(
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = MwDarkScheme,
        typography = MwTypography,
    ) {
        ProvideMwMotion(content)
    }
}
