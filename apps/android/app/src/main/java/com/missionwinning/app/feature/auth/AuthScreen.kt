package com.missionwinning.app.feature.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.missionwinning.app.BuildConfig
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
 * Sign-in stub: offline-first wedge. Wire Supabase magic link later.
 * Logging works without an account.
 */
@Composable
fun AuthScreen(onClose: () -> Unit) {
    var email by remember { mutableStateOf("") }
    var message by remember { mutableStateOf<String?>(null) }
    val versionLabel = "v${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})" +
        if (BuildConfig.DEBUG) " · debug" else ""

    MwScreenScaffold {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(MwSpace.md),
        ) {
            MwTopBar(title = "Account", onBack = onClose)
            MwSectionLabel("Optional")
            MwHeroTitle("Sign in later")
            MwOfflinePill()
            Text(
                "Train + Coach work fully offline. Sign-in is only for cloud sync across devices.",
                style = MwTypography.bodyMedium,
                color = MwColors.TextMuted,
            )
            MwCard(elevated = true) {
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Email") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = MwColors.Text,
                        unfocusedTextColor = MwColors.Text,
                        focusedContainerColor = MwColors.NavyDeep,
                        unfocusedContainerColor = MwColors.NavyDeep,
                        focusedBorderColor = MwColors.Emerald,
                        unfocusedBorderColor = MwColors.Border,
                        cursorColor = MwColors.Emerald,
                        focusedLabelColor = MwColors.TextMuted,
                        unfocusedLabelColor = MwColors.TextMuted,
                    ),
                )
                MwPrimaryButton(
                    text = "Continue offline",
                    contentDescription = "Continue offline without signing in",
                    onClick = {
                        message = "Staying offline. Your logs stay on this device."
                    },
                )
                message?.let {
                    Text(it, style = MwTypography.bodyMedium, color = MwColors.Emerald)
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
            }
            MwGhostButton(text = "Close", onClick = onClose, contentDescription = "Close account screen")
        }
    }
}
