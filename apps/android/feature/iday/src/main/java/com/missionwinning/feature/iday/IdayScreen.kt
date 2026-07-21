package com.missionwinning.feature.iday

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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

    MwScreenScaffold {
        MwEnterFade {
            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.SpaceBetween,
            ) {
                when (step) {
                    0 -> StepMission(
                        onNext = { step = 1 },
                        onSkip = { viewModel.complete(equipment, onFinished) },
                    )
                    1 -> StepEquipment(
                        selected = equipment,
                        onSelect = { equipment = it },
                        onNext = { step = 2 },
                        onBack = { step = 0 },
                    )
                    else -> StepReady(
                        equipment = equipment,
                        onFinish = { viewModel.complete(equipment, onFinished) },
                    )
                }
            }
        }
    }
}

@Composable
private fun StepMission(onNext: () -> Unit, onSkip: () -> Unit) {
    Column(verticalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxSize()) {
        Column(verticalArrangement = Arrangement.spacedBy(MwSpace.md)) {
            MwSectionLabel("I-Day · 1 of 3")
            Text("Mission Winning", style = MwTypography.displayLarge, color = MwColors.Text)
            MwBrassRule()
            Text(
                "Train Anywhere. Win Daily.",
                style = MwTypography.titleLarge,
                color = MwColors.Emerald,
            )
            Text(
                "Free offline logging and a weekly plan that adapts from your workouts — no wearable required.",
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
        Column(verticalArrangement = Arrangement.spacedBy(MwSpace.md)) {
            MwSectionLabel("I-Day · 2 of 3")
            Text("Where do you train?", style = MwTypography.headlineLarge, color = MwColors.Text)
            Text(
                "We seed your first week from this. Change anytime later.",
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
private fun StepReady(equipment: String, onFinish: () -> Unit) {
    Column(verticalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxSize()) {
        Column(verticalArrangement = Arrangement.spacedBy(MwSpace.md)) {
            MwSectionLabel("I-Day · 3 of 3")
            Text("Your first week is ready", style = MwTypography.headlineLarge, color = MwColors.Text)
            MwCard(elevated = true, glow = true) {
                Text("Offline · on this device", style = MwTypography.labelMedium, color = MwColors.Brass)
                Text(
                    "Equipment: ${equipment.replace('-', ' ')}",
                    style = MwTypography.titleLarge,
                    color = MwColors.Text,
                )
                Text(
                    "Start a session from Today. Logs stay on-device until you sign in.",
                    style = MwTypography.bodyMedium,
                    color = MwColors.TextMuted,
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
