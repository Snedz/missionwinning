package com.missionwinning.feature.auth

import android.content.Intent
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContract
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.missionwinning.core.common.NetworkStatus
import com.missionwinning.core.designsystem.MwCard
import com.missionwinning.core.designsystem.MwChip
import com.missionwinning.core.designsystem.MwChipTone
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwGhostButton
import com.missionwinning.core.designsystem.MwHeroTitle
import com.missionwinning.core.designsystem.MwOfflinePill
import com.missionwinning.core.designsystem.MwPrimaryButton
import com.missionwinning.core.designsystem.MwScreenScaffold
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwSpace
import com.missionwinning.core.designsystem.MwTopBar
import com.missionwinning.core.designsystem.MwTypography
import com.missionwinning.core.designsystem.R as DsR
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.InputStreamReader

/**
 * Optional account: email 6-digit OTP. Offline logger never requires sign-in.
 */
@Composable
fun AuthScreen(
    onClose: () -> Unit,
    onOpenGallery: () -> Unit = {},
    /** When true (hub tab), hide back chrome and skip double nav-bar padding. */
    asHubTab: Boolean = false,
    versionName: String,
    versionCode: Int,
    debugBuild: Boolean,
    apiBaseUrl: String,
    viewModel: AuthViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val online = remember { NetworkStatus.isOnline(context) }
    val versionLabel = "v$versionName ($versionCode)" +
        if (debugBuild) " · debug" else ""
    val apiHost = remember(apiBaseUrl) {
        runCatching {
            java.net.URI(apiBaseUrl).host ?: apiBaseUrl
        }.getOrDefault(apiBaseUrl)
    }
    val fieldColors = OutlinedTextFieldDefaults.colors(
        focusedTextColor = MwColors.Text,
        unfocusedTextColor = MwColors.Text,
        focusedContainerColor = MwColors.NavyDeep,
        unfocusedContainerColor = MwColors.NavyDeep,
        focusedBorderColor = MwColors.Emerald,
        unfocusedBorderColor = MwColors.Border,
        cursorColor = MwColors.Emerald,
        focusedLabelColor = MwColors.TextMuted,
        unfocusedLabelColor = MwColors.TextMuted,
    )
    val hcPermissionContract = remember {
        HealthConnectAccountBridge.createPermissionContract?.invoke()
            ?: object : ActivityResultContract<Set<String>, Set<String>>() {
                override fun createIntent(
                    context: android.content.Context,
                    input: Set<String>,
                ): Intent = Intent()

                override fun parseResult(resultCode: Int, intent: Intent?): Set<String> =
                    emptySet()
            }
    }
    val hcPermissionLauncher = rememberLauncherForActivityResult(
        contract = hcPermissionContract,
    ) { granted ->
        viewModel.onHealthConnectPermissionResult(granted)
    }
    val scope = rememberCoroutineScope()
    val importLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument(),
    ) { uri: Uri? ->
        if (uri == null) return@rememberLauncherForActivityResult
        scope.launch {
            val text = withContext(Dispatchers.IO) {
                runCatching {
                    context.contentResolver.openInputStream(uri)?.use { stream ->
                        BufferedReader(InputStreamReader(stream)).readText()
                    }
                }.getOrNull()
            }
            if (text.isNullOrBlank()) {
                // ViewModel message via local error path — fire empty import for feedback
                viewModel.importCsvText("")
            } else {
                viewModel.importCsvText(text)
            }
        }
    }

    fun shareExport(format: ExportFormat, mime: String, filename: String) {
        scope.launch {
            val body = withContext(Dispatchers.IO) { viewModel.buildExport(format) }
            if (body.isNullOrBlank()) return@launch
            val send = Intent(Intent.ACTION_SEND).apply {
                type = mime
                putExtra(Intent.EXTRA_SUBJECT, filename)
                putExtra(Intent.EXTRA_TEXT, body)
            }
            context.startActivity(Intent.createChooser(send, "Export workouts"))
        }
    }

    MwScreenScaffold(applyNavBarPadding = !asHubTab) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(MwSpace.md),
        ) {
            if (asHubTab) {
                MwHeroTitle(stringResource(DsR.string.mw_account))
            } else {
                MwTopBar(title = stringResource(DsR.string.mw_account), onBack = onClose)
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                MwSectionLabel("Optional")
                MwOfflinePill(online = online)
            }
            if (!asHubTab) {
                MwHeroTitle(
                    when (state.step) {
                        AuthStep.SignedIn -> "You're signed in"
                        AuthStep.Code -> "Enter code"
                        AuthStep.Email -> "Sign in"
                    },
                )
            } else {
                Text(
                    when (state.step) {
                        AuthStep.SignedIn -> "You're signed in"
                        AuthStep.Code -> "Enter code"
                        AuthStep.Email -> "Sign in for sync"
                    },
                    style = MwTypography.headlineMedium,
                    color = MwColors.Text,
                )
            }
            Text(
                "Train + Coach work fully offline. Sign-in unlocks cloud coach access and future sync — never required to log.",
                style = MwTypography.bodyMedium,
                color = MwColors.TextMuted,
            )

            when (state.step) {
                AuthStep.SignedIn -> SignedInCard(
                    state = state,
                    busy = state.busy,
                    onRefreshPremium = viewModel::refreshPremium,
                    onSignOut = viewModel::signOut,
                    onContinue = onClose,
                )
                AuthStep.Code -> CodeCard(
                    state = state,
                    fieldColors = fieldColors,
                    onCodeChange = viewModel::onCodeChange,
                    onVerify = viewModel::verifyCode,
                    onBack = viewModel::backToEmail,
                    onContinueOffline = onClose,
                )
                AuthStep.Email -> EmailCard(
                    state = state,
                    fieldColors = fieldColors,
                    onEmailChange = viewModel::onEmailChange,
                    onSendCode = viewModel::sendCode,
                    onContinueOffline = onClose,
                )
            }

            state.error?.let {
                Text(it, style = MwTypography.bodyMedium, color = MwColors.Danger)
            }
            state.message?.let {
                Text(it, style = MwTypography.bodyMedium, color = MwColors.Emerald)
            }

            MwCard(elevated = true) {
                MwSectionLabel("Preferences")
                Text(
                    "Saved on this device. Unit also toggles mid-session on Active.",
                    style = MwTypography.bodyMedium,
                    color = MwColors.TextMuted,
                )
                Text(
                    "Weight unit",
                    style = MwTypography.labelSmall,
                    color = MwColors.TextMuted,
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    MwChip(
                        text = "KG",
                        tone = if (state.weightUnit == "kg") MwChipTone.Emerald else MwChipTone.Neutral,
                        contentDescription = if (state.weightUnit == "kg") {
                            "Kilograms selected"
                        } else {
                            "Switch to kilograms"
                        },
                        onClick = { viewModel.setWeightUnit("kg") },
                    )
                    MwChip(
                        text = "LB",
                        tone = if (state.weightUnit == "lb") MwChipTone.Emerald else MwChipTone.Neutral,
                        contentDescription = if (state.weightUnit == "lb") {
                            "Pounds selected"
                        } else {
                            "Switch to pounds"
                        },
                        onClick = { viewModel.setWeightUnit("lb") },
                    )
                }
                Spacer(Modifier.height(MwSpace.sm))
                Text(
                    if (state.reseeding) {
                        "Reseeding week for new equipment…"
                    } else {
                        "Equipment — reseeds this week’s plan on device."
                    },
                    style = MwTypography.labelSmall,
                    color = MwColors.TextMuted,
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    MwChip(
                        text = "Bodyweight",
                        tone = if (state.equipment == "bodyweight") MwChipTone.Emerald else MwChipTone.Neutral,
                        contentDescription = if (state.equipment == "bodyweight") {
                            "Bodyweight equipment selected"
                        } else {
                            "Switch to bodyweight equipment"
                        },
                        onClick = { if (!state.reseeding) viewModel.setEquipment("bodyweight") },
                    )
                    MwChip(
                        text = "Dumbbells",
                        tone = if (state.equipment == "dumbbells") MwChipTone.Emerald else MwChipTone.Neutral,
                        contentDescription = if (state.equipment == "dumbbells") {
                            "Dumbbells equipment selected"
                        } else {
                            "Switch to dumbbells equipment"
                        },
                        onClick = { if (!state.reseeding) viewModel.setEquipment("dumbbells") },
                    )
                    MwChip(
                        text = "Full gym",
                        tone = if (state.equipment == "full-gym") MwChipTone.Emerald else MwChipTone.Neutral,
                        contentDescription = if (state.equipment == "full-gym") {
                            "Full gym equipment selected"
                        } else {
                            "Switch to full gym equipment"
                        },
                        onClick = { if (!state.reseeding) viewModel.setEquipment("full-gym") },
                    )
                }
            }

            MwCard(elevated = true) {
                MwSectionLabel("Cloud sync")
                Text(
                    "Pending and failed rows from this device. Retry resets dead-letters.",
                    style = MwTypography.bodyMedium,
                    color = MwColors.TextMuted,
                )
                Row(horizontalArrangement = Arrangement.spacedBy(MwSpace.sm)) {
                    val o = state.outbox
                    MwChip(
                        "${o.pendingWorkouts} pending",
                        tone = if (o.pendingWorkouts > 0) MwChipTone.Brass else MwChipTone.Neutral,
                    )
                    MwChip(
                        "${o.failedWorkouts} failed",
                        tone = if (o.failedWorkouts > 0) MwChipTone.Danger else MwChipTone.Neutral,
                    )
                    if (o.outboxRows > 0) {
                        MwChip("${o.outboxRows} queue", tone = MwChipTone.Brass)
                    }
                }
                Text(
                    state.outbox.summaryLine,
                    style = MwTypography.bodyMedium,
                    color = MwColors.TextMuted,
                )
                state.outbox.lastConflictNote?.let { note ->
                    Text(
                        note,
                        style = MwTypography.labelMedium,
                        color = MwColors.Brass,
                    )
                }
                if (state.outbox.conflictInbox.isNotEmpty()) {
                    MwSectionLabel("Conflict inbox")
                    state.outbox.conflictInbox.take(5).forEach { note ->
                        Text(
                            "· $note",
                            style = MwTypography.labelMedium,
                            color = MwColors.TextMuted,
                        )
                    }
                }
                Text(
                    "Room is source of truth. Offline logs never require sync. Local pending always wins until pushed. Dead-lettered rows stay until Retry succeeds.",
                    style = MwTypography.labelMedium,
                    color = MwColors.TextMuted,
                )
                if (state.outbox.workoutCount > 0) {
                    Text(
                        "${state.outbox.workoutCount} workout(s) on this device",
                        style = MwTypography.labelMedium,
                        color = MwColors.TextMuted,
                    )
                }
                MwGhostButton(
                    text = if (state.syncBusy) "Syncing…" else stringResource(DsR.string.mw_sync_retry),
                    contentDescription = stringResource(DsR.string.mw_sync_retry),
                    onClick = viewModel::retrySync,
                )
            }

            MwCard(elevated = true) {
                MwSectionLabel("Data portability")
                Text(
                    "Import Hevy workout CSV or Mission Winning export. Export stays free — your logs, your file. Import never requires an account.",
                    style = MwTypography.bodyMedium,
                    color = MwColors.TextMuted,
                )
                MwPrimaryButton(
                    text = if (state.busy) "Working…" else "Import CSV",
                    contentDescription = "Import workouts from CSV file",
                    onClick = {
                        importLauncher.launch(
                            arrayOf(
                                "text/*",
                                "text/csv",
                                "text/comma-separated-values",
                                "application/csv",
                                "application/vnd.ms-excel",
                                "*/*",
                            ),
                        )
                    },
                )
                MwGhostButton(
                    text = "Export MW CSV",
                    contentDescription = "Export workouts as Mission Winning CSV",
                    onClick = {
                        shareExport(ExportFormat.MwCsv, "text/csv", "missionwinning-workouts.csv")
                    },
                )
                MwGhostButton(
                    text = "Export Hevy-format CSV",
                    contentDescription = "Export workouts as Hevy-compatible CSV",
                    onClick = {
                        shareExport(ExportFormat.HevyCsv, "text/csv", "workouts-hevy.csv")
                    },
                )
                MwGhostButton(
                    text = "Export JSON",
                    contentDescription = "Export workouts as JSON",
                    onClick = {
                        shareExport(ExportFormat.Json, "application/json", "missionwinning-workouts.json")
                    },
                )
            }

            MwCard(elevated = true) {
                MwSectionLabel("Privacy")
                Text(
                    "Crash reports (no account data) and optional weekly install pulse. Workouts stay on-device unless you sign in to sync.",
                    style = MwTypography.bodyMedium,
                    color = MwColors.TextMuted,
                )
                if (state.sentryConfigured) {
                    MwChip(
                        text = if (state.crashReporting) "Crash reports · on" else "Crash reports · off",
                        tone = if (state.crashReporting) MwChipTone.Emerald else MwChipTone.Neutral,
                        contentDescription = "Toggle crash reporting",
                        onClick = viewModel::toggleCrashReporting,
                    )
                } else {
                    Text(
                        "Crash reporting DSN not configured on this build.",
                        style = MwTypography.labelMedium,
                        color = MwColors.TextMuted,
                    )
                }
                MwChip(
                    text = if (state.telemetryOptIn) "Weekly pulse · on" else "Weekly pulse · off",
                    tone = if (state.telemetryOptIn) MwChipTone.Emerald else MwChipTone.Neutral,
                    contentDescription = "Toggle weekly pulse",
                    onClick = viewModel::toggleTelemetry,
                )
                if (state.healthConnectAvailable) {
                    MwChip(
                        text = if (state.healthConnectExport) {
                            "Health Connect · on"
                        } else {
                            "Health Connect · off"
                        },
                        tone = if (state.healthConnectExport) MwChipTone.Emerald else MwChipTone.Neutral,
                        contentDescription = "Toggle Health Connect export",
                        onClick = {
                            if (state.healthConnectExport) {
                                viewModel.setHealthConnectExport(false)
                            } else {
                                hcPermissionLauncher.launch(viewModel.healthConnectPermissions())
                            }
                        },
                    )
                    Text(
                        "When on, finished workouts write a strength session + estimated active calories.",
                        style = MwTypography.labelMedium,
                        color = MwColors.TextMuted,
                    )
                    MwChip(
                        text = if (state.healthConnectStepsRead) {
                            "Steps on Today · on"
                        } else {
                            "Steps on Today · off"
                        },
                        tone = if (state.healthConnectStepsRead) {
                            MwChipTone.Emerald
                        } else {
                            MwChipTone.Neutral
                        },
                        contentDescription = "Toggle Health Connect steps on Today",
                        onClick = {
                            if (!state.healthConnectStepsRead) {
                                hcPermissionLauncher.launch(viewModel.healthConnectPermissions())
                            }
                            viewModel.setHealthConnectStepsRead(!state.healthConnectStepsRead)
                        },
                    )
                } else {
                    Text(
                        "Health Connect not available on this device.",
                        style = MwTypography.labelMedium,
                        color = MwColors.TextMuted,
                    )
                }
            }

            MwCard(elevated = true) {
                MwSectionLabel("About")
                Text("Mission Winning", style = MwTypography.titleMedium, color = MwColors.Text)
                Text(
                    "Free offline logger + Mission Coach. Not medical advice.",
                    style = MwTypography.bodyMedium,
                    color = MwColors.TextMuted,
                )
                MwChip(versionLabel, tone = MwChipTone.Brass)
                if (debugBuild) {
                    Text(
                        "API · $apiHost",
                        style = MwTypography.labelMedium,
                        color = MwColors.TextMuted,
                    )
                    Text(
                        if (state.session.configured) "Supabase · configured" else "Supabase · set mw.supabaseUrl + mw.supabaseAnonKey",
                        style = MwTypography.labelMedium,
                        color = MwColors.TextMuted,
                    )
                    MwGhostButton(
                        text = "Design system gallery",
                        contentDescription = "Open debug design system gallery",
                        onClick = onOpenGallery,
                    )
                }
            }
            MwGhostButton(text = "Close", onClick = onClose, contentDescription = "Close account screen")
        }
    }
}

