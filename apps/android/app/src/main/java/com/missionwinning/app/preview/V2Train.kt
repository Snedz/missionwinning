package com.missionwinning.app.preview

import androidx.activity.compose.PredictiveBackHandler
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.missionwinning.app.R
import com.missionwinning.core.model.ExerciseDef
import com.missionwinning.core.model.LoggedSet
import com.missionwinning.core.model.WeightUnits
import com.missionwinning.feature.active.ActiveEvent
import com.missionwinning.feature.active.ActiveScreen
import com.missionwinning.feature.active.ActiveSessionLogic
import com.missionwinning.feature.active.ActiveUiState
import kotlinx.coroutines.flow.collect

private enum class TrainDialog { Finish, Leave, Exercise }

@Composable
internal fun V2Train(
    state: ActiveUiState,
    onEvent: (ActiveEvent) -> Unit,
    onExit: () -> Unit,
    onDiscard: () -> Unit,
    search: suspend (String, String?, String?) -> List<ExerciseDef>,
) {
    var dialog by remember { mutableStateOf<TrainDialog?>(null) }
    var classic by rememberSaveable { mutableStateOf(false) }
    if (classic) {
        Column(Modifier.fillMaxSize()) {
            androidx.compose.foundation.layout.Box(Modifier.weight(1f)) {
                ActiveScreen(state, onEvent, onDiscard, search)
            }
            V2Theme {
                V2Secondary(stringResource(R.string.v2_back_to_train), Modifier.fillMaxWidth()) { classic = false }
            }
        }
        return
    }
    PredictiveBackHandler(enabled = dialog == null && !state.finishing) { progress ->
        progress.collect()
        dialog = TrainDialog.Leave
    }
    V2Theme {
        Column(Modifier.fillMaxSize().imePadding()) {
            V2Page(stringResource(R.string.v2_train), stringResource(R.string.v2_marker_train), bottomInset = true) {
                if (state.sessionId.isBlank()) {
                    Text(stringResource(R.string.v2_loading))
                    return@V2Page
                }
                Text(state.workoutName, style = MaterialTheme.typography.headlineSmall)
                V2Label(stringResource(R.string.v2_set_progress, state.doneCount, state.totalSets))
                if (state.restSeconds > 0) {
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            stringResource(R.string.v2_rest_seconds, state.restSeconds),
                            style = MaterialTheme.typography.titleMedium,
                        )
                        V2Secondary(stringResource(R.string.v2_skip_rest)) { onEvent(ActiveEvent.RestSkip) }
                    }
                }
                val currentId = ActiveSessionLogic.currentSetId(state.exercises)
                val current = state.exercises.firstNotNullOfOrNull { exercise -> exercise.sets.find { it.id == currentId } }
                if (current != null) {
                    V2Rule()
                    Text(current.exerciseName, Modifier.semantics { heading() }, style = MaterialTheme.typography.titleMedium)
                    ActiveSessionLogic.currentSetInExercise(state.exercises)?.let { (index, total) ->
                        Text(stringResource(R.string.v2_current_set, index, total))
                    }
                    SetEntry(current, state.weightUnit, !state.finishing, onEvent)
                } else if (state.exercises.isEmpty()) {
                    Text(stringResource(R.string.v2_empty_train))
                }
                state.error?.let {
                    Text(it, Modifier.semantics { liveRegion = LiveRegionMode.Polite }, color = V2Colors.Red)
                }
                if (state.doneCount > 0) {
                    V2Action(
                        stringResource(if (state.finishing) R.string.v2_saving else R.string.v2_finish),
                        enabled = !state.finishing,
                    ) {
                        if (state.remainingSets > 0) dialog = TrainDialog.Finish else onEvent(ActiveEvent.Finish)
                    }
                }
                if (!state.finishing) {
                    V2Secondary(stringResource(R.string.v2_add_exercise), Modifier.fillMaxWidth()) { dialog = TrainDialog.Exercise }
                    if (current != null) {
                        V2Secondary(stringResource(R.string.v2_add_set), Modifier.fillMaxWidth()) {
                            onEvent(ActiveEvent.AddSet(current.exerciseId))
                        }
                    }
                    V2Secondary(stringResource(R.string.v2_full_controls), Modifier.fillMaxWidth()) { classic = true }
                    V2Secondary(stringResource(R.string.v2_leave), Modifier.fillMaxWidth()) { dialog = TrainDialog.Leave }
                }
                state.exercises.forEach { exercise ->
                    val completed = exercise.sets.filter { it.done }
                    if (completed.isNotEmpty()) {
                        V2Label(exercise.name)
                        completed.forEach { set ->
                            Text(stringResource(R.string.v2_logged_set, set.setIndex + 1, set.reps, WeightUnits.formatWithUnit(set.weight, state.weightUnit)))
                        }
                    }
                }
            }
        }
        when (dialog) {
            TrainDialog.Finish -> TrainConfirmation(R.string.v2_finish_title, R.string.v2_finish_body, R.string.v2_finish, {
                dialog = null
                onEvent(ActiveEvent.Finish)
            }) { dialog = null }
            TrainDialog.Leave -> TrainConfirmation(R.string.v2_leave, R.string.v2_leave_body, R.string.v2_leave_confirm, {
                dialog = null
                onExit()
            }) { dialog = null }
            TrainDialog.Exercise -> ExercisePicker(search, onDismiss = { dialog = null }) {
                onEvent(ActiveEvent.AddExercise(it.id, it.name))
                dialog = null
            }
            null -> Unit
        }
    }
}

