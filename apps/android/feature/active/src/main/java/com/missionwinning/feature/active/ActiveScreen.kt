package com.missionwinning.feature.active

import android.view.HapticFeedbackConstants
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
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

/** Flat list model for LazyColumn keys + scroll-to-current. */
private sealed class ActiveListRow {
    data object Header : ActiveListRow()
    data object AllDone : ActiveListRow()
    data object Empty : ActiveListRow()
    data object Current : ActiveListRow()
    data class Section(val exerciseId: String, val name: String) : ActiveListRow()
    data class SetItem(val set: LoggedSet) : ActiveListRow()
    data class Error(val message: String) : ActiveListRow()
    data object FooterPad : ActiveListRow()
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
    var confirmPartialFinish by remember { mutableStateOf(false) }
    val view = LocalView.current
    var prevRest by remember { mutableStateOf(0) }
    val listState = rememberLazyListState()

    val rows = remember(state.exercises, currentId, allDone, state.error) {
        buildList {
            add(ActiveListRow.Header)
            if (allDone) add(ActiveListRow.AllDone)
            if (state.exercises.isEmpty()) add(ActiveListRow.Empty)
            if (currentSet != null) add(ActiveListRow.Current)
            state.exercises.forEach { exercise ->
                add(ActiveListRow.Section(exercise.exerciseId, exercise.name))
                exercise.sets.forEach { set ->
                    if (set.id != currentId) {
                        add(ActiveListRow.SetItem(set))
                    }
                }
            }
            state.error?.let { add(ActiveListRow.Error(it)) }
            add(ActiveListRow.FooterPad)
        }
    }

    BackHandler {
        when {
            confirmPartialFinish -> confirmPartialFinish = false
            confirmDiscard -> confirmDiscard = false
            else -> confirmDiscard = true
        }
    }
    LaunchedEffect(state.sessionId, state.workoutName) {
        elapsed = 0L
        while (true) {
            delay(1000)
            elapsed += 1
        }
    }
    LaunchedEffect(state.restSeconds) {
        if (prevRest > 0 && state.restSeconds == 0) {
            view.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS)
        }
        prevRest = state.restSeconds
    }
    // Keep the current set card in view as the logger advances
    LaunchedEffect(currentId, allDone, rows.size) {
        val target = when {
            currentId != null -> rows.indexOfFirst { it is ActiveListRow.Current }
            allDone -> rows.indexOfFirst { it is ActiveListRow.AllDone }
            else -> -1
        }
        if (target >= 0) {
            listState.animateScrollToItem(target)
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        MwScreenScaffold {
            Column(modifier = Modifier.fillMaxSize()) {
                LazyColumn(
                    state = listState,
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(MwSpace.md),
                ) {
                    items(
                        count = rows.size,
                        key = { i ->
                            when (val row = rows[i]) {
                                ActiveListRow.Header -> "header"
                                ActiveListRow.AllDone -> "alldone"
                                ActiveListRow.Empty -> "empty"
                                ActiveListRow.Current -> "current"
                                is ActiveListRow.Section -> "sec-${row.exerciseId}"
                                is ActiveListRow.SetItem -> "set-${row.set.id}"
                                is ActiveListRow.Error -> "error"
                                ActiveListRow.FooterPad -> "pad"
                            }
                        },
                    ) { i ->
                        when (val row = rows[i]) {
                            ActiveListRow.Header -> ActiveHeader(
                                state = state,
                                progress = progress,
                                elapsed = elapsed.toInt(),
                                onEvent = onEvent,
                            )
                            ActiveListRow.AllDone -> {
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
                            ActiveListRow.Empty -> {
                                MwEmptyState(
                                    title = "No exercises",
                                    body = "Cancel and pick another day on Today.",
                                    cta = "Cancel",
                                    onCta = onCancel,
                                )
                            }
                            ActiveListRow.Current -> {
                                val set = currentSet ?: return@items
                                val exIndex = ActiveSessionLogic.currentExerciseIndex(state.exercises)
                                val exTotal = ActiveSessionLogic.exerciseCount(state.exercises)
                                val nextEx = ActiveSessionLogic.nextExerciseName(state.exercises)
                                val setInEx = ActiveSessionLogic.currentSetInExercise(state.exercises)
                                CurrentSetCard(
                                    set = set,
                                    weightUnit = state.weightUnit,
                                    exerciseIndex = exIndex,
                                    exerciseTotal = exTotal,
                                    setInExercise = setInEx?.first,
                                    setsInExercise = setInEx?.second,
                                    nextExerciseName = nextEx,
                                    onComplete = {
                                        view.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS)
                                        onEvent(ActiveEvent.ToggleSet(set.id))
                                    },
                                    onRepsDelta = { d ->
                                        onEvent(ActiveEvent.UpdateReps(set.id, set.reps + d))
                                    },
                                    onWeightDelta = { d ->
                                        val step = ActiveSessionLogic.weightStep(state.weightUnit)
                                        onEvent(ActiveEvent.UpdateWeight(set.id, set.weight + d * step))
                                    },
                                    onApplyPrevious = {
                                        onEvent(ActiveEvent.ApplyPrevious(set.id))
                                    },
                                )
                            }
                            is ActiveListRow.Section -> MwSectionLabel(row.name)
                            is ActiveListRow.SetItem -> {
                                val set = row.set
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
                                        onEvent(ActiveEvent.ToggleSet(set.id))
                                    },
                                )
                            }
                            is ActiveListRow.Error -> {
                                MwCard(elevated = true) {
                                    Text(row.message, style = MwTypography.bodyMedium, color = MwColors.Danger)
                                    MwGhostButton(
                                        text = "Dismiss",
                                        contentDescription = "Dismiss error",
                                        onClick = { onEvent(ActiveEvent.ClearError) },
                                    )
                                }
                            }
                            ActiveListRow.FooterPad -> Spacer(Modifier.height(8.dp))
                        }
                    }
                }

                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    MwRestDock(
                        secondsLeft = state.restSeconds,
                        totalSeconds = state.restTotalSeconds,
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
                            if (!allDone && state.remainingSets > 0) {
                                confirmPartialFinish = true
                            } else {
                                onEvent(ActiveEvent.Finish)
                            }
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

        if (confirmPartialFinish) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.65f))
                    .padding(24.dp),
                contentAlignment = Alignment.Center,
            ) {
                MwConfirmSheet(
                    title = "Finish with sets left?",
                    body = "${state.remainingSets} set${if (state.remainingSets == 1) "" else "s"} still open. Only completed sets will be saved offline.",
                    confirmLabel = "Finish anyway",
                    cancelLabel = "Keep logging",
                    onConfirm = {
                        confirmPartialFinish = false
                        onEvent(ActiveEvent.Finish)
                    },
                    onDismiss = { confirmPartialFinish = false },
                )
            }
        }
    }
}

