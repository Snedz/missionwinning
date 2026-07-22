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
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AccountCircle
import androidx.compose.material.icons.outlined.FitnessCenter
import androidx.compose.material.icons.outlined.Today
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
// fillMaxWidth fraction overload

/** Spacing tokens */
object MwSpace {
    val xs = 4.dp
    val sm = 8.dp
    val md = 12.dp
    val lg = 16.dp
    val xl = 24.dp
    val xxl = 32.dp
    /** Section break between compositions */
    val section = 28.dp
    /** First-viewport breathing room */
    val hero = 40.dp
}

object MwRadius {
    val sm = 8.dp
    val md = 12.dp
    val lg = 16.dp
    val xl = 20.dp
    val pill = 999.dp
}

@Composable
fun MwCard(
    modifier: Modifier = Modifier,
    elevated: Boolean = false,
    glow: Boolean = false,
    /** Stronger emerald frame for logger current-set / ritual heroes */
    hero: Boolean = false,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit,
) {
    val shape = RoundedCornerShape(if (hero) MwRadius.xl else MwRadius.lg)
    val pad = if (hero) MwSpace.xl else MwSpace.lg
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
                if (glow || hero) {
                    Modifier.drawBehind {
                        drawCircle(
                            brush = Brush.radialGradient(
                                colors = listOf(
                                    if (hero) MwColors.EmeraldGlow else MwColors.EmeraldGlow,
                                    Color.Transparent,
                                ),
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
            .background(if (elevated || hero) MwColors.NavyElevated else MwColors.NavyDeep)
            .border(
                width = when {
                    hero -> 2.dp
                    glow -> 1.5.dp
                    else -> 1.dp
                },
                color = when {
                    hero -> MwColors.Emerald.copy(alpha = 0.55f)
                    glow -> MwColors.Emerald.copy(alpha = 0.45f)
                    else -> MwColors.Border
                },
                shape = shape,
            )
            .padding(pad),
        verticalArrangement = Arrangement.spacedBy(MwSpace.sm),
        content = content,
    )
}

@Composable
fun MwChip(
    text: String,
    modifier: Modifier = Modifier,
    tone: MwChipTone = MwChipTone.Neutral,
    onClick: (() -> Unit)? = null,
    contentDescription: String? = null,
) {
    val (bg, fg, border) = when (tone) {
        MwChipTone.Neutral -> Triple(MwColors.NavyElevated, MwColors.TextMuted, MwColors.Border)
        MwChipTone.Emerald -> Triple(MwColors.EmeraldDim.copy(alpha = 0.35f), MwColors.Emerald, MwColors.Emerald.copy(alpha = 0.5f))
        MwChipTone.Brass -> Triple(MwColors.BrassDim.copy(alpha = 0.25f), MwColors.Brass, MwColors.Brass.copy(alpha = 0.45f))
        MwChipTone.Danger -> Triple(MwColors.Danger.copy(alpha = 0.15f), MwColors.Danger, MwColors.Danger.copy(alpha = 0.4f))
    }
    val clickableMod = if (onClick != null) {
        Modifier
            .semantics {
                role = Role.Button
                contentDescription?.let { this.contentDescription = it }
            }
            .clickable(onClick = onClick)
    } else {
        Modifier
    }
    // Larger padding when tappable (≈48dp thumb target)
    val hPad = if (onClick != null) 14.dp else 10.dp
    val vPad = if (onClick != null) 12.dp else 4.dp
    Text(
        text = text.uppercase(),
        style = MwTypography.labelSmall,
        color = fg,
        modifier = modifier
            .clip(RoundedCornerShape(999.dp))
            .background(bg)
            .border(1.dp, border, RoundedCornerShape(999.dp))
            .then(clickableMod)
            .padding(horizontal = hPad, vertical = vPad),
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

enum class MwHubTab { Today, Coach, Account }

@Composable
fun MwBottomNav(
    selected: MwHubTab,
    onSelect: (MwHubTab) -> Unit,
    modifier: Modifier = Modifier,
) {
    val todayLabel = androidx.compose.ui.res.stringResource(R.string.mw_tab_today)
    val coachLabel = androidx.compose.ui.res.stringResource(R.string.mw_tab_coach)
    val accountLabel = androidx.compose.ui.res.stringResource(R.string.mw_tab_account)
    val todayCd = androidx.compose.ui.res.stringResource(R.string.mw_tab_today_cd)
    val coachCd = androidx.compose.ui.res.stringResource(R.string.mw_tab_coach_cd)
    val accountCd = androidx.compose.ui.res.stringResource(R.string.mw_tab_account_cd)
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(MwColors.NavyDeep)
            .border(width = 1.dp, color = MwColors.Border)
            .navigationBarsPadding()
            .padding(horizontal = MwSpace.sm, vertical = MwSpace.xs),
        horizontalArrangement = Arrangement.SpaceEvenly,
    ) {
        NavItem(
            label = todayLabel,
            icon = Icons.Outlined.Today,
            selected = selected == MwHubTab.Today,
            contentDescription = todayCd,
            onClick = { onSelect(MwHubTab.Today) },
            modifier = Modifier.weight(1f),
        )
        NavItem(
            label = coachLabel,
            icon = Icons.Outlined.FitnessCenter,
            selected = selected == MwHubTab.Coach,
            contentDescription = coachCd,
            onClick = { onSelect(MwHubTab.Coach) },
            modifier = Modifier.weight(1f),
        )
        NavItem(
            label = accountLabel,
            icon = Icons.Outlined.AccountCircle,
            selected = selected == MwHubTab.Account,
            contentDescription = accountCd,
            onClick = { onSelect(MwHubTab.Account) },
            modifier = Modifier.weight(1f),
        )
    }
}

@Composable
private fun NavItem(
    label: String,
    icon: ImageVector,
    selected: Boolean,
    contentDescription: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val tint = if (selected) MwColors.Emerald else MwColors.Brass.copy(alpha = 0.75f)
    Column(
        modifier = modifier
            .heightIn(min = 48.dp)
            .clip(RoundedCornerShape(MwRadius.md))
            .background(if (selected) MwColors.NavyPressed else Color.Transparent)
            .clickable(onClick = onClick)
            .semantics {
                role = Role.Tab
                this.contentDescription = contentDescription
                this.selected = selected
            }
            .padding(vertical = MwSpace.sm),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = tint,
            modifier = Modifier.size(22.dp),
        )
        Spacer(Modifier.height(4.dp))
        Text(
            label,
            style = MwTypography.labelMedium,
            color = if (selected) MwColors.Emerald else MwColors.TextMuted,
        )
        Spacer(Modifier.height(4.dp))
        Box(
            modifier = Modifier
                .size(width = if (selected) 22.dp else 18.dp, height = 3.dp)
                .clip(RoundedCornerShape(MwRadius.pill))
                .background(if (selected) MwColors.Emerald else Color.Transparent),
        )
    }
}

@Composable
fun MwOfflinePill(
    modifier: Modifier = Modifier,
    /** When true, show online-ready copy; false/null keeps offline-honest default. */
    online: Boolean? = null,
) {
    val (label, fg, bg, border) = when (online) {
        true -> Quad(
            "ONLINE · READY TO SYNC",
            MwColors.Emerald,
            MwColors.EmeraldDim.copy(alpha = 0.25f),
            MwColors.Emerald.copy(alpha = 0.4f),
        )
        else -> Quad(
            "ON DEVICE · SYNC LATER",
            MwColors.Brass,
            MwColors.BrassDim.copy(alpha = 0.2f),
            MwColors.Brass.copy(alpha = 0.35f),
        )
    }
    Text(
        label,
        style = MwTypography.labelSmall,
        color = fg,
        modifier = modifier
            .clip(RoundedCornerShape(999.dp))
            .background(bg)
            .border(1.dp, border, RoundedCornerShape(999.dp))
            .padding(horizontal = 10.dp, vertical = 4.dp),
    )
}

private data class Quad<A, B, C, D>(val a: A, val b: B, val c: C, val d: D)

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
fun MwLoadingBlock(modifier: Modifier = Modifier, lines: Int = 3) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(MwSpace.sm),
    ) {
        repeat(lines) { i ->
            Box(
                modifier = Modifier
                    .fillMaxWidth(if (i == lines - 1) 0.65f else 1f)
                    .height(14.dp)
                    .clip(RoundedCornerShape(MwRadius.md))
                    .background(MwColors.NavyElevated)
                    .border(1.dp, MwColors.Border, RoundedCornerShape(MwRadius.md)),
            )
        }
    }
}

@Composable
fun MwConfirmSheet(
    title: String,
    body: String,
    confirmLabel: String,
    cancelLabel: String = "Cancel",
    onConfirm: () -> Unit,
    onDismiss: () -> Unit,
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(MwRadius.xl))
            .background(MwColors.NavyElevated)
            .border(1.dp, MwColors.Border, RoundedCornerShape(MwRadius.xl))
            .padding(MwSpace.lg),
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(MwSpace.md)) {
            Text(title, style = MwTypography.titleLarge, color = MwColors.Text)
            Text(body, style = MwTypography.bodyMedium, color = MwColors.TextMuted)
            MwPrimaryButton(
                text = confirmLabel,
                contentDescription = confirmLabel,
                onClick = onConfirm,
            )
            MwGhostButton(text = cancelLabel, onClick = onDismiss, contentDescription = cancelLabel)
        }
    }
}

