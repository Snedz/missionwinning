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
import androidx.compose.ui.unit.dp
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwGhostButton
import com.missionwinning.core.designsystem.MwHeroTitle
import com.missionwinning.core.designsystem.MwPrimaryButton
import com.missionwinning.core.designsystem.MwScreenScaffold
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwTypography

/**
 * Sign-in stub: offline-first wedge. Wire Supabase magic link in a follow-up
 * using the same project keys as web via BuildConfig — logging works without account.
 */
@Composable
fun AuthScreen(onClose: () -> Unit) {
    var email by remember { mutableStateOf("") }
    var message by remember { mutableStateOf<String?>(null) }

    MwScreenScaffold {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            MwSectionLabel("Account")
            MwHeroTitle("Sign in")
            Text(
                "Logging works without an account. Sign in later to sync across devices.",
                style = MwTypography.bodyMedium,
                color = MwColors.TextMuted,
            )
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Email") },
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = MwColors.Text,
                    unfocusedTextColor = MwColors.Text,
                    focusedContainerColor = MwColors.NavyElevated,
                    unfocusedContainerColor = MwColors.NavyElevated,
                    focusedBorderColor = MwColors.Emerald,
                    unfocusedBorderColor = MwColors.Border,
                    cursorColor = MwColors.Emerald,
                    focusedLabelColor = MwColors.TextMuted,
                    unfocusedLabelColor = MwColors.TextMuted,
                ),
            )
            MwPrimaryButton(
                text = "Continue offline",
                onClick = {
                    message = "Staying offline. Train + Coach work without sign-in."
                },
            )
            message?.let {
                Text(it, style = MwTypography.bodyMedium, color = MwColors.Emerald)
            }
            MwGhostButton(text = "Close", onClick = onClose)
        }
    }
}
