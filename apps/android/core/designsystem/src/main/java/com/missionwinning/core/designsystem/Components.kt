package com.missionwinning.core.designsystem

import android.view.HapticFeedbackConstants
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import android.provider.Settings

val LocalReduceMotion = staticCompositionLocalOf { false }

@Composable
fun ProvideMwMotion(content: @Composable () -> Unit) {
    val context = LocalContext.current
    val systemReduce = remember(context) {
        Settings.Global.getFloat(
            context.contentResolver,
            Settings.Global.ANIMATOR_DURATION_SCALE,
            1f,
        ) == 0f
    }
    CompositionLocalProvider(LocalReduceMotion provides systemReduce) {
        content()
    }
}

@Composable
fun MwScreenScaffold(
    modifier: Modifier = Modifier,
    contentPadding: PaddingValues = PaddingValues(horizontal = 20.dp, vertical = 16.dp),
    content: @Composable BoxScope.() -> Unit,
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(MwColors.Navy)
            .drawBehind {
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(MwColors.EmeraldGlow, Color.Transparent),
                        center = Offset(size.width * 0.15f, size.height * 0.08f),
                        radius = size.minDimension * 0.85f,
                    ),
                    radius = size.minDimension * 0.85f,
                    center = Offset(size.width * 0.15f, size.height * 0.08f),
                )
            }
            .statusBarsPadding()
            .navigationBarsPadding()
            .padding(contentPadding),
        content = content,
    )
}

@Composable
fun MwSectionLabel(
    text: String,
    modifier: Modifier = Modifier,
    color: Color = MwColors.Brass,
) {
    Text(
        text = text.uppercase(),
        style = MwTypography.labelSmall,
        color = color,
        modifier = modifier,
    )
}

@Composable
fun MwHeroTitle(
    text: String,
    modifier: Modifier = Modifier,
) {
    Text(
        text = text,
        style = MwTypography.headlineLarge,
        color = MwColors.Text,
        modifier = modifier,
    )
}

@Composable
fun MwPrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    contentDescription: String? = null,
) {
    val shape = RoundedCornerShape(14.dp)
    val interaction = remember { MutableInteractionSource() }
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(56.dp)
            .clip(shape)
            .background(if (enabled) MwColors.Emerald else MwColors.EmeraldDim.copy(alpha = 0.4f))
            .clickable(
                enabled = enabled,
                interactionSource = interaction,
                indication = ripple(color = Color.White),
                role = Role.Button,
                onClick = onClick,
            )
            .then(
                if (contentDescription != null) {
                    Modifier.semantics {
                        this.role = Role.Button
                        this.contentDescription = contentDescription
                    }
                } else {
                    Modifier
                },
            ),
        contentAlignment = Alignment.Center,
    ) {
        Text(text, style = MwTypography.labelLarge, color = MwColors.Text)
    }
}

@Composable
fun MwSecondaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    contentDescription: String? = null,
) {
    val shape = RoundedCornerShape(14.dp)
    val interaction = remember { MutableInteractionSource() }
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(52.dp)
            .clip(shape)
            .border(1.dp, MwColors.Border, shape)
            .background(MwColors.NavyElevated)
            .clickable(
                interactionSource = interaction,
                indication = ripple(color = MwColors.Emerald),
                role = Role.Button,
                onClick = onClick,
            )
            .then(
                if (contentDescription != null) {
                    Modifier.semantics {
                        this.role = Role.Button
                        this.contentDescription = contentDescription
                    }
                } else {
                    Modifier
                },
            ),
        contentAlignment = Alignment.Center,
    ) {
        Text(text, style = MwTypography.labelLarge, color = MwColors.Text)
    }
}

@Composable
fun MwGhostButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    contentDescription: String? = null,
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(48.dp)
            .clickable(role = Role.Button, onClick = onClick)
            .then(
                if (contentDescription != null) {
                    Modifier.semantics {
                        this.role = Role.Button
                        this.contentDescription = contentDescription
                    }
                } else {
                    Modifier
                },
            ),
        contentAlignment = Alignment.Center,
    ) {
        Text(text, style = MwTypography.labelLarge, color = MwColors.Emerald)
    }
}

