package com.missionwinning.app.preview

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.WindowInsetsSides
import androidx.compose.foundation.layout.only
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.missionwinning.app.R
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.data.SessionDraftRepository
import com.missionwinning.core.data.WorkoutLogEntity
import com.missionwinning.core.model.ExerciseCatalog
import com.missionwinning.core.model.WeightUnits
import com.missionwinning.core.network.CoachPlanDto
import com.missionwinning.core.network.PlanExerciseDto
import com.missionwinning.core.network.PlanSessionDto
import com.missionwinning.feature.today.HistoryViewModel
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

private data class TodayData(val plan: CoachPlanDto, val draft: SessionDraftRepository.DraftPayload?)
private data class VictoryData(val setCount: Int, val exerciseIds: List<String>)

@Composable
internal fun V2Today(
    repository: MwRepository,
    drafts: SessionDraftRepository,
    onStart: (String, String, Int) -> Unit,
    onQuickLog: () -> Unit,
    onHistory: () -> Unit,
) {
    val data by produceState<TodayData?>(null, repository, drafts) {
        value = TodayData(repository.ensureCoachPlan(preferNetwork = false).plan, drafts.load()?.takeIf { it.exercises.isNotEmpty() })
    }
    V2Theme {
        V2Page(stringResource(R.string.v2_today), stringResource(R.string.v2_marker_today)) {
            Text(stringResource(R.string.v2_offline_intro), style = MaterialTheme.typography.bodyLarge)
            val draft = data?.draft
            val next = data?.plan?.nextSession()
            when {
                draft != null -> {
                    V2Label(stringResource(R.string.v2_draft))
                    Text(draft.workoutName, style = MaterialTheme.typography.headlineSmall)
                    V2Action(stringResource(R.string.v2_resume)) { onStart(draft.sessionId, draft.workoutName, 0) }
                }
                next != null -> {
                    V2Label(stringResource(R.string.v2_next_session))
                    SessionSummary(next, data?.plan?.weightUnit)
                    V2Action(stringResource(R.string.v2_start)) { next.start(onStart) }
                }
                data == null -> Text(stringResource(R.string.v2_loading))
                else -> Text(stringResource(R.string.v2_no_next))
            }
            if (draft == null) {
                V2Secondary(stringResource(R.string.v2_quick_log), Modifier.fillMaxWidth(), onQuickLog)
            }
            V2Rule()
            V2Secondary(stringResource(R.string.v2_open_history), Modifier.fillMaxWidth(), onHistory)
        }
    }
}

@Composable
internal fun V2Coach(
    repository: MwRepository,
    change: V2Change?,
    onStart: (String, String, Int) -> Unit,
) {
    val plan by produceState<CoachPlanDto?>(null, repository, change) {
        value = repository.ensureCoachPlan(preferNetwork = false).plan
    }
    V2Theme {
        V2Page(stringResource(R.string.v2_coach), stringResource(R.string.v2_marker_coach)) {
            val current = plan
            if (current == null) {
                Text(stringResource(R.string.v2_loading))
            } else {
                V2Label(stringResource(R.string.v2_revision, current.revision))
                val next = current.nextSession()
                if (next != null) {
                    SessionSummary(next, current.weightUnit)
                    V2Action(stringResource(R.string.v2_start)) { next.start(onStart) }
                } else {
                    Text(stringResource(R.string.v2_no_next))
                }
                if (change?.plan == current) {
                    V2Rule()
                    Text(stringResource(R.string.v2_what_changed), style = MaterialTheme.typography.headlineSmall)
                    Text(stringResource(R.string.v2_marked_done, change.completedName))
                    change.targets.forEach { target ->
                        Text(target.sessionName, style = MaterialTheme.typography.titleMedium)
                        Text(exerciseName(target.after), style = MaterialTheme.typography.bodyLarge)
                        Text(stringResource(R.string.v2_before, prescription(target.before, current.weightUnit)))
                        Text(stringResource(R.string.v2_after, prescription(target.after, current.weightUnit)))
                    }
                }
            }
        }
    }
}

@Composable
internal fun V2Victory(
    repository: MwRepository,
    name: String,
    workoutId: String,
    change: V2Change?,
    onCoach: () -> Unit,
    onHistory: () -> Unit,
) {
    val workout by produceState<VictoryData?>(null, repository, workoutId) {
        val saved = repository.workoutById(workoutId)
        if (saved != null && saved.deletedAt.isNullOrBlank()) {
            val sets = repository.setsForWorkout(workoutId)
            value = VictoryData(sets.size, sets.map { it.exerciseId })
        }
    }
    val plan by produceState<CoachPlanDto?>(null, repository, workout, change) {
        value = if (!workout?.exerciseIds.isNullOrEmpty()) repository.ensureCoachPlan(preferNetwork = false).plan else null
    }
    V2Theme {
        V2Page(stringResource(R.string.v2_victory), stringResource(R.string.v2_marker_victory), bottomInset = true) {
            Text(name, style = MaterialTheme.typography.headlineSmall)
            workout?.let { Text(pluralStringResource(R.plurals.v2_saved_sets, it.setCount, it.setCount)) }
            val targets = plan?.nextTargetsFor(workout?.exerciseIds.orEmpty()).orEmpty()
            if (targets.isNotEmpty()) {
                V2Rule()
                V2Label(stringResource(R.string.v2_next_time))
                Text(stringResource(R.string.v2_next_time_source))
                targets.forEach { ExerciseTarget(it, plan?.weightUnit) }
            }
            V2Action(stringResource(R.string.v2_open_coach), onClick = onCoach)
            V2Secondary(stringResource(R.string.v2_open_history), Modifier.fillMaxWidth(), onHistory)
        }
    }
}

