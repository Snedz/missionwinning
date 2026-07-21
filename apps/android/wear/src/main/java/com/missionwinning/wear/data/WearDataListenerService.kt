package com.missionwinning.wear.data

import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
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
        }
    }
}
