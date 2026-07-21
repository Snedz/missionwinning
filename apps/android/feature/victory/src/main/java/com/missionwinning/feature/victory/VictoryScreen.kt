package com.missionwinning.feature.victory

import android.content.Intent
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
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
    workoutId: String = "",
    onCoach: () -> Unit,
    onToday: () -> Unit,
    onOpenRoutines: () -> Unit = {},
    viewModel: VictoryViewModel = hiltViewModel(),
) {
    LaunchedEffect(workoutName, sets, duration, workouts, volume, weightUnit, workoutId) {
        viewModel.bind(workoutName, sets, duration, workouts, volume, weightUnit, workoutId)
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
    val context = LocalContext.current
    val shareText = buildString {
        append("Mission Winning · ${state.workoutName.ifBlank { "Workout" }}")
        append(" · ${state.sets} sets · ${formatDuration(state.duration)}")
        if (state.volume > 0) {
            append(" · $volumeLabel vol")
        }
        append(" · logged offline (#${state.workouts})")
    }

    MwScreenScaffold {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .graphicsLayer {
                    scaleX = lockScale.value
                    scaleY = lockScale.value
                },
            verticalArrangement = Arrangement.spacedBy(MwSpace.md),
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

            if (state.canSaveRoutine) {
                MwCard(elevated = true) {
                    MwSectionLabel("Template")
                    Text(
                        "Save this session’s exercises as a routine you can start anytime offline.",
                        style = MwTypography.bodyMedium,
                        color = MwColors.TextMuted,
                    )
                    Spacer(Modifier.height(8.dp))
                    if (state.routineSaved) {
                        MwChip("Saved as routine", tone = MwChipTone.Emerald)
                        Spacer(Modifier.height(8.dp))
                        MwGhostButton(
                            text = "View routines",
                            contentDescription = "View routines",
                            onClick = onOpenRoutines,
                        )
                    } else {
                        MwPrimaryButton(
                            text = if (state.savingRoutine) "Saving…" else "Save as routine",
                            contentDescription = "Save workout as routine",
                            enabled = !state.savingRoutine,
                            onClick = { viewModel.saveAsRoutine() },
                        )
                        state.routineMessage?.let { msg ->
                            Spacer(Modifier.height(6.dp))
                            Text(msg, style = MwTypography.bodyMedium, color = MwColors.TextMuted)
                        }
                    }
                }
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
                MwGhostButton(
                    text = "Share session",
                    contentDescription = "Share session summary",
                    onClick = {
                        val intent = Intent(Intent.ACTION_SEND).apply {
                            type = "text/plain"
                            putExtra(Intent.EXTRA_TEXT, shareText)
                        }
                        context.startActivity(
                            Intent.createChooser(intent, "Share session"),
                        )
                    },
                )
                MwGhostButton(text = "Today", onClick = onToday)
            }
            Spacer(Modifier.height(8.dp))
        }
    }
}

private fun formatDuration(seconds: Int): String {
    val m = seconds / 60
    val s = seconds % 60
    return if (m > 0) "${m}m ${s}s" else "${s}s"
}
