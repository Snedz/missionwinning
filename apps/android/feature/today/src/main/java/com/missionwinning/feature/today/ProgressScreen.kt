package com.missionwinning.feature.today

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
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
import com.missionwinning.core.designsystem.MwMetricCard
import com.missionwinning.core.designsystem.MwOfflinePill
import com.missionwinning.core.designsystem.MwScreenScaffold
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwSpace
import com.missionwinning.core.designsystem.MwTopBar
import com.missionwinning.core.designsystem.MwTypography

@Composable
fun ProgressScreen(
    onBack: () -> Unit,
    viewModel: ProgressViewModel = hiltViewModel(),
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
                MwTopBar(title = "Progress", onBack = onBack)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    MwSectionLabel("On this device")
                    MwOfflinePill()
                }

                if (state.loading) {
                    MwCard(elevated = true) {
                        MwLoadingBlock(lines = 5)
                    }
                } else if (state.workoutCount == 0) {
                    MwEmptyState(
                        title = "No progress yet",
                        body = "Finish a session with weights to unlock PRs, heat map, and volume history.",
                        cta = "Back to Today",
                        onCta = onBack,
                    )
                    BodyWeightCard(state, viewModel)
                } else {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        MwMetricCard("Workouts", state.workoutCount.toString(), Modifier.weight(1f))
                        MwMetricCard("PRs", state.prs.size.toString(), Modifier.weight(1f))
                        MwMetricCard("Vol (14)", state.totalVolumeLabel, Modifier.weight(1f))
                    }
                    if (state.streakDays > 0 || state.trainedDays28 > 0) {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            if (state.streakDays > 0) {
                                MwChip("${state.streakDays}d streak", tone = MwChipTone.Brass)
                            }
                            MwChip(
                                "${state.trainedDays28}/28 days trained",
                                tone = MwChipTone.Emerald,
                            )
                        }
                    }

                    MwCard(elevated = true) {
                        MwSectionLabel("Training heat map")
                        Text(
                            "Last 28 days · ${state.heatStartLabel} → ${state.heatEndLabel}. Darker = more volume.",
                            style = MwTypography.bodyMedium,
                            color = MwColors.TextMuted,
                        )
                        if (state.heatLevels.isEmpty()) {
                            Text(
                                "Log sessions to light up the calendar.",
                                style = MwTypography.bodyMedium,
                                color = MwColors.TextMuted,
                            )
                        } else {
                            HeatMapGrid(
                                levels = state.heatLevels,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(top = 8.dp),
                            )
                            Row(
                                modifier = Modifier.padding(top = 8.dp),
                                horizontalArrangement = Arrangement.spacedBy(4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Text("Less", style = MwTypography.labelSmall, color = MwColors.TextMuted)
                                (0..4).forEach { lvl ->
                                    Box(
                                        Modifier
                                            .size(12.dp)
                                            .clip(RoundedCornerShape(2.dp))
                                            .background(heatColor(lvl)),
                                    )
                                }
                                Text("More", style = MwTypography.labelSmall, color = MwColors.TextMuted)
                            }
                        }
                    }

                    MwCard(elevated = true) {
                        MwSectionLabel("Weekly volume")
                        Text(
                            "Last 8 weeks (oldest → newest).",
                            style = MwTypography.bodyMedium,
                            color = MwColors.TextMuted,
                        )
                        if (state.weekBars.isEmpty()) {
                            Text("—", style = MwTypography.bodyMedium, color = MwColors.TextMuted)
                        } else {
                            VolumeBarChart(
                                fractions = state.weekBars,
                                labels = state.weekLabels,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(140.dp),
                            )
                        }
                    }

                    MwCard(elevated = true) {
                        MwSectionLabel("Session volume")
                        Text(
                            "Last ${state.volumeBars.size.coerceAtMost(14)} workouts (oldest → newest).",
                            style = MwTypography.bodyMedium,
                            color = MwColors.TextMuted,
                        )
                        if (state.volumeBars.isEmpty()) {
                            Text(
                                "Log a few sessions to see the chart.",
                                style = MwTypography.bodyMedium,
                                color = MwColors.TextMuted,
                            )
                        } else {
                            VolumeBarChart(
                                fractions = state.volumeBars,
                                labels = state.volumeLabels,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(140.dp),
                            )
                        }
                    }

                    MwSectionLabel("Personal records")
                    Text(
                        "Best estimated 1RM per exercise (Epley) from weighted sets.",
                        style = MwTypography.bodyMedium,
                        color = MwColors.TextMuted,
                    )
                    if (state.prs.isEmpty()) {
                        MwCard(elevated = true) {
                            Text(
                                "No weighted sets yet — bodyweight-only logs don’t create load PRs.",
                                style = MwTypography.bodyMedium,
                                color = MwColors.TextMuted,
                            )
                        }
                    } else {
                        state.prs.forEach { pr ->
                            MwCard(elevated = true) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically,
                                ) {
                                    Column(Modifier.weight(1f)) {
                                        Text(
                                            pr.exerciseName,
                                            style = MwTypography.titleMedium,
                                            color = MwColors.Text,
                                        )
                                        Text(
                                            pr.loadLabel,
                                            style = MwTypography.bodyMedium,
                                            color = MwColors.TextMuted,
                                        )
                                    }
                                    Column(horizontalAlignment = Alignment.End) {
                                        MwChip(pr.e1rmLabel, tone = MwChipTone.Brass)
                                        Text(
                                            pr.whenLabel,
                                            style = MwTypography.labelMedium,
                                            color = MwColors.TextMuted,
                                        )
                                    }
                                }
                            }
                        }
                    }

                    BodyWeightCard(state, viewModel)
                }
                Spacer(Modifier.height(12.dp))
            }
        }
    }
}