@Composable
private fun ActiveHeader(
    state: ActiveUiState,
    progress: Float,
    elapsed: Int,
    onEvent: (ActiveEvent) -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(MwSpace.md)) {
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
                MwChip(formatElapsed(elapsed), tone = MwChipTone.Brass)
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
            buildString {
                append("${state.doneCount} / ${state.totalSets} sets")
                if (state.liveVolume > 0) {
                    append(" · ")
                    append(ActiveSessionLogic.formatWeightWithUnit(state.liveVolume, state.weightUnit))
                    append(" vol")
                }
                append(" · tap ${state.weightUnit.uppercase()} to switch unit")
            },
            style = MwTypography.labelMedium,
            color = MwColors.TextMuted,
        )
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                "Rest",
                style = MwTypography.labelMedium,
                color = MwColors.TextMuted,
            )
            listOf(45, 60, 90, 120).forEach { sec ->
                MwChip(
                    text = "${sec}s",
                    tone = if (state.defaultRestSeconds == sec) {
                        MwChipTone.Brass
                    } else {
                        MwChipTone.Neutral
                    },
                    contentDescription = "Default rest $sec seconds",
                    onClick = { onEvent(ActiveEvent.SetDefaultRest(sec)) },
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
    exerciseIndex: Int? = null,
    exerciseTotal: Int = 0,
    setInExercise: Int? = null,
    setsInExercise: Int? = null,
    nextExerciseName: String? = null,
) {
    val hasPrevious = set.previousReps != null || set.previousWeight != null
    val prevWeight = set.previousWeight ?: 0.0
    val prevReps = set.previousReps
    val matchesPrevious =
        hasPrevious &&
            set.reps == (prevReps ?: set.reps) &&
            kotlin.math.abs(set.weight - prevWeight) < 0.01
    val sectionLabel = buildString {
        if (setInExercise != null && setsInExercise != null) {
            append("Set $setInExercise / $setsInExercise")
        } else {
            append("Current set · ${set.setIndex + 1}")
        }
        if (exerciseIndex != null && exerciseTotal > 0) {
            append(" · exercise $exerciseIndex/$exerciseTotal")
        }
    }

    MwCard(elevated = true, glow = true) {
        MwSectionLabel(sectionLabel)
        Text(set.exerciseName, style = MwTypography.headlineMedium, color = MwColors.Text)
        if (nextExerciseName != null) {
            Text(
                "Up next · $nextExerciseName",
                style = MwTypography.labelMedium,
                color = MwColors.TextMuted,
            )
        }
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
