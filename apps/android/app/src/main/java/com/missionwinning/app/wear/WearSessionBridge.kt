package com.missionwinning.app.wear

import android.content.Context
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable
import com.missionwinning.core.common.ActiveSessionHub
import com.missionwinning.core.common.WearProtocol
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

/**
 * Pushes active session state to connected Wear nodes (phone is SoT).
 */
class WearSessionBridge(
    context: Context,
) {
    private val appContext = context.applicationContext
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private var job: Job? = null

    fun start() {
        if (job?.isActive == true) return
        job = scope.launch {
            ActiveSessionHub.snapshot.collectLatest { snap ->
                runCatching { publish(snap) }
            }
        }
    }

    fun stop() {
        job?.cancel()
        job = null
        scope.launch {
            runCatching { publish(ActiveSessionHub.Snapshot()) }
        }
    }

    private suspend fun publish(snap: ActiveSessionHub.Snapshot) {
        val dataClient = Wearable.getDataClient(appContext)
        val req = PutDataMapRequest.create(WearProtocol.PATH_ACTIVE).apply {
            dataMap.putByteArray("payload", WearProtocol.encodeActive(snap))
            dataMap.putLong("ts", System.currentTimeMillis())
        }.asPutDataRequest().setUrgent()
        dataClient.putDataItem(req).await()
    }
}
