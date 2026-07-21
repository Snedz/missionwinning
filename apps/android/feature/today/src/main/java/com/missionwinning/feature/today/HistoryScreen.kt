package com.missionwinning.feature.today

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.missionwinning.core.designsystem.MwCard
import com.missionwinning.core.designsystem.MwChip
import com.missionwinning.core.designsystem.MwChipTone
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwEmptyState
import com.missionwinning.core.designsystem.MwEnterFade
import com.missionwinning.core.designsystem.MwLoadingBlock
import com.missionwinning.core.designsystem.MwMetricCard
import com.missionwinning.core.designsystem.MwOfflinePill
import com.missionwinning.core.designsystem.MwScreenScaffold
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwSpace
import com.missionwinning.core.designsystem.MwTopBar
import com.missionwinning.core.designsystem.MwTypography

@Composable
fun HistoryScreen(
    workoutId: String,
    onBack: () -> Unit,
    viewModel: HistoryViewModel = hiltViewModel(),
) {
    LaunchedEffect(workoutId) {
        viewModel.load(workoutId)
    }
    val state by viewModel.state.collectAsStateWithLifecycle()

    MwScreenScaffold {
        MwEnterFade {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(MwSpace.md),
            ) {
                MwTopBar(title = "Workout", onBack = onBack)
                when {
                    state.loading -> {
                        MwCard(elevated = true) {
                            MwSectionLabel("Loading")
                            MwLoadingBlock(lines = 4)
                        }
                    }
                    state.notFound -> {
                        MwEmptyState(
                            title = "Workout not found",
                            body = "This log may have been cleared from this device.",
                            cta = "Back to Today",
                            onCta = onBack,
                        )
                    }
                    else -> {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                        ) {
                            MwSectionLabel(state.whenLabel.ifBlank { "Complete" })
                            MwOfflinePill()
                        }
                        Text(state.name, style = MwTypography.headlineLarge, color = MwColors.Text)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            MwChip("${state.setCount} sets", tone = MwChipTone.Emerald)
                            MwChip(state.durationLabel, tone = MwChipTone.Brass)
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                        ) {
                            MwMetricCard("Sets", state.setCount.toString(), Modifier.weight(1f))
                            MwMetricCard("Time", state.durationLabel, Modifier.weight(1f))
                            MwMetricCard("Volume", state.volumeLabel, Modifier.weight(1f))
                        }

                        if (state.groups.isEmpty()) {
                            MwCard(elevated = true) {
                                MwSectionLabel("Sets")
                                Text(
                                    "No set breakdown on this log (older sessions before history detail).",
                                    style = MwTypography.bodyMedium,
                                    color = MwColors.TextMuted,
                                )
                            }
                        } else {
                            state.groups.forEach { group ->
                                MwCard(elevated = true) {
                                    MwSectionLabel(group.exerciseName)
                                    group.sets.forEach { set ->
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                        ) {
                                            Text(
                                                "Set ${set.setIndex + 1}",
                                                style = MwTypography.titleMedium,
                                                color = MwColors.Text,
                                            )
                                            Text(
                                                buildString {
                                                    append("${set.weightLabel} × ${set.reps}")
                                                    set.rpeLabel?.let {
                                                        append(" · ")
                                                        append(it)
                                                    }
                                                },
                                                style = MwTypography.bodyMedium,
                                                color = MwColors.TextMuted,
                                            )
                                        }
                                    }
                                }
                            }
                        }
                        Spacer(Modifier.height(8.dp))
                    }
                }
            }
        }
    }
}
