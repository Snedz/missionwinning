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
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.missionwinning.core.designsystem.MwCard
import com.missionwinning.core.designsystem.MwChip
import com.missionwinning.core.designsystem.MwChipTone
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwConfirmSheet
import com.missionwinning.core.designsystem.MwEmptyState
import com.missionwinning.core.designsystem.MwEnterFade
import com.missionwinning.core.designsystem.MwGhostButton
import com.missionwinning.core.designsystem.MwLoadingBlock
import com.missionwinning.core.designsystem.MwMetricCard
import com.missionwinning.core.designsystem.MwOfflinePill
import com.missionwinning.core.designsystem.MwPrimaryButton
import com.missionwinning.core.designsystem.MwScreenScaffold
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwSpace
import com.missionwinning.core.designsystem.MwTopBar
import com.missionwinning.core.designsystem.MwTypography
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.background
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.Color
import androidx.compose.foundation.layout.padding

@Composable
fun HistoryScreen(
    workoutId: String,
    onBack: () -> Unit,
    onOpenRoutines: () -> Unit = {},
    viewModel: HistoryViewModel = hiltViewModel(),
) {
    LaunchedEffect(workoutId) {
        viewModel.load(workoutId)
    }
    val state by viewModel.state.collectAsStateWithLifecycle()
    var confirmDelete by remember { mutableStateOf(false) }

    LaunchedEffect(state.deleted) {
        if (state.deleted) onBack()
    }

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

                        if (state.canSaveRoutine) {
                            MwCard(elevated = true) {
                                MwSectionLabel("Template")
                                Text(
                                    "Save this workout’s exercises and set structure as a routine you can start anytime offline.",
                                    style = MwTypography.bodyMedium,
                                    color = MwColors.TextMuted,
                                )
                                Spacer(Modifier.height(8.dp))
                                if (state.routineSavedId != null) {
                                    MwChip("Saved as routine", tone = MwChipTone.Emerald)
                                    Spacer(Modifier.height(8.dp))
                                    MwPrimaryButton(
                                        text = "View routines",
                                        onClick = onOpenRoutines,
                                        contentDescription = "View routines",
                                    )
                                } else {
                                    MwPrimaryButton(
                                        text = if (state.savingRoutine) "Saving…" else "Save as routine",
                                        onClick = { viewModel.saveAsRoutine() },
                                        contentDescription = "Save as routine",
                                        enabled = !state.savingRoutine,
                                    )
                                }
                                state.saveMessage?.let { msg ->
                                    if (state.routineSavedId == null) {
                                        Spacer(Modifier.height(6.dp))
                                        Text(msg, style = MwTypography.bodyMedium, color = MwColors.TextMuted)
                                    }
                                }
                            }
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
                                                    set.kindLabel?.let {
                                                        append(it)
                                                        append(" · ")
                                                    }
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
                        MwGhostButton(
                            text = if (state.deleting) "Deleting…" else "Delete workout",
                            onClick = { if (!state.deleting) confirmDelete = true },
                            contentDescription = "Delete this workout from history",
                        )
                        Spacer(Modifier.height(8.dp))
                    }
                }
            }
        }
        if (confirmDelete) {
            MwConfirmSheet(
                title = "Delete this workout?",
                body = "Removes it from this device. If you're signed in, sync will tombstone the cloud copy.",
                confirmLabel = "Delete",
                cancelLabel = "Keep",
                onConfirm = {
                    confirmDelete = false
                    viewModel.softDelete()
                },
                onDismiss = { confirmDelete = false },
            )
        }
    }
}
