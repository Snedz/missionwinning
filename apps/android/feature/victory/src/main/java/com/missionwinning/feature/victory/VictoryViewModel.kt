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
) {
    val coachFirst: Boolean get() = workouts in 1..3
}

@HiltViewModel
class VictoryViewModel @Inject constructor() : ViewModel() {
    private val _state = MutableStateFlow(VictoryUiState())
    val state: StateFlow<VictoryUiState> = _state.asStateFlow()

    fun bind(name: String, sets: Int, duration: Int, workouts: Int) {
        _state.value = VictoryUiState(name, sets, duration, workouts)
    }
}
