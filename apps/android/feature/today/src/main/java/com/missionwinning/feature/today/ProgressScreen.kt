package com.missionwinning.feature.today

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
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
                        body = "Finish a session with weights to unlock PRs and volume history.",
                        cta = "Back to Today",
                        onCta = onBack,
                    )
                } else {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        MwMetricCard("Workouts", state.workoutCount.toString(), Modifier.weight(1f))
                        MwMetricCard("PRs", state.prs.size.toString(), Modifier.weight(1f))
                        MwMetricCard("Vol (14)", state.totalVolumeLabel, Modifier.weight(1f))
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
                }
                Spacer(Modifier.height(12.dp))
            }
        }
    }
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
