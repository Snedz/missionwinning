package com.missionwinning.feature.coach

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.network.CoachPlanResponseDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CoachUiState(
    val plan: CoachPlanResponseDto? = null,
    val loading: Boolean = true,
    val message: String? = null,
)

@HiltViewModel
class CoachViewModel @Inject constructor(
    private val repository: MwRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(CoachUiState())
    val state: StateFlow<CoachUiState> = _state.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _state.value = CoachUiState(plan = repository.ensureCoachPlan(), loading = false)
        }
    }

    fun seedAdaptDemo() {
        viewModelScope.launch {
            _state.value = CoachUiState(
                plan = repository.seedAdaptDemo(),
                loading = false,
                message = "Adapt demo seeded (miss + swap).",
            )
        }
    }

    fun forceReseed() {
        viewModelScope.launch {
            _state.value = CoachUiState(loading = true)
            val plan = repository.forceReseedPlan()
            _state.value = CoachUiState(
                plan = plan,
                loading = false,
                message = "Plan reseeded for ${plan.plan.equipmentProfile}.",
            )
        }
    }
}
