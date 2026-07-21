package com.missionwinning.feature.today

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.missionwinning.core.common.NetworkStatus
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.data.WorkoutLogEntity
import com.missionwinning.core.model.WeightUnits
import com.missionwinning.core.model.WorkoutStats
import com.missionwinning.core.network.CoachPlanResponseDto
import com.missionwinning.core.network.PlanSessionDto
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
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

data class WeekStatsUi(
    val workoutCount: Int = 0,
    val setCount: Int = 0,
    val volumeLabel: String = "—",
    val minutesLabel: String = "—",
)

data class TodayUiState(
    val plan: CoachPlanResponseDto? = null,
    val workouts: Int = 0,
    val recent: List<RecentWorkoutUi> = emptyList(),
    val weekStats: WeekStatsUi = WeekStatsUi(),
    val streakDays: Int = 0,
    val online: Boolean = false,
    val loading: Boolean = true,
    val weightUnit: String = "kg",
    val equipment: String = "bodyweight",
    val pendingSync: Int = 0,
    val syncing: Boolean = false,
    val syncMessage: String? = null,
    val reseeding: Boolean = false,
    val refreshing: Boolean = false,
) {
    /** Prefer today's planned/swapped session, else first open session of the week. */
    val next: PlanSessionDto?
        get() {
            val sessions = plan?.plan?.sessions.orEmpty()
            return WorkoutStats.pickNextSession(
                sessions = sessions,
                todayOffset = WorkoutStats.mondayBasedOffset(),
                dayOffset = { it.dayOffset },
                status = { it.status },
            )
        }
}

@HiltViewModel
class TodayViewModel @Inject constructor(
    private val repository: MwRepository,
    @param:ApplicationContext private val appContext: Context,
) : ViewModel() {
    private val _state = MutableStateFlow(TodayUiState())
    val state: StateFlow<TodayUiState> = _state.asStateFlow()

    init {
        refresh()
    }

    fun refresh(userInitiated: Boolean = false) {
        viewModelScope.launch {
            _state.update {
                it.copy(
                    loading = it.plan == null && !userInitiated,
                    refreshing = userInitiated,
                )
            }
            val unit = WeightUnits.normalize(repository.weightUnit())
            val equipment = repository.equipmentProfile()
            val rows = repository.recentWorkouts(5)
            val weekStats = buildWeekStats(repository, unit)
            val streak = repository.workoutStreakDays()
            val online = NetworkStatus.isOnline(appContext)
            val pendingBefore = repository.pendingSyncCount()
            val pendingAfter = if (pendingBefore > 0 && online) {
                repository.flushOutboxAndCount()
            } else if (pendingBefore > 0) {
                pendingBefore
            } else {
                0
            }
            _state.value = TodayUiState(
                plan = repository.ensureCoachPlan(preferNetwork = userInitiated),
                workouts = repository.workoutCount(),
                recent = rows.map { it.toUi(unit) },
                weekStats = weekStats,
                streakDays = streak,
                online = online,
                loading = false,
                refreshing = false,
                weightUnit = unit,
                equipment = equipment,
                pendingSync = pendingAfter,
                syncMessage = when {
                    pendingBefore > 0 && pendingAfter == 0 -> "Synced $pendingBefore offline log${if (pendingBefore == 1) "" else "s"}."
                    pendingAfter > 0 && !online -> "Offline · $pendingAfter waiting — will retry when online."
                    pendingAfter > 0 -> "On device · $pendingAfter waiting to sync."
                    else -> null
                },
            )
        }
    }

    fun retrySync() {
        viewModelScope.launch {
            val online = NetworkStatus.isOnline(appContext)
            if (!online) {
                _state.update {
                    it.copy(
                        online = false,
                        syncMessage = "You're offline. Logs stay on device until you're back.",
                    )
                }
                return@launch
            }
            _state.update { it.copy(syncing = true, syncMessage = null, online = true) }
            val remaining = repository.flushOutboxAndCount()
            _state.update {
                it.copy(
                    syncing = false,
                    pendingSync = remaining,
                    online = NetworkStatus.isOnline(appContext),
                    syncMessage = if (remaining == 0) {
                        "All clear — nothing pending."
                    } else {
                        "Still $remaining pending (need private cookie if API is gated)."
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

    fun setEquipment(profile: String) {
        viewModelScope.launch {
            if (profile == _state.value.equipment) return@launch
            _state.update { it.copy(reseeding = true) }
            val plan = repository.setEquipmentAndReseed(profile)
            _state.update {
                it.copy(
                    plan = plan,
                    equipment = repository.equipmentProfile(),
                    reseeding = false,
                )
            }
        }
    }
}

private suspend fun buildWeekStats(repository: MwRepository, unit: String): WeekStatsUi {
    val monday = java.time.LocalDate.now()
        .with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY))
        .atStartOfDay(ZoneId.systemDefault())
        .toInstant()
        .toString()
    val week = repository.workoutsSince(monday)
    if (week.isEmpty()) return WeekStatsUi()
    val sets = week.sumOf { it.setCount }
    val volume = week.sumOf { it.totalVolume }
    val seconds = week.sumOf { it.durationSeconds }
    val minutes = (seconds / 60).coerceAtLeast(0)
    return WeekStatsUi(
        workoutCount = week.size,
        setCount = sets,
        volumeLabel = if (volume > 0) "${WeightUnits.format(volume)} $unit" else "—",
        minutesLabel = if (minutes > 0) "${minutes}m" else "—",
    )
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
