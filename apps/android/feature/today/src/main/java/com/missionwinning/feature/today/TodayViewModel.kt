package com.missionwinning.feature.today

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.network.CoachPlanResponseDto
import com.missionwinning.core.network.PlanSessionDto
import com.missionwinning.core.model.WeightUnits
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class TodayUiState(
    val plan: CoachPlanResponseDto? = null,
    val workouts: Int = 0,
    val loading: Boolean = true,
    val weightUnit: String = "kg",
) {
    val next: PlanSessionDto?
        get() = plan?.plan?.sessions?.firstOrNull {
            it.status == "planned" || it.status == "swapped"
        }
}

@HiltViewModel
class TodayViewModel @Inject constructor(
    private val repository: MwRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(TodayUiState())
    val state: StateFlow<TodayUiState> = _state.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _state.value = TodayUiState(
                plan = repository.ensureCoachPlan(),
                workouts = repository.workoutCount(),
                loading = false,
                weightUnit = WeightUnits.normalize(repository.weightUnit()),
            )
            repository.flushOutbox()
        }
    }

    fun setWeightUnit(unit: String) {
        val normalized = WeightUnits.normalize(unit)
        viewModelScope.launch {
            repository.setWeightUnit(normalized)
            _state.update { it.copy(weightUnit = normalized) }
        }
    }
}
