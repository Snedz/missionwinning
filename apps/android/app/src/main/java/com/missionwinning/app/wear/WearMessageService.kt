package com.missionwinning.app.wear

import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.Wearable
import com.google.android.gms.wearable.WearableListenerService
import com.missionwinning.core.common.ActiveSessionHub
import com.missionwinning.core.common.WearProtocol
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

/**
 * Receives Wear commands (complete set / skip rest). Phone ActiveViewModel applies them.
 * Sends complete ACK so the watch can confirm delivery (Phase 13).
 */
class WearMessageService : WearableListenerService() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onMessageReceived(messageEvent: MessageEvent) {
        when (messageEvent.path) {
            WearProtocol.PATH_SKIP_REST -> {
                ActiveSessionHub.offer(ActiveSessionHub.Command.SkipRest)
            }
            WearProtocol.PATH_COMPLETE -> {
                val decoded = WearProtocol.decodeComplete(messageEvent.data)
                if (decoded == null) {
                    replyAck(messageEvent.sourceNodeId, "", ok = false)
                    return
                }
                val (setId, reps, weight) = decoded
                ActiveSessionHub.offer(
                    ActiveSessionHub.Command.CompleteSet(
                        setId = setId,
                        reps = reps,
                        weight = weight,
                    ),
                )
                replyAck(messageEvent.sourceNodeId, setId, ok = true)
            }
            WearProtocol.PATH_PING -> {
                // Watch connectivity probe — no-op
            }
            else -> Unit
        }
    }

    private fun replyAck(nodeId: String, setId: String, ok: Boolean) {
        if (nodeId.isBlank()) return
        scope.launch {
            runCatching {
                val payload = WearProtocol.encodeCompleteAck(setId.ifBlank { "_" }, ok)
                Wearable.getMessageClient(this@WearMessageService)
                    .sendMessage(nodeId, WearProtocol.PATH_COMPLETE_ACK, payload)
                    .await()
            }
        }
    }
}
