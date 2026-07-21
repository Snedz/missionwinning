package com.missionwinning.feature.active

import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwGhostButton
import com.missionwinning.core.designsystem.MwHeroTitle
import com.missionwinning.core.designsystem.MwPrimaryButton
import com.missionwinning.core.designsystem.MwRestTimer
import com.missionwinning.core.designsystem.MwScreenScaffold
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwSetRow
import com.missionwinning.core.designsystem.MwTypography
import com.missionwinning.core.model.LoggedSet

@Composable
fun ActiveRoute(
    sessionId: String,
    workoutName: String,
    targetSets: Int,
    onFinished: (name: String, sets: Int, duration: Int, workouts: Int) -> Unit,
    onCancel: () -> Unit,
    viewModel: ActiveViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(sessionId, workoutName, targetSets) {
        viewModel.start(sessionId, workoutName, targetSets)
    }

    LaunchedEffect(state.finished) {
        state.finished?.let { f ->
            onFinished(f.name, f.sets, f.duration, f.workouts)
            viewModel.onEvent(ActiveEvent.ClearFinished)
        }
    }

    KeepScreenOn()

    ActiveScreen(
        state = state,
        onEvent = viewModel::onEvent,
        onCancel = onCancel,
    )
}

@Composable
private fun KeepScreenOn() {
    val activity = LocalContext.current as? ComponentActivity
    DisposableEffect(activity) {
        val window = activity?.window
        window?.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        onDispose { window?.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON) }
    }
}

@Composable
fun ActiveScreen(
    state: ActiveUiState,
    onEvent: (ActiveEvent) -> Unit,
    onCancel: () -> Unit,
) {
    val progress = if (state.totalSets == 0) 0f else state.doneCount.toFloat() / state.totalSets

    MwScreenScaffold {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            MwSectionLabel("Train")
            MwHeroTitle(state.workoutName.ifBlank { "Workout" })
            Text(
                "Log sets offline. Rest starts when you complete a set.",
                style = MwTypography.bodyMedium,
                color = MwColors.TextMuted,
            )

            LinearProgressIndicator(
                progress = { progress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp),
                color = MwColors.Emerald,
                trackColor = MwColors.Border,
                strokeCap = StrokeCap.Round,
            )
            Text(
                "${state.doneCount} / ${state.totalSets} sets · ${state.weightUnit}",
                style = MwTypography.labelMedium,
                color = MwColors.TextMuted,
            )

            if (state.restSeconds > 0) {
                MwRestTimer(secondsLeft = state.restSeconds)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    MwGhostButton(
                        text = "−15s",
                        contentDescription = "Shorten rest by 15 seconds",
                        onClick = { onEvent(ActiveEvent.RestMinus15) },
                        modifier = Modifier.weight(1f),
                    )
                    MwGhostButton(
                        text = "Skip rest",
                        contentDescription = "Skip rest timer",
                        onClick = { onEvent(ActiveEvent.RestSkip) },
                        modifier = Modifier.weight(1f),
                    )
                    MwGhostButton(
                        text = "+15s",
                        contentDescription = "Extend rest by 15 seconds",
                        onClick = { onEvent(ActiveEvent.RestPlus15) },
                        modifier = Modifier.weight(1f),
                    )
                }
            }

            if (state.exercises.isEmpty()) {
                Text(
                    "No exercises in this session. Cancel and pick another day on Today.",
                    style = MwTypography.bodyMedium,
                    color = MwColors.TextMuted,
                )
            }

            state.exercises.forEach { exercise ->
                Spacer(Modifier.height(4.dp))
                MwSectionLabel(exercise.name)
                exercise.sets.forEach { set ->
                    SetBlock(
                        set = set,
                        weightUnit = state.weightUnit,
                        isCurrent = !set.done &&
                            ActiveSessionLogic.currentSetId(state.exercises) == set.id,
                        onToggle = { onEvent(ActiveEvent.ToggleSet(set.id)) },
                        onReps = { onEvent(ActiveEvent.UpdateReps(set.id, it)) },
                        onWeight = { onEvent(ActiveEvent.UpdateWeight(set.id, it)) },
                    )
                }
            }

            state.error?.let {
                Text(it, style = MwTypography.bodyMedium, color = MwColors.Danger)
            }

            Spacer(Modifier.height(8.dp))
            MwPrimaryButton(
                text = if (state.finishing) "Saving…" else "Finish workout",
                contentDescription = if (state.finishing) {
                    "Saving workout"
                } else {
                    "Finish workout and save sets offline"
                },
                enabled = !state.finishing && ActiveSessionLogic.canFinish(state.exercises),
                onClick = { onEvent(ActiveEvent.Finish) },
            )
            MwGhostButton(
                text = "Cancel",
                contentDescription = "Cancel workout without saving",
                onClick = onCancel,
            )
        }
    }
}

@Composable
private fun SetBlock(
    set: LoggedSet,
    weightUnit: String,
    isCurrent: Boolean,
    onToggle: () -> Unit,
    onReps: (Int) -> Unit,
    onWeight: (Double) -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        MwSetRow(
            index = set.setIndex,
            reps = set.reps,
            done = set.done,
            isCurrent = isCurrent,
            onToggle = onToggle,
        )
        if (set.previousReps != null || set.previousWeight != null) {
            Text(
                "Previous  ${set.previousWeight ?: 0.0} $weightUnit × ${set.previousReps ?: "—"}",
                style = MwTypography.labelMedium,
                color = MwColors.Brass,
                modifier = Modifier.padding(start = 8.dp),
            )
        }
        if (isCurrent && !set.done) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                NumberField(
                    label = "Reps",
                    value = set.reps.toString(),
                    onChange = { it.toIntOrNull()?.let(onReps) },
                    modifier = Modifier.weight(1f),
                )
                NumberField(
                    label = weightUnit.uppercase(),
                    value = if (set.weight == 0.0) "" else set.weight.toString(),
                    onChange = { raw ->
                        if (raw.isBlank()) onWeight(0.0)
                        else raw.toDoubleOrNull()?.let(onWeight)
                    },
                    modifier = Modifier.weight(1f),
                )
            }
        }
    }
}

@Composable
private fun NumberField(
    label: String,
    value: String,
    onChange: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onChange,
        modifier = modifier,
        label = { Text(label) },
        singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
        colors = OutlinedTextFieldDefaults.colors(
            focusedTextColor = MwColors.Text,
            unfocusedTextColor = MwColors.Text,
            focusedContainerColor = MwColors.NavyElevated,
            unfocusedContainerColor = MwColors.NavyElevated,
            focusedBorderColor = MwColors.Emerald,
            unfocusedBorderColor = MwColors.Border,
            cursorColor = MwColors.Emerald,
            focusedLabelColor = MwColors.TextMuted,
            unfocusedLabelColor = MwColors.TextMuted,
        ),
    )
}
