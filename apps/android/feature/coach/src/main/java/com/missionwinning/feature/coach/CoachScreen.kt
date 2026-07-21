package com.missionwinning.feature.coach

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.missionwinning.core.designsystem.MwCard
import com.missionwinning.core.designsystem.MwChip
import com.missionwinning.core.designsystem.MwChipTone
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwEnterFade
import com.missionwinning.core.designsystem.MwGhostButton
import com.missionwinning.core.designsystem.MwHeroTitle
import com.missionwinning.core.designsystem.MwLoadingBlock
import com.missionwinning.core.designsystem.MwOfflinePill
import com.missionwinning.core.designsystem.MwScreenScaffold
import com.missionwinning.core.designsystem.MwSecondaryButton
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwSessionTile
import com.missionwinning.core.designsystem.MwSpace
import com.missionwinning.core.designsystem.MwTypography
import java.time.LocalDate

@Composable
fun CoachScreen(
    onStartWorkout: (sessionId: String, name: String, sets: Int) -> Unit,
    onBack: () -> Unit,
    viewModel: CoachViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val planResp = state.plan
    val todayOffset = ((LocalDate.now().dayOfWeek.value + 6) % 7)

    MwScreenScaffold {
        MwEnterFade {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(MwSpace.md),
            ) {
                MwSectionLabel("Plan")
                MwHeroTitle("Mission Coach")
                Text(
                    "Weekly plan from your logs — adapts when life happens.",
                    style = MwTypography.bodyMedium,
                    color = MwColors.TextMuted,
                )

                MwCard(elevated = true) {
                    MwOfflinePill()
                    Text(
                        "Week of ${planResp?.plan?.weekStart ?: "—"}",
                        style = MwTypography.titleLarge,
                        color = MwColors.Text,
                    )
                    androidx.compose.foundation.layout.Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        MwChip("${planResp?.plan?.daysPerWeek ?: 0} days", tone = MwChipTone.Emerald)
                        MwChip("rev ${planResp?.plan?.revision ?: 0}", tone = MwChipTone.Brass)
                    }
                }

                if (state.loading) {
                    MwCard(elevated = true) {
                        MwLoadingBlock(lines = 5)
                    }
                }

                planResp?.let { CoachAdaptBanner(it) }

                MwSectionLabel("Sessions")
                planResp?.plan?.sessions?.forEach { s ->
                    val actionable = s.status == "planned" || s.status == "swapped"
                    val tone = when (s.status) {
                        "done" -> MwChipTone.Emerald
                        "swapped" -> MwChipTone.Brass
                        else -> MwChipTone.Neutral
                    }
                    MwSessionTile(
                        dayLabel = "DAY +${s.dayOffset}",
                        title = s.name,
                        subtitle = "${s.estMinutes}m · ${s.exercises.size} exercises · ${s.kind}",
                        statusLabel = s.status,
                        statusTone = tone,
                        highlighted = s.dayOffset == todayOffset,
                        actionable = actionable,
                        onClick = {
                            val sets = s.exercises.sumOf { it.sets }.coerceAtLeast(3)
                            onStartWorkout(s.id, s.name, sets)
                        },
                    )
                }

                Spacer(Modifier.height(4.dp))
                MwSecondaryButton(
                    text = "Seed adapt demo (miss + swap)",
                    onClick = { viewModel.seedAdaptDemo() },
                )
                MwGhostButton(text = "Refresh plan", onClick = { viewModel.refresh() })
                Spacer(Modifier.height(8.dp))
            }
        }
    }
}
