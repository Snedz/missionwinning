package com.missionwinning.app.widget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.GlanceTheme
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import com.missionwinning.app.MainActivity
import com.missionwinning.core.common.ActiveSessionHub
import com.missionwinning.core.data.MwDatabase
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.model.WeightUnits

/**
 * Widget v2 (Phase 13): streak, week volume, active session cue, open app.
 */
class StreakWidget : GlanceAppWidget() {
    override val sizeMode: SizeMode = SizeMode.Exact

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val repo = runCatching {
            MwRepository.create(MwDatabase.get(context))
        }.getOrNull()
        val streak = runCatching { repo?.workoutStreakDays() ?: 0 }.getOrDefault(0)
        val since = java.time.LocalDate.now()
            .minusDays(6)
            .atStartOfDay(java.time.ZoneId.systemDefault())
            .toInstant()
            .toString()
        val weekRows = runCatching { repo?.workoutsSince(since).orEmpty() }.getOrDefault(emptyList())
        val weekWorkouts = weekRows.size
        val weekVol = weekRows.sumOf { it.totalVolume }
        val unit = runCatching { repo?.weightUnit() ?: "kg" }.getOrDefault("kg")
        val volLabel = if (weekVol > 0) {
            "${WeightUnits.format(weekVol)} $unit"
        } else {
            "—"
        }
        val active = ActiveSessionHub.snapshot.value
        val activeLine = when {
            active.active && active.restDeadlineMs != null &&
                active.restDeadlineMs!! > System.currentTimeMillis() ->
                "Rest · ${active.restSecondsLeft()}s"
            active.active ->
                "Live · ${active.doneSets}/${active.totalSets.coerceAtLeast(1)}"
            else -> null
        }

        provideContent {
            GlanceTheme {
                StreakContent(
                    streak = streak,
                    weekWorkouts = weekWorkouts,
                    weekVolumeLabel = volLabel,
                    activeLine = activeLine,
                )
            }
        }
    }
}

@Composable
private fun StreakContent(
    streak: Int,
    weekWorkouts: Int,
    weekVolumeLabel: String,
    activeLine: String?,
) {
    val navy = ColorProvider(Color(0xFF0A0C10))
    val emerald = ColorProvider(Color(0xFF27B07D))
    val brass = ColorProvider(Color(0xFFC7A860))
    val muted = ColorProvider(Color(0xFF9AA3B2))
    val text = ColorProvider(Color(0xFFF2F4F7))
    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(navy)
            .padding(12.dp)
            .clickable(actionStartActivity<MainActivity>()),
        verticalAlignment = Alignment.CenterVertically,
        horizontalAlignment = Alignment.Start,
    ) {
        Text(
            text = if (streak > 0) "$streak-day streak" else "Mission Winning",
            style = TextStyle(color = emerald, fontSize = 16.sp, fontWeight = FontWeight.Bold),
        )
        Spacer(GlanceModifier.height(4.dp))
        if (activeLine != null) {
            Text(
                text = activeLine,
                style = TextStyle(color = brass, fontSize = 13.sp, fontWeight = FontWeight.Bold),
            )
            Spacer(GlanceModifier.height(2.dp))
        }
        Text(
            text = if (weekWorkouts > 0) {
                "$weekWorkouts workout${if (weekWorkouts == 1) "" else "s"} · $weekVolumeLabel"
            } else {
                "Log today · free offline"
            },
            style = TextStyle(color = if (weekWorkouts > 0) text else muted, fontSize = 12.sp),
        )
        Spacer(GlanceModifier.height(6.dp))
        Row(modifier = GlanceModifier.fillMaxWidth()) {
            Text(
                text = "Open app",
                style = TextStyle(color = emerald, fontSize = 11.sp, fontWeight = FontWeight.Bold),
            )
        }
    }
}

class StreakWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = StreakWidget()
}
