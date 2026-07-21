package com.missionwinning.app.wear

import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService
import com.missionwinning.core.common.ActiveSessionHub
import com.missionwinning.core.common.WearProtocol

/**
 * Receives Wear commands (complete set / skip rest). Phone ActiveViewModel applies them.
 */
class WearMessageService : WearableListenerService() {
    override fun onMessageReceived(messageEvent: MessageEvent) {
        when (messageEvent.path) {
            WearProtocol.PATH_SKIP_REST -> {
                ActiveSessionHub.offer(ActiveSessionHub.Command.SkipRest)
            }
            WearProtocol.PATH_COMPLETE -> {
                val decoded = WearProtocol.decodeComplete(messageEvent.data) ?: return
                val (setId, reps, weight) = decoded
                ActiveSessionHub.offer(
                    ActiveSessionHub.Command.CompleteSet(
                        setId = setId,
                        reps = reps,
                        weight = weight,
                    ),
                )
            }
            WearProtocol.PATH_PING -> Unit
            else -> Unit
        }
    }
}
