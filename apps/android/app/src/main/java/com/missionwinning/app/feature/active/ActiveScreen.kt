package com.missionwinning.app.feature.active

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwGhostButton
import com.missionwinning.core.designsystem.MwPrimaryButton
import com.missionwinning.core.designsystem.MwSecondaryButton
import com.missionwinning.core.designsystem.MwTypography
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun ActiveScreen(
    repository: MwRepository,
    sessionId: String,
    workoutName: String,
    targetSets: Int,
    onFinished: (name: String, sets: Int, duration: Int, workouts: Int) -> Unit,
    onCancel: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    val count = targetSets.coerceIn(3, 12)
    var doneFlags by remember { mutableStateOf(List(count) { false }) }
    var restLeft by remember { mutableIntStateOf(0) }
    val startedAt = remember { System.currentTimeMillis() }

    LaunchedEffect(restLeft) {
        if (restLeft <= 0) return@LaunchedEffect
        delay(1000)
        restLeft -= 1
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Text(workoutName, style = MwTypography.headlineLarge, color = MwColors.Text)
        Text(
            "Log sets offline. Rest timer starts when you check a set.",
            style = MwTypography.bodyLarge,
            color = MwColors.TextMuted,
        )
        Text(
            if (restLeft > 0) "Rest ${restLeft}s" else "Ready",
            style = MwTypography.titleLarge,
            color = if (restLeft > 0) MwColors.Brass else MwColors.TextMuted,
        )

        doneFlags.forEachIndexed { i, done ->
            if (done) {
                MwSecondaryButton(
                    text = "✓ Set ${i + 1} · 10 reps",
                    onClick = {
                        doneFlags = doneFlags.toMutableList().also { it[i] = false }
                    },
                )
            } else {
                MwPrimaryButton(
                    text = "Set ${i + 1} · 10 reps",
                    onClick = {
                        doneFlags = doneFlags.toMutableList().also { it[i] = true }
                        restLeft = 60
                    },
                )
            }
        }

        MwPrimaryButton(
            text = "Finish workout",
            onClick = {
                scope.launch {
                    val doneCount = doneFlags.count { it }.coerceAtLeast(doneFlags.size)
                    val duration = ((System.currentTimeMillis() - startedAt) / 1000)
                        .toInt()
                        .coerceAtLeast(30)
                    val total = repository.appendWorkout(
                        workoutName = workoutName,
                        durationSeconds = duration,
                        setCount = doneCount,
                        totalVolume = doneCount * 10.0,
                        sessionId = sessionId,
                    )
                    repository.markSessionDone(sessionId)
                    onFinished(workoutName, doneCount, duration, total)
                }
            },
            modifier = Modifier.semantics { contentDescription = "Finish workout" },
        )
        MwGhostButton(text = "Cancel", onClick = onCancel)
    }
}
