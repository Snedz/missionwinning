package com.missionwinning.app.feature.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
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
import com.missionwinning.core.designsystem.MwPrimaryButton
import com.missionwinning.core.designsystem.MwTypography

/**
 * Sign-in stub: offline-first wedge. Wire Supabase magic link in a follow-up
 * using the same project keys as web via BuildConfig — logging works without account.
 */
@Composable
fun AuthScreen(onClose: () -> Unit) {
    var email by remember { mutableStateOf("") }
    var message by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Sign in", style = MwTypography.headlineLarge, color = MwColors.Text)
        Text(
            "Offline-first: logging works without an account. Cloud sync uses the same Supabase project as the web app when configured.",
            style = MwTypography.bodyLarge,
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
            ),
        )
        MwPrimaryButton(
            text = "Continue offline",
            onClick = {
                message = "Staying offline. Train + Coach work without sign-in."
            },
        )
        message?.let {
            Text(it, style = MwTypography.bodyLarge, color = MwColors.Emerald)
        }
        MwGhostButton(text = "Close", onClick = onClose)
    }
}
