package com.missionwinning.feature.coach

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.missionwinning.core.data.AuthRepository
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.network.CoachPlanResponseDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CoachUiState(
    val plan: CoachPlanResponseDto? = null,
    val loading: Boolean = true,
    val message: String? = null,
    val signedIn: Boolean = false,
    val premium: Boolean = false,
    val premiumSource: String = "anonymous",
)

@HiltViewModel
class CoachViewModel @Inject constructor(
    private val repository: MwRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {
    private val _local = MutableStateFlow(CoachUiState())

    val state: StateFlow<CoachUiState> = combine(
        _local,
        authRepository.state,
    ) { local, auth ->
        local.copy(
            signedIn = auth.signedIn,
            premium = auth.premium,
            premiumSource = auth.premiumSource,
        )
    }.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5_000),
        CoachUiState(),
    )

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _local.update { it.copy(loading = true, message = null) }
            // Prefer network when signed in so Bearer-authenticated coach can run
            val plan = repository.ensureCoachPlan(preferNetwork = authRepository.accessTokenOrNull() != null)
            if (authRepository.accessTokenOrNull() != null) {
                runCatching { authRepository.refreshPremium() }
            }
            _local.update {
                it.copy(plan = plan, loading = false)
            }
        }
    }

    fun seedAdaptDemo() {
        viewModelScope.launch {
            // Product path for Super Bundle; also available in debug lab
            val plan = repository.seedAdaptDemo()
            _local.update {
                it.copy(
                    plan = plan,
                    loading = false,
                    message = "Adapt depth seeded (miss + swap).",
                )
            }
        }
    }

    fun forceReseed() {
        viewModelScope.launch {
            _local.update { it.copy(loading = true) }
            val plan = repository.forceReseedPlan()
            _local.update {
                it.copy(
                    plan = plan,
                    loading = false,
                    message = "Plan reseeded for ${plan.plan.equipmentProfile}.",
                )
            }
        }
    }
}
