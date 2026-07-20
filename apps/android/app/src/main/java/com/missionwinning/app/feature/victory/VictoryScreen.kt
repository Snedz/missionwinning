package com.missionwinning.app.feature.victory

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.unit.dp
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwGhostButton
import com.missionwinning.core.designsystem.MwPrimaryButton
import com.missionwinning.core.designsystem.MwTypography

@Composable
fun VictoryScreen(
    workoutName: String,
    sets: Int,
    duration: Int,
    workouts: Int,
    onCoach: () -> Unit,
    onToday: () -> Unit,
) {
    val coachFirst = workouts in 1..3
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.Start,
    ) {
        Text("Session locked", style = MwTypography.headlineLarge, color = MwColors.Text)
        Text(workoutName, style = MwTypography.titleLarge, color = MwColors.Emerald)
        Text(
            "$sets sets · ${duration}s · workout #$workouts",
            style = MwTypography.bodyLarge,
            color = MwColors.TextMuted,
            modifier = Modifier.padding(bottom = 16.dp),
        )
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(MwColors.NavyElevated)
                .drawBehind {
                    drawLine(
                        color = MwColors.Brass,
                        start = Offset(0f, 0f),
                        end = Offset(0f, size.height),
                        strokeWidth = 8f,
                    )
                }
                .padding(16.dp),
        ) {
            Text(
                if (coachFirst) {
                    "Coach adapts your week from this log — no wearable needed."
                } else {
                    "Keep logging. Mission Coach has your week."
                },
                style = MwTypography.bodyLarge,
                color = MwColors.Text,
            )
        }
        MwPrimaryButton(
            text = if (coachFirst) "See Mission Coach" else "Back to Today",
            onClick = if (coachFirst) onCoach else onToday,
            modifier = Modifier.padding(top = 16.dp),
        )
        MwGhostButton(text = "Today", onClick = onToday)
    }
}
