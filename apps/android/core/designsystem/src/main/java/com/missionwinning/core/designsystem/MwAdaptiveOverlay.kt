package com.missionwinning.core.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties

/**
 * Adaptive overlay: Compact = bottom-aligned sheet; Medium/Expanded = centered dialog.
 * Mirrors web [AdaptiveOverlay] size-class rules (docs/ADAPTIVE_LAYOUT.md).
 */
@Composable
fun MwAdaptiveOverlay(
    open: Boolean,
    onDismiss: () -> Unit,
    title: String,
    modifier: Modifier = Modifier,
    eyebrow: String? = null,
    content: @Composable ColumnScope.() -> Unit,
) {
    if (!open) return

    val sizeClass = rememberMwWidthSizeClass()
    val compact = sizeClass == MwWidthSizeClass.Compact
    val maxW = sizeClass.overlayMaxWidthDp()

    if (compact) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.55f))
                .clickable(
                    indication = null,
                    interactionSource = remember { MutableInteractionSource() },
                    onClick = onDismiss,
                )
                .semantics { contentDescription = "Dismiss overlay" },
        ) {
            Column(
                modifier = modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .heightIn(max = 640.dp)
                    .clip(RoundedCornerShape(topStart = MwRadius.xl, topEnd = MwRadius.xl))
                    .background(MwColors.NavyElevated)
                    .clickable(
                        indication = null,
                        interactionSource = remember { MutableInteractionSource() },
                        onClick = {}, // absorb
                    )
                    .navigationBarsPadding()
                    .padding(MwSpace.lg)
                    .verticalScroll(rememberScrollState()),
            ) {
                OverlayHeader(eyebrow = eyebrow, title = title)
                content()
            }
        }
    } else {
        Dialog(
            onDismissRequest = onDismiss,
            properties = DialogProperties(usePlatformDefaultWidth = false),
        ) {
            Column(
                modifier = modifier
                    .widthIn(max = maxW.dp)
                    .fillMaxWidth(0.92f)
                    .heightIn(max = 720.dp)
                    .clip(RoundedCornerShape(MwRadius.xl))
                    .background(MwColors.NavyElevated)
                    .padding(MwSpace.lg)
                    .verticalScroll(rememberScrollState()),
            ) {
                OverlayHeader(eyebrow = eyebrow, title = title)
                content()
            }
        }
    }
}

@Composable
private fun OverlayHeader(eyebrow: String?, title: String) {
    if (eyebrow != null) {
        Text(
            text = eyebrow.uppercase(),
            style = MwTypography.labelSmall,
            color = MwColors.TextMuted,
            modifier = Modifier.padding(bottom = MwSpace.xs),
        )
    }
    Text(
        text = title,
        style = MwTypography.titleMedium,
        color = MwColors.Text,
        modifier = Modifier.padding(bottom = MwSpace.md),
    )
}
