package com.missionwinning.app

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.missionwinning.app.nav.MwNavHost
import com.missionwinning.app.nav.PendingDeepLink
import com.missionwinning.core.designsystem.MissionWinningTheme
import com.missionwinning.core.designsystem.MwColors
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    private var deepLink by mutableStateOf<PendingDeepLink?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        // Manifest uses splash theme for cold start; switch to main before Compose draws.
        setTheme(R.style.Theme_MissionWinning)
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        deepLink = parseDeepLink(intent)
        setContent {
            MissionWinningTheme {
                Surface(modifier = Modifier.fillMaxSize(), color = MwColors.Navy) {
                    MwNavHost(
                        pendingDeepLink = deepLink,
                        onDeepLinkConsumed = { deepLink = null },
                    )
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        deepLink = parseDeepLink(intent)
    }

    private fun parseDeepLink(intent: Intent?): PendingDeepLink? {
        if (intent == null) return null
        if (intent.getBooleanExtra(EXTRA_QUICK_LOG, false) ||
            intent.data?.host == "workout" && intent.data?.pathSegments?.firstOrNull() == "quick"
        ) {
            return PendingDeepLink.QuickLog
        }
        if (intent.getBooleanExtra(EXTRA_OPEN_ACTIVE, false)) {
            val sessionId = intent.getStringExtra(EXTRA_SESSION_ID).orEmpty()
            val name = intent.getStringExtra(EXTRA_WORKOUT_NAME).orEmpty()
            if (sessionId.isNotBlank()) {
                return PendingDeepLink.ResumeActive(sessionId = sessionId, name = name)
            }
        }
        val data = intent.data ?: return null
        if (data.scheme == "mw" && data.host == "workout") {
            val path = data.pathSegments
            when (path.firstOrNull()) {
                "quick" -> return PendingDeepLink.QuickLog
                "start" -> {
                    val sessionId = data.getQueryParameter("sessionId").orEmpty()
                    val name = data.getQueryParameter("name") ?: "Workout"
                    val sets = data.getQueryParameter("sets")?.toIntOrNull() ?: 3
                    if (sessionId.isNotBlank()) {
                        return PendingDeepLink.StartWorkout(sessionId, name, sets)
                    }
                }
            }
        }
        return null
    }

    companion object {
        const val EXTRA_OPEN_ACTIVE = "mw_open_active"
        const val EXTRA_SESSION_ID = "mw_session_id"
        const val EXTRA_WORKOUT_NAME = "mw_workout_name"
        const val EXTRA_QUICK_LOG = "mw_quick_log"
    }
}
