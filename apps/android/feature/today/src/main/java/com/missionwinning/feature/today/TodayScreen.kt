package com.missionwinning.feature.today

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
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
import com.missionwinning.core.designsystem.MwMetricCard
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TodayScreen(
    onStartWorkout: (sessionId: String, name: String, sets: Int) -> Unit,
    onOpenCoach: () -> Unit,
    onOpenAuth: () -> Unit,
    onOpenHistory: (workoutId: String) -> Unit = {},
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
            PullToRefreshBox(
                isRefreshing = state.refreshing,
                onRefresh = { viewModel.refresh(userInitiated = true) },
                modifier = Modifier.fillMaxSize(),
            ) {
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
                    MwOfflinePill(online = state.online)
                }

                Text(
                    if (state.workouts == 0) {
                        "Your next session is ready on this device."
                    } else {
                        buildString {
                            append("${state.workouts} workout${if (state.workouts == 1) "" else "s"} logged offline")
                            if (state.streakDays > 0) {
                                append(" · ${state.streakDays}-day streak")
                            }
                            state.recent.firstOrNull()?.let { last ->
                                append(" · last ${last.whenLabel.lowercase()}")
                            }
                            append(".")
                        }
                    },
                    style = MwTypography.bodyMedium,
                    color = MwColors.TextMuted,
                )

                if (state.streakDays > 0) {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        MwChip(
                            "${state.streakDays} day streak",
                            tone = MwChipTone.Brass,
                        )
                    }
                }

                if (state.pendingSync > 0 || state.syncMessage != null) {
                    MwCard(elevated = true) {
                        MwSectionLabel("Sync")
                        Text(
                            state.syncMessage
                                ?: "${state.pendingSync} workout${if (state.pendingSync == 1) "" else "s"} waiting to sync.",
                            style = MwTypography.bodyMedium,
                            color = MwColors.TextMuted,
                        )
                        if (state.pendingSync > 0) {
                            MwGhostButton(
                                text = if (state.syncing) {
                                    "Syncing…"
                                } else if (!state.online) {
                                    "Offline — retry later"
                                } else {
                                    "Retry sync"
                                },
                                contentDescription = "Retry syncing offline workouts",
                                onClick = { if (!state.syncing) viewModel.retrySync() },
                            )
                        }
                    }
                }

                if (state.loading) {
                    MwCard(elevated = true) {
                        MwSectionLabel("Loading")
                        MwLoadingBlock(lines = 4)
                    }
                }

                state.plan?.let { CoachAdaptBanner(it) }

                if (!state.loading && next != null) {
                    val todayOffset = ((LocalDate.now().dayOfWeek.value + 6) % 7)
                    HeroSessionCard(
                        session = next,
                        isToday = next.dayOffset == todayOffset,
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
                    Text(
                        "Tap a planned day to start that session.",
                        style = MwTypography.bodyMedium,
                        color = MwColors.TextMuted,
                    )
                    MwWeekStrip(
                        days = weekDays,
                        onDayClick = { day ->
                            val id = day.sessionId ?: return@MwWeekStrip
                            val name = day.sessionName ?: "Workout"
                            val sets = day.setCount.coerceAtLeast(3)
                            onStartWorkout(id, name, sets)
                        },
                    )
                    if (state.weekStats.workoutCount > 0) {
                        Spacer(Modifier.height(MwSpace.sm))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                        ) {
                            MwMetricCard(
                                "Workouts",
                                state.weekStats.workoutCount.toString(),
                                Modifier.weight(1f),
                            )
                            MwMetricCard(
                                "Sets",
                                state.weekStats.setCount.toString(),
                                Modifier.weight(1f),
                            )
                            MwMetricCard(
                                "Volume",
                                state.weekStats.volumeLabel,
                                Modifier.weight(1f),
                            )
                        }
                        Text(
                            "Training time this week · ${state.weekStats.minutesLabel}",
                            style = MwTypography.labelMedium,
                            color = MwColors.TextMuted,
                        )
                    }
                }

                if (state.recent.isNotEmpty()) {
                    MwCard(elevated = true) {
                        MwSectionLabel("Recent")
                        Text(
                            "Tap a log for set breakdown.",
                            style = MwTypography.bodyMedium,
                            color = MwColors.TextMuted,
                        )
                        state.recent.forEachIndexed { index, w ->
                            if (index > 0) Spacer(Modifier.height(MwSpace.sm))
                            RecentWorkoutRow(w, onClick = { onOpenHistory(w.id) })
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

                MwCard(elevated = true) {
                    MwSectionLabel("Equipment")
                    Text(
                        if (state.reseeding) {
                            "Reseeding week for new equipment…"
                        } else {
                            "Where you train — reseeds this week’s plan on device."
                        },
                        style = MwTypography.bodyMedium,
                        color = MwColors.TextMuted,
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        EquipmentChip("Bodyweight", "bodyweight", state.equipment, state.reseeding) {
                            viewModel.setEquipment("bodyweight")
                        }
                        EquipmentChip("Dumbbells", "dumbbells", state.equipment, state.reseeding) {
                            viewModel.setEquipment("dumbbells")
                        }
                        EquipmentChip("Full gym", "full-gym", state.equipment, state.reseeding) {
                            viewModel.setEquipment("full-gym")
                        }
                    }
                }

                MwGhostButton(text = "Review week on Coach", onClick = onOpenCoach)
                MwGhostButton(text = "Account / sign-in", onClick = onOpenAuth)
                Spacer(Modifier.height(8.dp))
            }
            } // PullToRefreshBox
        }
    }
}

