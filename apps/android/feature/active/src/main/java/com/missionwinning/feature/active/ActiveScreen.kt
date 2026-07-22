package com.missionwinning.feature.active

import android.content.Intent
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
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
import com.missionwinning.core.designsystem.MwSecondaryButton
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwSetRow
import com.missionwinning.core.designsystem.MwSpace
import com.missionwinning.core.designsystem.MwStepper
import com.missionwinning.core.designsystem.MwTypography
import com.missionwinning.core.model.ExerciseCatalog
import com.missionwinning.core.model.ExerciseDef
import com.missionwinning.core.model.LoggedSet
import com.missionwinning.core.model.SetKind
import kotlinx.coroutines.delay

@Composable
fun ActiveRoute(
    sessionId: String,
    workoutName: String,
    targetSets: Int,
    onFinished: (
        name: String,
        sets: Int,
        duration: Int,
        workouts: Int,
        volume: Double,
        weightUnit: String,
        workoutId: String,
    ) -> Unit,
    onCancel: () -> Unit,
    viewModel: ActiveViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(sessionId, workoutName, targetSets) {
        viewModel.start(sessionId, workoutName, targetSets)
    }

    LaunchedEffect(state.finished) {
        state.finished?.let { f ->
            onFinished(f.name, f.sets, f.duration, f.workouts, f.volume, f.weightUnit, f.workoutId)
            viewModel.onEvent(ActiveEvent.ClearFinished)
        }
    }

    KeepScreenOn()
    ActiveSessionForeground()

    ActiveScreen(
        state = state,
        onEvent = viewModel::onEvent,
        onCancel = onCancel,
        searchExercises = { q, equip, muscle -> viewModel.searchExercises(q, equip, muscle) },
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

/**
 * Starts the ongoing-session foreground service so swipe-away does not kill the log.
 * Service package lives in :app; resolved by class name to avoid a circular module dep.
 */
@Composable
private fun ActiveSessionForeground() {
    val context = LocalContext.current.applicationContext
    DisposableEffect(Unit) {
        runCatching {
            val cls = Class.forName("com.missionwinning.app.session.ActiveSessionService")
            val intent = Intent(context, cls)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }
        onDispose {
            runCatching {
                val cls = Class.forName("com.missionwinning.app.session.ActiveSessionService")
                val intent = Intent(context, cls).setAction(
                    "com.missionwinning.app.STOP_SESSION_SERVICE",
                )
                context.startService(intent)
            }
            com.missionwinning.core.common.ActiveSessionHub.clear()
        }
    }
}

/** Flat list model for LazyColumn keys + scroll-to-current. */
private sealed class ActiveListRow {
    data object Header : ActiveListRow()
    data object AllDone : ActiveListRow()
    data object Empty : ActiveListRow()
    data object Current : ActiveListRow()
    data class Section(
        val exerciseId: String,
        val name: String,
        val index: Int,
        val total: Int,
        val supersetGroup: String,
    ) : ActiveListRow()
    data class SetItem(val set: LoggedSet) : ActiveListRow()
    data class Error(val message: String) : ActiveListRow()
    data object FooterPad : ActiveListRow()
}

@Composable
fun ActiveScreen(
    state: ActiveUiState,
    onEvent: (ActiveEvent) -> Unit,
    onCancel: () -> Unit,
    searchExercises: suspend (String, String?, String?) -> List<ExerciseDef> = { q, e, m ->
        ExerciseCatalog.search(q, e, m)
    },
) {
    val progress = if (state.totalSets == 0) 0f else state.doneCount.toFloat() / state.totalSets
    val currentId = ActiveSessionLogic.currentSetId(state.exercises)
    val currentSet = state.exercises.flatMap { it.sets }.find { it.id == currentId }
    val allDone = ActiveSessionLogic.allDone(state.exercises)
    var elapsed by remember { mutableLongStateOf(0L) }
    var confirmDiscard by remember { mutableStateOf(false) }
    var confirmPartialFinish by remember { mutableStateOf(false) }
    var showAddExercise by remember { mutableStateOf(false) }
    var showPlates by remember { mutableStateOf(false) }
    var pendingRemoveExerciseId by remember { mutableStateOf<String?>(null) }
    var pendingRemoveExerciseName by remember { mutableStateOf("") }
    val view = LocalView.current
    val context = LocalContext.current
    var prevRest by remember { mutableStateOf(0) }
    val listState = rememberLazyListState()

    val rows = remember(state.exercises, currentId, allDone, state.error) {
        buildList {
            add(ActiveListRow.Header)
            if (allDone) add(ActiveListRow.AllDone)
            if (state.exercises.isEmpty()) add(ActiveListRow.Empty)
            if (currentSet != null) add(ActiveListRow.Current)
            val total = state.exercises.size
            state.exercises.forEachIndexed { idx, exercise ->
                val label = if (exercise.supersetGroup.isNotBlank()) {
                    "${exercise.supersetGroup}${idx + 1} · ${exercise.name}"
                } else {
                    exercise.name
                }
                add(
                    ActiveListRow.Section(
                        exerciseId = exercise.exerciseId,
                        name = label,
                        index = idx,
                        total = total,
                        supersetGroup = exercise.supersetGroup,
                    ),
                )
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
            showAddExercise -> showAddExercise = false
            pendingRemoveExerciseId != null -> pendingRemoveExerciseId = null
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
            if (state.restVibrate) {
                playPatternedHaptic(context, REST_END_PATTERN_MS)
            }
            if (state.restBeep) {
                playRestEndBeep()
            }
        }
        prevRest = state.restSeconds
    }
    LaunchedEffect(state.lastPrSetId) {
        if (state.lastPrSetId == null) return@LaunchedEffect
        if (state.restVibrate) {
            playPatternedHaptic(context, PR_PATTERN_MS)
        }
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
                                    title = "No exercises yet",
                                    body = "Add from the offline catalog to start logging, or cancel.",
                                    cta = "Add exercise",
                                    onCta = { showAddExercise = true },
                                )
                                MwGhostButton(
                                    text = "Cancel workout",
                                    contentDescription = "Cancel workout without saving",
                                    onClick = { confirmDiscard = true },
                                )
                            }
                            ActiveListRow.Current -> {
                                val set = currentSet ?: return@items
                                val exIndex = ActiveSessionLogic.currentExerciseIndex(state.exercises)
                                val exTotal = ActiveSessionLogic.exerciseCount(state.exercises)
                                val nextEx = ActiveSessionLogic.nextExerciseName(state.exercises)
                                val setInEx = ActiveSessionLogic.currentSetInExercise(state.exercises)
                                val ex = state.exercises.find { it.exerciseId == set.exerciseId }
                                CurrentSetCard(
                                    set = set,
                                    weightUnit = state.weightUnit,
                                    exerciseIndex = exIndex,
                                    exerciseTotal = exTotal,
                                    setInExercise = setInEx?.first,
                                    setsInExercise = setInEx?.second,
                                    nextExerciseName = nextEx,
                                    canAddSet = (setInEx?.second ?: 0) < ActiveSessionLogic.MAX_SETS_PER_EXERCISE,
                                    canRemoveSet = true,
                                    onComplete = {
                                        onEvent(ActiveEvent.ToggleSet(set.id))
                                    },
                                    onRepsDelta = { d ->
                                        onEvent(ActiveEvent.UpdateReps(set.id, set.reps + d))
                                    },
                                    onWeightDelta = { d ->
                                        val step = ActiveSessionLogic.weightStep(state.weightUnit)
                                        onEvent(ActiveEvent.UpdateWeight(set.id, set.weight + d * step))
                                    },
                                    onRpe = { rpe ->
                                        onEvent(ActiveEvent.UpdateRpe(set.id, rpe))
                                    },
                                    onNote = { note ->
                                        onEvent(ActiveEvent.UpdateNote(set.id, note))
                                    },
                                    onCycleKind = {
                                        onEvent(ActiveEvent.CycleSetKind(set.id))
                                    },
                                    onAddSet = {
                                        onEvent(ActiveEvent.AddSet(set.exerciseId))
                                    },
                                    onRemoveSet = {
                                        onEvent(ActiveEvent.RemoveSet(set.id))
                                    },
                                    onApplyPrevious = {
                                        onEvent(ActiveEvent.ApplyPrevious(set.id))
                                    },
                                    onShowPlates = { showPlates = true },
                                    exerciseRestSeconds = ex?.defaultRestSeconds,
                                    onExerciseRest = { sec ->
                                        onEvent(ActiveEvent.SetExerciseRest(set.exerciseId, sec))
                                    },
                                )
                            }
                            is ActiveListRow.Section -> {
                                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically,
                                    ) {
                                        MwSectionLabel(row.name)
                                        MwGhostButton(
                                            text = "Remove",
                                            contentDescription = "Remove ${row.name} from session",
                                            onClick = {
                                                pendingRemoveExerciseId = row.exerciseId
                                                pendingRemoveExerciseName = row.name
                                            },
                                            modifier = Modifier.fillMaxWidth(0.32f),
                                        )
                                    }
                                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                        MwChip(
                                            text = if (row.supersetGroup.isBlank()) {
                                                "Superset"
                                            } else {
                                                "SS ${row.supersetGroup}"
                                            },
                                            tone = if (row.supersetGroup.isBlank()) {
                                                MwChipTone.Neutral
                                            } else {
                                                MwChipTone.Brass
                                            },
                                            contentDescription = "Cycle superset group",
                                            onClick = {
                                                onEvent(ActiveEvent.CycleSuperset(row.exerciseId))
                                            },
                                        )
                                        if (row.index > 0) {
                                            MwChip(
                                                text = "↑",
                                                tone = MwChipTone.Neutral,
                                                contentDescription = "Move exercise up",
                                                onClick = {
                                                    onEvent(ActiveEvent.MoveExercise(row.exerciseId, -1))
                                                },
                                            )
                                        }
                                        if (row.index < row.total - 1) {
                                            MwChip(
                                                text = "↓",
                                                tone = MwChipTone.Neutral,
                                                contentDescription = "Move exercise down",
                                                onClick = {
                                                    onEvent(ActiveEvent.MoveExercise(row.exerciseId, 1))
                                                },
                                            )
                                        }
                                    }
                                }
                            }
                            is ActiveListRow.SetItem -> {
                                val set = row.set
                                val weightPart = if (set.weight > 0) {
                                    ActiveSessionLogic.formatWeightWithUnit(set.weight, state.weightUnit)
                                } else {
                                    null
                                }
                                val kindShort = SetKind.shortLabel(set.kind)
                                val detail = buildString {
                                    if (kindShort.isNotEmpty()) {
                                        append(kindShort)
                                    }
                                    if (weightPart != null) {
                                        if (isNotEmpty()) append(" · ")
                                        append(weightPart)
                                    }
                                    set.rpe?.let {
                                        if (isNotEmpty()) append(" · ")
                                        append("RPE $it")
                                    }
                                    if (set.note.isNotBlank()) {
                                        if (isNotEmpty()) append(" · ")
                                        append("📝")
                                    }
                                    if (set.isPr) {
                                        if (isNotEmpty()) append(" · ")
                                        append("PR")
                                    }
                                }.ifBlank { null }
                                MwSetRow(
                                    index = set.setIndex,
                                    reps = set.reps,
                                    done = set.done,
                                    isCurrent = false,
                                    weightLabel = detail,
                                    onToggle = {
                                        onEvent(ActiveEvent.ToggleSet(set.id))
                                    },
                                )
                                if (set.isPr && set.done) {
                                    MwChip(
                                        text = "New PR",
                                        tone = MwChipTone.Brass,
                                        contentDescription = "New personal record",
                                    )
                                }
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
                    if (state.lastPrSetId != null) {
                        MwChip(
                            text = "New PR · e1RM",
                            tone = MwChipTone.Brass,
                            contentDescription = "New personal record",
                        )
                    }
                    MwRestDock(
                        secondsLeft = state.restSeconds,
                        totalSeconds = state.restTotalSeconds,
                        onMinus = { onEvent(ActiveEvent.RestMinus15) },
                        onSkip = { onEvent(ActiveEvent.RestSkip) },
                        onPlus = { onEvent(ActiveEvent.RestPlus15) },
                    )
                    if (state.exercises.size < ActiveSessionLogic.MAX_EXERCISES && !state.finishing) {
                        MwGhostButton(
                            text = "Add exercise",
                            contentDescription = "Add exercise from offline catalog",
                            onClick = { showAddExercise = true },
                        )
                    }
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

        if (showAddExercise) {
            AddExerciseSheet(
                existingIds = state.exercises.map { it.exerciseId }.toSet(),
                search = searchExercises,
                onPick = { def ->
                    onEvent(ActiveEvent.AddExercise(def.id, def.name))
                    showAddExercise = false
                },
                onCreateCustom = { name ->
                    onEvent(ActiveEvent.CreateCustomExercise(name))
                    showAddExercise = false
                },
                onDismiss = { showAddExercise = false },
            )
        }

        if (showPlates && currentSet != null) {
            PlateSheet(
                weight = currentSet.weight,
                unit = state.weightUnit,
                barWeight = state.barWeight,
                onDismiss = { showPlates = false },
            )
        }

        pendingRemoveExerciseId?.let { exerciseId ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.65f))
                    .padding(24.dp),
                contentAlignment = Alignment.Center,
            ) {
                MwConfirmSheet(
                    title = "Remove ${pendingRemoveExerciseName.ifBlank { "exercise" }}?",
                    body = "All sets for this exercise leave the session. Completed sets on it will not be saved.",
                    confirmLabel = "Remove exercise",
                    cancelLabel = "Keep",
                    onConfirm = {
                        onEvent(ActiveEvent.RemoveExercise(exerciseId))
                        pendingRemoveExerciseId = null
                        pendingRemoveExerciseName = ""
                    },
                    onDismiss = {
                        pendingRemoveExerciseId = null
                        pendingRemoveExerciseName = ""
                    },
                )
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
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                "Alert",
                style = MwTypography.labelMedium,
                color = MwColors.TextMuted,
            )
            MwChip(
                text = "Vibrate",
                tone = if (state.restVibrate) MwChipTone.Emerald else MwChipTone.Neutral,
                contentDescription = if (state.restVibrate) {
                    "Rest vibrate on"
                } else {
                    "Rest vibrate off"
                },
                onClick = { onEvent(ActiveEvent.ToggleRestVibrate) },
            )
            MwChip(
                text = "Beep",
                tone = if (state.restBeep) MwChipTone.Emerald else MwChipTone.Neutral,
                contentDescription = if (state.restBeep) {
                    "Rest beep on"
                } else {
                    "Rest beep off"
                },
                onClick = { onEvent(ActiveEvent.ToggleRestBeep) },
            )
        }
    }
}

