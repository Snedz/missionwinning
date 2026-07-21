package com.missionwinning.app.feature.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.missionwinning.app.BuildConfig
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

/**
 * Optional account: email 6-digit OTP. Offline logger never requires sign-in.
 */
@Composable
fun AuthScreen(
    onClose: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val online = remember { NetworkStatus.isOnline(context) }
    val versionLabel = "v${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})" +
        if (BuildConfig.DEBUG) " · debug" else ""
    val apiHost = remember {
        runCatching {
            java.net.URI(BuildConfig.API_BASE_URL).host ?: BuildConfig.API_BASE_URL
        }.getOrDefault(BuildConfig.API_BASE_URL)
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

    MwScreenScaffold {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(MwSpace.md),
        ) {
            MwTopBar(title = "Account", onBack = onClose)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                MwSectionLabel("Optional")
                MwOfflinePill(online = online)
            }
            MwHeroTitle(
                when (state.step) {
                    AuthStep.SignedIn -> "You're signed in"
                    AuthStep.Code -> "Enter code"
                    AuthStep.Email -> "Sign in"
                },
            )
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
                MwSectionLabel("About")
                Text("Mission Winning", style = MwTypography.titleMedium, color = MwColors.Text)
                Text(
                    "Free offline logger + Mission Coach. Not medical advice.",
                    style = MwTypography.bodyMedium,
                    color = MwColors.TextMuted,
                )
                MwChip(versionLabel, tone = MwChipTone.Brass)
                if (BuildConfig.DEBUG) {
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
        Row(horizontalArrangement = Arrangement.spacedBy(MwSpace.sm)) {
            MwChip(
                if (state.session.premium) "Super Bundle" else "Free",
                tone = if (state.session.premium) MwChipTone.Emerald else MwChipTone.Neutral,
            )
            MwChip(state.session.premiumSource, tone = MwChipTone.Brass)
        }
        Text(
            "Cloud sync of full set history lands in a later release. Coach already accepts your session Bearer when online.",
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
