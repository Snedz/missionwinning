package com.missionwinning.wear.tile

import androidx.wear.protolayout.ColorBuilders.argb
import androidx.wear.protolayout.DimensionBuilders.dp
import androidx.wear.protolayout.DimensionBuilders.expand
import androidx.wear.protolayout.LayoutElementBuilders
import androidx.wear.protolayout.ModifiersBuilders
import androidx.wear.protolayout.material.Colors
import androidx.wear.protolayout.material.Text
import androidx.wear.protolayout.material.Typography
import androidx.wear.protolayout.material.layouts.PrimaryLayout
import androidx.wear.tiles.RequestBuilders
import androidx.wear.tiles.TileBuilders
import androidx.wear.tiles.TileService
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture
import com.missionwinning.core.common.WearProtocol
import com.missionwinning.wear.data.WearSessionStore
import java.util.concurrent.TimeUnit

/**
 * Watch face tile: active set / rest / streak (phone SoT).
 * Tap opens the Wear logger activity.
 */
class MwSessionTileService : TileService() {

    override fun onTileRequest(
        requestParams: RequestBuilders.TileRequest,
    ): ListenableFuture<TileBuilders.Tile> {
        val session = WearSessionStore.session.value
        val line = WearProtocol.statusLine(session)
        val subtitle = when {
            session.active && session.workoutName.isNotBlank() -> session.workoutName
            session.streakDays > 0 -> "Train free offline"
            else -> "Start on phone"
        }

        val click = ModifiersBuilders.Clickable.Builder()
            .setId("open")
            .setOnClick(
                androidx.wear.protolayout.ActionBuilders.LaunchAction.Builder()
                    .setAndroidActivity(
                        androidx.wear.protolayout.ActionBuilders.AndroidActivity.Builder()
                            .setClassName("com.missionwinning.wear.presentation.MainActivity")
                            .setPackageName(packageName)
                            .build(),
                    )
                    .build(),
            )
            .build()

        val title = Text.Builder(this, line)
            .setTypography(Typography.TYPOGRAPHY_TITLE3)
            .setColor(argb(0xFF27B07D.toInt()))
            .setMaxLines(2)
            .build()
        val body = Text.Builder(this, subtitle)
            .setTypography(Typography.TYPOGRAPHY_BODY2)
            .setColor(argb(0xFF9AA3B2.toInt()))
            .setMaxLines(2)
            .build()

        val column = LayoutElementBuilders.Column.Builder()
            .setWidth(expand())
            .setHeight(expand())
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
            .addContent(title)
            .addContent(
                LayoutElementBuilders.Spacer.Builder()
                    .setHeight(dp(4f))
                    .build(),
            )
            .addContent(body)
            .build()

        val layout = PrimaryLayout.Builder(requestParams.deviceConfiguration)
            .setResponsiveContentInsetEnabled(true)
            .setContent(column)
            .build()

        val root = LayoutElementBuilders.Box.Builder()
            .setWidth(expand())
            .setHeight(expand())
            .setModifiers(
                ModifiersBuilders.Modifiers.Builder()
                    .setClickable(click)
                    .setBackground(
                        ModifiersBuilders.Background.Builder()
                            .setColor(argb(0xFF0A0C10.toInt()))
                            .build(),
                    )
                    .build(),
            )
            .addContent(layout)
            .build()

        val tile = TileBuilders.Tile.Builder()
            .setResourcesVersion(RESOURCES_VERSION)
            .setFreshnessIntervalMillis(TimeUnit.SECONDS.toMillis(30))
            .setTileTimeline(
                androidx.wear.protolayout.TimelineBuilders.Timeline.fromLayoutElement(root),
            )
            .build()
        return Futures.immediateFuture(tile)
    }

    override fun onTileResourcesRequest(
        requestParams: RequestBuilders.ResourcesRequest,
    ): ListenableFuture<androidx.wear.protolayout.ResourceBuilders.Resources> {
        return Futures.immediateFuture(
            androidx.wear.protolayout.ResourceBuilders.Resources.Builder()
                .setVersion(RESOURCES_VERSION)
                .build(),
        )
    }

    companion object {
        private const val RESOURCES_VERSION = "1"
        // Material Colors unused but documents brand intent
        @Suppress("unused")
        private val brand = Colors.DEFAULT
    }
}
