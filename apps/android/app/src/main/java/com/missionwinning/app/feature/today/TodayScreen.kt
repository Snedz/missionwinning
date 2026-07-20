package com.missionwinning.app.feature.today

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.missionwinning.app.ui.CoachAdaptBanner
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwPrimaryButton
import com.missionwinning.core.designsystem.MwSecondaryButton
import com.missionwinning.core.designsystem.MwTypography
import com.missionwinning.core.network.CoachPlanResponseDto

@Composable
fun TodayScreen(
    repository: MwRepository,
    onStartWorkout: (sessionId: String, name: String, sets: Int) -> Unit,
    onOpenCoach: () -> Unit,
    onOpenAuth: () -> Unit,
) {
    var planResp by remember { mutableStateOf<CoachPlanResponseDto?>(null) }
    var workouts by remember { mutableIntStateOf(0) }

    LaunchedEffect(Unit) {
        planResp = repository.ensureCoachPlan()
        workouts = repository.workoutCount()
    }

    val next = planResp?.plan?.sessions?.firstOrNull {
        it.status == "planned" || it.status == "swapped"
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Text("Today", style = MwTypography.headlineLarge, color = MwColors.Text)
        Text(
            "Free forever logger + Mission Coach. $workouts workout${if (workouts == 1) "" else "s"} on this device.",
            style = MwTypography.bodyLarge,
            color = MwColors.TextMuted,
        )
        planResp?.let { CoachAdaptBanner(it) }

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(MwColors.NavyElevated)
                .border(1.dp, MwColors.Border, RoundedCornerShape(12.dp))
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Text("NEXT SESSION", style = MwTypography.labelSmall, color = MwColors.Brass)
            Text(
                next?.name ?: "Open Coach for your week",
                style = MwTypography.titleLarge,
                color = MwColors.Text,
            )
            Text(
                next?.let { "${it.estMinutes} min · ${it.kind} · ${it.exercises.size} exercises" }
                    ?: "Generate or review your week on Coach.",
                style = MwTypography.bodyLarge,
                color = MwColors.TextMuted,
            )
        }

        MwPrimaryButton(
            text = if (next != null) "Start workout" else "Open Coach",
            onClick = {
                if (next != null) {
                    val sets = next.exercises.sumOf { it.sets }.coerceAtLeast(3)
                    onStartWorkout(next.id, next.name, sets)
                } else {
                    onOpenCoach()
                }
            },
            modifier = Modifier.semantics { contentDescription = "Start workout" },
        )
        MwSecondaryButton(text = "Mission Coach", onClick = onOpenCoach)
        MwSecondaryButton(text = "Account / sign-in", onClick = onOpenAuth)
    }
}
