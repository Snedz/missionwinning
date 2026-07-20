package com.missionwinning.app.feature.iday

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwGhostButton
import com.missionwinning.core.designsystem.MwPrimaryButton
import com.missionwinning.core.designsystem.MwTypography
import kotlinx.coroutines.launch

@Composable
fun IdayScreen(
    repository: MwRepository,
    onFinished: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    fun complete() {
        scope.launch {
            repository.markIdayDone()
            repository.ensureCoachPlan()
            onFinished()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
    ) {
        Text("Mission Winning", style = MwTypography.headlineLarge, color = MwColors.Text)
        Text(
            "Adaptive AI coach for people who train at home or in a park — free offline logging, weekly plans from logs alone. No wearable required.",
            style = MwTypography.bodyLarge,
            color = MwColors.TextMuted,
            modifier = Modifier.padding(top = 12.dp, bottom = 24.dp),
        )
        Text(
            "I-Day is short. Native v1 ships Train + Coach. Everything else stays on missionwinning.com until we deepen the app.",
            style = MwTypography.bodyLarge,
            color = MwColors.Text,
            modifier = Modifier.padding(bottom = 24.dp),
        )
        MwPrimaryButton(
            text = "Start mission",
            onClick = { complete() },
            modifier = Modifier.semantics { contentDescription = "Start mission" },
        )
        MwGhostButton(text = "I already train — skip", onClick = { complete() })
    }
}
