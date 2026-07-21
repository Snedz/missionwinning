package com.missionwinning.feature.today

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.data.WorkoutLogEntity
import com.missionwinning.core.model.WeightUnits
import com.missionwinning.core.network.CoachPlanResponseDto
import com.missionwinning.core.network.PlanSessionDto
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

data class RecentWorkoutUi(
    val id: String,
    val name: String,
    val sets: Int,
    val durationLabel: String,
    val whenLabel: String,
    val volumeLabel: String?,
)

data class TodayUiState(
    val plan: CoachPlanResponseDto? = null,
    val workouts: Int = 0,
    val recent: List<RecentWorkoutUi> = emptyList(),
    val loading: Boolean = true,
    val weightUnit: String = "kg",
    val pendingSync: Int = 0,
    val syncing: Boolean = false,
    val syncMessage: String? = null,
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
            _state.update { it.copy(loading = it.plan == null) }
            val unit = WeightUnits.normalize(repository.weightUnit())
            val rows = repository.recentWorkouts(5)
            val pendingBefore = repository.pendingSyncCount()
            val pendingAfter = if (pendingBefore > 0) {
                repository.flushOutboxAndCount()
            } else {
                0
            }
            _state.value = TodayUiState(
                plan = repository.ensureCoachPlan(),
                workouts = repository.workoutCount(),
                recent = rows.map { it.toUi(unit) },
                loading = false,
                weightUnit = unit,
                pendingSync = pendingAfter,
                syncMessage = when {
                    pendingBefore > 0 && pendingAfter == 0 -> "Synced $pendingBefore offline log${if (pendingBefore == 1) "" else "s"}."
                    pendingAfter > 0 -> "On device · $pendingAfter waiting to sync when online."
                    else -> null
                },
            )
        }
    }

    fun retrySync() {
        viewModelScope.launch {
            _state.update { it.copy(syncing = true, syncMessage = null) }
            val remaining = repository.flushOutboxAndCount()
            _state.update {
                it.copy(
                    syncing = false,
                    pendingSync = remaining,
                    syncMessage = if (remaining == 0) {
                        "All clear — nothing pending."
                    } else {
                        "Still $remaining pending (need network + private cookie if gated)."
                    },
                )
            }
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

private fun WorkoutLogEntity.toUi(weightUnit: String): RecentWorkoutUi {
    val durationLabel = formatDuration(durationSeconds)
    val whenLabel = formatWhen(completedAt)
    val volumeLabel = if (totalVolume > 0) {
        "${WeightUnits.format(totalVolume)} $weightUnit vol"
    } else {
        null
    }
    return RecentWorkoutUi(
        id = id,
        name = workoutName.ifBlank { "Workout" },
        sets = setCount,
        durationLabel = durationLabel,
        whenLabel = whenLabel,
        volumeLabel = volumeLabel,
    )
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
        val today = java.time.LocalDate.now()
        val date = zoned.toLocalDate()
        when {
            date == today -> "Today · " + zoned.format(DateTimeFormatter.ofPattern("h:mm a", Locale.US))
            date == today.minusDays(1) -> "Yesterday"
            else -> zoned.format(DateTimeFormatter.ofPattern("EEE · MMM d", Locale.US))
        }
    }.getOrDefault(iso.take(10))
}
