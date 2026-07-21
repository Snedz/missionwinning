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
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.missionwinning.core.designsystem.MwCard
import com.missionwinning.core.designsystem.MwChip
import com.missionwinning.core.designsystem.MwChipTone
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwEmptyState
import com.missionwinning.core.designsystem.MwEnterFade
import com.missionwinning.core.designsystem.MwGhostButton
import com.missionwinning.core.designsystem.MwLoadingBlock
import com.missionwinning.core.designsystem.MwOfflinePill
import com.missionwinning.core.designsystem.MwPrimaryButton
import com.missionwinning.core.designsystem.MwScreenScaffold
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwSpace
import com.missionwinning.core.designsystem.MwTopBar
import com.missionwinning.core.designsystem.MwTypography

@Composable
fun RoutinesScreen(
    onBack: () -> Unit,
    onStartRoutine: (sessionId: String, name: String, sets: Int) -> Unit,
    viewModel: RoutinesViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val lifecycleOwner = LocalLifecycleOwner.current
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) viewModel.refresh()
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    MwScreenScaffold {
        MwEnterFade {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(MwSpace.md),
            ) {
                MwTopBar(title = "Routines", onBack = onBack)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    MwSectionLabel("Saved templates")
                    MwOfflinePill()
                }
                Text(
                    "Start a routine anytime. Save one from any finished workout with set detail.",
                    style = MwTypography.bodyMedium,
                    color = MwColors.TextMuted,
                )

                when {
                    state.loading -> {
                        MwCard(elevated = true) {
                            MwLoadingBlock(lines = 4)
                        }
                    }
                    state.routines.isEmpty() -> {
                        MwEmptyState(
                            title = "No routines yet",
                            body = "Finish a workout, open it from History, and tap Save as routine.",
                            cta = "Back to Today",
                            onCta = onBack,
                        )
                    }
                    else -> {
                        state.routines.forEach { item ->
                            MwCard(elevated = true) {
                                Text(
                                    item.name,
                                    style = MwTypography.titleLarge,
                                    color = MwColors.Text,
                                )
                                Spacer(Modifier.height(6.dp))
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    MwChip(
                                        "${item.exerciseCount} exercises",
                                        tone = MwChipTone.Emerald,
                                    )
                                    MwChip(
                                        "${item.setCount} sets",
                                        tone = MwChipTone.Brass,
                                    )
                                }
                                Text(
                                    item.whenLabel,
                                    style = MwTypography.bodyMedium,
                                    color = MwColors.TextMuted,
                                )
                                Spacer(Modifier.height(10.dp))
                                MwPrimaryButton(
                                    text = "Start routine",
                                    onClick = {
                                        val (sessionId, name, sets) = viewModel.startArgs(item)
                                        onStartRoutine(sessionId, name, sets)
                                    },
                                    contentDescription = "Start ${item.name}",
                                )
                                Spacer(Modifier.height(6.dp))
                                MwGhostButton(
                                    text = "Delete",
                                    onClick = { viewModel.delete(item.id) },
                                    contentDescription = "Delete ${item.name}",
                                )
                            }
                        }
                    }
                }
                Spacer(Modifier.height(8.dp))
            }
        }
    }
}
