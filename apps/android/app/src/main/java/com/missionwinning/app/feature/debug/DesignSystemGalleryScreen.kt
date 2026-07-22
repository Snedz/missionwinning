package com.missionwinning.app.feature.debug

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.missionwinning.core.designsystem.MwCard
import com.missionwinning.core.designsystem.MwChip
import com.missionwinning.core.designsystem.MwChipTone
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwEmptyState
import com.missionwinning.core.designsystem.MwGhostButton
import com.missionwinning.core.designsystem.MwHeroTitle
import com.missionwinning.core.designsystem.MwLoadingBlock
import com.missionwinning.core.designsystem.MwMetricCard
import com.missionwinning.core.designsystem.MwMotion
import com.missionwinning.core.designsystem.MwOfflinePill
import com.missionwinning.core.designsystem.MwPrimaryButton
import com.missionwinning.core.designsystem.MwRadius
import com.missionwinning.core.designsystem.MwRestDock
import com.missionwinning.core.designsystem.MwScreenScaffold
import com.missionwinning.core.designsystem.MwSecondaryButton
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwSpace
import com.missionwinning.core.designsystem.MwStepper
import com.missionwinning.core.designsystem.MwTopBar
import com.missionwinning.core.designsystem.MwTypography

/**
 * Debug-only visual catalog of designsystem tokens/components for agents & QA.
 * Not linked from release builds.
 */
@Composable
fun DesignSystemGalleryScreen(onBack: () -> Unit) {
    MwScreenScaffold {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(MwSpace.md),
        ) {
            MwTopBar(title = "Design system", onBack = onBack)
            MwSectionLabel("Gallery · debug")
            MwHeroTitle("Mission Winning")
            Text(
                "Tokens + Mw* components. Use for visual consistency checks.",
                style = MwTypography.bodyMedium,
                color = MwColors.TextMuted,
            )

            MwSectionLabel("Colors")
            MwCard(elevated = true) {
                ColorSwatchRow(
                    "Navy" to MwColors.Navy,
                    "Elevated" to MwColors.NavyElevated,
                    "Pressed" to MwColors.NavyPressed,
                    "Emerald" to MwColors.Emerald,
                    "Brass" to MwColors.Brass,
                    "Border" to MwColors.Border,
                    "BorderStrong" to MwColors.BorderStrong,
                    "Danger" to MwColors.Danger,
                )
            }

            MwSectionLabel("Space · radius")
            MwCard(elevated = true) {
                Text(
                    "Space md=${MwSpace.md} · section=${MwSpace.section} · hero=${MwSpace.hero}",
                    style = MwTypography.labelMedium,
                    color = MwColors.TextMuted,
                )
                Text(
                    "Radius sm=${MwRadius.sm} · lg=${MwRadius.lg} · xl=${MwRadius.xl}",
                    style = MwTypography.labelMedium,
                    color = MwColors.TextMuted,
                )
            }

            MwSectionLabel("Motion (MwMotion)")
            MwCard(elevated = true) {
                Text(
                    "HubTab=${MwMotion.HubTabMs}ms · Push=${MwMotion.RoutePushMs}ms · " +
                        "Pop=${MwMotion.RoutePopMs}ms · Enter=${MwMotion.EnterFadeMs}ms · " +
                        "Victory=${MwMotion.VictoryLockMs}ms · Pulse=${MwMotion.PulseMs}ms",
                    style = MwTypography.labelMedium,
                    color = MwColors.Brass,
                )
            }

            MwSectionLabel("Type")
            MwCard(elevated = true) {
                Text("Headline · Barlow", style = MwTypography.headlineLarge, color = MwColors.Text)
                Text("Title medium", style = MwTypography.titleMedium, color = MwColors.Text)
                Text("Body medium muted", style = MwTypography.bodyMedium, color = MwColors.TextMuted)
                Text("Label mono · metrics", style = MwTypography.labelMedium, color = MwColors.Brass)
            }

            MwSectionLabel("Chips")
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                MwChip("Emerald", tone = MwChipTone.Emerald)
                MwChip("Brass", tone = MwChipTone.Brass)
                MwChip("Neutral", tone = MwChipTone.Neutral)
                MwChip("Danger", tone = MwChipTone.Danger)
            }
            MwOfflinePill(online = true)
            MwOfflinePill(online = false)

            MwSectionLabel("Buttons")
            MwPrimaryButton(text = "Primary CTA", onClick = {})
            MwSecondaryButton(text = "Secondary", onClick = {})
            MwGhostButton(text = "Ghost", onClick = {})

            MwSectionLabel("Hero card")
            MwCard(elevated = true, glow = true, hero = true) {
                MwSectionLabel("Current set · 1 / 3")
                Text("Back squat", style = MwTypography.headlineMedium, color = MwColors.Text)
                MwStepper(
                    label = "Reps",
                    value = "8",
                    onMinus = {},
                    onPlus = {},
                )
                MwPrimaryButton(text = "Complete set", onClick = {})
            }

            MwSectionLabel("Rest dock")
            MwRestDock(
                secondsLeft = 45,
                totalSeconds = 90,
                onMinus = {},
                onSkip = {},
                onPlus = {},
            )

            MwSectionLabel("Metrics")
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Box(Modifier.weight(1f)) {
                    MwMetricCard(label = "Streak", value = "4d")
                }
                Box(Modifier.weight(1f)) {
                    MwMetricCard(label = "Volume", value = "12.4k")
                }
            }

            MwSectionLabel("States")
            MwCard(elevated = true) {
                MwLoadingBlock(lines = 3)
            }
            MwEmptyState(
                title = "Empty state",
                body = "Example when a list has no rows.",
                cta = "Action",
                onCta = {},
            )

            Spacer(Modifier.height(24.dp))
        }
    }
}

@Composable
private fun ColorSwatchRow(vararg pairs: Pair<String, Color>) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        pairs.toList().chunked(3).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                row.forEach { (name, color) ->
                    Column {
                        Box(
                            Modifier
                                .size(48.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(color),
                        )
                        Text(name, style = MwTypography.labelMedium, color = MwColors.TextMuted)
                    }
                }
            }
        }
    }
}
