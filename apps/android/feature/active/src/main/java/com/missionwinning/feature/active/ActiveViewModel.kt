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
    /** Anchor for rest progress bar (does not tick down). */
    val restTotalSeconds: Int = 0,
    /** Preferred rest length after complete set (user pref). */
    val defaultRestSeconds: Int = ActiveSessionLogic.DEFAULT_REST_SECONDS,
    val restVibrate: Boolean = true,
    val restBeep: Boolean = false,
    val weightUnit: String = "kg",
    val finishing: Boolean = false,
    val finished: FinishedPayload? = null,
    val error: String? = null,
) {
    val doneCount: Int get() = exercises.sumOf { ex -> ex.sets.count { it.done } }
    val totalSets: Int get() = exercises.sumOf { it.sets.size }
    val remainingSets: Int get() = (totalSets - doneCount).coerceAtLeast(0)
    /** Volume of completed sets only (weight × reps). */
    val liveVolume: Double get() = ActiveSessionLogic.sessionVolume(exercises)
}

data class FinishedPayload(
    val name: String,
    val sets: Int,
    val duration: Int,
    val workouts: Int,
    val volume: Double = 0.0,
    val weightUnit: String = "kg",
)

sealed interface ActiveEvent {
    data class ToggleSet(val setId: String) : ActiveEvent
    data class UpdateReps(val setId: String, val reps: Int) : ActiveEvent
    data class UpdateWeight(val setId: String, val weight: Double) : ActiveEvent
    data class UpdateRpe(val setId: String, val rpe: Int?) : ActiveEvent
    data class ApplyPrevious(val setId: String) : ActiveEvent
    data object ToggleWeightUnit : ActiveEvent
    data object RestMinus15 : ActiveEvent
    data object RestPlus15 : ActiveEvent
    data object RestSkip : ActiveEvent
    data class SetDefaultRest(val seconds: Int) : ActiveEvent
    data object ToggleRestVibrate : ActiveEvent
    data object ToggleRestBeep : ActiveEvent
    data object Finish : ActiveEvent
    data object ClearFinished : ActiveEvent
    data object ClearError : ActiveEvent
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
            val unit = ActiveSessionLogic.normalizeUnit(repository.weightUnit())
            val defaultRest = ActiveSessionLogic.normalizeDefaultRest(repository.defaultRestSeconds())
            val plan = repository.ensureCoachPlan(preferNetwork = false)
            val session = plan.plan.sessions.find { it.id == sessionId }
            val exercises = buildExercises(
                sessionExercises = session?.exercises.orEmpty(),
                workoutName = workoutName,
                fallbackSets = fallbackSets,
                displayUnit = unit,
            )
            _state.value = ActiveUiState(
                workoutName = workoutName,
                sessionId = sessionId,
                exercises = exercises,
                weightUnit = unit,
                defaultRestSeconds = defaultRest,
                restVibrate = repository.restVibrateEnabled(),
                restBeep = repository.restBeepEnabled(),
            )
        }
    }

    fun onEvent(event: ActiveEvent) {
        when (event) {
            is ActiveEvent.ToggleSet -> toggleSet(event.setId)
            is ActiveEvent.UpdateReps -> {
                // Editing load means rest is over — standard logger UX
                clearRestIfActive()
                updateSet(event.setId) { it.copy(reps = event.reps.coerceIn(1, 99)) }
            }
            is ActiveEvent.UpdateWeight -> {
                clearRestIfActive()
                updateSet(event.setId) { it.copy(weight = event.weight.coerceAtLeast(0.0)) }
            }
            is ActiveEvent.UpdateRpe -> {
                clearRestIfActive()
                updateSet(event.setId) {
                    it.copy(rpe = event.rpe?.coerceIn(6, 10))
                }
            }
            is ActiveEvent.ApplyPrevious -> {
                clearRestIfActive()
                applyPrevious(event.setId)
            }
            ActiveEvent.ToggleWeightUnit -> toggleWeightUnit()
            ActiveEvent.RestMinus15 -> adjustRest(-ActiveSessionLogic.REST_STEP)
            ActiveEvent.RestPlus15 -> adjustRest(ActiveSessionLogic.REST_STEP)
            ActiveEvent.RestSkip -> skipRest()
            is ActiveEvent.SetDefaultRest -> setDefaultRest(event.seconds)
            ActiveEvent.ToggleRestVibrate -> toggleRestVibrate()
            ActiveEvent.ToggleRestBeep -> toggleRestBeep()
            ActiveEvent.Finish -> finish()
            ActiveEvent.ClearFinished -> _state.update { it.copy(finished = null) }
            ActiveEvent.ClearError -> _state.update { it.copy(error = null) }
        }
    }

    private fun toggleRestVibrate() {
        val next = !_state.value.restVibrate
        _state.update { it.copy(restVibrate = next) }
        viewModelScope.launch { repository.setRestVibrateEnabled(next) }
    }

    private fun toggleRestBeep() {
        val next = !_state.value.restBeep
        _state.update { it.copy(restBeep = next) }
        viewModelScope.launch { repository.setRestBeepEnabled(next) }
    }

    private fun clearRestIfActive() {
        if (_state.value.restSeconds > 0) skipRest()
    }

    private fun setDefaultRest(seconds: Int) {
        val normalized = ActiveSessionLogic.normalizeDefaultRest(seconds)
        _state.update { it.copy(defaultRestSeconds = normalized) }
        viewModelScope.launch { repository.setDefaultRestSeconds(normalized) }
    }

    private fun applyPrevious(setId: String) {
        updateSet(setId) { s ->
            s.copy(
                reps = (s.previousReps ?: s.reps).coerceIn(1, 99),
                weight = (s.previousWeight ?: s.weight).coerceAtLeast(0.0),
            )
        }
    }

    private fun toggleWeightUnit() {
        val st = _state.value
        val from = ActiveSessionLogic.normalizeUnit(st.weightUnit)
        val to = if (from == "kg") "lb" else "kg"
        _state.update { cur ->
            cur.copy(
                weightUnit = to,
                exercises = cur.exercises.map { ex ->
                    ex.copy(
                        sets = ex.sets.map { s ->
                            s.copy(
                                weight = ActiveSessionLogic.convertWeight(s.weight, from, to),
                                previousWeight = s.previousWeight?.let {
                                    ActiveSessionLogic.convertWeight(it, from, to)
                                },
                            )
                        },
                    )
                },
            )
        }
        viewModelScope.launch { repository.setWeightUnit(to) }
    }

    private fun toggleSet(setId: String) {
        val before = _state.value.exercises.flatMap { it.sets }.find { it.id == setId } ?: return
        val becomingDone = !before.done
        _state.update { st ->
            var exercises = st.exercises.map { ex ->
                ex.copy(sets = ex.sets.map { s ->
                    if (s.id == setId) s.copy(done = !s.done) else s
                })
            }
            if (becomingDone) {
                exercises = ActiveSessionLogic.carryForwardWithinExercise(exercises, setId)
            }
            st.copy(exercises = exercises)
        }
        if (becomingDone) {
            val snap = _state.value
            val allDone = ActiveSessionLogic.allDone(snap.exercises)
            startRest(
                ActiveSessionLogic.restAfterComplete(
                    currentRest = snap.restSeconds,
                    defaultRest = snap.defaultRestSeconds,
                    allSetsDone = allDone,
                ),
            )
        }
    }

    private fun skipRest() {
        restJob?.cancel()
        _state.update { it.copy(restSeconds = 0, restTotalSeconds = 0) }
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
        _state.update {
            val next = ActiveSessionLogic.adjustRest(it.restSeconds, delta)
            it.copy(
                restSeconds = next,
                restTotalSeconds = maxOf(it.restTotalSeconds, next),
            )
        }
        if (_state.value.restSeconds > 0 && restJob?.isActive != true) {
            tickRest()
        }
    }

    private fun startRest(seconds: Int) {
        restJob?.cancel()
        val sec = seconds.coerceAtLeast(0)
        _state.update {
            it.copy(
                restSeconds = sec,
                restTotalSeconds = if (sec > 0) sec else 0,
            )
        }
        if (sec > 0) tickRest()
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
        val st = _state.value
        if (!ActiveSessionLogic.canFinish(st.exercises)) {
            _state.update {
                it.copy(error = "Complete at least one set before finishing.")
            }
            return
        }
        viewModelScope.launch {
            _state.update { it.copy(finishing = true, error = null) }
            runCatching {
                val snap = _state.value
                val completed = ActiveSessionLogic.completedSetsForPersist(snap.exercises)
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
                        sessionId = snap.sessionId,
                        weightUnit = ActiveSessionLogic.normalizeUnit(snap.weightUnit),
                        rpe = s.rpe?.coerceIn(6, 10),
                    )
                }
                val duration = ActiveSessionLogic.durationSeconds(startedAt)
                val volume = ActiveSessionLogic.sessionVolume(snap.exercises)
                // Room SoT + outbox first; markSessionDone may hit network but local plan updates offline.
                val total = repository.finishWorkout(snap.workoutName, duration, entities, snap.sessionId)
                runCatching { repository.markSessionDone(snap.sessionId) }
                _state.update {
                    it.copy(
                        finishing = false,
                        finished = FinishedPayload(
                            name = snap.workoutName,
                            sets = entities.size,
                            duration = duration,
                            workouts = total,
                            volume = volume,
                            weightUnit = snap.weightUnit,
                        ),
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
        displayUnit: String,
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
                val prevWeight = ActiveSessionLogic.previousWeightInUnit(
                    storedWeight = prev?.weight,
                    storedUnit = prev?.weightUnit,
                    displayUnit = displayUnit,
                )
                LoggedSet(
                    id = UUID.randomUUID().toString(),
                    exerciseId = ex.exerciseId,
                    exerciseName = name.ifBlank { workoutName },
                    setIndex = idx,
                    reps = ActiveSessionLogic.defaultReps(ex.reps, prev?.reps),
                    weight = ActiveSessionLogic.defaultWeight(prevWeight),
                    previousReps = prev?.reps,
                    previousWeight = prevWeight,
                )
            }
            ActiveExercise(exerciseId = ex.exerciseId, name = name.ifBlank { workoutName }, sets = sets)
        }
    }
}