@Composable
private fun SetEntry(set: LoggedSet, unit: String, enabled: Boolean, onEvent: (ActiveEvent) -> Unit) {
    var reps by remember(set.id, set.reps) { mutableStateOf(set.reps.toString()) }
    var load by remember(set.id, set.weight, unit) { mutableStateOf(WeightUnits.format(set.weight)) }
    val previousWeight = set.previousWeight
    val previousReps = set.previousReps
    if (previousWeight != null && previousReps != null) {
        Text(stringResource(R.string.v2_last_set, previousReps, WeightUnits.formatWithUnit(previousWeight, unit)))
    }
    val repsField: @Composable (Modifier) -> Unit = { modifier ->
        OutlinedTextField(
            value = reps,
            onValueChange = { raw ->
                if (raw.isEmpty() || raw.toIntOrNull()?.let { it in 1..99 } == true) {
                    reps = raw
                    raw.toIntOrNull()?.let { onEvent(ActiveEvent.UpdateReps(set.id, it)) }
                }
            },
            modifier = modifier,
            enabled = enabled,
            label = { Text(stringResource(R.string.v2_reps)) },
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
        )
    }
    val loadField: @Composable (Modifier) -> Unit = { modifier ->
        OutlinedTextField(
            value = load,
            onValueChange = { raw ->
                val parsed = raw.replace(',', '.').toDoubleOrNull()
                if (raw.isEmpty() || parsed?.let { it.isFinite() && it >= 0 } == true) {
                    load = raw
                    parsed?.let { onEvent(ActiveEvent.UpdateWeight(set.id, it)) }
                }
            },
            modifier = modifier,
            enabled = enabled,
            label = { Text(stringResource(R.string.v2_weight, unit)) },
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
        )
    }
    BoxWithConstraints(Modifier.fillMaxWidth()) {
        if (maxWidth / LocalDensity.current.fontScale < 275.dp) {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                repsField(Modifier.fillMaxWidth())
                loadField(Modifier.fillMaxWidth())
            }
        } else {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                repsField(Modifier.weight(1f))
                loadField(Modifier.weight(1f))
            }
        }
    }
    V2Action(stringResource(R.string.v2_complete_set), enabled && reps.isNotEmpty() && load.isNotEmpty()) {
        onEvent(ActiveEvent.ToggleSet(set.id))
    }
}

@Composable
private fun ExercisePicker(
    search: suspend (String, String?, String?) -> List<ExerciseDef>,
    onDismiss: () -> Unit,
    onSelect: (ExerciseDef) -> Unit,
) {
    var query by rememberSaveable { mutableStateOf("") }
    var results by remember { mutableStateOf(emptyList<ExerciseDef>()) }
    var loadedQuery by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(query) {
        results = search(query, null, null).take(5)
        loadedQuery = query
    }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(stringResource(R.string.v2_add_exercise)) },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                OutlinedTextField(
                    value = query,
                    onValueChange = { query = it },
                    label = { Text(stringResource(R.string.v2_search_exercises)) },
                    singleLine = true,
                )
                if (loadedQuery == query) {
                    results.forEach { exercise -> V2Secondary(exercise.name, Modifier.fillMaxWidth()) { onSelect(exercise) } }
                    if (results.isEmpty()) Text(stringResource(R.string.v2_no_exercises))
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text(stringResource(R.string.v2_cancel)) } },
    )
}

@Composable
private fun TrainConfirmation(title: Int, body: Int, action: Int, confirm: () -> Unit, dismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = dismiss,
        title = { Text(stringResource(title)) },
        text = { Text(stringResource(body)) },
        confirmButton = { TextButton(onClick = confirm) { Text(stringResource(action)) } },
        dismissButton = { TextButton(onClick = dismiss) { Text(stringResource(R.string.v2_cancel)) } },
    )
}
