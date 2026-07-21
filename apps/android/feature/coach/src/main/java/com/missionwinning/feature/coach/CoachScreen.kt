package com.missionwinning.feature.coach

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import android.app.Activity
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.missionwinning.core.designsystem.R as DsR
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.missionwinning.core.data.BillingConnectionState
import com.missionwinning.core.data.BillingOffer
import com.missionwinning.core.designsystem.MwCard
import com.missionwinning.core.designsystem.MwChip
import com.missionwinning.core.designsystem.MwChipTone
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwEmptyState
import com.missionwinning.core.designsystem.MwEnterFade
import com.missionwinning.core.designsystem.MwGhostButton
import com.missionwinning.core.designsystem.MwHeroTitle
import com.missionwinning.core.designsystem.MwLoadingBlock
import com.missionwinning.core.designsystem.MwOfflinePill
import com.missionwinning.core.designsystem.MwPrimaryButton
import com.missionwinning.core.designsystem.MwScreenScaffold
import com.missionwinning.core.designsystem.MwSecondaryButton
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwSessionTile
import com.missionwinning.core.designsystem.MwSpace
import com.missionwinning.core.designsystem.MwTypography
import com.missionwinning.feature.coach.BuildConfig
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

@Composable
fun CoachScreen(
    onStartWorkout: (sessionId: String, name: String, sets: Int) -> Unit,
    onBack: () -> Unit,
    viewModel: CoachViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val activity = context as? Activity
    val planResp = state.plan
    val todayOffset = ((LocalDate.now().dayOfWeek.value + 6) % 7)
    val weekStart = planResp?.plan?.weekStart
    val todaySession = planResp?.plan?.sessions?.firstOrNull {
        (it.status == "planned" || it.status == "swapped") &&
            (it.dayOffset == todayOffset || planResp.plan.sessions.none { s -> s.dayOffset == todayOffset })
    } ?: planResp?.plan?.sessions?.firstOrNull { it.status == "planned" || it.status == "swapped" }
    var showLab by remember { mutableStateOf(false) }
    val lifecycleOwner = LocalLifecycleOwner.current
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) viewModel.refresh()
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    MwScreenScaffold {
        MwEnterFade {
            Column(modifier = Modifier.fillMaxSize()) {
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(MwSpace.md),
                ) {
                    MwSectionLabel("Plan")
                    MwHeroTitle(stringResource(DsR.string.mw_hero_coach))
                    Text(
                        stringResource(DsR.string.mw_coach_tagline),
                        style = MwTypography.bodyMedium,
                        color = MwColors.TextMuted,
                    )

                    EntitlementBanner(
                        signedIn = state.signedIn,
                        premium = state.premium,
                        premiumSource = state.premiumSource,
                        billingOffers = state.billing.offers,
                        billingReady = state.billing.connection is BillingConnectionState.Ready,
                        billingPurchasing = state.billing.purchasing,
                        billingError = state.billing.lastError,
                        onSeedAdapt = if (state.premium) {
                            { viewModel.seedAdaptDemo() }
                        } else {
                            null
                        },
                        onSubscribe = if (!state.premium && state.signedIn && activity != null) {
                            { viewModel.subscribe(activity) }
                        } else {
                            null
                        },
                    )
                    state.billing.lastError?.let { err ->
                        Text(err, style = MwTypography.bodyMedium, color = MwColors.Danger)
                    }
                    state.message?.let { msg ->
                        Text(msg, style = MwTypography.bodyMedium, color = MwColors.Emerald)
                    }

                    MwCard(elevated = true) {
                        MwOfflinePill()
                        Text(
                            "Week of ${weekStart ?: "—"}",
                            style = MwTypography.titleLarge,
                            color = MwColors.Text,
                        )
                        val sessions = planResp?.plan?.sessions.orEmpty()
                        val doneN = sessions.count { it.status == "done" }
                        val openN = sessions.count { it.status == "planned" || it.status == "swapped" }
                        val missedN = sessions.count { it.status == "missed" }
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            MwChip("${planResp?.plan?.daysPerWeek ?: 0} days", tone = MwChipTone.Emerald)
                            MwChip("rev ${planResp?.plan?.revision ?: 0}", tone = MwChipTone.Brass)
                            planResp?.plan?.equipmentProfile?.let { eq ->
                                MwChip(eq.replace('-', ' '), tone = MwChipTone.Neutral)
                            }
                        }
                        if (sessions.isNotEmpty()) {
                            Spacer(Modifier.height(8.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                MwChip("$doneN done", tone = MwChipTone.Emerald)
                                MwChip("$openN open", tone = MwChipTone.Brass)
                                if (missedN > 0) {
                                    MwChip("$missedN missed", tone = MwChipTone.Danger)
                                }
                            }
                            val total = sessions.size.coerceAtLeast(1)
                            val progress = doneN.toFloat() / total.toFloat()
                            Spacer(Modifier.height(10.dp))
                            Text(
                                "Week progress · $doneN / $total",
                                style = MwTypography.labelMedium,
                                color = MwColors.TextMuted,
                            )
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(6.dp)
                                    .clip(RoundedCornerShape(999.dp))
                                    .background(MwColors.Border),
                            ) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth(progress.coerceIn(0f, 1f))
                                        .height(6.dp)
                                        .clip(RoundedCornerShape(999.dp))
                                        .background(MwColors.Emerald),
                                )
                            }
                        }
                    }

                    if (state.loading) {
                        MwCard(elevated = true) {
                            MwLoadingBlock(lines = 5)
                        }
                    }

                    planResp?.let {
                        CoachAdaptBanner(resp = it, premium = state.premium)
                    }

                    CoachInsightStack(
                        insights = state.insights,
                        premium = state.premium,
                    )

                    MwSectionLabel("Sessions")
                    val ordered = planResp?.plan?.sessions.orEmpty().sortedBy { it.dayOffset }
                    if (!state.loading && ordered.isEmpty()) {
                        MwEmptyState(
                            title = "No sessions this week",
                            body = "Reseed from Lab tools or change equipment on Today to build a plan.",
                            cta = "Force reseed",
                            onCta = { viewModel.forceReseed() },
                        )
                    }
                    ordered.forEach { s ->
                        val actionable = s.status == "planned" || s.status == "swapped"
                        val tone = when (s.status) {
                            "done" -> MwChipTone.Emerald
                            "swapped" -> MwChipTone.Brass
                            "missed" -> MwChipTone.Danger
                            else -> MwChipTone.Neutral
                        }
                        MwSessionTile(
                            dayLabel = weekdayLabel(weekStart, s.dayOffset),
                            title = s.name,
                            subtitle = "${s.estMinutes}m · ${s.exercises.size} exercises · ${s.kind}",
                            statusLabel = s.status,
                            statusTone = tone,
                            highlighted = s.dayOffset == todayOffset || s.id == todaySession?.id,
                            actionable = actionable,
                            onClick = {
                                val sets = s.exercises.sumOf { it.sets }.coerceAtLeast(3)
                                onStartWorkout(s.id, s.name, sets)
                            },
                        )
                        // Why this session — free short copy; premium deeper + move hints
                        val why = state.sessionWhys[s.id]
                        if (why != null) {
                            MwGhostButton(
                                text = if (state.expandedSessionId == s.id) {
                                    "Hide why"
                                } else {
                                    "Why this session"
                                },
                                contentDescription = "Toggle why for ${s.name}",
                                onClick = { viewModel.toggleSessionWhy(s.id) },
                            )
                            if (state.expandedSessionId == s.id) {
                                MwCard(elevated = true) {
                                    Text(
                                        why.headline,
                                        style = MwTypography.titleMedium,
                                        color = MwColors.Text,
                                    )
                                    Text(
                                        why.focusLine,
                                        style = MwTypography.labelMedium,
                                        color = MwColors.Brass,
                                    )
                                    Text(
                                        why.detail,
                                        style = MwTypography.bodyMedium,
                                        color = MwColors.TextMuted,
                                    )
                                    if (why.moveHints.isNotEmpty()) {
                                        Spacer(Modifier.height(6.dp))
                                        MwChip("Move intent", tone = MwChipTone.Emerald)
                                        why.moveHints.forEach { hint ->
                                            Text(
                                                hint,
                                                style = MwTypography.labelMedium,
                                                color = MwColors.TextMuted,
                                            )
                                        }
                                    } else if (!state.premium) {
                                        Text(
                                            "Super Bundle on this account unlocks move-level intent (no in-app purchase).",
                                            style = MwTypography.labelMedium,
                                            color = MwColors.TextMuted,
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Lab tools: debug builds only (Track 2B.4 — hide prototype chrome from Internal).
                    if (BuildConfig.DEBUG) {
                        Spacer(Modifier.height(4.dp))
                        MwGhostButton(
                            text = if (showLab) "Hide lab tools" else "Lab tools",
                            contentDescription = if (showLab) "Hide lab tools" else "Show lab tools",
                            onClick = { showLab = !showLab },
                        )
                        if (showLab) {
                            Text(
                                "Founder / QA helpers — not part of the product path.",
                                style = MwTypography.bodyMedium,
                                color = MwColors.TextMuted,
                            )
                            state.message?.let {
                                Text(it, style = MwTypography.bodyMedium, color = MwColors.Emerald)
                            }
                            MwSecondaryButton(
                                text = "Seed adapt demo (miss + swap)",
                                onClick = { viewModel.seedAdaptDemo() },
                            )
                            MwGhostButton(text = "Refresh plan (cache)", onClick = { viewModel.refresh() })
                            MwGhostButton(
                                text = "Force reseed plan",
                                contentDescription = "Clear cache and rebuild coach plan",
                                onClick = { viewModel.forceReseed() },
                            )
                        }
                    }
                    Spacer(Modifier.height(8.dp))
                }

                if (todaySession != null) {
                    MwPrimaryButton(
                        text = "Start ${todaySession.name}",
                        contentDescription = "Start today's session ${todaySession.name}",
                        onClick = {
                            val sets = todaySession.exercises.sumOf { it.sets }.coerceAtLeast(3)
                            onStartWorkout(todaySession.id, todaySession.name, sets)
                        },
                    )
                }
            }
        }
    }
}

/**
 * Super Bundle access — Play Billing subscribe only on Coach (Phase 15).
 * Free offline logger is never behind a paywall. No Stripe / web checkout links.
 */
@Composable
private fun EntitlementBanner(
    signedIn: Boolean,
    premium: Boolean,
    premiumSource: String,
    billingOffers: List<BillingOffer>,
    billingReady: Boolean,
    billingPurchasing: Boolean,
    billingError: String?,
    onSeedAdapt: (() -> Unit)?,
    onSubscribe: (() -> Unit)?,
) {
    MwCard(elevated = true) {
        MwSectionLabel("Access")
        when {
            premium -> {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    MwChip("Super Bundle", tone = MwChipTone.Emerald)
                    MwChip(premiumSource, tone = MwChipTone.Brass)
                }
                Text(
                    stringResource(DsR.string.mw_free_forever_logger),
                    style = MwTypography.bodyMedium,
                    color = MwColors.TextMuted,
                )
                if (onSeedAdapt != null) {
                    Spacer(Modifier.height(8.dp))
                    MwSecondaryButton(
                        text = "Preview adapt depth",
                        onClick = onSeedAdapt,
                    )
                }
            }
            signedIn -> {
                MwChip("Free coach", tone = MwChipTone.Neutral)
                Text(
                    "Full week plan free forever. Super Bundle unlocks deeper insights only — never the logger.",
                    style = MwTypography.bodyMedium,
                    color = MwColors.TextMuted,
                )
                if (billingOffers.isNotEmpty()) {
                    Spacer(Modifier.height(6.dp))
                    billingOffers.take(2).forEach { offer ->
                        Text(
                            "${offer.title} · ${offer.priceLabel}",
                            style = MwTypography.labelMedium,
                            color = MwColors.Brass,
                        )
                    }
                }
                if (onSubscribe != null && billingReady) {
                    Spacer(Modifier.height(8.dp))
                    MwPrimaryButton(
                        text = if (billingPurchasing) {
                            "Processing…"
                        } else {
                            stringResource(DsR.string.mw_subscribe_super_bundle)
                        },
                        contentDescription = stringResource(DsR.string.mw_subscribe_super_bundle),
                        onClick = onSubscribe,
                    )
                    Text(
                        "Billed by Google Play. Cancel anytime in Play subscriptions. Refunds: missionwinning.com/refunds",
                        style = MwTypography.labelMedium,
                        color = MwColors.TextMuted,
                    )
                } else if (onSubscribe != null && !billingReady) {
                    Text(
                        billingError
                            ?: "Play Billing connecting… Configure products in Play Console if empty.",
                        style = MwTypography.labelMedium,
                        color = MwColors.TextMuted,
                    )
                }
            }
            else -> {
                MwChip("Offline free", tone = MwChipTone.Brass)
                Text(
                    "Full week plan + logger work offline. Sign in on Account to subscribe or restore Super Bundle.",
                    style = MwTypography.bodyMedium,
                    color = MwColors.TextMuted,
                )
            }
        }
    }
}

/** MON / TUE / … from plan weekStart + dayOffset; falls back to DAY +n. */
private fun weekdayLabel(weekStart: String?, dayOffset: Int): String {
    if (weekStart.isNullOrBlank()) return "DAY +$dayOffset"
    return runCatching {
        LocalDate.parse(weekStart)
            .plusDays(dayOffset.toLong())
            .format(DateTimeFormatter.ofPattern("EEE", Locale.US))
            .uppercase(Locale.US)
    }.getOrDefault("DAY +$dayOffset")
}
