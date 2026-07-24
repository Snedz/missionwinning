package com.missionwinning.core.designsystem

import android.annotation.SuppressLint
import android.graphics.Color as AndroidColor
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView

/**
 * Form diagram sheet — loads the same `/form-guides/{id}.svg` as the web app
 * (docs/MEDIA_SYSTEM.md). Needs network once; SVG is long-cached on CDN.
 */
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun MwFormGuideSheet(
    exerciseName: String,
    svgUrl: String,
    onDismiss: () -> Unit,
) {
    MwAdaptiveOverlay(
        open = true,
        onDismiss = onDismiss,
        title = exerciseName,
    ) {
        Text(
            "Form diagram",
            style = MwTypography.labelMedium,
            color = MwColors.TextMuted,
        )
        Spacer(Modifier.height(MwSpace.sm))
        AndroidView(
            factory = { context ->
                WebView(context).apply {
                    setBackgroundColor(AndroidColor.parseColor("#0a0c10"))
                    settings.javaScriptEnabled = false
                    settings.loadWithOverviewMode = true
                    settings.useWideViewPort = true
                    webViewClient = WebViewClient()
                    loadUrl(svgUrl)
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(220.dp),
        )
        Spacer(Modifier.height(MwSpace.md))
        MwPrimaryButton(
            text = "Got it",
            contentDescription = "Close form diagram",
            onClick = onDismiss,
        )
    }
}
