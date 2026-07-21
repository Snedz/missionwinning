package com.missionwinning.wear.complication

import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.PlainComplicationText
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.SuspendingComplicationDataSourceService
import com.missionwinning.core.common.WearProtocol
import com.missionwinning.wear.data.WearSessionStore

/**
 * Short-text complication: streak or live set progress.
 */
class MwStreakComplicationService : SuspendingComplicationDataSourceService() {

    override fun getPreviewData(type: ComplicationType): ComplicationData? {
        if (type != ComplicationType.SHORT_TEXT) return null
        return shortText("3d", "streak")
    }

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData? {
        if (request.complicationType != ComplicationType.SHORT_TEXT) return null
        val session = WearSessionStore.session.value
        val primary = when {
            session.active -> "${session.doneSets}/${session.totalSets.coerceAtLeast(1)}"
            session.streakDays > 0 -> "${session.streakDays}d"
            else -> "MW"
        }
        val secondary = WearProtocol.statusLine(session).take(16)
        return shortText(primary, secondary)
    }

    private fun shortText(primary: String, secondary: String): ShortTextComplicationData =
        ShortTextComplicationData.Builder(
            text = PlainComplicationText.Builder(primary).build(),
            contentDescription = PlainComplicationText.Builder("Mission Winning · $secondary").build(),
        )
            .setTitle(PlainComplicationText.Builder(secondary.take(8)).build())
            .build()
}
