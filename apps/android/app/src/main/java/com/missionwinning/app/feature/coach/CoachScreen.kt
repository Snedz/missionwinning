package com.missionwinning.app.feature.coach

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.missionwinning.app.ui.CoachAdaptBanner
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwGhostButton
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

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Mission Coach", style = MwTypography.headlineLarge, color = MwColors.Text)
        Text(
            "Weekly plan from your logs — adapts when life happens. No wearable.",
            style = MwTypography.bodyLarge,
            color = MwColors.TextMuted,
        )
        planResp?.let { CoachAdaptBanner(it) }
        Text(
            "Week of ${planResp?.plan?.weekStart ?: "—"} · ${planResp?.plan?.daysPerWeek ?: 0} days · rev ${planResp?.plan?.revision ?: 0}",
            style = MwTypography.bodyLarge,
            color = MwColors.TextMuted,
        )

        planResp?.plan?.sessions?.forEach { s ->
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(MwColors.NavyElevated)
                    .border(1.dp, MwColors.Border, RoundedCornerShape(10.dp))
                    .clickable(enabled = s.status == "planned" || s.status == "swapped") {
                        val sets = s.exercises.sumOf { it.sets }.coerceAtLeast(3)
                        onStartWorkout(s.id, s.name, sets)
                    }
                    .padding(14.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                Text(s.name, style = MwTypography.titleLarge, color = MwColors.Text)
                Text(
                    "Day +${s.dayOffset} · ${s.status} · ${s.estMinutes}m",
                    style = MwTypography.labelSmall,
                    color = MwColors.Brass,
                )
                s.exercises.forEach { e ->
                    Text(
                        "${e.exerciseId} · ${e.sets}×${e.reps}",
                        style = MwTypography.bodyLarge,
                        color = MwColors.TextMuted,
                    )
                }
            }
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
