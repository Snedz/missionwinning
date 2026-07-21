package com.missionwinning.wear.data

import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService
import com.missionwinning.core.common.WearProtocol

class WearDataListenerService : WearableListenerService() {
    override fun onDataChanged(dataEvents: DataEventBuffer) {
        dataEvents.forEach { event ->
            if (event.type != DataEvent.TYPE_CHANGED) return@forEach
            val path = event.dataItem.uri.path ?: return@forEach
            if (path != WearProtocol.PATH_ACTIVE) return@forEach
            val map = DataMapItem.fromDataItem(event.dataItem).dataMap
            val payload = map.getByteArray("payload")
            val snap = WearProtocol.decodeActive(payload) ?: return@forEach
            WearSessionStore.update(snap)
            // Request tile refresh when session changes
            runCatching {
                androidx.wear.tiles.TileService.getUpdater(this)
                    .requestUpdate(com.missionwinning.wear.tile.MwSessionTileService::class.java)
            }
        }
    }

    override fun onMessageReceived(messageEvent: MessageEvent) {
        if (messageEvent.path == WearProtocol.PATH_COMPLETE_ACK) {
            val ack = WearProtocol.decodeCompleteAck(messageEvent.data) ?: return
            WearSessionStore.noteCompleteAck(ack.first, ack.second)
        }
    }
}
