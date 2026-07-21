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
import androidx.compose.ui.Alignment
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
import com.missionwinning.core.designsystem.MwHeroTitle
import com.missionwinning.core.designsystem.MwLoadingBlock
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

                if (state.loading) {
                    MwCard(elevated = true) {
                        MwSectionLabel("Loading")
                        MwLoadingBlock(lines = 4)
                    }
                }

                state.plan?.let { CoachAdaptBanner(it) }

                if (!state.loading && next != null) {
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

                if (state.recent.isNotEmpty()) {
                    MwCard(elevated = true) {
                        MwSectionLabel("Recent")
                        state.recent.forEachIndexed { index, w ->
                            if (index > 0) Spacer(Modifier.height(MwSpace.sm))
                            RecentWorkoutRow(w)
                        }
                    }
                }

                MwCard(elevated = true) {
                    MwSectionLabel("Units")
                    Text(
                        "Weight unit for logging (saved on device). Same toggle as the Active chip.",
                        style = MwTypography.bodyMedium,
                        color = MwColors.TextMuted,
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        MwChip(
                            text = "KG",
                            tone = if (state.weightUnit == "kg") MwChipTone.Emerald else MwChipTone.Neutral,
                            contentDescription = if (state.weightUnit == "kg") {
                                "Kilograms selected"
                            } else {
                                "Switch to kilograms"
                            },
                            onClick = { viewModel.setWeightUnit("kg") },
                        )
                        MwChip(
                            text = "LB",
                            tone = if (state.weightUnit == "lb") MwChipTone.Emerald else MwChipTone.Neutral,
                            contentDescription = if (state.weightUnit == "lb") {
                                "Pounds selected"
                            } else {
                                "Switch to pounds"
                            },
                            onClick = { viewModel.setWeightUnit("lb") },
                        )
                    }
                }

                MwGhostButton(text = "Review week on Coach", onClick = onOpenCoach)
                MwGhostButton(text = "Account / sign-in", onClick = onOpenAuth)
                Spacer(Modifier.height(8.dp))
            }
        }
    }
}

@Composable
private fun RecentWorkoutRow(w: RecentWorkoutUi) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f)) {
            Text(w.name, style = MwTypography.titleMedium, color = MwColors.Text)
            Text(
                buildString {
                    append(w.whenLabel)
                    append(" · ")
                    append(w.sets)
                    append(if (w.sets == 1) " set" else " sets")
                    append(" · ")
                    append(w.durationLabel)
                    w.volumeLabel?.let {
                        append(" · ")
                        append(it)
                    }
                },
                style = MwTypography.bodyMedium,
                color = MwColors.TextMuted,
            )
        }
        MwChip("DONE", tone = MwChipTone.Emerald)
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
