package com.missionwinning.wear.data

import com.missionwinning.core.common.ActiveSessionHub
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/** In-memory mirror of phone active session on the watch. */
object WearSessionStore {
    private val _session = MutableStateFlow(ActiveSessionHub.Snapshot())
    val session: StateFlow<ActiveSessionHub.Snapshot> = _session.asStateFlow()

    fun update(snapshot: ActiveSessionHub.Snapshot) {
        _session.value = snapshot
    }
}
