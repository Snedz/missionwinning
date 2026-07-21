package com.missionwinning.app.feature.coach

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.missionwinning.app.ui.CoachAdaptBanner
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwEnterFade
import com.missionwinning.core.designsystem.MwGhostButton
import com.missionwinning.core.designsystem.MwHeroTitle
import com.missionwinning.core.designsystem.MwScreenScaffold
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwSecondaryButton
import com.missionwinning.core.designsystem.MwTypography
import com.missionwinning.core.network.CoachPlanResponseDto
import kotlinx.coroutines.launch

@Composable
fun CoachScreen(
    repository: MwRepository,
    onStartWorkout: (sessionId: String, name: String, sets: Int) -> Unit,
    onBack: () -> Unit,
) {
    var planResp by remember { mutableStateOf<CoachPlanResponseDto?>(null) }
    val scope = rememberCoroutineScope()

    fun refresh() {
        scope.launch { planResp = repository.ensureCoachPlan() }
    }

    LaunchedEffect(Unit) { refresh() }

    MwScreenScaffold {
        MwEnterFade {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                MwSectionLabel("Plan")
                MwHeroTitle("Mission Coach")
                Text(
                    "Weekly plan from your logs — adapts when life happens.",
                    style = MwTypography.bodyMedium,
                    color = MwColors.TextMuted,
                )
                planResp?.let { CoachAdaptBanner(it) }
                Text(
                    "Week of ${planResp?.plan?.weekStart ?: "—"} · ${planResp?.plan?.daysPerWeek ?: 0} days · rev ${planResp?.plan?.revision ?: 0}",
                    style = MwTypography.labelMedium,
                    color = MwColors.TextMuted,
                )

                planResp?.plan?.sessions?.forEach { s ->
                    val actionable = s.status == "planned" || s.status == "swapped"
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(enabled = actionable) {
                                val sets = s.exercises.sumOf { it.sets }.coerceAtLeast(3)
                                onStartWorkout(s.id, s.name, sets)
                            }
                            .padding(vertical = 12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Top,
                    ) {
                        Column(
                            modifier = Modifier.weight(1f),
                            verticalArrangement = Arrangement.spacedBy(4.dp),
                        ) {
                            Text(
                                "DAY +${s.dayOffset}",
                                style = MwTypography.labelSmall,
                                color = MwColors.Brass,
                            )
                            Text(s.name, style = MwTypography.titleLarge, color = MwColors.Text)
                            Text(
                                "${s.estMinutes}m · ${s.status}",
                                style = MwTypography.bodyMedium,
                                color = MwColors.TextMuted,
                            )
                            s.exercises.forEach { e ->
                                Text(
                                    "${e.exerciseId}  ${e.sets}×${e.reps}",
                                    style = MwTypography.labelMedium,
                                    color = MwColors.TextMuted,
                                )
                            }
                        }
                        if (actionable) {
                            Text(
                                "START",
                                style = MwTypography.labelSmall,
                                color = MwColors.Emerald,
                                modifier = Modifier.padding(start = 12.dp, top = 4.dp),
                            )
                        }
                    }
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(1.dp)
                            .background(MwColors.Border),
                    )
                }

                MwSecondaryButton(
                    text = "Seed adapt demo (miss + swap)",
                    onClick = {
                        scope.launch { planResp = repository.seedAdaptDemo() }
                    },
                )
                MwGhostButton(text = "Refresh", onClick = { refresh() })
                MwGhostButton(text = "Back", onClick = onBack)
            }
        }
    }
}
