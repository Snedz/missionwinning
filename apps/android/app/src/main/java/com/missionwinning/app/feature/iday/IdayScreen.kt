package com.missionwinning.app.feature.iday

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.designsystem.MwBrassRule
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwEnterFade
import com.missionwinning.core.designsystem.MwGhostButton
import com.missionwinning.core.designsystem.MwPrimaryButton
import com.missionwinning.core.designsystem.MwScreenScaffold
import com.missionwinning.core.designsystem.MwSectionLabel
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

    MwScreenScaffold {
        MwEnterFade {
            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.SpaceBetween,
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    MwSectionLabel("Mission Winning")
                    Text(
                        text = "Mission Winning",
                        style = MwTypography.displayLarge,
                        color = MwColors.Text,
                    )
                    MwBrassRule()
                    Spacer(Modifier.height(4.dp))
                    Text(
                        text = "Train Anywhere. Win Daily.",
                        style = MwTypography.titleLarge,
                        color = MwColors.Emerald,
                    )
                    Text(
                        text = "Free offline logging and a weekly plan that adapts from your workouts — no wearable required.",
                        style = MwTypography.bodyLarge,
                        color = MwColors.TextMuted,
                    )
                }
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    MwPrimaryButton(
                        text = "Start mission",
                        contentDescription = "Start mission",
                        onClick = { complete() },
                    )
                    MwGhostButton(text = "I already train — skip", onClick = { complete() })
                }
            }
        }
    }
}