@Composable
private fun EmailCard(
    state: AuthScreenState,
    fieldColors: androidx.compose.material3.TextFieldColors,
    onEmailChange: (String) -> Unit,
    onSendCode: () -> Unit,
    onContinueOffline: () -> Unit,
) {
    MwCard(elevated = true) {
        MwSectionLabel("Email")
        if (!state.session.configured) {
            Text(
                "Auth is not configured on this build. You can still train offline.",
                style = MwTypography.bodyMedium,
                color = MwColors.TextMuted,
            )
        }
        OutlinedTextField(
            value = state.email,
            onValueChange = onEmailChange,
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Email") },
            singleLine = true,
            enabled = !state.busy && state.session.configured,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            colors = fieldColors,
        )
        MwPrimaryButton(
            text = if (state.busy) "Sending…" else "Send code",
            contentDescription = "Send sign-in code",
            enabled = !state.busy && state.session.configured && state.email.contains("@"),
            onClick = onSendCode,
        )
        MwGhostButton(
            text = "Continue offline",
            contentDescription = "Continue offline without signing in",
            onClick = onContinueOffline,
        )
    }
}

@Composable
private fun CodeCard(
    state: AuthScreenState,
    fieldColors: androidx.compose.material3.TextFieldColors,
    onCodeChange: (String) -> Unit,
    onVerify: () -> Unit,
    onBack: () -> Unit,
    onContinueOffline: () -> Unit,
) {
    MwCard(elevated = true) {
        MwSectionLabel("Code")
        Text(
            "We sent a 6-digit code to ${state.email}.",
            style = MwTypography.bodyMedium,
            color = MwColors.TextMuted,
        )
        OutlinedTextField(
            value = state.code,
            onValueChange = onCodeChange,
            modifier = Modifier.fillMaxWidth(),
            label = { Text("6-digit code") },
            singleLine = true,
            enabled = !state.busy,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            colors = fieldColors,
        )
        MwPrimaryButton(
            text = if (state.busy) "Verifying…" else "Verify & sign in",
            contentDescription = "Verify code and sign in",
            enabled = !state.busy && state.code.length >= 6,
            onClick = onVerify,
        )
        MwGhostButton(text = "Use a different email", onClick = onBack)
        MwGhostButton(
            text = "Continue offline",
            contentDescription = "Continue offline without signing in",
            onClick = onContinueOffline,
        )
    }
}

