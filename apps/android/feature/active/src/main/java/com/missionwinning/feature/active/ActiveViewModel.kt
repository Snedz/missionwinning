package com.missionwinning.feature.active

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.data.SetLogEntity
import com.missionwinning.core.model.ActiveExercise
import com.missionwinning.core.model.LoggedSet
import com.missionwinning.core.network.PlanExerciseDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.UUID
import javax.inject.Inject

data class ActiveUiState(
    val workoutName: String = "",
    val sessionId: String = "",
    val exercises: List<ActiveExercise> = emptyList(),
    val restSeconds: Int = 0,
    val weightUnit: String = "kg",
    val finishing: Boolean = false,
    val finished: FinishedPayload? = null,
    val error: String? = null,
) {
    val doneCount: Int get() = exercises.sumOf { ex -> ex.sets.count { it.done } }
    val totalSets: Int get() = exercises.sumOf { it.sets.size }
}

data class FinishedPayload(
    val name: String,
    val sets: Int,
    val duration: Int,
    val workouts: Int,
)

sealed interface ActiveEvent {
    data class ToggleSet(val setId: String) : ActiveEvent
    data class UpdateReps(val setId: String, val reps: Int) : ActiveEvent
    data class UpdateWeight(val setId: String, val weight: Double) : ActiveEvent
    data object RestMinus15 : ActiveEvent
    data object RestPlus15 : ActiveEvent
    data object Finish : ActiveEvent
    data object ClearFinished : ActiveEvent
}

@HiltViewModel
class ActiveViewModel @Inject constructor(
    private val repository: MwRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(ActiveUiState())
    val state: StateFlow<ActiveUiState> = _state.asStateFlow()

    private var startedAt = System.currentTimeMillis()
    private var restJob: Job? = null

    fun start(sessionId: String, workoutName: String, fallbackSets: Int) {
        startedAt = System.currentTimeMillis()
        viewModelScope.launch {
            val unit = repository.weightUnit()
            val plan = repository.ensureCoachPlan(preferNetwork = false)
            val session = plan.plan.sessions.find { it.id == sessionId }
            val exercises = buildExercises(
                sessionExercises = session?.exercises.orEmpty(),
                workoutName = workoutName,
                fallbackSets = fallbackSets,
            )
            _state.value = ActiveUiState(
                workoutName = workoutName,
                sessionId = sessionId,
                exercises = exercises,
                weightUnit = unit,
            )
        }
    }

    fun onEvent(event: ActiveEvent) {
        when (event) {
            is ActiveEvent.ToggleSet -> toggleSet(event.setId)
            is ActiveEvent.UpdateReps -> updateSet(event.setId) { it.copy(reps = event.reps.coerceIn(1, 99)) }
            is ActiveEvent.UpdateWeight -> updateSet(event.setId) { it.copy(weight = event.weight.coerceAtLeast(0.0)) }
            ActiveEvent.RestMinus15 -> adjustRest(-15)
            ActiveEvent.RestPlus15 -> adjustRest(15)
            ActiveEvent.Finish -> finish()
            ActiveEvent.ClearFinished -> _state.update { it.copy(finished = null) }
        }
    }

    private fun toggleSet(setId: String) {
        val before = _state.value.exercises.flatMap { it.sets }.find { it.id == setId } ?: return
        val becomingDone = !before.done
        updateSet(setId) { it.copy(done = !it.done) }
        if (becomingDone) startRest(60) else if (_state.value.restSeconds > 0) {
            // keep rest if other sets still mid-session
        }
    }

    private fun updateSet(setId: String, transform: (LoggedSet) -> LoggedSet) {
        _state.update { st ->
            st.copy(
                exercises = st.exercises.map { ex ->
                    ex.copy(sets = ex.sets.map { s -> if (s.id == setId) transform(s) else s })
                },
            )
        }
    }

    private fun adjustRest(delta: Int) {
        _state.update { it.copy(restSeconds = (it.restSeconds + delta).coerceAtLeast(0)) }
        if (_state.value.restSeconds > 0 && restJob?.isActive != true) {
            tickRest()
        }
    }

    private fun startRest(seconds: Int) {
        _state.update { it.copy(restSeconds = seconds) }
        tickRest()
    }

    private fun tickRest() {
        restJob?.cancel()
        restJob = viewModelScope.launch {
            while (_state.value.restSeconds > 0) {
                delay(1000)
                _state.update { cur ->
                    if (cur.restSeconds <= 0) cur else cur.copy(restSeconds = cur.restSeconds - 1)
                }
            }
        }
    }

    private fun finish() {
        if (_state.value.finishing) return
        viewModelScope.launch {
            _state.update { it.copy(finishing = true, error = null) }
            runCatching {
                val st = _state.value
                val completed = st.exercises.flatMap { it.sets }.filter { it.done }
                    .ifEmpty { st.exercises.flatMap { it.sets }.take(1) }
                val now = java.time.Instant.now().toString()
                val entities = completed.map { s ->
                    SetLogEntity(
                        id = UUID.randomUUID().toString(),
                        exerciseId = s.exerciseId,
                        exerciseName = s.exerciseName,
                        setIndex = s.setIndex,
                        reps = s.reps,
                        weight = s.weight,
                        completedAt = now,
                        sessionId = st.sessionId,
                    )
                }
                val duration = ((System.currentTimeMillis() - startedAt) / 1000).toInt().coerceAtLeast(30)
                val total = repository.finishWorkout(st.workoutName, duration, entities, st.sessionId)
                repository.markSessionDone(st.sessionId)
                _state.update {
                    it.copy(
                        finishing = false,
                        finished = FinishedPayload(st.workoutName, entities.size, duration, total),
                    )
                }
            }.onFailure { e ->
                _state.update { it.copy(finishing = false, error = e.message ?: "Finish failed") }
            }
        }
    }

    private suspend fun buildExercises(
        sessionExercises: List<PlanExerciseDto>,
        workoutName: String,
        fallbackSets: Int,
    ): List<ActiveExercise> {
        val source = if (sessionExercises.isNotEmpty()) {
            sessionExercises
        } else {
            listOf(PlanExerciseDto("main", fallbackSets.coerceIn(3, 12), 10))
        }
        return source.map { ex ->
            val name = ex.exerciseId.replace('-', ' ').replaceFirstChar { it.uppercase() }
            val sets = (0 until ex.sets.coerceIn(1, 12)).map { idx ->
                val prev = repository.previousSet(ex.exerciseId, idx)
                LoggedSet(
                    id = UUID.randomUUID().toString(),
                    exerciseId = ex.exerciseId,
                    exerciseName = name.ifBlank { workoutName },
                    setIndex = idx,
                    reps = ex.reps.coerceIn(1, 99),
                    weight = prev?.weight ?: 0.0,
                    previousReps = prev?.reps,
                    previousWeight = prev?.weight,
                )
            }
            ActiveExercise(exerciseId = ex.exerciseId, name = name.ifBlank { workoutName }, sets = sets)
        }
    }
}
