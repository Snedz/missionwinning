package com.missionwinning.feature.victory

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.missionwinning.core.data.MwRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class VictoryUiState(
    val workoutName: String = "",
    val sets: Int = 0,
    val duration: Int = 0,
    val workouts: Int = 0,
    val volume: Int = 0,
    val weightUnit: String = "kg",
    val workoutId: String = "",
    val savingRoutine: Boolean = false,
    val routineSaved: Boolean = false,
    val routineMessage: String? = null,
) {
    val coachFirst: Boolean get() = workouts in 1..3
    val canSaveRoutine: Boolean get() = workoutId.isNotBlank() && sets > 0

    /** Sparse milestone lines for early lifetime volume. */
    val milestone: String?
        get() = when (workouts) {
            1 -> "First session locked. You're in the mission."
            3 -> "Three sessions. Coach has enough signal to adapt."
            5 -> "Five sessions. Consistency is the product."
            10 -> "Ten sessions. Mission pace is real."
            25 -> "Twenty-five sessions. On-device legend."
            else -> null
        }
}

@HiltViewModel
class VictoryViewModel @Inject constructor(
    private val repository: MwRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(VictoryUiState())
    val state: StateFlow<VictoryUiState> = _state.asStateFlow()

    fun bind(
        name: String,
        sets: Int,
        duration: Int,
        workouts: Int,
        volume: Int = 0,
        weightUnit: String = "kg",
        workoutId: String = "",
    ) {
        _state.value = VictoryUiState(
            workoutName = name,
            sets = sets,
            duration = duration,
            workouts = workouts,
            volume = volume,
            weightUnit = weightUnit.ifBlank { "kg" },
            workoutId = workoutId,
        )
    }

    fun saveAsRoutine() {
        val id = _state.value.workoutId
        if (id.isBlank() || _state.value.savingRoutine || _state.value.routineSaved) return
        viewModelScope.launch {
            _state.update { it.copy(savingRoutine = true, routineMessage = null) }
            val routineId = runCatching {
                repository.saveRoutineFromWorkout(id)
            }.getOrNull()
            _state.update {
                if (routineId != null) {
                    it.copy(
                        savingRoutine = false,
                        routineSaved = true,
                        routineMessage = "Saved as routine",
                    )
                } else {
                    it.copy(
                        savingRoutine = false,
                        routineMessage = "Could not save routine",
                    )
                }
            }
        }
    }
}
