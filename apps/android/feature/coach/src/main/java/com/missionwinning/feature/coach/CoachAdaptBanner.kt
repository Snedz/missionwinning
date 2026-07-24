package com.missionwinning.feature.coach

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.missionwinning.core.designsystem.MwCard
import com.missionwinning.core.designsystem.MwChip
import com.missionwinning.core.designsystem.MwChipTone
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwFreeBeta
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwSpace
import com.missionwinning.core.designsystem.MwTypography
import com.missionwinning.core.network.CoachPlanResponseDto

@Composable
fun CoachAdaptBanner(
    resp: CoachPlanResponseDto,
    premium: Boolean = false,
    modifier: Modifier = Modifier,
) {
    if (!resp.hasAdaptSignal && resp.adaptBeats.isEmpty()) return
    MwCard(modifier = modifier, elevated = true, glow = true, hero = true) {
        MwSectionLabel("Week adapted · rev ${resp.plan.revision}")
        if (premium) {
            MwChip(
                if (MwFreeBeta.ENABLED) "Open beta depth" else "Coach depth",
                tone = MwChipTone.Emerald,
            )
        }
        if (resp.adaptBeats.isEmpty()) {
            Text(
                "Plan revised from your logs — no wearable required.",
                style = MwTypography.titleMedium,
                color = MwColors.Text,
            )
        } else {
            // Free: first beat; premium: full list
            val beats = if (premium) resp.adaptBeats else resp.adaptBeats.take(1)
            beats.forEach { beat ->
                Text(beat.defaultMessage, style = MwTypography.titleMedium, color = MwColors.Text)
            }
            if (!premium && resp.adaptBeats.size > 1) {
                Spacer(Modifier.height(MwSpace.sm))
                Text(
                    "+${resp.adaptBeats.size - 1} more adapt notes with full coach depth on this account.",
                    style = MwTypography.labelMedium,
                    color = MwColors.TextMuted,
                )
            }
        }
    }
}

@Composable
fun CoachInsightStack(
    insights: List<CoachInsightUi>,
    premium: Boolean,
    modifier: Modifier = Modifier,
) {
    if (insights.isEmpty()) return
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(MwSpace.sm)) {
        MwSectionLabel(if (premium) "Coach insights" else "Coach notes")
        insights.forEach { card ->
            MwCard(elevated = true) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        card.title,
                        style = MwTypography.titleMedium,
                        color = MwColors.Text,
                    )
                    if (card.premiumBadge) {
                        MwChip("Depth", tone = MwChipTone.Brass)
                    }
                }
                Text(
                    card.body,
                    style = MwTypography.bodyMedium,
                    color = MwColors.TextMuted,
                )
            }
        }
    }
}
