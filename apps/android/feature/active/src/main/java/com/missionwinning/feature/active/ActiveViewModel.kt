package com.missionwinning.feature.active

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.missionwinning.core.common.ActiveSessionHub
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.data.SessionDraftRepository
import com.missionwinning.core.data.SetLogEntity
import com.missionwinning.core.model.ActiveExercise
import com.missionwinning.core.model.ExerciseCatalog
import com.missionwinning.core.model.LoggedSet
import com.missionwinning.core.model.SetKind
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
    /** Barbell empty weight for plate calculator (prefs). */
    val barWeight: Double = 20.0,
    val finishing: Boolean = false,
    val finished: FinishedPayload? = null,
    val error: String? = null,
    /** For Wear tile / complication (phone SoT). */
    val streakDays: Int = 0,
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
    val workoutId: String = "",
)

sealed interface ActiveEvent {
    data class ToggleSet(val setId: String) : ActiveEvent
    data class UpdateReps(val setId: String, val reps: Int) : ActiveEvent
    data class UpdateWeight(val setId: String, val weight: Double) : ActiveEvent
    data class UpdateRpe(val setId: String, val rpe: Int?) : ActiveEvent
    data class UpdateNote(val setId: String, val note: String) : ActiveEvent
    data class CycleSetKind(val setId: String) : ActiveEvent
    data class ApplyPrevious(val setId: String) : ActiveEvent
    data class AddSet(val exerciseId: String) : ActiveEvent
    data class AddExercise(val exerciseId: String, val exerciseName: String) : ActiveEvent
    data class CreateCustomExercise(val name: String) : ActiveEvent
    data class RemoveSet(val setId: String) : ActiveEvent
    data class RemoveExercise(val exerciseId: String) : ActiveEvent
    data class MoveExercise(val exerciseId: String, val delta: Int) : ActiveEvent
    data class CycleSuperset(val exerciseId: String) : ActiveEvent
    data class SetExerciseRest(val exerciseId: String, val seconds: Int?) : ActiveEvent
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
    private val sessionDrafts: SessionDraftRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(ActiveUiState())
    val state: StateFlow<ActiveUiState> = _state.asStateFlow()

    private var startedAt = System.currentTimeMillis()
    private var restJob: Job? = null
    /** Absolute rest end for notification (screen-off accurate). */
    private var restDeadlineMs: Long? = null
    private var draftJob: Job? = null

    init {
        viewModelScope.launch {
            ActiveSessionHub.commands.collect { cmd ->
                when (cmd) {
                    ActiveSessionHub.Command.SkipRest -> skipRest()
                    is ActiveSessionHub.Command.CompleteSet -> completeFromWear(cmd)
                }
            }
        }
        viewModelScope.launch {
            _state.collect { publishHub(it) }
        }
        viewModelScope.launch {
            _state.collect { st ->
                if (st.sessionId.isBlank() || st.finished != null || st.finishing) return@collect
                if (st.exercises.isEmpty() && !MwRepository.isFreeformSession(st.sessionId)) return@collect
                draftJob?.cancel()
                draftJob = viewModelScope.launch {
                    delay(250)
                    persistDraft(st)
                }
            }
        }
    }

    suspend fun searchExercises(query: String, equipment: String? = null, muscle: String? = null) =
        repository.searchExercises(query, equipment, muscle)

