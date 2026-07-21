package com.missionwinning.app.feature.active

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.LinearProgressIndicator
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
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.unit.dp
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwGhostButton
import com.missionwinning.core.designsystem.MwHeroTitle
import com.missionwinning.core.designsystem.MwPrimaryButton
import com.missionwinning.core.designsystem.MwRestTimer
import com.missionwinning.core.designsystem.MwScreenScaffold
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwSetRow
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
    val doneCount = doneFlags.count { it }
    val currentIndex = doneFlags.indexOfFirst { !it }.let { if (it < 0) count - 1 else it }
    val progress = doneCount.toFloat() / count.toFloat()

    LaunchedEffect(restLeft) {
        if (restLeft <= 0) return@LaunchedEffect
        delay(1000)
        restLeft -= 1
    }

    MwScreenScaffold {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            MwSectionLabel("Train")
            MwHeroTitle(workoutName)
            Text(
                "Log sets offline. Rest starts when you complete a set.",
                style = MwTypography.bodyMedium,
                color = MwColors.TextMuted,
            )

            LinearProgressIndicator(
                progress = { progress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .padding(top = 4.dp),
                color = MwColors.Emerald,
                trackColor = MwColors.Border,
                strokeCap = StrokeCap.Round,
            )
            Text(
                "$doneCount / $count sets",
                style = MwTypography.labelMedium,
                color = MwColors.TextMuted,
            )

            Spacer(Modifier.height(4.dp))
            MwRestTimer(secondsLeft = restLeft)
            Spacer(Modifier.height(8.dp))

            doneFlags.forEachIndexed { i, done ->
                MwSetRow(
                    index = i,
                    reps = 10,
                    done = done,
                    isCurrent = i == currentIndex,
                    onToggle = {
                        doneFlags = doneFlags.toMutableList().also { list ->
                            list[i] = !list[i]
                        }
                        if (!done) restLeft = 60
                    },
                )
            }

            Spacer(Modifier.height(12.dp))
            MwPrimaryButton(
                text = "Finish workout",
                contentDescription = "Finish workout",
                onClick = {
                    scope.launch {
                        val logged = doneFlags.count { it }.coerceAtLeast(1)
                        val duration = ((System.currentTimeMillis() - startedAt) / 1000)
                            .toInt()
                            .coerceAtLeast(30)
                        val total = repository.appendWorkout(
                            workoutName = workoutName,
                            durationSeconds = duration,
                            setCount = logged,
                            totalVolume = logged * 10.0,
                            sessionId = sessionId,
                        )
                        repository.markSessionDone(sessionId)
                        onFinished(workoutName, logged, duration, total)
                    }
                },
            )
            MwGhostButton(text = "Cancel", onClick = onCancel)
        }
    }
}
