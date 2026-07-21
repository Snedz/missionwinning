package com.missionwinning.feature.today

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.model.WeightUnits
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale
import javax.inject.Inject

data class HistorySetUi(
    val id: String,
    val exerciseName: String,
    val setIndex: Int,
    val reps: Int,
    val weightLabel: String,
    val rpeLabel: String? = null,
)

data class HistoryExerciseGroup(
    val exerciseName: String,
    val sets: List<HistorySetUi>,
)

data class HistoryUiState(
    val loading: Boolean = true,
    val notFound: Boolean = false,
    val workoutId: String = "",
    val name: String = "",
    val whenLabel: String = "",
    val durationLabel: String = "",
    val setCount: Int = 0,
    val volumeLabel: String = "—",
    val groups: List<HistoryExerciseGroup> = emptyList(),
    val canSaveRoutine: Boolean = false,
    val savingRoutine: Boolean = false,
    val routineSavedId: String? = null,
    val saveMessage: String? = null,
)

@HiltViewModel
class HistoryViewModel @Inject constructor(
    private val repository: MwRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(HistoryUiState())
    val state: StateFlow<HistoryUiState> = _state.asStateFlow()

    fun load(workoutId: String) {
        viewModelScope.launch {
            _state.value = HistoryUiState(loading = true, workoutId = workoutId)
            val workout = repository.workoutById(workoutId)
            if (workout == null) {
                _state.value = HistoryUiState(loading = false, notFound = true, workoutId = workoutId)
                return@launch
            }
            val unitPref = WeightUnits.normalize(repository.weightUnit())
            val sets = repository.setsForWorkout(workoutId)
            val groups = sets
                .groupBy { it.exerciseName.ifBlank { it.exerciseId } }
                .map { (name, rows) ->
                    HistoryExerciseGroup(
                        exerciseName = name,
                        sets = rows.sortedBy { it.setIndex }.map { row ->
                            val unit = WeightUnits.normalize(row.weightUnit.ifBlank { unitPref })
                            val display = if (unit == unitPref) {
                                row.weight
                            } else {
                                WeightUnits.convert(row.weight, unit, unitPref)
                            }
                            HistorySetUi(
                                id = row.id,
                                exerciseName = name,
                                setIndex = row.setIndex,
                                reps = row.reps,
                                weightLabel = WeightUnits.formatWithUnit(display, unitPref),
                                rpeLabel = row.rpe?.let { "RPE $it" },
                            )
                        },
                    )
                }
                .sortedBy { it.exerciseName.lowercase(Locale.US) }
            _state.value = HistoryUiState(
                loading = false,
                workoutId = workoutId,
                name = workout.workoutName.ifBlank { "Workout" },
                whenLabel = formatWhen(workout.completedAt),
                durationLabel = formatDuration(workout.durationSeconds),
                setCount = workout.setCount,
                volumeLabel = if (workout.totalVolume > 0) {
                    "${WeightUnits.format(workout.totalVolume)} $unitPref"
                } else {
                    "—"
                },
                groups = groups,
                canSaveRoutine = sets.isNotEmpty(),
            )
        }
    }

    fun saveAsRoutine() {
        val workoutId = _state.value.workoutId
        if (workoutId.isBlank() || _state.value.savingRoutine) return
        viewModelScope.launch {
            _state.update {
                it.copy(savingRoutine = true, saveMessage = null, routineSavedId = null)
            }
            val id = runCatching {
                repository.saveRoutineFromWorkout(workoutId)
            }.getOrNull()
            _state.update {
                if (id != null) {
                    it.copy(
                        savingRoutine = false,
                        routineSavedId = id,
                        saveMessage = "Saved as routine",
                    )
                } else {
                    it.copy(
                        savingRoutine = false,
                        saveMessage = "Could not save routine (no sets)",
                    )
                }
            }
        }
    }

    fun clearSaveMessage() {
        _state.update { it.copy(saveMessage = null) }
    }
}

private fun formatDuration(seconds: Int): String {
    val m = seconds / 60
    val s = seconds % 60
    return if (m > 0) "${m}m ${s}s" else "${s}s"
}

private fun formatWhen(iso: String): String {
    return runCatching {
        val instant = Instant.parse(iso)
        val zoned = instant.atZone(ZoneId.systemDefault())
        zoned.format(DateTimeFormatter.ofPattern("EEE · MMM d · h:mm a", Locale.US))
    }.getOrDefault(iso.take(16))
}
