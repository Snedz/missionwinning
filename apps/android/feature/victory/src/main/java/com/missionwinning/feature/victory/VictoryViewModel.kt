package com.missionwinning.feature.victory

import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

data class VictoryUiState(
    val workoutName: String = "",
    val sets: Int = 0,
    val duration: Int = 0,
    val workouts: Int = 0,
    val volume: Int = 0,
    val weightUnit: String = "kg",
) {
    val coachFirst: Boolean get() = workouts in 1..3

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
class VictoryViewModel @Inject constructor() : ViewModel() {
    private val _state = MutableStateFlow(VictoryUiState())
    val state: StateFlow<VictoryUiState> = _state.asStateFlow()

    fun bind(
        name: String,
        sets: Int,
        duration: Int,
        workouts: Int,
        volume: Int = 0,
        weightUnit: String = "kg",
    ) {
        _state.value = VictoryUiState(
            workoutName = name,
            sets = sets,
            duration = duration,
            workouts = workouts,
            volume = volume,
            weightUnit = weightUnit.ifBlank { "kg" },
        )
    }
}