private val REST_END_PATTERN_MS = longArrayOf(0, 70, 50, 70, 50, 120)
private val PR_PATTERN_MS = longArrayOf(0, 80, 40, 80, 40, 80)

private fun playPatternedHaptic(context: android.content.Context, patternMs: LongArray) {
    runCatching {
        val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            context.getSystemService(VibratorManager::class.java)?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Vibrator::class.java)
        } ?: return
        if (!vibrator.hasVibrator()) return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createWaveform(patternMs, -1))
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(patternMs, -1)
        }
    }
}

private fun playRestEndBeep() {
    runCatching {
        val tone = ToneGenerator(AudioManager.STREAM_NOTIFICATION, 80)
        tone.startTone(ToneGenerator.TONE_PROP_ACK, 180)
        // Release after tone; short delay via post is overkill for a one-shot beep.
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
            runCatching { tone.release() }
        }, 250)
    }
}

@Composable
private fun CurrentSetCard(
    set: LoggedSet,
    weightUnit: String,
    onComplete: () -> Unit,
    onRepsDelta: (Int) -> Unit,
    onWeightDelta: (Int) -> Unit,
    onRpe: (Int?) -> Unit,
    onNote: (String) -> Unit,
    onCycleKind: () -> Unit,
    onAddSet: () -> Unit,
    onRemoveSet: () -> Unit,
    onApplyPrevious: () -> Unit,
    onShowPlates: () -> Unit,
    exerciseRestSeconds: Int? = null,
    onExerciseRest: (Int?) -> Unit = {},
    exerciseIndex: Int? = null,
    exerciseTotal: Int = 0,
    setInExercise: Int? = null,
    setsInExercise: Int? = null,
    nextExerciseName: String? = null,
    canAddSet: Boolean = true,
    canRemoveSet: Boolean = true,
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
    val kindTone = when (set.kind) {
        SetKind.Warmup -> MwChipTone.Brass
        SetKind.Failure -> MwChipTone.Danger
        SetKind.Drop -> MwChipTone.Neutral
        SetKind.Normal -> MwChipTone.Emerald
    }
    val kindChipText = SetKind.displayLabel(set.kind)

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
        if (set.weight > 0) {
            MwGhostButton(
                text = "Plate calc",
                contentDescription = "Show plate loading for this weight",
                onClick = onShowPlates,
            )
        }
        Text(
            "Note (optional)",
            style = MwTypography.labelSmall,
            color = MwColors.TextMuted,
        )
        OutlinedTextField(
            value = set.note,
            onValueChange = onNote,
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            placeholder = { Text("Form cue, pause, etc.") },
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = MwColors.Text,
                unfocusedTextColor = MwColors.Text,
                focusedContainerColor = MwColors.NavyDeep,
                unfocusedContainerColor = MwColors.NavyDeep,
                focusedBorderColor = MwColors.Emerald,
                unfocusedBorderColor = MwColors.Border,
                cursorColor = MwColors.Emerald,
                focusedPlaceholderColor = MwColors.TextMuted,
                unfocusedPlaceholderColor = MwColors.TextMuted,
            ),
        )
        Text(
            "Rest for this exercise",
            style = MwTypography.labelSmall,
            color = MwColors.TextMuted,
        )
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            MwChip(
                text = "Default",
                tone = if (exerciseRestSeconds == null) MwChipTone.Brass else MwChipTone.Neutral,
                contentDescription = "Use session default rest",
                onClick = { onExerciseRest(null) },
            )
            listOf(45, 60, 90, 120).forEach { sec ->
                MwChip(
                    text = "${sec}s",
                    tone = if (exerciseRestSeconds == sec) MwChipTone.Brass else MwChipTone.Neutral,
                    contentDescription = "Exercise rest $sec seconds",
                    onClick = { onExerciseRest(sec) },
                )
            }
        }
        Text(
            "Set type",
            style = MwTypography.labelSmall,
            color = MwColors.TextMuted,
        )
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            MwChip(
                text = kindChipText,
                tone = kindTone,
                contentDescription = "Set type $kindChipText, tap to change",
                onClick = onCycleKind,
            )
            Text(
                "Tap to cycle W · F · D",
                style = MwTypography.bodyMedium,
                color = MwColors.TextMuted,
            )
        }
        Text(
            "RPE (optional)",
            style = MwTypography.labelSmall,
            color = MwColors.TextMuted,
        )
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            (6..10).forEach { value ->
                MwChip(
                    text = value.toString(),
                    tone = if (set.rpe == value) MwChipTone.Brass else MwChipTone.Neutral,
                    contentDescription = if (set.rpe == value) {
                        "RPE $value selected, tap to clear"
                    } else {
                        "Set RPE $value"
                    },
                    onClick = {
                        onRpe(if (set.rpe == value) null else value)
                    },
                )
            }
        }
        MwPrimaryButton(
            text = "Complete set",
            contentDescription = "Complete set ${set.setIndex + 1}",
            onClick = onComplete,
        )
        if (canAddSet) {
            MwGhostButton(
                text = "Add set",
                contentDescription = "Add another set to ${set.exerciseName}",
                onClick = onAddSet,
            )
        }
        if (canRemoveSet) {
            MwGhostButton(
                text = "Remove set",
                contentDescription = "Remove set ${set.setIndex + 1}",
                onClick = onRemoveSet,
            )
        }
    }
}