    fun start(sessionId: String, workoutName: String, fallbackSets: Int) {
        startedAt = System.currentTimeMillis()
        restDeadlineMs = null
        viewModelScope.launch {
            val unit = ActiveSessionLogic.normalizeUnit(repository.weightUnit())
            val defaultRest = ActiveSessionLogic.normalizeDefaultRest(repository.defaultRestSeconds())
            val restVibrate = repository.restVibrateEnabled()
            val restBeep = repository.restBeepEnabled()
            val streak = runCatching { repository.workoutStreakDays() }.getOrDefault(0)
            val barWeight = if (unit == "lb") repository.barWeightLb() else repository.barWeightKg()

            val draft = sessionDrafts.load()
            if (draft != null && draft.sessionId == sessionId && draft.exercises.isNotEmpty()) {
                startedAt = draft.startedAtMs
                _state.value = ActiveUiState(
                    workoutName = draft.workoutName.ifBlank { workoutName },
                    sessionId = sessionId,
                    exercises = draft.exercises.map { it.toActive() },
                    weightUnit = draft.weightUnit.ifBlank { unit },
                    defaultRestSeconds = draft.defaultRestSeconds,
                    restSeconds = draft.restSeconds,
                    restTotalSeconds = draft.restSeconds,
                    restVibrate = restVibrate,
                    restBeep = restBeep,
                    streakDays = streak,
                    barWeight = barWeight,
                )
                if (draft.restSeconds > 0) startRest(draft.restSeconds)
                return@launch
            }

            if (MwRepository.isFreeformSession(sessionId)) {
                _state.value = ActiveUiState(
                    workoutName = workoutName.ifBlank { "Quick log" },
                    sessionId = sessionId,
                    exercises = emptyList(),
                    weightUnit = unit,
                    defaultRestSeconds = defaultRest,
                    restVibrate = restVibrate,
                    restBeep = restBeep,
                    streakDays = streak,
                    barWeight = barWeight,
                )
                return@launch
            }

            if (MwRepository.isRoutineSession(sessionId)) {
                val routineId = MwRepository.routineIdFromSession(sessionId).orEmpty()
                val routine = repository.routineById(routineId)
                val name = routine?.name?.takeIf { it.isNotBlank() } ?: workoutName
                val exercises = buildExercisesFromRoutine(
                    dtos = routine?.let { repository.parseRoutineExercises(it.exercisesJson) }.orEmpty(),
                    workoutName = name,
                    fallbackSets = fallbackSets,
                    displayUnit = unit,
                )
                _state.value = ActiveUiState(
                    workoutName = name,
                    sessionId = sessionId,
                    exercises = exercises,
                    weightUnit = unit,
                    defaultRestSeconds = defaultRest,
                    restVibrate = restVibrate,
                    restBeep = restBeep,
                    streakDays = streak,
                    barWeight = barWeight,
                )
                return@launch
            }

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
                restVibrate = restVibrate,
                restBeep = restBeep,
                streakDays = streak,
                barWeight = barWeight,
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
            is ActiveEvent.UpdateNote -> {
                updateSet(event.setId) {
                    it.copy(note = event.note.take(200))
                }
            }
            is ActiveEvent.CycleSetKind -> {
                clearRestIfActive()
                updateSet(event.setId) { it.copy(kind = SetKind.cycle(it.kind)) }
            }
            is ActiveEvent.ApplyPrevious -> {
                clearRestIfActive()
                applyPrevious(event.setId)
            }
            is ActiveEvent.AddSet -> {
                clearRestIfActive()
                addSet(event.exerciseId)
            }
            is ActiveEvent.AddExercise -> {
                clearRestIfActive()
                addExercise(event.exerciseId, event.exerciseName)
            }
            is ActiveEvent.CreateCustomExercise -> {
                clearRestIfActive()
                createCustomAndAdd(event.name)
            }
            is ActiveEvent.RemoveSet -> {
                clearRestIfActive()
                _state.update { st ->
                    st.copy(
                        exercises = ActiveSessionLogic.removeSet(st.exercises, event.setId),
                    )
                }
            }
            is ActiveEvent.RemoveExercise -> {
                clearRestIfActive()
                _state.update { st ->
                    st.copy(
                        exercises = ActiveSessionLogic.removeExercise(st.exercises, event.exerciseId),
                    )
                }
            }
            is ActiveEvent.MoveExercise -> {
                clearRestIfActive()
                _state.update { st ->
                    st.copy(
                        exercises = ActiveSessionLogic.moveExercise(
                            st.exercises,
                            event.exerciseId,
                            event.delta,
                        ),
                    )
                }
            }
            is ActiveEvent.CycleSuperset -> {
                _state.update { st ->
                    st.copy(
                        exercises = st.exercises.map { ex ->
                            if (ex.exerciseId != event.exerciseId) ex
                            else ex.copy(
                                supersetGroup = ActiveSessionLogic.nextSupersetGroup(ex.supersetGroup),
                            )
                        },
                    )
                }
            }
            is ActiveEvent.SetExerciseRest -> {
                _state.update { st ->
                    st.copy(
                        exercises = st.exercises.map { ex ->
                            if (ex.exerciseId != event.exerciseId) ex
                            else ex.copy(
                                defaultRestSeconds = event.seconds?.let {
                                    ActiveSessionLogic.normalizeDefaultRest(it)
                                },
                            )
                        },
                    )
                }
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

    private fun addSet(exerciseId: String) {
        _state.update { st ->
            st.copy(
                exercises = ActiveSessionLogic.addSet(
                    exercises = st.exercises,
                    exerciseId = exerciseId,
                    newSetId = UUID.randomUUID().toString(),
                ),
            )
        }
    }

    private fun addExercise(exerciseId: String, exerciseName: String) {
        viewModelScope.launch {
            val unit = ActiveSessionLogic.normalizeUnit(_state.value.weightUnit)
            val setCount = ActiveSessionLogic.DEFAULT_NEW_EXERCISE_SETS
            val previousByIndex = mutableMapOf<Int, Pair<Int?, Double?>>()
            for (idx in 0 until setCount) {
                val prev = repository.previousSet(exerciseId, idx)
                val prevWeight = ActiveSessionLogic.previousWeightInUnit(
                    storedWeight = prev?.weight,
                    storedUnit = prev?.weightUnit,
                    displayUnit = unit,
                )
                previousByIndex[idx] = prev?.reps to prevWeight
            }
            val seedWeight = previousByIndex[0]?.second
            val seedReps = previousByIndex[0]?.first
            val newIds = List(setCount) { UUID.randomUUID().toString() }
            val name = exerciseName.ifBlank {
                repository.exerciseDisplayName(exerciseId).ifBlank {
                    ExerciseCatalog.displayName(exerciseId).ifBlank { exerciseId }
                }
            }
            _state.update { st ->
                st.copy(
                    exercises = ActiveSessionLogic.addExercise(
                        exercises = st.exercises,
                        exerciseId = exerciseId,
                        exerciseName = name,
                        newSetIds = newIds,
                        setCount = setCount,
                        defaultReps = ActiveSessionLogic.defaultReps(10, seedReps),
                        defaultWeight = ActiveSessionLogic.defaultWeight(seedWeight),
                        previousByIndex = previousByIndex,
                    ),
                    error = null,
                )
            }
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
        viewModelScope.launch {
            val bar = if (to == "lb") repository.barWeightLb() else repository.barWeightKg()
            _state.update { cur ->
                cur.copy(
                    weightUnit = to,
                    barWeight = bar,
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
            repository.setWeightUnit(to)
        }
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
            val exRest = snap.exercises
                .find { it.exerciseId == before.exerciseId }
                ?.defaultRestSeconds
            startRest(
                ActiveSessionLogic.restAfterComplete(
                    currentRest = snap.restSeconds,
                    defaultRest = snap.defaultRestSeconds,
                    allSetsDone = allDone,
                    exerciseRest = exRest,
                ),
            )
        }
    }

    private fun createCustomAndAdd(name: String) {
        viewModelScope.launch {
            val created = repository.createCustomExercise(name) ?: run {
                _state.update { it.copy(error = "Name required for custom exercise") }
                return@launch
            }
            addExercise(created.id, created.name)
        }
    }

    private fun skipRest() {
        restJob?.cancel()
        restDeadlineMs = null
        _state.update { it.copy(restSeconds = 0, restTotalSeconds = 0) }
    }

    private fun completeFromWear(cmd: ActiveSessionHub.Command.CompleteSet) {
        val setId = cmd.setId
        val target = _state.value.exercises.flatMap { it.sets }.find { it.id == setId } ?: return
        if (target.done) return
        // Apply load from watch, then mark done
        updateSet(setId) {
            it.copy(
                reps = cmd.reps.coerceIn(1, 99),
                weight = cmd.weight.coerceAtLeast(0.0),
            )
        }
        toggleSet(setId)
    }

    private fun publishHub(st: ActiveUiState) {
        val active = st.sessionId.isNotBlank() && st.finished == null && !st.finishing
        if (!active) {
            // Keep streak on hub for Wear tile when idle between sessions
            if (st.streakDays > 0) {
                ActiveSessionHub.publish(
                    ActiveSessionHub.Snapshot(active = false, streakDays = st.streakDays),
                )
            } else {
                ActiveSessionHub.clear()
            }
            return
        }
        val currentId = ActiveSessionLogic.currentSetId(st.exercises)
        val current = st.exercises.flatMap { it.sets }.find { it.id == currentId }
        ActiveSessionHub.publish(
            ActiveSessionHub.Snapshot(
                active = true,
                workoutName = st.workoutName,
                sessionId = st.sessionId,
                doneSets = st.doneCount,
                totalSets = st.totalSets,
                restDeadlineMs = restDeadlineMs,
                currentSetId = current?.id.orEmpty(),
                exerciseName = current?.exerciseName.orEmpty(),
                setIndex = current?.setIndex ?: 0,
                reps = current?.reps ?: 10,
                weight = current?.weight ?: 0.0,
                weightUnit = st.weightUnit,
                streakDays = st.streakDays,
            ),
        )
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
        restDeadlineMs = if (sec > 0) System.currentTimeMillis() + sec * 1000L else null
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
            restDeadlineMs = null
            _state.update { it.copy(finishing = true, error = null) }
            ActiveSessionHub.clear()
            runCatching {
                val snap = _state.value
                val completed = ActiveSessionLogic.completedSetsForPersist(snap.exercises)
                val now = java.time.Instant.now().toString()
                val groupByEx = snap.exercises.associate { it.exerciseId to it.supersetGroup }
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
                        setKind = s.kind.code,
                        note = s.note,
                        supersetGroup = groupByEx[s.exerciseId].orEmpty(),
                    )
                }
                val duration = ActiveSessionLogic.durationSeconds(startedAt)
                val volume = ActiveSessionLogic.sessionVolume(snap.exercises)
                // Room SoT + outbox first; markSessionDone may hit network but local plan updates offline.
                val result = repository.finishWorkout(snap.workoutName, duration, entities, snap.sessionId)
                sessionDrafts.clear()
                // Coach week progress only for plan sessions — not routines / freeform.
                if (MwRepository.isCoachSession(snap.sessionId)) {
                    runCatching { repository.markSessionDone(snap.sessionId) }
                }
                // Optional Health Connect write (app module implements via reflection-free callback on repo side later)
                runCatching {
                    if (repository.healthConnectExportEnabled()) {
                        HealthConnectExportBridge.write(
                            title = snap.workoutName,
                            durationSeconds = duration,
                            totalVolume = volume,
                            setCount = entities.size,
                            weightUnit = snap.weightUnit,
                        )
                    }
                }
                _state.update {
                    it.copy(
                        finishing = false,
                        finished = FinishedPayload(
                            name = snap.workoutName,
                            sets = entities.size,
                            duration = duration,
                            workouts = result.workoutCount,
                            volume = volume,
                            weightUnit = snap.weightUnit,
                            workoutId = result.workoutId,
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
            val name = ExerciseCatalog.displayName(ex.exerciseId).ifBlank { workoutName }
            buildSetsForExercise(
                exerciseId = ex.exerciseId,
                exerciseName = name,
                setCount = ex.sets,
                targetReps = ex.reps,
                seedWeight = null,
                displayUnit = displayUnit,
            )
        }
    }

    private suspend fun buildExercisesFromRoutine(
        dtos: List<com.missionwinning.core.data.RoutineExerciseDto>,
        workoutName: String,
        fallbackSets: Int,
        displayUnit: String,
    ): List<ActiveExercise> {
        if (dtos.isEmpty()) {
            return buildExercises(emptyList(), workoutName, fallbackSets, displayUnit)
        }
        return dtos.map { ex ->
            val name = ex.exerciseName.ifBlank {
                ExerciseCatalog.displayName(ex.exerciseId).ifBlank { workoutName }
            }
            buildSetsForExercise(
                exerciseId = ex.exerciseId,
                exerciseName = name,
                setCount = ex.sets,
                targetReps = ex.targetReps,
                seedWeight = ex.lastWeight.takeIf { it > 0.0 },
                displayUnit = displayUnit,
            )
        }
    }

    private suspend fun buildSetsForExercise(
        exerciseId: String,
        exerciseName: String,
        setCount: Int,
        targetReps: Int,
        seedWeight: Double?,
        displayUnit: String,
    ): ActiveExercise {
        val sets = (0 until setCount.coerceIn(1, 12)).map { idx ->
            val prev = repository.previousSet(exerciseId, idx)
            val prevWeight = ActiveSessionLogic.previousWeightInUnit(
                storedWeight = prev?.weight,
                storedUnit = prev?.weightUnit,
                displayUnit = displayUnit,
            )
            val weight = when {
                prevWeight != null && prevWeight > 0.0 -> ActiveSessionLogic.defaultWeight(prevWeight)
                seedWeight != null -> ActiveSessionLogic.defaultWeight(seedWeight)
                else -> ActiveSessionLogic.defaultWeight(null)
            }
            LoggedSet(
                id = UUID.randomUUID().toString(),
                exerciseId = exerciseId,
                exerciseName = exerciseName,
                setIndex = idx,
                reps = ActiveSessionLogic.defaultReps(targetReps, prev?.reps),
                weight = weight,
                previousReps = prev?.reps,
                previousWeight = prevWeight,
            )
        }
        return ActiveExercise(exerciseId = exerciseId, name = exerciseName, sets = sets)
    }

    private suspend fun persistDraft(st: ActiveUiState) {
        runCatching {
            sessionDrafts.save(
                SessionDraftRepository.DraftPayload(
                    sessionId = st.sessionId,
                    workoutName = st.workoutName,
                    startedAtMs = startedAt,
                    weightUnit = st.weightUnit,
                    restSeconds = st.restSeconds,
                    defaultRestSeconds = st.defaultRestSeconds,
                    exercises = st.exercises.map { ex ->
                        SessionDraftRepository.DraftExercise(
                            exerciseId = ex.exerciseId,
                            name = ex.name,
                            supersetGroup = ex.supersetGroup,
                            defaultRestSeconds = ex.defaultRestSeconds,
                            sets = ex.sets.map { s ->
                                SessionDraftRepository.DraftSet(
                                    id = s.id,
                                    exerciseId = s.exerciseId,
                                    exerciseName = s.exerciseName,
                                    setIndex = s.setIndex,
                                    reps = s.reps,
                                    weight = s.weight,
                                    done = s.done,
                                    previousReps = s.previousReps,
                                    previousWeight = s.previousWeight,
                                    rpe = s.rpe,
                                    kind = s.kind.code,
                                    note = s.note,
                                )
                            },
                        )
                    },
                ),
            )
        }
    }

    private fun SessionDraftRepository.DraftExercise.toActive(): ActiveExercise =
        ActiveExercise(
            exerciseId = exerciseId,
            name = name,
            sets = sets.map { s ->
                LoggedSet(
                    id = s.id,
                    exerciseId = s.exerciseId,
                    exerciseName = s.exerciseName,
                    setIndex = s.setIndex,
                    reps = s.reps,
                    weight = s.weight,
                    done = s.done,
                    previousReps = s.previousReps,
                    previousWeight = s.previousWeight,
                    rpe = s.rpe,
                    kind = SetKind.fromCode(s.kind),
                    note = s.note,
                )
            },
            supersetGroup = supersetGroup,
            defaultRestSeconds = defaultRestSeconds,
        )
}