@Composable
private fun EquipmentChip(
    label: String,
    id: String,
    selectedId: String,
    disabled: Boolean,
    onSelect: () -> Unit,
) {
    MwChip(
        text = label,
        tone = if (selectedId == id) MwChipTone.Emerald else MwChipTone.Neutral,
        contentDescription = if (selectedId == id) "$label selected" else "Switch to $label",
        onClick = { if (!disabled) onSelect() },
    )
}

@Composable
private fun RecentWorkoutRow(w: RecentWorkoutUi, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .semantics {
                role = Role.Button
                contentDescription = "Open ${w.name} details"
            }
            .clickable(onClick = onClick),
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
        MwChip("VIEW", tone = MwChipTone.Emerald)
    }
}

@Composable
private fun HeroSessionCard(
    session: PlanSessionDto,
    isToday: Boolean,
    onStart: () -> Unit,
) {
    MwCard(elevated = true, glow = true) {
        MwSectionLabel(if (isToday) "Today's session" else "Next session")
        Text(session.name, style = MwTypography.displayLarge, color = MwColors.Text)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            if (isToday) MwChip("Today", tone = MwChipTone.Brass)
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
            text = if (isToday) "Start today's workout" else "Start workout",
            contentDescription = "Start workout ${session.name}",
            onClick = onStart,
        )
    }
}

@Composable
private fun rememberDateLabel(): String {
    val now = LocalDate.now()
    val hour = java.time.LocalTime.now().hour
    val greeting = when {
        hour < 12 -> "Morning"
        hour < 17 -> "Afternoon"
        else -> "Evening"
    }
    val date = now.format(DateTimeFormatter.ofPattern("EEE · MMM d", Locale.US)).uppercase()
    return "$greeting · $date"
}

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
        val actionable = session != null &&
            (session.status == "planned" || session.status == "swapped")
        MwWeekDay(
            label = label,
            state = state,
            dayOffset = index,
            sessionId = if (actionable) session?.id else null,
            sessionName = if (actionable) session?.name else null,
            setCount = session?.exercises?.sumOf { it.sets }?.coerceAtLeast(3) ?: 0,
        )
    }
}