private fun formatElapsed(seconds: Int): String {
    val m = seconds / 60
    val s = seconds % 60
    return "%d:%02d".format(m, s)
}

@Composable
private fun PlateSheet(
    weight: Double,
    unit: String,
    barWeight: Double,
    onDismiss: () -> Unit,
) {
    val result = remember(weight, unit, barWeight) {
        com.missionwinning.core.model.PlateCalculator.platesPerSide(
            target = weight,
            unit = unit,
            barWeight = barWeight,
        )
    }
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.72f))
            .padding(24.dp),
        contentAlignment = Alignment.Center,
    ) {
        MwCard(elevated = true) {
            MwSectionLabel("Plate calculator")
            Text(
                ActiveSessionLogic.formatWeightWithUnit(weight, unit),
                style = MwTypography.headlineMedium,
                color = MwColors.Text,
            )
            Text(
                result.summary,
                style = MwTypography.bodyMedium,
                color = MwColors.TextMuted,
            )
            Text(
                "Bar ${ActiveSessionLogic.formatWeightWithUnit(barWeight, unit)} · plates per side · free forever",
                style = MwTypography.labelMedium,
                color = MwColors.Brass,
            )
            MwPrimaryButton(text = "Done", onClick = onDismiss, contentDescription = "Close plate calculator")
        }
    }
}