@Composable
private fun SignedInCard(
    state: AuthScreenState,
    busy: Boolean,
    onRefreshPremium: () -> Unit,
    onSignOut: () -> Unit,
    onContinue: () -> Unit,
) {
    MwCard(elevated = true) {
        MwSectionLabel("Session")
        Text(
            state.session.email.ifBlank { "Signed in" },
            style = MwTypography.titleMedium,
            color = MwColors.Text,
        )
        MwSectionLabel("Entitlement")
        Row(horizontalArrangement = Arrangement.spacedBy(MwSpace.sm)) {
            MwChip(
                if (state.session.premium) "Super Bundle" else "Free logger",
                tone = if (state.session.premium) MwChipTone.Emerald else MwChipTone.Neutral,
            )
            MwChip(state.session.premiumSource, tone = MwChipTone.Brass)
        }
        Text(
            if (state.session.premium) {
                "Super Bundle recognized on this account. Coach adapt depth is unlocked. Purchase is not offered in-app."
            } else {
                "Free offline logging is permanent. If you already have Super Bundle on web, refresh entitlement while online — no in-app purchase."
            },
            style = MwTypography.bodyMedium,
            color = MwColors.TextMuted,
        )
        Spacer(Modifier.height(8.dp))
        Text(
            "Workouts & routines sync when online. Sign-out keeps local logs and stops cloud sync.",
            style = MwTypography.bodyMedium,
            color = MwColors.TextMuted,
        )
        MwPrimaryButton(
            text = "Done",
            contentDescription = "Close account and return",
            onClick = onContinue,
        )
        MwGhostButton(
            text = if (busy) "Refreshing…" else "Refresh entitlement",
            contentDescription = "Refresh Super Bundle status",
            onClick = onRefreshPremium,
        )
        MwGhostButton(
            text = "Sign out",
            contentDescription = "Sign out and keep local workouts",
            onClick = onSignOut,
        )
    }
}
