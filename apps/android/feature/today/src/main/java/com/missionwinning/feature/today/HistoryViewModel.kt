package com.missionwinning.feature.today

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.model.WeightUnits
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
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
)

data class HistoryExerciseGroup(
    val exerciseName: String,
    val sets: List<HistorySetUi>,
)

data class HistoryUiState(
    val loading: Boolean = true,
    val notFound: Boolean = false,
    val name: String = "",
    val whenLabel: String = "",
    val durationLabel: String = "",
    val setCount: Int = 0,
    val volumeLabel: String = "—",
    val groups: List<HistoryExerciseGroup> = emptyList(),
)

@HiltViewModel
class HistoryViewModel @Inject constructor(
    private val repository: MwRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(HistoryUiState())
    val state: StateFlow<HistoryUiState> = _state.asStateFlow()

    fun load(workoutId: String) {
        viewModelScope.launch {
            _state.value = HistoryUiState(loading = true)
            val workout = repository.workoutById(workoutId)
            if (workout == null) {
                _state.value = HistoryUiState(loading = false, notFound = true)
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
                            )
                        },
                    )
                }
                .sortedBy { it.exerciseName.lowercase(Locale.US) }
            _state.value = HistoryUiState(
                loading = false,
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
            )
        }
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
