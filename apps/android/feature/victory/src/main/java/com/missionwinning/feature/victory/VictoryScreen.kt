package com.missionwinning.feature.victory

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
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.missionwinning.core.designsystem.LocalReduceMotion
import com.missionwinning.core.designsystem.MwBrassRule
import com.missionwinning.core.designsystem.MwCard
import com.missionwinning.core.designsystem.MwChip
import com.missionwinning.core.designsystem.MwChipTone
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwGhostButton
import com.missionwinning.core.designsystem.MwMetricCard
import com.missionwinning.core.designsystem.MwOfflinePill
import com.missionwinning.core.designsystem.MwPrimaryButton
import com.missionwinning.core.designsystem.MwScreenScaffold
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwSpace
import com.missionwinning.core.designsystem.MwTypography
import com.missionwinning.core.model.WeightUnits

@Composable
fun VictoryScreen(
    workoutName: String,
    sets: Int,
    duration: Int,
    workouts: Int,
    volume: Int = 0,
    weightUnit: String = "kg",
    onCoach: () -> Unit,
    onToday: () -> Unit,
    viewModel: VictoryViewModel = hiltViewModel(),
) {
    LaunchedEffect(workoutName, sets, duration, workouts, volume, weightUnit) {
        viewModel.bind(workoutName, sets, duration, workouts, volume, weightUnit)
    }
    val state by viewModel.state.collectAsStateWithLifecycle()
    val coachFirst = state.coachFirst
    val reduceMotion = LocalReduceMotion.current
    val lockScale = remember { Animatable(if (reduceMotion) 1f else 0.92f) }
    LaunchedEffect(reduceMotion) {
        if (reduceMotion) return@LaunchedEffect
        lockScale.animateTo(1f, tween(420, easing = FastOutSlowInEasing))
    }

    val unit = WeightUnits.normalize(state.weightUnit)
    val volumeLabel = if (state.volume > 0) {
        "${WeightUnits.format(state.volume.toDouble())} $unit"
    } else {
        "—"
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
            Column(verticalArrangement = Arrangement.spacedBy(MwSpace.md)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    MwSectionLabel("Complete")
                    MwOfflinePill()
                }
                Text("Session locked", style = MwTypography.headlineLarge, color = MwColors.Text)
                MwBrassRule()
                Text(state.workoutName, style = MwTypography.titleLarge, color = MwColors.Emerald)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    MwChip("${state.sets} sets", tone = MwChipTone.Emerald)
                    MwChip(formatDuration(state.duration), tone = MwChipTone.Brass)
                    MwChip("#${state.workouts}", tone = MwChipTone.Neutral)
                }
                state.milestone?.let { line ->
                    Text(line, style = MwTypography.titleMedium, color = MwColors.Brass)
                }
                Text(
                    if (coachFirst) {
                        "Saved on this device. Coach adapts your week from this log — no wearable needed."
                    } else {
                        "Saved on this device. Keep logging — Mission Coach has your week."
                    },
                    style = MwTypography.bodyLarge,
                    color = MwColors.TextMuted,
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                MwMetricCard("Sets", state.sets.toString(), Modifier.weight(1f))
                MwMetricCard("Time", formatDuration(state.duration), Modifier.weight(1f))
                MwMetricCard("Volume", volumeLabel, Modifier.weight(1f))
            }

            MwCard(elevated = true, glow = true) {
                Text(
                    if (coachFirst) "Next: review Mission Coach" else "Next: rest or open Today",
                    style = MwTypography.titleMedium,
                    color = MwColors.Text,
                )
                Spacer(Modifier.height(4.dp))
                MwPrimaryButton(
                    text = if (coachFirst) "See Mission Coach" else "Back to Today",
                    contentDescription = if (coachFirst) "See Mission Coach" else "Back to Today",
                    onClick = if (coachFirst) onCoach else onToday,
                )
                MwGhostButton(text = "Today", onClick = onToday)
            }
        }
    }
}

private fun formatDuration(seconds: Int): String {
    val m = seconds / 60
    val s = seconds % 60
    return if (m > 0) "${m}m ${s}s" else "${s}s"
}
