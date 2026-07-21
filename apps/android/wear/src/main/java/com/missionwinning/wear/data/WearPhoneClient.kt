package com.missionwinning.wear.data

import android.content.Context
import com.google.android.gms.wearable.DataClient
import com.google.android.gms.wearable.DataItem
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.Node
import com.google.android.gms.wearable.Wearable
import com.missionwinning.core.common.WearProtocol
import kotlinx.coroutines.tasks.await

class WearPhoneClient(
    context: Context,
) {
    private val appContext = context.applicationContext

    suspend fun sendComplete(setId: String, reps: Int, weight: Double) {
        val nodes: List<Node> = Wearable.getNodeClient(appContext).connectedNodes.await()
        val payload = WearProtocol.encodeComplete(setId, reps, weight)
        val messageClient = Wearable.getMessageClient(appContext)
        for (node in nodes) {
            runCatching {
                messageClient.sendMessage(node.id, WearProtocol.PATH_COMPLETE, payload).await()
            }
        }
    }

    suspend fun sendSkipRest() {
        val nodes: List<Node> = Wearable.getNodeClient(appContext).connectedNodes.await()
        val messageClient = Wearable.getMessageClient(appContext)
        for (node in nodes) {
            runCatching {
                messageClient.sendMessage(node.id, WearProtocol.PATH_SKIP_REST, byteArrayOf()).await()
            }
        }
    }

    suspend fun refreshActiveFromDataLayer() {
        val dataClient: DataClient = Wearable.getDataClient(appContext)
        val buffer = dataClient.dataItems.await()
        try {
            val items: List<DataItem> = buffer.toList()
            for (item in items) {
                if (item.uri.path == WearProtocol.PATH_ACTIVE) {
                    val map = DataMapItem.fromDataItem(item).dataMap
                    val snap = WearProtocol.decodeActive(map.getByteArray("payload"))
                    if (snap != null) WearSessionStore.update(snap)
                }
            }
        } finally {
            buffer.release()
        }
    }
}
