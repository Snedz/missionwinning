package com.missionwinning.feature.today

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
import com.missionwinning.feature.coach.CoachAdaptBanner
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwEnterFade
import com.missionwinning.core.designsystem.MwGhostButton
import com.missionwinning.core.designsystem.MwHeroTitle
import com.missionwinning.core.designsystem.MwPrimaryButton
import com.missionwinning.core.designsystem.MwScreenScaffold
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwTypography
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

@Composable
fun TodayScreen(
    onStartWorkout: (sessionId: String, name: String, sets: Int) -> Unit,
    onOpenCoach: () -> Unit,
    onOpenAuth: () -> Unit,
    viewModel: TodayViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val next = state.next
    val dateLabel = rememberDateLabel()

    MwScreenScaffold {
        MwEnterFade {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                MwSectionLabel(dateLabel)
                MwHeroTitle("Today")
                Text(
                    if (state.workouts == 0) {
                        "Your next session is ready."
                    } else {
                        "${state.workouts} workout${if (state.workouts == 1) "" else "s"} on this device."
                    },
                    style = MwTypography.bodyMedium,
                    color = MwColors.TextMuted,
                )

                state.plan?.let { CoachAdaptBanner(it) }

                Spacer(Modifier.height(8.dp))
                MwSectionLabel("Next session")
                Text(
                    next?.name ?: "Open Coach for your week",
                    style = MwTypography.displayLarge,
                    color = MwColors.Text,
                )
                Text(
                    next?.let { "${it.estMinutes} min · ${it.kind} · ${it.exercises.size} exercises" }
                        ?: "Review your week on Mission Coach.",
                    style = MwTypography.bodyLarge,
                    color = MwColors.TextMuted,
                )

                Spacer(Modifier.height(8.dp))
                MwPrimaryButton(
                    text = if (next != null) "Start workout" else "Open Coach",
                    contentDescription = "Start workout",
                    onClick = {
                        if (next != null) {
                            val sets = next.exercises.sumOf { it.sets }.coerceAtLeast(3)
                            onStartWorkout(next.id, next.name, sets)
                        } else {
                            onOpenCoach()
                        }
                    },
                )
                MwGhostButton(text = "Mission Coach", onClick = onOpenCoach)
                MwGhostButton(text = "Account / sign-in", onClick = onOpenAuth)
            }
        }
    }
}

@Composable
private fun rememberDateLabel(): String =
    LocalDate.now().format(DateTimeFormatter.ofPattern("EEE · MMM d", Locale.US)).uppercase()
