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
    fun complete(onDone: () -> Unit) {
        viewModelScope.launch {
            repository.markIdayDone()
            repository.ensureCoachPlan()
            onDone()
        }
    }
}
