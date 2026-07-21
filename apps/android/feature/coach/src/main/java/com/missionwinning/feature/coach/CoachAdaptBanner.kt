package com.missionwinning.feature.coach

import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.missionwinning.core.designsystem.MwCard
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwTypography
import com.missionwinning.core.network.CoachPlanResponseDto

@Composable
fun CoachAdaptBanner(resp: CoachPlanResponseDto, modifier: Modifier = Modifier) {
    if (!resp.hasAdaptSignal) return
    MwCard(modifier = modifier, elevated = true, glow = true) {
        MwSectionLabel("Week adapted · rev ${resp.plan.revision}")
        if (resp.adaptBeats.isEmpty()) {
            Text(
                "Plan revised from your logs — no wearable required.",
                style = MwTypography.bodyMedium,
                color = MwColors.Text,
            )
        } else {
            resp.adaptBeats.forEach { beat ->
                Text(beat.defaultMessage, style = MwTypography.bodyMedium, color = MwColors.Text)
            }
        }
    }
}
