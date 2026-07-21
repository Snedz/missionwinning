package com.missionwinning.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.missionwinning.app.nav.MwNavHost
import com.missionwinning.core.designsystem.MissionWinningTheme
import com.missionwinning.core.designsystem.MwColors
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MissionWinningTheme {
                Surface(modifier = Modifier.fillMaxSize(), color = MwColors.Navy) {
                    MwNavHost()
                }
            }
        }
    }
}
