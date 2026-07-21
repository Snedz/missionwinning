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
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
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
import com.missionwinning.core.designsystem.MwGhostButton
import com.missionwinning.core.designsystem.MwHeroTitle
import com.missionwinning.core.designsystem.MwOfflinePill
import com.missionwinning.core.designsystem.MwPrimaryButton
import com.missionwinning.core.designsystem.MwScreenScaffold
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwSpace
import com.missionwinning.core.designsystem.MwTypography
import com.missionwinning.core.designsystem.MwWeekDay
import com.missionwinning.core.designsystem.MwWeekDayState
import com.missionwinning.core.designsystem.MwWeekStrip
import com.missionwinning.core.network.PlanSessionDto
import com.missionwinning.feature.coach.CoachAdaptBanner
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
    val weekDays = rememberWeekDays(state.plan?.plan?.sessions.orEmpty())

    MwScreenScaffold {
        MwEnterFade {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(MwSpace.lg),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column {
                        MwSectionLabel(dateLabel)
                        MwHeroTitle("Today")
                    }
                    MwOfflinePill()
                }

                Text(
                    if (state.workouts == 0) {
                        "Your next session is ready on this device."
                    } else {
                        "${state.workouts} workout${if (state.workouts == 1) "" else "s"} logged offline."
                    },
                    style = MwTypography.bodyMedium,
                    color = MwColors.TextMuted,
                )

                state.plan?.let { CoachAdaptBanner(it) }

                if (next != null) {
                    HeroSessionCard(
                        session = next,
                        onStart = {
                            val sets = next.exercises.sumOf { it.sets }.coerceAtLeast(3)
                            onStartWorkout(next.id, next.name, sets)
                        },
                    )
                } else if (!state.loading) {
                    MwEmptyState(
                        title = "No session queued",
                        body = "Open Mission Coach to review your week or seed a plan.",
                        cta = "Open Coach",
                        onCta = onOpenCoach,
                    )
                }

                MwCard(elevated = true) {
                    MwSectionLabel("This week")
                    MwWeekStrip(days = weekDays)
                }

                MwGhostButton(text = "Review week on Coach", onClick = onOpenCoach)
                MwGhostButton(text = "Account / sign-in", onClick = onOpenAuth)
                Spacer(Modifier.height(8.dp))
            }
        }
    }
}

@Composable
private fun HeroSessionCard(
    session: PlanSessionDto,
    onStart: () -> Unit,
) {
    MwCard(elevated = true, glow = true) {
        MwSectionLabel("Next session")
        Text(session.name, style = MwTypography.displayLarge, color = MwColors.Text)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            MwChip(session.kind, tone = MwChipTone.Emerald)
            MwChip("${session.estMinutes} min", tone = MwChipTone.Neutral)
            MwChip("${session.exercises.size} moves", tone = MwChipTone.Brass)
        }
        Text(
            session.exercises.take(4).joinToString(" · ") {
                it.exerciseId.replace('-', ' ')
            }.ifBlank { "Ready when you are." },
            style = MwTypography.bodyMedium,
            color = MwColors.TextMuted,
        )
        Spacer(Modifier.height(4.dp))
        MwPrimaryButton(
            text = "Start workout",
            contentDescription = "Start workout ${session.name}",
            onClick = onStart,
        )
    }
}

@Composable
private fun rememberDateLabel(): String =
    LocalDate.now().format(DateTimeFormatter.ofPattern("EEE · MMM d", Locale.US)).uppercase()

@Composable
private fun rememberWeekDays(sessions: List<PlanSessionDto>): List<MwWeekDay> {
    val labels = listOf("M", "T", "W", "T", "F", "S", "S")
    val todayOffset = ((LocalDate.now().dayOfWeek.value + 6) % 7) // Mon=0
    return labels.mapIndexed { index, label ->
        val session = sessions.find { it.dayOffset == index }
        val state = when {
            session == null -> MwWeekDayState.Empty
            session.status == "done" -> MwWeekDayState.Done
            index == todayOffset -> MwWeekDayState.Today
            session.status == "planned" || session.status == "swapped" -> MwWeekDayState.Planned
            else -> MwWeekDayState.Empty
        }
        MwWeekDay(label, state)
    }
}