@Composable
private fun AddExerciseSheet(
    existingIds: Set<String>,
    search: suspend (String, String?, String?) -> List<ExerciseDef>,
    onPick: (ExerciseDef) -> Unit,
    onCreateCustom: (String) -> Unit,
    onDismiss: () -> Unit,
) {
    var query by remember { mutableStateOf("") }
    var equip by remember { mutableStateOf<String?>(null) }
    var muscle by remember { mutableStateOf<String?>(null) }
    var results by remember { mutableStateOf(ExerciseCatalog.search("")) }
    var customName by remember { mutableStateOf("") }
    LaunchedEffect(query, equip, muscle) {
        results = search(query, equip, muscle)
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.72f))
            .padding(16.dp),
        contentAlignment = Alignment.Center,
    ) {
        MwCard(elevated = true, modifier = Modifier.fillMaxSize()) {
            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(MwSpace.sm),
            ) {
                MwSectionLabel("Add exercise")
                Text(
                    "Offline catalog + your custom moves · adds 3 working sets.",
                    style = MwTypography.bodyMedium,
                    color = MwColors.TextMuted,
                )
                OutlinedTextField(
                    value = query,
                    onValueChange = { query = it },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    label = { Text("Search name or muscle") },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = MwColors.Text,
                        unfocusedTextColor = MwColors.Text,
                        focusedContainerColor = MwColors.NavyDeep,
                        unfocusedContainerColor = MwColors.NavyDeep,
                        focusedBorderColor = MwColors.Emerald,
                        unfocusedBorderColor = MwColors.Border,
                        cursorColor = MwColors.Emerald,
                        focusedLabelColor = MwColors.TextMuted,
                        unfocusedLabelColor = MwColors.TextMuted,
                    ),
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    MwChip(
                        text = "All",
                        tone = if (equip == null) MwChipTone.Emerald else MwChipTone.Neutral,
                        contentDescription = "All equipment",
                        onClick = { equip = null },
                    )
                    MwChip(
                        text = "BW",
                        tone = if (equip == "bodyweight") MwChipTone.Emerald else MwChipTone.Neutral,
                        contentDescription = "Bodyweight",
                        onClick = { equip = "bodyweight" },
                    )
                    MwChip(
                        text = "DB",
                        tone = if (equip == "dumbbells") MwChipTone.Emerald else MwChipTone.Neutral,
                        contentDescription = "Dumbbells",
                        onClick = { equip = "dumbbells" },
                    )
                    MwChip(
                        text = "Gym",
                        tone = if (equip == "full-gym") MwChipTone.Emerald else MwChipTone.Neutral,
                        contentDescription = "Full gym",
                        onClick = { equip = "full-gym" },
                    )
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf(
                        null to "Any",
                        "chest" to "Chest",
                        "back" to "Back",
                        "quads" to "Legs",
                        "shoulders" to "Shoulders",
                        "core" to "Core",
                    ).forEach { (key, label) ->
                        MwChip(
                            text = label,
                            tone = if (muscle == key) MwChipTone.Emerald else MwChipTone.Neutral,
                            contentDescription = "Muscle $label",
                            onClick = { muscle = key },
                        )
                    }
                }
                OutlinedTextField(
                    value = customName,
                    onValueChange = { customName = it },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    label = { Text("Or create custom name") },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = MwColors.Text,
                        unfocusedTextColor = MwColors.Text,
                        focusedContainerColor = MwColors.NavyDeep,
                        unfocusedContainerColor = MwColors.NavyDeep,
                        focusedBorderColor = MwColors.Emerald,
                        unfocusedBorderColor = MwColors.Border,
                        cursorColor = MwColors.Emerald,
                        focusedLabelColor = MwColors.TextMuted,
                        unfocusedLabelColor = MwColors.TextMuted,
                    ),
                )
                if (customName.isNotBlank()) {
                    MwSecondaryButton(
                        text = "Add “${customName.trim()}”",
                        onClick = { onCreateCustom(customName.trim()) },
                        contentDescription = "Create custom exercise and add to session",
                    )
                }
                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(MwSpace.sm),
                ) {
                    items(results, key = { it.id }) { def ->
                        val already = def.id in existingIds
                        MwCard(
                            elevated = false,
                            onClick = { onPick(def) },
                        ) {
                            Text(def.name, style = MwTypography.titleMedium, color = MwColors.Text)
                            Text(
                                buildString {
                                    append(def.muscleGroups.joinToString(" · ").ifBlank { def.id })
                                    if (def.id.startsWith("custom-")) append(" · custom")
                                    if (already) append(" · in session (+sets)")
                                },
                                style = MwTypography.bodyMedium,
                                color = MwColors.TextMuted,
                            )
                        }
                    }
                    item { Spacer(Modifier.height(8.dp)) }
                }
                MwGhostButton(
                    text = "Cancel",
                    contentDescription = "Close add exercise",
                    onClick = onDismiss,
                )
            }
        }
    }
}
