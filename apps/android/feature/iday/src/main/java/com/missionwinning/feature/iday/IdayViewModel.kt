package com.missionwinning.feature.iday

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.missionwinning.core.data.MwRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class IdayViewModel @Inject constructor(
    private val repository: MwRepository,
) : ViewModel() {
    fun complete(
        equipment: String = "bodyweight",
        telemetryOptIn: Boolean = false,
        onDone: () -> Unit,
    ) {
        viewModelScope.launch {
            repository.setTelemetryOptIn(telemetryOptIn)
            repository.setEquipmentAndReseed(equipment)
            repository.markIdayDone()
            onDone()
        }
    }
}
