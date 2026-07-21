package com.missionwinning.feature.coach

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.missionwinning.core.designsystem.MwCard
import com.missionwinning.core.designsystem.MwChip
import com.missionwinning.core.designsystem.MwChipTone
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwEnterFade
import com.missionwinning.core.designsystem.MwGhostButton
import com.missionwinning.core.designsystem.MwHeroTitle
import com.missionwinning.core.designsystem.MwLoadingBlock
import com.missionwinning.core.designsystem.MwOfflinePill
import com.missionwinning.core.designsystem.MwPrimaryButton
import com.missionwinning.core.designsystem.MwScreenScaffold
import com.missionwinning.core.designsystem.MwSecondaryButton
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwSessionTile
import com.missionwinning.core.designsystem.MwSpace
import com.missionwinning.core.designsystem.MwTypography
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

@Composable
fun CoachScreen(
    onStartWorkout: (sessionId: String, name: String, sets: Int) -> Unit,
    onBack: () -> Unit,
    viewModel: CoachViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val planResp = state.plan
    val todayOffset = ((LocalDate.now().dayOfWeek.value + 6) % 7)
    val weekStart = planResp?.plan?.weekStart
    val todaySession = planResp?.plan?.sessions?.firstOrNull {
        (it.status == "planned" || it.status == "swapped") &&
            (it.dayOffset == todayOffset || planResp.plan.sessions.none { s -> s.dayOffset == todayOffset })
    } ?: planResp?.plan?.sessions?.firstOrNull { it.status == "planned" || it.status == "swapped" }
    var showLab by remember { mutableStateOf(false) }

    MwScreenScaffold {
        MwEnterFade {
            Column(modifier = Modifier.fillMaxSize()) {
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(MwSpace.md),
                ) {
                    MwSectionLabel("Plan")
                    MwHeroTitle("Mission Coach")
                    Text(
                        "Weekly plan from your logs — adapts when life happens.",
                        style = MwTypography.bodyMedium,
                        color = MwColors.TextMuted,
                    )

                    MwCard(elevated = true) {
                        MwOfflinePill()
                        Text(
                            "Week of ${weekStart ?: "—"}",
                            style = MwTypography.titleLarge,
                            color = MwColors.Text,
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            MwChip("${planResp?.plan?.daysPerWeek ?: 0} days", tone = MwChipTone.Emerald)
                            MwChip("rev ${planResp?.plan?.revision ?: 0}", tone = MwChipTone.Brass)
                        }
                    }

                    if (state.loading) {
                        MwCard(elevated = true) {
                            MwLoadingBlock(lines = 5)
                        }
                    }

                    planResp?.let { CoachAdaptBanner(it) }

                    MwSectionLabel("Sessions")
                    planResp?.plan?.sessions?.forEach { s ->
                        val actionable = s.status == "planned" || s.status == "swapped"
                        val tone = when (s.status) {
                            "done" -> MwChipTone.Emerald
                            "swapped" -> MwChipTone.Brass
                            "missed" -> MwChipTone.Danger
                            else -> MwChipTone.Neutral
                        }
                        MwSessionTile(
                            dayLabel = weekdayLabel(weekStart, s.dayOffset),
                            title = s.name,
                            subtitle = "${s.estMinutes}m · ${s.exercises.size} exercises · ${s.kind}",
                            statusLabel = s.status,
                            statusTone = tone,
                            highlighted = s.dayOffset == todayOffset || s.id == todaySession?.id,
                            actionable = actionable,
                            onClick = {
                                val sets = s.exercises.sumOf { it.sets }.coerceAtLeast(3)
                                onStartWorkout(s.id, s.name, sets)
                            },
                        )
                    }

                    Spacer(Modifier.height(4.dp))
                    MwGhostButton(
                        text = if (showLab) "Hide lab tools" else "Lab tools",
                        contentDescription = if (showLab) "Hide lab tools" else "Show lab tools",
                        onClick = { showLab = !showLab },
                    )
                    if (showLab) {
                        Text(
                            "Founder / QA helpers — not part of the product path.",
                            style = MwTypography.bodyMedium,
                            color = MwColors.TextMuted,
                        )
                        MwSecondaryButton(
                            text = "Seed adapt demo (miss + swap)",
                            onClick = { viewModel.seedAdaptDemo() },
                        )
                        MwGhostButton(text = "Refresh plan", onClick = { viewModel.refresh() })
                    }
                    Spacer(Modifier.height(8.dp))
                }

                if (todaySession != null) {
                    MwPrimaryButton(
                        text = "Start ${todaySession.name}",
                        contentDescription = "Start today's session ${todaySession.name}",
                        onClick = {
                            val sets = todaySession.exercises.sumOf { it.sets }.coerceAtLeast(3)
                            onStartWorkout(todaySession.id, todaySession.name, sets)
                        },
                    )
                }
            }
        }
    }
}

/** MON / TUE / … from plan weekStart + dayOffset; falls back to DAY +n. */
private fun weekdayLabel(weekStart: String?, dayOffset: Int): String {
    if (weekStart.isNullOrBlank()) return "DAY +$dayOffset"
    return runCatching {
        LocalDate.parse(weekStart)
            .plusDays(dayOffset.toLong())
            .format(DateTimeFormatter.ofPattern("EEE", Locale.US))
            .uppercase(Locale.US)
    }.getOrDefault("DAY +$dayOffset")
}
