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
            _state.updateLoading()
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
            val workouts = repository.recentWorkouts(14).asReversed() // oldest → newest for chart
            val volumes = workouts.map { it.totalVolume }
            val bars = Progression.barFractions(volumes)
            val labels = workouts.map { shortDay(it.completedAt) }
            val values = workouts.map {
                if (it.totalVolume > 0) WeightUnits.format(it.totalVolume) else "0"
            }
            val totalVol = workouts.sumOf { it.totalVolume }
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
            )
        }
    }

    private fun MutableStateFlow<ProgressUiState>.updateLoading() {
        value = value.copy(loading = true)
    }
}

private fun formatWhen(iso: String): String =
    runCatching {
        Instant.parse(iso).atZone(ZoneId.systemDefault())
            .format(DateTimeFormatter.ofPattern("MMM d", Locale.US))
    }.getOrDefault(iso.take(10))

private fun shortDay(iso: String): String =
    runCatching {
        Instant.parse(iso).atZone(ZoneId.systemDefault())
            .format(DateTimeFormatter.ofPattern("EE", Locale.US))
    }.getOrDefault("·")
