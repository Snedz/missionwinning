package com.missionwinning.feature.today

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.model.ExerciseCatalog
import com.missionwinning.core.model.Progression
import com.missionwinning.core.model.SetKind
import com.missionwinning.core.model.WeightUnits
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale
import javax.inject.Inject

data class PrUi(
    val exerciseName: String,
    val loadLabel: String,
    val e1rmLabel: String,
    val whenLabel: String,
)

data class ProgressUiState(
    val loading: Boolean = true,
    val weightUnit: String = "kg",
    val prs: List<PrUi> = emptyList(),
    val volumeBars: List<Float> = emptyList(),
    val volumeLabels: List<String> = emptyList(),
    val volumeValues: List<String> = emptyList(),
    val totalVolumeLabel: String = "—",
    val workoutCount: Int = 0,
    /** 28-day heat map levels 0–4 (oldest → newest). */
    val heatLevels: List<Int> = emptyList(),
    val heatStartLabel: String = "",
    val heatEndLabel: String = "",
    /** 8-week volume bars (oldest → newest). */
    val weekBars: List<Float> = emptyList(),
    val weekLabels: List<String> = emptyList(),
    val bodyWeightLabel: String = "—",
    val bodyWeightInput: String = "",
    val bodyWeightUnit: String = "kg",
    val streakDays: Int = 0,
    val trainedDays28: Int = 0,
)

@HiltViewModel
class ProgressViewModel @Inject constructor(
    private val repository: MwRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(ProgressUiState())
    val state: StateFlow<ProgressUiState> = _state.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _state.value = _state.value.copy(loading = true)
            val unit = WeightUnits.normalize(repository.weightUnit())
            val sets = repository.recentWeightedSets(500).map { row ->
                val from = WeightUnits.normalize(row.weightUnit.ifBlank { unit })
                val w = if (from == unit) row.weight else WeightUnits.convert(row.weight, from, unit)
                Progression.SetSample(
                    exerciseId = row.exerciseId,
                    exerciseName = ExerciseCatalog.displayName(row.exerciseId)
                        .ifBlank { row.exerciseName },
                    weight = w,
                    reps = row.reps,
                    completedAt = row.completedAt,
                    weightUnit = unit,
                    kind = SetKind.fromCode(row.setKind),
                )
            }
            val prs = Progression.personalRecords(sets, limit = 12).map { pr ->
                PrUi(
                    exerciseName = pr.exerciseName,
                    loadLabel = "${WeightUnits.format(pr.weight)} $unit × ${pr.reps}",
                    e1rmLabel = "e1RM ${WeightUnits.format(pr.estimated1rm)} $unit",
                    whenLabel = formatWhen(pr.completedAt),
                )
            }
            val recent14 = repository.recentWorkouts(14).asReversed()
            val volumes = recent14.map { it.totalVolume }
            val bars = Progression.barFractions(volumes)
            val labels = recent14.map { shortDay(it.completedAt) }
            val values = recent14.map {
                if (it.totalVolume > 0) WeightUnits.format(it.totalVolume) else "0"
            }
            val totalVol = recent14.sumOf { it.totalVolume }

            val allRecent = repository.recentWorkouts(120)
            val pairs = allRecent.map { it.completedAt to it.totalVolume }
            val dayVol = Progression.volumeByDay(pairs, dayCount = 28)
            val heat = Progression.heatMap(dayVol)
            val weekSeries = Progression.weeklyVolumes(pairs, weekCount = 8)
            val weekBars = Progression.barFractions(weekSeries.map { it.volume })
            val weekLabels = weekSeries.map { it.label }

            val bwUnit = WeightUnits.normalize(repository.bodyWeightUnit())
            val bw = repository.bodyWeight()
            val streak = repository.workoutStreakDays()

            _state.value = ProgressUiState(
                loading = false,
                weightUnit = unit,
                prs = prs,
                volumeBars = bars,
                volumeLabels = labels,
                volumeValues = values,
                totalVolumeLabel = if (totalVol > 0) {
                    "${WeightUnits.format(totalVol)} $unit"
                } else {
                    "—"
                },
                workoutCount = repository.workoutCount(),
                heatLevels = heat.map { it.level },
                heatStartLabel = heat.firstOrNull()?.date?.format(MONTH_DAY) ?: "",
                heatEndLabel = heat.lastOrNull()?.date?.format(MONTH_DAY) ?: "",
                weekBars = weekBars,
                weekLabels = weekLabels,
                bodyWeightLabel = bw?.let { "${WeightUnits.format(it)} $bwUnit" } ?: "—",
                bodyWeightInput = bw?.let { WeightUnits.format(it) } ?: "",
                bodyWeightUnit = bwUnit,
                streakDays = streak,
                trainedDays28 = heat.count { it.workoutCount > 0 },
            )
        }
    }

    fun onBodyWeightInput(raw: String) {
        _state.value = _state.value.copy(bodyWeightInput = raw.filter { it.isDigit() || it == '.' }.take(6))
    }

    fun setBodyWeightUnit(unit: String) {
        viewModelScope.launch {
            repository.setBodyWeightUnit(unit)
            _state.value = _state.value.copy(bodyWeightUnit = WeightUnits.normalize(unit))
        }
    }

    fun saveBodyWeight() {
        viewModelScope.launch {
            val parsed = _state.value.bodyWeightInput.toDoubleOrNull()
            repository.setBodyWeight(parsed)
            repository.setBodyWeightUnit(_state.value.bodyWeightUnit)
            refresh()
        }
    }
}

private val MONTH_DAY: DateTimeFormatter =
    DateTimeFormatter.ofPattern("MMM d", Locale.US)

private fun formatWhen(iso: String): String =
    runCatching {
        Instant.parse(iso).atZone(ZoneId.systemDefault())
            .format(MONTH_DAY)
    }.getOrDefault(iso.take(10))

private fun shortDay(iso: String): String =
    runCatching {
        Instant.parse(iso).atZone(ZoneId.systemDefault())
            .format(DateTimeFormatter.ofPattern("EE", Locale.US))
    }.getOrDefault("·")
