package com.missionwinning.wear.data

import com.missionwinning.core.common.ActiveSessionHub
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/** In-memory mirror of phone active session on the watch. */
object WearSessionStore {
    private val _session = MutableStateFlow(ActiveSessionHub.Snapshot())
    val session: StateFlow<ActiveSessionHub.Snapshot> = _session.asStateFlow()

    private val _phoneLinked = MutableStateFlow(true)
    val phoneLinked: StateFlow<Boolean> = _phoneLinked.asStateFlow()

    private val _lastSendStatus = MutableStateFlow<String?>(null)
    val lastSendStatus: StateFlow<String?> = _lastSendStatus.asStateFlow()

    fun update(snapshot: ActiveSessionHub.Snapshot) {
        _session.value = snapshot
    }

    fun setPhoneLinked(linked: Boolean) {
        _phoneLinked.value = linked
    }

    fun setSendStatus(message: String?) {
        _lastSendStatus.value = message
    }

    fun noteCompleteAck(setId: String, ok: Boolean) {
        _lastSendStatus.value = if (ok) {
            "Phone saved set"
        } else {
            "Phone rejected set · retry"
        }
    }
}
