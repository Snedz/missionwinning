package com.missionwinning.wear.data

import android.content.Context
import com.google.android.gms.wearable.DataClient
import com.google.android.gms.wearable.DataItem
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.Node
import com.google.android.gms.wearable.Wearable
import com.missionwinning.core.common.WearProtocol
import kotlinx.coroutines.delay
import kotlinx.coroutines.tasks.await

class WearPhoneClient(
    context: Context,
) {
    private val appContext = context.applicationContext

    data class SendResult(val delivered: Boolean, val nodeCount: Int)

    suspend fun phoneConnected(): Boolean =
        connectedNodes().isNotEmpty()

    suspend fun connectedNodes(): List<Node> =
        runCatching {
            Wearable.getNodeClient(appContext).connectedNodes.await()
        }.getOrDefault(emptyList())

    /**
     * Send complete with one retry — improves reliability when phone is pocketed.
     */
    suspend fun sendComplete(setId: String, reps: Int, weight: Double): SendResult {
        val payload = WearProtocol.encodeComplete(setId, reps, weight)
        return sendWithRetry(WearProtocol.PATH_COMPLETE, payload)
    }

    suspend fun sendSkipRest(): SendResult =
        sendWithRetry(WearProtocol.PATH_SKIP_REST, byteArrayOf())

    suspend fun sendPing(): SendResult =
        sendWithRetry(WearProtocol.PATH_PING, byteArrayOf(1))

    private suspend fun sendWithRetry(path: String, payload: ByteArray): SendResult {
        var nodes = connectedNodes()
        if (nodes.isEmpty()) {
            delay(400)
            nodes = connectedNodes()
        }
        if (nodes.isEmpty()) return SendResult(delivered = false, nodeCount = 0)
        val messageClient = Wearable.getMessageClient(appContext)
        var ok = false
        for (node in nodes) {
            val first = runCatching {
                messageClient.sendMessage(node.id, path, payload).await()
                true
            }.getOrDefault(false)
            if (!first) {
                delay(300)
                ok = runCatching {
                    messageClient.sendMessage(node.id, path, payload).await()
                    true
                }.getOrDefault(false) || ok
            } else {
                ok = true
            }
        }
        return SendResult(delivered = ok, nodeCount = nodes.size)
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
