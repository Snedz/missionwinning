package com.missionwinning.feature.today

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.missionwinning.core.data.MwRepository
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

data class RoutineListItem(
    val id: String,
    val name: String,
    val exerciseCount: Int,
    val setCount: Int,
    val whenLabel: String,
)

data class RoutinesUiState(
    val loading: Boolean = true,
    val routines: List<RoutineListItem> = emptyList(),
)

@HiltViewModel
class RoutinesViewModel @Inject constructor(
    private val repository: MwRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(RoutinesUiState())
    val state: StateFlow<RoutinesUiState> = _state.asStateFlow()

    fun refresh() {
        viewModelScope.launch {
            _state.update { it.copy(loading = true) }
            val rows = repository.allRoutines()
            val items = rows.map { row ->
                val exercises = repository.parseRoutineExercises(row.exercisesJson)
                RoutineListItem(
                    id = row.id,
                    name = row.name.ifBlank { "Routine" },
                    exerciseCount = exercises.size,
                    setCount = exercises.sumOf { it.sets.coerceIn(1, 12) },
                    whenLabel = formatWhen(row.createdAt),
                )
            }
            _state.value = RoutinesUiState(loading = false, routines = items)
        }
    }

    fun delete(id: String) {
        viewModelScope.launch {
            repository.deleteRoutine(id)
            refresh()
        }
    }

    /** Session id + name + target set count for Active. */
    fun startArgs(item: RoutineListItem): Triple<String, String, Int> {
        val sessionId = MwRepository.routineSessionId(item.id)
        val sets = item.setCount.coerceIn(1, 48)
        return Triple(sessionId, item.name, sets)
    }
}

private fun formatWhen(iso: String): String {
    return runCatching {
        val instant = Instant.parse(iso)
        val zoned = instant.atZone(ZoneId.systemDefault())
        zoned.format(DateTimeFormatter.ofPattern("MMM d · yyyy", Locale.US))
    }.getOrDefault(iso.take(10))
}