@Composable
internal fun V2History(
    repository: MwRepository,
    onWorkout: (String) -> Unit,
    onProgress: () -> Unit,
    onRoutines: () -> Unit,
    onCatalog: () -> Unit,
) {
    val workouts by produceState<List<WorkoutLogEntity>?>(null, repository) {
        value = repository.workoutsSince(Instant.EPOCH.toString())
    }
    V2Theme {
        LazyColumn(
            Modifier.fillMaxSize().statusBarsPadding()
                .windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Horizontal))
                .padding(horizontal = 20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item {
                Column(Modifier.padding(top = 18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    V2Label(stringResource(R.string.v2_marker_history))
                    Text(stringResource(R.string.v2_history), style = MaterialTheme.typography.displaySmall)
                    V2Rule()
                }
            }
            item {
                V2Secondary(stringResource(R.string.v2_progress), Modifier.fillMaxWidth(), onProgress)
                V2Secondary(stringResource(R.string.v2_routines), Modifier.fillMaxWidth(), onRoutines)
                V2Secondary(stringResource(R.string.v2_catalog), Modifier.fillMaxWidth(), onCatalog)
            }
            if (workouts == null) item { Text(stringResource(R.string.v2_loading)) }
            else if (workouts.isNullOrEmpty()) item { Text(stringResource(R.string.v2_empty_history)) }
            items(workouts.orEmpty(), key = { it.id }) { workout ->
                V2Rule()
                Text(workout.workoutName, style = MaterialTheme.typography.titleMedium)
                Text(workoutDate(workout.completedAt))
                Text(pluralStringResource(R.plurals.v2_sets, workout.setCount, workout.setCount))
                V2Secondary(stringResource(R.string.v2_view_workout, workout.workoutName)) { onWorkout(workout.id) }
            }
        }
    }
}

@Composable
internal fun V2HistoryDetail(
    workoutId: String,
    onBack: () -> Unit,
    onRoutines: () -> Unit,
    viewModel: HistoryViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var confirm by remember { mutableStateOf(false) }
    LaunchedEffect(workoutId) { viewModel.load(workoutId) }
    LaunchedEffect(state.deleted) { if (state.deleted) onBack() }
    V2Theme {
        V2Page(state.name.ifBlank { stringResource(R.string.v2_history) }, stringResource(R.string.v2_marker_history), bottomInset = true) {
            V2Secondary(stringResource(R.string.v2_back), onClick = onBack)
            when {
                state.loading -> Text(stringResource(R.string.v2_loading))
                state.notFound -> Text(stringResource(R.string.v2_missing_workout))
                else -> {
                    Text(stringResource(R.string.v2_workout_date_duration, state.whenLabel, state.durationLabel))
                    state.groups.forEach { group ->
                        V2Rule()
                        Text(group.exerciseName, style = MaterialTheme.typography.titleMedium)
                        group.sets.forEach { set ->
                            Text(stringResource(R.string.v2_history_set, set.setIndex + 1, set.weightLabel, set.reps))
                            set.kindLabel?.let { Text(it) }
                            set.rpeLabel?.let { Text(it) }
                        }
                    }
                    if (state.canSaveRoutine && !state.savingRoutine) {
                        V2Secondary(stringResource(R.string.v2_save_routine), onClick = viewModel::saveAsRoutine)
                    }
                    state.saveMessage?.let { Text(it) }
                    if (state.routineSavedId != null) V2Secondary(stringResource(R.string.v2_routines), onClick = onRoutines)
                    if (!state.deleting) V2Secondary(stringResource(R.string.v2_delete_workout)) { confirm = true }
                }
            }
        }
        if (confirm) {
            AlertDialog(
                onDismissRequest = { confirm = false },
                title = { Text(stringResource(R.string.v2_delete_workout)) },
                confirmButton = {
                    TextButton(onClick = { confirm = false; viewModel.softDelete() }) {
                        Text(stringResource(R.string.v2_delete))
                    }
                },
                dismissButton = { TextButton(onClick = { confirm = false }) { Text(stringResource(R.string.v2_cancel)) } },
            )
        }
    }
}

@Composable
private fun SessionSummary(session: PlanSessionDto, unit: String?) {
    Text(session.name, style = MaterialTheme.typography.headlineSmall)
    session.exercises.forEach { ExerciseTarget(it, unit) }
}

@Composable
private fun ExerciseTarget(exercise: PlanExerciseDto, unit: String?) {
    Text(stringResource(R.string.v2_exercise_target, exerciseName(exercise), prescription(exercise, unit)))
}

private fun PlanSessionDto.start(onStart: (String, String, Int) -> Unit) =
    onStart(id, name, exercises.sumOf { it.sets })

private fun exerciseName(exercise: PlanExerciseDto): String =
    ExerciseCatalog.get(exercise.exerciseId)?.name ?: exercise.exerciseId.replace('-', ' ')

@Composable
private fun prescription(exercise: PlanExerciseDto, unit: String?): String {
    val load = when {
        exercise.weight > 0 && (unit == "kg" || unit == "lb") -> WeightUnits.formatWithUnit(exercise.weight, unit)
        exercise.weight > 0 -> stringResource(R.string.v2_load_unavailable)
        ExerciseCatalog.get(exercise.exerciseId)?.isBodyweight == true -> stringResource(R.string.v2_bodyweight)
        else -> stringResource(R.string.v2_unloaded)
    }
    return stringResource(R.string.v2_weighted_target, exercise.sets, exercise.reps, load)
}

private fun workoutDate(raw: String): String =
    runCatching {
        Instant.parse(raw).atZone(ZoneId.systemDefault()).format(DateTimeFormatter.ofLocalizedDate(java.time.format.FormatStyle.MEDIUM))
    }.getOrDefault(raw)
