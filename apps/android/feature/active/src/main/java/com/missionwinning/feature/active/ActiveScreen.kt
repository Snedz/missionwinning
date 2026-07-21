package com.missionwinning.feature.active

import android.view.HapticFeedbackConstants
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.missionwinning.core.designsystem.MwCard
import com.missionwinning.core.designsystem.MwChip
import com.missionwinning.core.designsystem.MwChipTone
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwConfirmSheet
import com.missionwinning.core.designsystem.MwEmptyState
import com.missionwinning.core.designsystem.MwGhostButton
import com.missionwinning.core.designsystem.MwHeroTitle
import com.missionwinning.core.designsystem.MwPrimaryButton
import com.missionwinning.core.designsystem.MwRestDock
import com.missionwinning.core.designsystem.MwScreenScaffold
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwSetRow
import com.missionwinning.core.designsystem.MwSpace
import com.missionwinning.core.designsystem.MwStepper
import com.missionwinning.core.designsystem.MwTypography
import com.missionwinning.core.model.LoggedSet
import kotlinx.coroutines.delay

@Composable
fun ActiveRoute(
    sessionId: String,
    workoutName: String,
    targetSets: Int,
    onFinished: (name: String, sets: Int, duration: Int, workouts: Int, volume: Double, weightUnit: String) -> Unit,
    onCancel: () -> Unit,
    viewModel: ActiveViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(sessionId, workoutName, targetSets) {
        viewModel.start(sessionId, workoutName, targetSets)
    }

    LaunchedEffect(state.finished) {
        state.finished?.let { f ->
            onFinished(f.name, f.sets, f.duration, f.workouts, f.volume, f.weightUnit)
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
    val currentId = ActiveSessionLogic.currentSetId(state.exercises)
    val currentSet = state.exercises.flatMap { it.sets }.find { it.id == currentId }
    val allDone = ActiveSessionLogic.allDone(state.exercises)
    var elapsed by remember { mutableLongStateOf(0L) }
    var confirmDiscard by remember { mutableStateOf(false) }
    val view = LocalView.current
    var prevRest by remember { mutableStateOf(0) }
    BackHandler {
        if (confirmDiscard) {
            confirmDiscard = false
        } else {
            confirmDiscard = true
        }
    }
    LaunchedEffect(state.sessionId, state.workoutName) {
        elapsed = 0L
        while (true) {
            delay(1000)
            elapsed += 1
        }
    }
    // Pulse when rest timer hits zero
    LaunchedEffect(state.restSeconds) {
        if (prevRest > 0 && state.restSeconds == 0) {
            view.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS)
        }
        prevRest = state.restSeconds
    }

    Box(modifier = Modifier.fillMaxSize()) {
    MwScreenScaffold {
        Column(modifier = Modifier.fillMaxSize()) {
            Column(
                modifier = Modifier
                    .weight(1f)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(MwSpace.md),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column(Modifier.weight(1f)) {
                        MwSectionLabel("Train")
                        MwHeroTitle(state.workoutName.ifBlank { "Workout" })
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        MwChip(formatElapsed(elapsed.toInt()), tone = MwChipTone.Brass)
                        MwChip(
                            text = state.weightUnit.uppercase(),
                            tone = MwChipTone.Emerald,
                            contentDescription = "Toggle weight unit, currently ${state.weightUnit}",
                            onClick = { onEvent(ActiveEvent.ToggleWeightUnit) },
                        )
                    }
                }

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
                    "${state.doneCount} / ${state.totalSets} sets · tap ${state.weightUnit.uppercase()} to switch unit",
                    style = MwTypography.labelMedium,
                    color = MwColors.TextMuted,
                )

                if (allDone) {
                    MwCard(elevated = true, glow = true) {
                        MwSectionLabel("Session complete")
                        Text(
                            "All sets logged",
                            style = MwTypography.headlineMedium,
                            color = MwColors.Emerald,
                        )
                        Text(
                            "Finish to lock this workout offline. Coach will use it on the next plan refresh.",
                            style = MwTypography.bodyMedium,
                            color = MwColors.TextMuted,
                        )
                    }
                }

                if (state.exercises.isEmpty()) {
                    MwEmptyState(
                        title = "No exercises",
                        body = "Cancel and pick another day on Today.",
                        cta = "Cancel",
                        onCta = onCancel,
                    )
                }

                if (currentSet != null) {
                    CurrentSetCard(
                        set = currentSet,
                        weightUnit = state.weightUnit,
                        onComplete = {
                            view.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS)
                            onEvent(ActiveEvent.ToggleSet(currentSet.id))
                        },
                        onRepsDelta = { d ->
                            onEvent(ActiveEvent.UpdateReps(currentSet.id, currentSet.reps + d))
                        },
                        onWeightDelta = { d ->
                            val step = ActiveSessionLogic.weightStep(state.weightUnit)
                            onEvent(ActiveEvent.UpdateWeight(currentSet.id, currentSet.weight + d * step))
                        },
                        onApplyPrevious = {
                            onEvent(ActiveEvent.ApplyPrevious(currentSet.id))
                        },
                    )
                }

                state.exercises.forEach { exercise ->
                    MwSectionLabel(exercise.name)
                    exercise.sets.forEach { set ->
                        val isCurrent = set.id == currentId
                        if (!isCurrent) {
                            MwSetRow(
                                index = set.setIndex,
                                reps = set.reps,
                                done = set.done,
                                isCurrent = false,
                                weightLabel = if (set.weight > 0) {
                                    ActiveSessionLogic.formatWeightWithUnit(set.weight, state.weightUnit)
                                } else {
                                    null
                                },
                                onToggle = {
                                    if (!set.done) onEvent(ActiveEvent.ToggleSet(set.id))
                                },
                            )
                        }
                    }
                }

                state.error?.let {
                    Text(it, style = MwTypography.bodyMedium, color = MwColors.Danger)
                }

                Spacer(Modifier.height(8.dp))
            }

            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                MwRestDock(
                    secondsLeft = state.restSeconds,
                    onMinus = { onEvent(ActiveEvent.RestMinus15) },
                    onSkip = { onEvent(ActiveEvent.RestSkip) },
                    onPlus = { onEvent(ActiveEvent.RestPlus15) },
                )
                MwPrimaryButton(
                    text = when {
                        state.finishing -> "Saving…"
                        allDone -> "Finish workout · lock session"
                        else -> "Finish workout"
                    },
                    contentDescription = "Finish workout and save sets offline",
                    enabled = !state.finishing && ActiveSessionLogic.canFinish(state.exercises),
                    onClick = {
                        view.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS)
                        onEvent(ActiveEvent.Finish)
                    },
                )
                MwGhostButton(
                    text = "Discard session",
                    contentDescription = "Cancel workout without saving",
                    onClick = { confirmDiscard = true },
                )
            }
        }
    }

        if (confirmDiscard) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.65f))
                    .padding(24.dp),
                contentAlignment = Alignment.Center,
            ) {
                MwConfirmSheet(
                    title = "Discard session?",
                    body = "Sets you completed this session will not be saved.",
                    confirmLabel = "Discard",
                    cancelLabel = "Keep logging",
                    onConfirm = {
                        confirmDiscard = false
                        onCancel()
                    },
                    onDismiss = { confirmDiscard = false },
                )
            }
        }
    }
}

