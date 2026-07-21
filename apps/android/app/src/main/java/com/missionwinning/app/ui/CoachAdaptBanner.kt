package com.missionwinning.app.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.unit.dp
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwTypography
import com.missionwinning.core.network.CoachPlanResponseDto

@Composable
fun CoachAdaptBanner(resp: CoachPlanResponseDto) {
    if (!resp.hasAdaptSignal) return
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .drawBehind {
                drawLine(
                    color = MwColors.Brass,
                    start = Offset(0f, 0f),
                    end = Offset(0f, size.height),
                    strokeWidth = 6f,
                )
            }
            .padding(start = 14.dp, top = 4.dp, bottom = 4.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
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