@Composable
private fun BodyWeightCard(state: ProgressUiState, viewModel: ProgressViewModel) {
    MwCard(elevated = true) {
        MwSectionLabel("Body weight")
        Text(
            "Optional · stays on this device (free). Not medical advice.",
            style = MwTypography.bodyMedium,
            color = MwColors.TextMuted,
        )
        Text(
            "Logged · ${state.bodyWeightLabel}",
            style = MwTypography.titleMedium,
            color = MwColors.Text,
        )
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            MwChip(
                text = "KG",
                tone = if (state.bodyWeightUnit == "kg") MwChipTone.Emerald else MwChipTone.Neutral,
                onClick = { viewModel.setBodyWeightUnit("kg") },
            )
            MwChip(
                text = "LB",
                tone = if (state.bodyWeightUnit == "lb") MwChipTone.Emerald else MwChipTone.Neutral,
                onClick = { viewModel.setBodyWeightUnit("lb") },
            )
        }
        OutlinedTextField(
            value = state.bodyWeightInput,
            onValueChange = viewModel::onBodyWeightInput,
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            label = { Text("Weight") },
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = MwColors.Text,
                unfocusedTextColor = MwColors.Text,
                focusedContainerColor = MwColors.NavyDeep,
                unfocusedContainerColor = MwColors.NavyDeep,
                focusedBorderColor = MwColors.Emerald,
                unfocusedBorderColor = MwColors.Border,
                cursorColor = MwColors.Emerald,
                focusedLabelColor = MwColors.TextMuted,
                unfocusedLabelColor = MwColors.TextMuted,
            ),
        )
        MwGhostButton(
            text = "Save body weight",
            contentDescription = "Save body weight on device",
            onClick = viewModel::saveBodyWeight,
        )
    }
}

@Composable
private fun HeatMapGrid(
    levels: List<Int>,
    modifier: Modifier = Modifier,
) {
    // 4 rows × 7 cols ≈ 28 cells
    val cols = 7
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(4.dp)) {
        levels.chunked(cols).forEach { row ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                row.forEach { level ->
                    Box(
                        Modifier
                            .weight(1f)
                            .aspectRatio(1f)
                            .clip(RoundedCornerShape(3.dp))
                            .background(heatColor(level)),
                    )
                }
                // pad incomplete last row
                repeat(cols - row.size) {
                    Spacer(Modifier.weight(1f).aspectRatio(1f))
                }
            }
        }
    }
}

private fun heatColor(level: Int): Color = when (level.coerceIn(0, 4)) {
    0 -> MwColors.Border.copy(alpha = 0.35f)
    1 -> MwColors.Emerald.copy(alpha = 0.25f)
    2 -> MwColors.Emerald.copy(alpha = 0.45f)
    3 -> MwColors.Emerald.copy(alpha = 0.7f)
    else -> MwColors.Emerald
}

@Composable
private fun VolumeBarChart(
    fractions: List<Float>,
    labels: List<String>,
    modifier: Modifier = Modifier,
) {
    val barColor = MwColors.Emerald
    val track = MwColors.Border
    Column(modifier = modifier) {
        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
        ) {
            val n = fractions.size.coerceAtLeast(1)
            val gap = 6.dp.toPx()
            val totalGap = gap * (n - 1).coerceAtLeast(0)
            val barW = ((size.width - totalGap) / n).coerceAtLeast(4f)
            fractions.forEachIndexed { i, frac ->
                val h = (size.height * frac.coerceIn(0.04f, 1f))
                val x = i * (barW + gap)
                val y = size.height - h
                drawRoundRect(
                    color = track,
                    topLeft = Offset(x, 0f),
                    size = Size(barW, size.height),
                    cornerRadius = CornerRadius(4.dp.toPx()),
                )
                drawRoundRect(
                    color = barColor,
                    topLeft = Offset(x, y),
                    size = Size(barW, h),
                    cornerRadius = CornerRadius(4.dp.toPx()),
                )
            }
        }
        if (labels.isNotEmpty()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                labels.forEach { lab ->
                    Text(
                        lab,
                        style = MwTypography.labelSmall,
                        color = MwColors.TextMuted,
                        modifier = Modifier.weight(1f),
                    )
                }
            }
        }
    }
}
