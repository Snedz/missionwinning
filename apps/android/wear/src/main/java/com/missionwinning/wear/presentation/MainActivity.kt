package com.missionwinning.wear.presentation

import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.Chip
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.TimeText
import com.missionwinning.core.common.ActiveSessionHub
import com.missionwinning.wear.data.WearPhoneClient
import com.missionwinning.wear.data.WearSessionStore
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                WearLoggerScreen()
            }
        }
    }
}

@Composable
private fun WearLoggerScreen() {
    val context = LocalContext.current
    val client = remember { WearPhoneClient(context) }
    val session by WearSessionStore.session.collectAsStateWithLifecycle()
    val scope = rememberCoroutineScope()
    var tick by remember { mutableIntStateOf(0) }
    var localReps by remember { mutableIntStateOf(session.reps) }
    var localWeight by remember { mutableDoubleStateOf(session.weight) }
    var lastResting by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        runCatching { client.refreshActiveFromDataLayer() }
    }
    LaunchedEffect(session.currentSetId, session.reps, session.weight) {
        localReps = session.reps
        localWeight = session.weight
    }
    LaunchedEffect(Unit) {
        while (true) {
            delay(1000)
            tick++
        }
    }

    val restLeft = remember(session.restDeadlineMs, tick) { session.restSecondsLeft() }
    LaunchedEffect(restLeft) {
        val resting = restLeft > 0
        if (lastResting && !resting && session.active) {
            vibrate(context, long = true)
        }
        lastResting = resting
    }

    val navy = Color(0xFF0A0C10)
    val emerald = Color(0xFF27B07D)
    val muted = Color(0xFF9AA3B2)
    val text = Color(0xFFF2F4F7)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(navy)
            .padding(8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        TimeText()
        Spacer(Modifier.height(4.dp))
        when {
            !session.active -> {
                Text(
                    text = "Start workout\non phone",
                    color = muted,
                    textAlign = TextAlign.Center,
                )
            }
            restLeft > 0 -> {
                Text("Rest", color = emerald)
                Text(
                    formatRest(restLeft),
                    color = text,
                )
                Spacer(Modifier.height(8.dp))
                Button(
                    onClick = {
                        scope.launch {
                            client.sendSkipRest()
                            vibrate(context, long = false)
                        }
                    },
                    modifier = Modifier.fillMaxWidth(0.85f),
                ) {
                    Text("Skip rest")
                }
            }
            session.currentSetId.isBlank() -> {
                Text(session.workoutName.ifBlank { "Workout" }, color = emerald)
                Text(
                    "${session.doneSets}/${session.totalSets} sets",
                    color = muted,
                )
                Text("No open sets", color = text)
            }
            else -> {
                Text(session.workoutName.ifBlank { "Workout" }, color = muted)
                Text(session.exerciseName.ifBlank { "Set" }, color = emerald)
                Text(
                    "Set ${session.setIndex + 1} · ${session.doneSets}/${session.totalSets}",
                    color = muted,
                )
                Spacer(Modifier.height(4.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Chip(onClick = { localReps = (localReps - 1).coerceAtLeast(1) }, label = { Text("-") })
                    Text("$localReps reps", color = text)
                    Chip(onClick = { localReps = (localReps + 1).coerceAtMost(99) }, label = { Text("+") })
                }
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    val step = if (session.weightUnit == "lb") 5.0 else 2.5
                    Chip(onClick = { localWeight = (localWeight - step).coerceAtLeast(0.0) }, label = { Text("-") })
                    Text(
                        "${formatWeight(localWeight)} ${session.weightUnit}",
                        color = text,
                    )
                    Chip(onClick = { localWeight += step }, label = { Text("+") })
                }
                Spacer(Modifier.height(6.dp))
                Button(
                    onClick = {
                        scope.launch {
                            client.sendComplete(session.currentSetId, localReps, localWeight)
                            vibrate(context, long = true)
                        }
                    },
                    modifier = Modifier.fillMaxWidth(0.9f),
                ) {
                    Text("Complete set")
                }
            }
        }
    }
}

private fun formatRest(seconds: Int): String {
    val m = seconds / 60
    val s = seconds % 60
    return if (m > 0) "%d:%02d".format(m, s) else "${s}s"
}

private fun formatWeight(value: Double): String {
    return if (kotlin.math.abs(value - value.toLong()) < 1e-6) {
        value.toLong().toString()
    } else {
        String.format(java.util.Locale.US, "%.1f", value)
    }
}

@Suppress("DEPRECATION")
private fun vibrate(context: android.content.Context, long: Boolean) {
    val duration = if (long) 80L else 40L
    val vibrator = if (android.os.Build.VERSION.SDK_INT >= 31) {
        val vm = context.getSystemService(VibratorManager::class.java)
        vm?.defaultVibrator
    } else {
        context.getSystemService(Vibrator::class.java)
    } ?: return
    if (android.os.Build.VERSION.SDK_INT >= 26) {
        vibrator.vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE))
    } else {
        vibrator.vibrate(duration)
    }
}
