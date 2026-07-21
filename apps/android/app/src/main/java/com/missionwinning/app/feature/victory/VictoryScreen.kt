package com.missionwinning.app.feature.victory

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp
import com.missionwinning.core.designsystem.LocalReduceMotion
import com.missionwinning.core.designsystem.MwBrassRule
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwGhostButton
import com.missionwinning.core.designsystem.MwMetricStyle
import com.missionwinning.core.designsystem.MwPrimaryButton
import com.missionwinning.core.designsystem.MwScreenScaffold
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwTypography

@Composable
fun VictoryScreen(
    workoutName: String,
    sets: Int,
    duration: Int,
    workouts: Int,
    onCoach: () -> Unit,
    onToday: () -> Unit,
) {
    val coachFirst = workouts in 1..3
    val reduceMotion = LocalReduceMotion.current
    val lockScale = remember { Animatable(if (reduceMotion) 1f else 0.92f) }
    LaunchedEffect(reduceMotion) {
        if (reduceMotion) return@LaunchedEffect
        lockScale.animateTo(1f, tween(420, easing = FastOutSlowInEasing))
    }

    MwScreenScaffold {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .graphicsLayer {
                    scaleX = lockScale.value
                    scaleY = lockScale.value
                },
            verticalArrangement = Arrangement.SpaceBetween,
        ) {
            Column(
                verticalArrangement = Arrangement.spacedBy(10.dp),
                horizontalAlignment = Alignment.Start,
            ) {
                MwSectionLabel("Complete")
                Text(
                    "Session locked",
                    style = MwTypography.headlineLarge,
                    color = MwColors.Text,
                )
                MwBrassRule()
                Text(workoutName, style = MwTypography.titleLarge, color = MwColors.Emerald)
                Text(
                    if (coachFirst) {
                        "Coach adapts your week from this log — no wearable needed."
                    } else {
                        "Keep logging. Mission Coach has your week."
                    },
                    style = MwTypography.bodyLarge,
                    color = MwColors.TextMuted,
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                MetricBlock(label = "Sets", value = sets.toString())
                MetricBlock(label = "Time", value = formatDuration(duration))
                MetricBlock(label = "Total", value = "#$workouts")
            }

            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                MwPrimaryButton(
                    text = if (coachFirst) "See Mission Coach" else "Back to Today",
                    onClick = if (coachFirst) onCoach else onToday,
                )
                MwGhostButton(text = "Today", onClick = onToday)
            }
        }
    }
}

@Composable
private fun MetricBlock(label: String, value: String) {
    Column(horizontalAlignment = Alignment.Start) {
        Text(label.uppercase(), style = MwTypography.labelSmall, color = MwColors.Brass)
        Spacer(Modifier.height(4.dp))
        Text(value, style = MwMetricStyle, color = MwColors.Text)
    }
}

private fun formatDuration(seconds: Int): String {
    val m = seconds / 60
    val s = seconds % 60
    return if (m > 0) "${m}m ${s}s" else "${s}s"
}
