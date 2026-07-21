package com.missionwinning.core.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp

/** Spacing tokens */
object MwSpace {
    val xs = 4.dp
    val sm = 8.dp
    val md = 12.dp
    val lg = 16.dp
    val xl = 24.dp
    val xxl = 32.dp
}

object MwRadius {
    val md = 12.dp
    val lg = 16.dp
    val xl = 20.dp
}

@Composable
fun MwCard(
    modifier: Modifier = Modifier,
    elevated: Boolean = false,
    glow: Boolean = false,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit,
) {
    val shape = RoundedCornerShape(MwRadius.lg)
    Column(
        modifier = modifier
            .fillMaxWidth()
            .then(
                if (onClick != null) {
                    Modifier
                        .clickable(onClick = onClick)
                        .semantics { role = Role.Button }
                } else {
                    Modifier
                },
            )
            .then(
                if (glow) {
                    Modifier.drawBehind {
                        drawCircle(
                            brush = Brush.radialGradient(
                                colors = listOf(MwColors.EmeraldGlow, Color.Transparent),
                                center = Offset(size.width * 0.2f, size.height * 0.1f),
                                radius = size.minDimension * 0.9f,
                            ),
                        )
                    }
                } else {
                    Modifier
                },
            )
            .clip(shape)
            .background(if (elevated) MwColors.NavyElevated else MwColors.NavyDeep)
            .border(
                width = if (glow) 1.5.dp else 1.dp,
                color = if (glow) MwColors.Emerald.copy(alpha = 0.45f) else MwColors.Border,
                shape = shape,
            )
            .padding(MwSpace.lg),
        verticalArrangement = Arrangement.spacedBy(MwSpace.sm),
        content = content,
    )
}

@Composable
fun MwChip(
    text: String,
    modifier: Modifier = Modifier,
    tone: MwChipTone = MwChipTone.Neutral,
) {
    val (bg, fg, border) = when (tone) {
        MwChipTone.Neutral -> Triple(MwColors.NavyElevated, MwColors.TextMuted, MwColors.Border)
        MwChipTone.Emerald -> Triple(MwColors.EmeraldDim.copy(alpha = 0.35f), MwColors.Emerald, MwColors.Emerald.copy(alpha = 0.5f))
        MwChipTone.Brass -> Triple(MwColors.BrassDim.copy(alpha = 0.25f), MwColors.Brass, MwColors.Brass.copy(alpha = 0.45f))
        MwChipTone.Danger -> Triple(MwColors.Danger.copy(alpha = 0.15f), MwColors.Danger, MwColors.Danger.copy(alpha = 0.4f))
    }
    Text(
        text = text.uppercase(),
        style = MwTypography.labelSmall,
        color = fg,
        modifier = modifier
            .clip(RoundedCornerShape(999.dp))
            .background(bg)
            .border(1.dp, border, RoundedCornerShape(999.dp))
            .padding(horizontal = 10.dp, vertical = 4.dp),
    )
}

enum class MwChipTone { Neutral, Emerald, Brass, Danger }

@Composable
fun MwTopBar(
    title: String,
    modifier: Modifier = Modifier,
    onBack: (() -> Unit)? = null,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(bottom = MwSpace.sm),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            if (onBack != null) {
                Text(
                    "←",
                    style = MwTypography.titleLarge,
                    color = MwColors.Emerald,
                    modifier = Modifier
                        .semantics {
                            role = Role.Button
                            contentDescription = "Back"
                        }
                        .clickable(onClick = onBack)
                        .padding(end = MwSpace.md),
                )
            }
            Text(title, style = MwTypography.titleLarge, color = MwColors.Text)
        }
        if (actionLabel != null && onAction != null) {
            Text(
                actionLabel,
                style = MwTypography.labelMedium,
                color = MwColors.Emerald,
                modifier = Modifier
                    .semantics {
                        role = Role.Button
                        contentDescription = actionLabel
                    }
                    .clickable(onClick = onAction)
                    .padding(MwSpace.xs),
            )
        }
    }
}

enum class MwHubTab { Today, Coach }

@Composable
fun MwBottomNav(
    selected: MwHubTab,
    onSelect: (MwHubTab) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(MwColors.NavyDeep)
            .border(width = 1.dp, color = MwColors.Border)
            .padding(horizontal = MwSpace.sm, vertical = MwSpace.sm),
        horizontalArrangement = Arrangement.SpaceEvenly,
    ) {
        NavItem(
            label = "Today",
            selected = selected == MwHubTab.Today,
            contentDescription = "Today tab",
            onClick = { onSelect(MwHubTab.Today) },
            modifier = Modifier.weight(1f),
        )
        NavItem(
            label = "Coach",
            selected = selected == MwHubTab.Coach,
            contentDescription = "Coach tab",
            onClick = { onSelect(MwHubTab.Coach) },
            modifier = Modifier.weight(1f),
        )
    }
}

@Composable
private fun NavItem(
    label: String,
    selected: Boolean,
    contentDescription: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(MwRadius.md))
            .clickable(onClick = onClick)
            .semantics {
                role = Role.Tab
                this.contentDescription = contentDescription
            }
            .padding(vertical = MwSpace.sm),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(
            modifier = Modifier
                .size(4.dp)
                .clip(CircleShape)
                .background(if (selected) MwColors.Emerald else Color.Transparent),
        )
        Spacer(Modifier.height(4.dp))
        Text(
            label,
            style = MwTypography.labelLarge,
            color = if (selected) MwColors.Emerald else MwColors.TextMuted,
        )
    }
}