@Composable
fun MwWeekStrip(
    days: List<MwWeekDay>,
    modifier: Modifier = Modifier,
    onDayClick: ((MwWeekDay) -> Unit)? = null,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        days.forEach { day ->
            val actionable = onDayClick != null && day.sessionId != null &&
                (day.state == MwWeekDayState.Planned || day.state == MwWeekDayState.Today)
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = if (actionable) {
                    Modifier
                        .clip(RoundedCornerShape(MwRadius.md))
                        .clickable { onDayClick?.invoke(day) }
                        .semantics {
                            role = Role.Button
                            contentDescription = "Start ${day.sessionName ?: "session"} on ${day.label}"
                        }
                        .padding(horizontal = 4.dp, vertical = 4.dp)
                } else {
                    Modifier.padding(horizontal = 4.dp, vertical = 4.dp)
                },
            ) {
                Text(day.label, style = MwTypography.labelSmall, color = MwColors.TextMuted)
                Spacer(Modifier.height(6.dp))
                Box(
                    modifier = Modifier
                        .size(if (day.state == MwWeekDayState.Today) 12.dp else 10.dp)
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

data class MwWeekDay(
    val label: String,
    val state: MwWeekDayState,
    val dayOffset: Int = -1,
    val sessionId: String? = null,
    val sessionName: String? = null,
    val setCount: Int = 0,
)

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
    totalSeconds: Int = 0,
) {
    if (secondsLeft <= 0) return
    val total = totalSeconds.coerceAtLeast(secondsLeft).coerceAtLeast(1)
    val progress = (secondsLeft.toFloat() / total.toFloat()).coerceIn(0f, 1f)
    MwCard(modifier = modifier, elevated = true, glow = true, hero = true) {
        MwRestTimer(secondsLeft = secondsLeft)
        // Remaining rest fraction (ticks down with the timer)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(5.dp)
                .clip(RoundedCornerShape(MwRadius.pill))
                .background(MwColors.Border),
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(progress)
                    .height(5.dp)
                    .clip(RoundedCornerShape(MwRadius.pill))
                    .background(MwColors.Brass),
            )
        }
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

