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
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import com.missionwinning.app.MainActivity
import com.missionwinning.core.data.MwDatabase
import com.missionwinning.core.data.MwRepository

class StreakWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val streak = runCatching {
            val db = MwDatabase.get(context)
            MwRepository(db, api = null).workoutStreakDays()
        }.getOrDefault(0)
        val weekWorkouts = runCatching {
            val db = MwDatabase.get(context)
            val repo = MwRepository(db, api = null)
            val since = java.time.LocalDate.now()
                .minusDays(6)
                .atStartOfDay(java.time.ZoneId.systemDefault())
                .toInstant()
                .toString()
            repo.workoutsSince(since).size
        }.getOrDefault(0)

        provideContent {
            GlanceTheme {
                StreakContent(streak = streak, weekWorkouts = weekWorkouts)
            }
        }
    }
}

@Composable
private fun StreakContent(streak: Int, weekWorkouts: Int) {
    val navy = ColorProvider(Color(0xFF0A0C10))
    val emerald = ColorProvider(Color(0xFF27B07D))
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
        Text(
            text = if (weekWorkouts > 0) {
                "$weekWorkouts workout${if (weekWorkouts == 1) "" else "s"} this week"
            } else {
                "Log today · free offline"
            },
            style = TextStyle(color = if (weekWorkouts > 0) text else muted, fontSize = 12.sp),
        )
    }
}

class StreakWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = StreakWidget()
}