@Composable
fun MwOfflinePill(modifier: Modifier = Modifier) {
    Text(
        "ON DEVICE · SYNC LATER",
        style = MwTypography.labelSmall,
        color = MwColors.Brass,
        modifier = modifier
            .clip(RoundedCornerShape(999.dp))
            .background(MwColors.BrassDim.copy(alpha = 0.2f))
            .border(1.dp, MwColors.Brass.copy(alpha = 0.35f), RoundedCornerShape(999.dp))
            .padding(horizontal = 10.dp, vertical = 4.dp),
    )
}

@Composable
fun MwMetricCard(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(MwRadius.md))
            .background(MwColors.NavyElevated)
            .border(1.dp, MwColors.Border, RoundedCornerShape(MwRadius.md))
            .padding(MwSpace.md),
        horizontalAlignment = Alignment.Start,
    ) {
        Text(label.uppercase(), style = MwTypography.labelSmall, color = MwColors.Brass)
        Spacer(Modifier.height(6.dp))
        Text(value, style = MwTypography.headlineMedium, color = MwColors.Text)
    }
}

@Composable
fun MwSessionTile(
    dayLabel: String,
    title: String,
    subtitle: String,
    statusLabel: String,
    statusTone: MwChipTone,
    highlighted: Boolean,
    actionable: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val shape = RoundedCornerShape(MwRadius.lg)
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(shape)
            .background(if (highlighted) MwColors.NavyElevated else MwColors.NavyDeep)
            .border(
                1.5.dp,
                if (highlighted) MwColors.Emerald.copy(alpha = 0.5f) else MwColors.Border,
                shape,
            )
            .then(
                if (actionable) {
                    Modifier
                        .clickable(onClick = onClick)
                        .semantics {
                            role = Role.Button
                            contentDescription = "Start $title"
                        }
                } else {
                    Modifier
                },
            )
            .padding(MwSpace.lg),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            Text(dayLabel, style = MwTypography.labelSmall, color = MwColors.Brass)
            Text(title, style = MwTypography.titleLarge, color = MwColors.Text)
            Text(subtitle, style = MwTypography.bodyMedium, color = MwColors.TextMuted)
            MwChip(statusLabel, tone = statusTone)
        }
        if (actionable) {
            Text("›", style = MwTypography.headlineMedium, color = MwColors.Emerald)
        }
    }
}

@Composable
fun MwEmptyState(
    title: String,
    body: String,
    modifier: Modifier = Modifier,
    cta: String? = null,
    onCta: (() -> Unit)? = null,
) {
    MwCard(modifier = modifier, elevated = true) {
        Text(title, style = MwTypography.titleLarge, color = MwColors.Text)
        Text(body, style = MwTypography.bodyMedium, color = MwColors.TextMuted)
        if (cta != null && onCta != null) {
            Spacer(Modifier.height(MwSpace.sm))
            MwPrimaryButton(text = cta, onClick = onCta, contentDescription = cta)
        }
    }
}

@Composable
fun MwWeekStrip(
    days: List<MwWeekDay>,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        days.forEach { day ->
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(day.label, style = MwTypography.labelSmall, color = MwColors.TextMuted)
                Spacer(Modifier.height(6.dp))
                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .clip(CircleShape)
                        .background(
                            when (day.state) {
                                MwWeekDayState.Done -> MwColors.Emerald
                                MwWeekDayState.Today -> MwColors.Brass
                                MwWeekDayState.Planned -> MwColors.Border
                                MwWeekDayState.Empty -> MwColors.NavyElevated
                            },
                        )
                        .border(1.dp, MwColors.Border, CircleShape),
                )
            }
        }
    }
}

data class MwWeekDay(val label: String, val state: MwWeekDayState)

enum class MwWeekDayState { Empty, Planned, Today, Done }

@Composable
fun MwStepper(
    label: String,
    value: String,
    onMinus: () -> Unit,
    onPlus: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier) {
        Text(label, style = MwTypography.labelSmall, color = MwColors.TextMuted)
        Spacer(Modifier.height(6.dp))
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            StepBtn("−", "Decrease $label", onMinus)
            Text(
                value,
                style = MwTypography.headlineMedium,
                color = MwColors.Text,
                modifier = Modifier.width(64.dp),
            )
            StepBtn("+", "Increase $label", onPlus)
        }
    }
}

@Composable
private fun StepBtn(text: String, desc: String, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .size(48.dp)
            .clip(RoundedCornerShape(MwRadius.md))
            .background(MwColors.NavyElevated)
            .border(1.dp, MwColors.Border, RoundedCornerShape(MwRadius.md))
            .clickable(onClick = onClick)
            .semantics {
                role = Role.Button
                contentDescription = desc
            },
        contentAlignment = Alignment.Center,
    ) {
        Text(text, style = MwTypography.titleLarge, color = MwColors.Emerald)
    }
}

@Composable
fun MwRestDock(
    secondsLeft: Int,
    onMinus: () -> Unit,
    onSkip: () -> Unit,
    onPlus: () -> Unit,
    modifier: Modifier = Modifier,
) {
    if (secondsLeft <= 0) return
    MwCard(modifier = modifier, elevated = true, glow = true) {
        MwRestTimer(secondsLeft = secondsLeft)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            MwGhostButton(
                text = "−15s",
                contentDescription = "Shorten rest by 15 seconds",
                onClick = onMinus,
                modifier = Modifier.weight(1f),
            )
            MwSecondaryButton(
                text = "Skip",
                onClick = onSkip,
                modifier = Modifier.weight(1f),
            )
            MwGhostButton(
                text = "+15s",
                contentDescription = "Extend rest by 15 seconds",
                onClick = onPlus,
                modifier = Modifier.weight(1f),
            )
        }
    }
}

