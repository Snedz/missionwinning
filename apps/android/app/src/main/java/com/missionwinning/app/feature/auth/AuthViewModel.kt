package com.missionwinning.app.feature.auth

import android.app.Application
import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.missionwinning.app.crash.CrashReporting
import com.missionwinning.app.health.HealthConnectWriter
import com.missionwinning.core.data.AuthRepository
import com.missionwinning.core.data.AuthUiSnapshot
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.data.SyncScheduler
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class AuthStep { Email, Code, SignedIn }

data class AuthScreenState(
    val step: AuthStep = AuthStep.Email,
    val email: String = "",
    val code: String = "",
    val busy: Boolean = false,
    val message: String? = null,
    val error: String? = null,
    val session: AuthUiSnapshot = AuthUiSnapshot(),
    val crashReporting: Boolean = true,
    val telemetryOptIn: Boolean = false,
    val sentryConfigured: Boolean = false,
    val healthConnectExport: Boolean = false,
    val healthConnectAvailable: Boolean = false,
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val repository: MwRepository,
    private val syncScheduler: SyncScheduler,
    @ApplicationContext private val appContext: Context,
) : ViewModel() {
    private val healthConnect = HealthConnectWriter(appContext)
    private val _local = MutableStateFlow(AuthScreenState())
    val state: StateFlow<AuthScreenState> = combine(
        _local,
        authRepository.state,
    ) { local, session ->
        val step = when {
            session.signedIn -> AuthStep.SignedIn
            local.step == AuthStep.Code -> AuthStep.Code
            else -> AuthStep.Email
        }
        local.copy(
            step = step,
            session = session,
            email = if (session.signedIn && session.email.isNotBlank()) session.email else local.email,
        )
    }.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5_000),
        AuthScreenState(session = authRepository.state.value),
    )

    init {
        viewModelScope.launch { refreshPrivacyToggles() }
    }

    fun healthConnectPermissions(): Set<String> = healthConnect.requiredPermissions()

    private suspend fun refreshPrivacyToggles() {
        _local.update {
            it.copy(
                crashReporting = repository.crashReportingEnabled(),
                telemetryOptIn = repository.telemetryOptIn(),
                sentryConfigured = CrashReporting.isConfigured(),
                healthConnectExport = repository.healthConnectExportEnabled(),
                healthConnectAvailable = healthConnect.isAvailable(),
            )
        }
    }

    fun onEmailChange(value: String) {
        _local.update { it.copy(email = value, error = null, message = null) }
    }

    fun onCodeChange(value: String) {
        _local.update {
            it.copy(
                code = value.filter { ch -> ch.isDigit() }.take(8),
                error = null,
                message = null,
            )
        }
    }

    fun sendCode() {
        val email = _local.value.email
        viewModelScope.launch {
            _local.update { it.copy(busy = true, error = null, message = null) }
            authRepository.requestOtp(email)
                .onSuccess {
                    _local.update {
                        it.copy(
                            busy = false,
                            step = AuthStep.Code,
                            message = "Check your email for a 6-digit code.",
                        )
                    }
                }
                .onFailure { e ->
                    _local.update {
                        it.copy(busy = false, error = e.message ?: "Could not send code")
                    }
                }
        }
    }

    fun verifyCode() {
        val email = _local.value.email
        val code = _local.value.code
        viewModelScope.launch {
            _local.update { it.copy(busy = true, error = null, message = null) }
            authRepository.verifyOtp(email, code)
                .onSuccess {
                    runCatching { repository.syncNow() }
                    syncScheduler.enqueueNow()
                    _local.update {
                        it.copy(
                            busy = false,
                            step = AuthStep.SignedIn,
                            code = "",
                            message = "Signed in. Syncing workouts & routines…",
                        )
                    }
                }
                .onFailure { e ->
                    _local.update {
                        it.copy(busy = false, error = e.message ?: "Could not verify code")
                    }
                }
        }
    }

    fun backToEmail() {
        _local.update {
            it.copy(step = AuthStep.Email, code = "", error = null, message = null)
        }
    }

    fun signOut() {
        viewModelScope.launch {
            _local.update { it.copy(busy = true, error = null) }
            authRepository.signOut()
            _local.update {
                it.copy(
                    busy = false,
                    step = AuthStep.Email,
                    code = "",
                    message = "Signed out. Local workouts stay on this device.",
                )
            }
        }
    }

    fun refreshPremium() {
        viewModelScope.launch {
            _local.update { it.copy(busy = true, error = null) }
            runCatching { authRepository.refreshPremium() }
                .onFailure { e ->
                    _local.update {
                        it.copy(busy = false, error = e.message ?: "Status check failed")
                    }
                }
                .onSuccess {
                    _local.update { it.copy(busy = false, message = "Entitlement refreshed") }
                }
        }
    }

    fun clearFeedback() {
        _local.update { it.copy(error = null, message = null) }
    }

    fun toggleCrashReporting(app: Application) {
        viewModelScope.launch {
            val next = !_local.value.crashReporting
            repository.setCrashReportingEnabled(next)
            CrashReporting.setEnabled(app, next)
            _local.update {
                it.copy(
                    crashReporting = next,
                    message = if (next) "Crash reports on" else "Crash reports off",
                )
            }
        }
    }

    fun toggleTelemetry() {
        viewModelScope.launch {
            val next = !_local.value.telemetryOptIn
            repository.setTelemetryOptIn(next)
            _local.update {
                it.copy(
                    telemetryOptIn = next,
                    message = if (next) "Weekly pulse on" else "Weekly pulse off",
                )
            }
        }
    }

    fun setHealthConnectExport(enabled: Boolean) {
        viewModelScope.launch {
            repository.setHealthConnectExportEnabled(enabled)
            _local.update {
                it.copy(
                    healthConnectExport = enabled,
                    message = if (enabled) {
                        "Health Connect export on — finished workouts write exercise sessions"
                    } else {
                        "Health Connect export off"
                    },
                )
            }
        }
    }

    fun toggleHealthConnectExport() {
        viewModelScope.launch {
            val next = !_local.value.healthConnectExport
            if (!next) {
                setHealthConnectExport(false)
            } else {
                // Permission grant is requested from UI; enable only after grant or if already held
                if (healthConnect.hasWritePermission()) {
                    setHealthConnectExport(true)
                } else {
                    _local.update {
                        it.copy(message = "Grant Health Connect exercise write permission…")
                    }
                }
            }
        }
    }

    fun onHealthConnectPermissionResult(granted: Set<String>) {
        viewModelScope.launch {
            val ok = healthConnect.requiredPermissions().all { it in granted }
            if (ok) {
                setHealthConnectExport(true)
            } else {
                repository.setHealthConnectExportEnabled(false)
                _local.update {
                    it.copy(
                        healthConnectExport = false,
                        message = "Health Connect permission not granted",
                    )
                }
            }
        }
    }
}
