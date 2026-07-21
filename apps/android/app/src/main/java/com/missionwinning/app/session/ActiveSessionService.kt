package com.missionwinning.app.session

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import com.missionwinning.app.MainActivity
import com.missionwinning.app.R
import com.missionwinning.core.common.ActiveSessionHub
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

/**
 * Foreground service keeps the Active session visible after swipe-away.
 * Rest countdown uses [ActiveSessionHub.Snapshot.restDeadlineMs] (screen-off accurate).
 */
class ActiveSessionService : Service() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private var ticker: Job? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_SKIP_REST -> {
                ActiveSessionHub.offer(ActiveSessionHub.Command.SkipRest)
            }
            ACTION_STOP -> {
                stopSelfSafely()
                return START_NOT_STICKY
            }
            else -> Unit
        }
        ensureChannel()
        val notification = buildNotification(ActiveSessionHub.snapshot.value)
        ServiceCompat.startForeground(
            this,
            NOTIFICATION_ID,
            notification,
            if (Build.VERSION.SDK_INT >= 34) {
                ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
            } else {
                0
            },
        )
        startTicker()
        return START_STICKY
    }

    override fun onDestroy() {
        ticker?.cancel()
        scope.cancel()
        super.onDestroy()
    }

    private fun startTicker() {
        if (ticker?.isActive == true) return
        ticker = scope.launch {
            while (isActive) {
                val snap = ActiveSessionHub.snapshot.value
                if (!snap.active) {
                    stopSelfSafely()
                    break
                }
                val nm = getSystemService(NotificationManager::class.java)
                nm.notify(NOTIFICATION_ID, buildNotification(snap))
                delay(1000)
            }
        }
    }

    private fun stopSelfSafely() {
        ticker?.cancel()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun buildNotification(snap: ActiveSessionHub.Snapshot): Notification {
        val open = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra(MainActivity.EXTRA_OPEN_ACTIVE, true)
                putExtra(MainActivity.EXTRA_SESSION_ID, snap.sessionId)
                putExtra(MainActivity.EXTRA_WORKOUT_NAME, snap.workoutName)
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val skipRest = PendingIntent.getService(
            this,
            1,
            Intent(this, ActiveSessionService::class.java).setAction(ACTION_SKIP_REST),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val restLeft = snap.restSecondsLeft()
        val title = snap.workoutName.ifBlank { getString(R.string.app_name) }
        val text = buildString {
            append("${snap.doneSets}/${snap.totalSets} sets")
            if (restLeft > 0) {
                append(" · rest ${formatRest(restLeft)}")
            } else if (snap.totalSets > 0 && snap.doneSets >= snap.totalSets) {
                append(" · ready to finish")
            }
        }
        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(text)
            .setSubText(getString(R.string.session_ongoing))
            .setContentIntent(open)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setCategory(NotificationCompat.CATEGORY_WORKOUT)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setColor(0xFF27B07D.toInt())
        if (restLeft > 0) {
            builder.addAction(
                0,
                getString(R.string.skip_rest),
                skipRest,
            )
        }
        return builder.build()
    }

    private fun ensureChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val nm = getSystemService(NotificationManager::class.java)
        val channel = NotificationChannel(
            CHANNEL_ID,
            getString(R.string.session_channel_name),
            NotificationManager.IMPORTANCE_LOW,
        ).apply {
            description = getString(R.string.session_channel_desc)
            setShowBadge(false)
        }
        nm.createNotificationChannel(channel)
    }

    companion object {
        const val CHANNEL_ID = "mw_active_session"
        const val NOTIFICATION_ID = 4201
        const val ACTION_SKIP_REST = "com.missionwinning.app.SKIP_REST"
        const val ACTION_STOP = "com.missionwinning.app.STOP_SESSION_SERVICE"

        fun start(context: Context) {
            val intent = Intent(context, ActiveSessionService::class.java)
            context.startForegroundService(intent)
        }

        fun stop(context: Context) {
            val intent = Intent(context, ActiveSessionService::class.java).setAction(ACTION_STOP)
            context.startService(intent)
        }

        private fun formatRest(seconds: Int): String {
            val m = seconds / 60
            val s = seconds % 60
            return if (m > 0) "%d:%02d".format(m, s) else "${s}s"
        }
    }
}