@Composable
fun MwSetRow(
    index: Int,
    reps: Int,
    done: Boolean,
    onToggle: () -> Unit,
    modifier: Modifier = Modifier,
    isCurrent: Boolean = false,
    weightLabel: String? = null,
) {
    val view = LocalView.current
    val shape = RoundedCornerShape(16.dp)
    val bg = when {
        done -> MwColors.EmeraldDim.copy(alpha = 0.35f)
        isCurrent -> MwColors.NavyElevated
        else -> MwColors.NavyDeep
    }
    val borderColor = when {
        done -> MwColors.Emerald
        isCurrent -> MwColors.Emerald.copy(alpha = 0.55f)
        else -> MwColors.Border
    }
    val detail = buildString {
        append("$reps reps")
        if (!weightLabel.isNullOrBlank()) append(" · $weightLabel")
    }
    val setLabel = when {
        done -> "Set ${index + 1}, $detail, completed. Double tap to undo"
        isCurrent -> "Set ${index + 1}, $detail, current. Double tap to complete"
        else -> "Set ${index + 1}, $detail. Double tap to complete"
    }
    Row(
        modifier = modifier
            .fillMaxWidth()
            .height(64.dp)
            .clip(shape)
            .background(bg)
            .border(1.5.dp, borderColor, shape)
            .semantics {
                role = Role.Button
                contentDescription = setLabel
            }
            .clickable {
                if (!done) {
                    view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                }
                onToggle()
            }
            .padding(horizontal = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Box(
            modifier = Modifier
                .size(28.dp)
                .clip(CircleShape)
                .background(if (done) MwColors.Emerald else Color.Transparent)
                .border(2.dp, if (done) MwColors.Emerald else MwColors.Border, CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            if (done) {
                Text("✓", color = MwColors.Text, style = MwTypography.labelLarge)
            }
        }
        Column(modifier = Modifier.weight(1f)) {
            Text(
                "Set ${index + 1}",
                style = MwTypography.titleMedium,
                color = MwColors.Text,
            )
            Text(
                detail,
                style = MwTypography.bodyMedium,
                color = MwColors.TextMuted,
            )
        }
        if (isCurrent && !done) {
            Text("NOW", style = MwTypography.labelSmall, color = MwColors.Emerald)
        } else if (done) {
            Text("DONE", style = MwTypography.labelSmall, color = MwColors.Emerald)
        }
    }
}

@Composable
fun MwRestTimer(
    secondsLeft: Int,
    modifier: Modifier = Modifier,
) {
    val reduceMotion = LocalReduceMotion.current
    val pulse = remember { Animatable(1f) }
    LaunchedEffect(secondsLeft, reduceMotion) {
        if (reduceMotion || secondsLeft <= 0) {
            pulse.snapTo(1f)
            return@LaunchedEffect
        }
        pulse.snapTo(1.04f)
        pulse.animateTo(1f, tween(280, easing = FastOutSlowInEasing))
    }
    Column(
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        MwSectionLabel(if (secondsLeft > 0) "Rest" else "Ready")
        Spacer(Modifier.height(8.dp))
        Text(
            text = if (secondsLeft > 0) {
                "%d:%02d".format(secondsLeft / 60, secondsLeft % 60)
            } else {
                "0:00"
            },
            style = MwTimerStyle,
            color = if (secondsLeft > 0) MwColors.Brass else MwColors.TextMuted,
            textAlign = TextAlign.Center,
            modifier = Modifier.graphicsLayer {
                scaleX = pulse.value
                scaleY = pulse.value
            },
        )
    }
}

@Composable
fun MwBrassRule(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .width(48.dp)
            .height(3.dp)
            .background(MwColors.Brass, RoundedCornerShape(2.dp)),
    )
}

@Composable
fun MwEnterFade(
    content: @Composable () -> Unit,
) {
    val reduceMotion = LocalReduceMotion.current
    val alpha = remember { Animatable(if (reduceMotion) 1f else 0f) }
    val offsetY = remember { Animatable(if (reduceMotion) 0f else 18f) }
    LaunchedEffect(reduceMotion) {
        if (reduceMotion) return@LaunchedEffect
        alpha.animateTo(1f, tween(520, easing = FastOutSlowInEasing))
        offsetY.animateTo(0f, tween(520, easing = FastOutSlowInEasing))
    }
    Box(
        modifier = Modifier.graphicsLayer {
            this.alpha = alpha.value
            translationY = offsetY.value
        },
    ) {
        content()
    }
}
