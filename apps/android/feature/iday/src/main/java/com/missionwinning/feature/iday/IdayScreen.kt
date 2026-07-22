package com.missionwinning.feature.iday

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.missionwinning.core.designsystem.MwBrassRule
import com.missionwinning.core.designsystem.MwCard
import com.missionwinning.core.designsystem.MwChip
import com.missionwinning.core.designsystem.MwChipTone
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwEnterFade
import com.missionwinning.core.designsystem.MwGhostButton
import com.missionwinning.core.designsystem.MwPrimaryButton
import com.missionwinning.core.designsystem.MwScreenScaffold
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwSpace
import com.missionwinning.core.designsystem.MwTypography

@Composable
fun IdayScreen(
    onFinished: () -> Unit,
    viewModel: IdayViewModel = hiltViewModel(),
) {
    var step by remember { mutableIntStateOf(0) }
    var equipment by remember { mutableStateOf("bodyweight") }
    var telemetryOptIn by remember { mutableStateOf(false) }

    MwScreenScaffold {
        MwEnterFade {
            Column(modifier = Modifier.fillMaxSize()) {
                IdayProgressDots(step = step, total = 3)
                Spacer(Modifier.height(MwSpace.md))
                Box(modifier = Modifier.weight(1f).fillMaxSize()) {
                    when (step) {
                        0 -> StepMission(
                            onNext = { step = 1 },
                            onSkip = {
                                viewModel.complete(
                                    equipment = equipment,
                                    telemetryOptIn = false,
                                    onDone = onFinished,
                                )
                            },
                        )
                        1 -> StepEquipment(
                            selected = equipment,
                            onSelect = { equipment = it },
                            onNext = { step = 2 },
                            onBack = { step = 0 },
                        )
                        else -> StepReady(
                            equipment = equipment,
                            telemetryOptIn = telemetryOptIn,
                            onTelemetryChange = { telemetryOptIn = it },
                            onFinish = {
                                viewModel.complete(
                                    equipment = equipment,
                                    telemetryOptIn = telemetryOptIn,
                                    onDone = onFinished,
                                )
                            },
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun IdayProgressDots(step: Int, total: Int) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        repeat(total) { i ->
            val active = i == step
            val done = i < step
            Box(
                modifier = Modifier
                    .size(if (active) 10.dp else 8.dp)
                    .clip(CircleShape)
                    .background(
                        when {
                            active -> MwColors.Emerald
                            done -> MwColors.Emerald.copy(alpha = 0.45f)
                            else -> MwColors.Border
                        },
                    ),
            )
        }
        Spacer(Modifier.weight(1f))
        Text(
            "${step + 1} / $total",
            style = MwTypography.labelSmall,
            color = MwColors.TextMuted,
        )
    }
}

@Composable
private fun StepMission(onNext: () -> Unit, onSkip: () -> Unit) {
    Column(verticalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxSize()) {
        Column(verticalArrangement = Arrangement.spacedBy(MwSpace.sm)) {
            MwSectionLabel("I-Day · 1 of 3")
            Text("Mission Winning", style = MwTypography.displayLarge, color = MwColors.Text)
            MwBrassRule()
            Text(
                "Train Anywhere. Win Daily.",
                style = MwTypography.titleLarge,
                color = MwColors.Emerald,
            )
            Text(
                "Offline logging + a weekly plan from your workouts.",
                style = MwTypography.bodyLarge,
                color = MwColors.TextMuted,
            )
        }
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            MwPrimaryButton(text = "Continue", contentDescription = "Continue onboarding", onClick = onNext)
            MwGhostButton(text = "I already train — skip", onClick = onSkip)
        }
    }
}

@Composable
private fun StepEquipment(
    selected: String,
    onSelect: (String) -> Unit,
    onNext: () -> Unit,
    onBack: () -> Unit,
) {
    val options = listOf(
        "bodyweight" to "Bodyweight",
        "dumbbells" to "Dumbbells",
        "full-gym" to "Full gym",
    )
    Column(verticalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxSize()) {
        Column(verticalArrangement = Arrangement.spacedBy(MwSpace.sm)) {
            MwSectionLabel("I-Day · 2 of 3")
            Text("Where do you train?", style = MwTypography.headlineLarge, color = MwColors.Text)
            Text(
                "Seeds this week. Change anytime in Account.",
                style = MwTypography.bodyMedium,
                color = MwColors.TextMuted,
            )
            options.forEach { (id, label) ->
                val active = selected == id
                MwCard(
                    elevated = true,
                    glow = active,
                    onClick = { onSelect(id) },
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text(label, style = MwTypography.titleLarge, color = MwColors.Text)
                        if (active) MwChip("Selected", tone = MwChipTone.Emerald)
                    }
                }
            }
        }
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            MwPrimaryButton(text = "Continue", onClick = onNext, contentDescription = "Continue")
            MwGhostButton(text = "Back", onClick = onBack)
        }
    }
}

@Composable
private fun StepReady(
    equipment: String,
    telemetryOptIn: Boolean,
    onTelemetryChange: (Boolean) -> Unit,
    onFinish: () -> Unit,
) {
    Column(verticalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxSize()) {
        Column(verticalArrangement = Arrangement.spacedBy(MwSpace.sm)) {
            MwSectionLabel("I-Day · 3 of 3")
            Text("Ready", style = MwTypography.headlineLarge, color = MwColors.Text)
            MwCard(elevated = true, glow = true, hero = true) {
                Text("Offline · on this device", style = MwTypography.labelMedium, color = MwColors.Brass)
                Text(
                    "Equipment: ${equipment.replace('-', ' ')}",
                    style = MwTypography.titleLarge,
                    color = MwColors.Text,
                )
                Text(
                    "Start from Today. Logs stay on-device until you sign in.",
                    style = MwTypography.bodyMedium,
                    color = MwColors.TextMuted,
                )
            }
            MwCard(elevated = true) {
                MwSectionLabel("Privacy")
                Text(
                    "Optional anonymous weekly pulse. Off by default.",
                    style = MwTypography.bodyMedium,
                    color = MwColors.TextMuted,
                )
                MwChip(
                    text = if (telemetryOptIn) "Weekly pulse · on" else "Weekly pulse · off",
                    tone = if (telemetryOptIn) MwChipTone.Emerald else MwChipTone.Neutral,
                    contentDescription = if (telemetryOptIn) {
                        "Weekly pulse on, tap to turn off"
                    } else {
                        "Weekly pulse off, tap to turn on"
                    },
                    onClick = { onTelemetryChange(!telemetryOptIn) },
                )
            }
        }
        MwPrimaryButton(
            text = "Enter Today",
            contentDescription = "Enter Today",
            onClick = onFinish,
        )
    }
}