@Composable
private fun CurrentSetCard(
    set: LoggedSet,
    weightUnit: String,
    onComplete: () -> Unit,
    onRepsDelta: (Int) -> Unit,
    onWeightDelta: (Int) -> Unit,
    onApplyPrevious: () -> Unit,
) {
    val hasPrevious = set.previousReps != null || set.previousWeight != null
    val prevWeight = set.previousWeight ?: 0.0
    val prevReps = set.previousReps
    val matchesPrevious =
        hasPrevious &&
            set.reps == (prevReps ?: set.reps) &&
            kotlin.math.abs(set.weight - prevWeight) < 0.01

    MwCard(elevated = true, glow = true) {
        MwSectionLabel("Current set · ${set.setIndex + 1}")
        Text(set.exerciseName, style = MwTypography.headlineMedium, color = MwColors.Text)
        if (hasPrevious) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(Modifier.weight(1f)) {
                    Text(
                        "LAST SESSION",
                        style = MwTypography.labelSmall,
                        color = MwColors.Brass,
                    )
                    Text(
                        "${ActiveSessionLogic.formatWeightWithUnit(prevWeight, weightUnit)} × ${prevReps ?: "—"}",
                        style = MwTypography.titleMedium,
                        color = MwColors.Brass,
                    )
                }
                if (!matchesPrevious) {
                    MwGhostButton(
                        text = "Use last",
                        contentDescription = "Apply previous session reps and weight",
                        onClick = onApplyPrevious,
                        modifier = Modifier.fillMaxWidth(0.38f),
                    )
                } else {
                    MwChip("Match", tone = MwChipTone.Brass)
                }
            }
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            MwStepper(
                label = "Reps",
                value = set.reps.toString(),
                onMinus = { onRepsDelta(-1) },
                onPlus = { onRepsDelta(1) },
                modifier = Modifier.weight(1f),
            )
            MwStepper(
                label = weightUnit.uppercase(),
                value = ActiveSessionLogic.formatWeight(set.weight),
                onMinus = { onWeightDelta(-1) },
                onPlus = { onWeightDelta(1) },
                modifier = Modifier.weight(1f),
            )
        }
        MwPrimaryButton(
            text = "Complete set",
            contentDescription = "Complete set ${set.setIndex + 1}",
            onClick = onComplete,
        )
    }
}

private fun formatElapsed(seconds: Int): String {
    val m = seconds / 60
    val s = seconds % 60
    return "%d:%02d".format(m, s)
}
