package com.missionwinning.feature.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.missionwinning.core.data.AuthRepository
import com.missionwinning.core.data.AuthUiSnapshot
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.data.OutboxStatus
import com.missionwinning.core.data.SyncScheduler
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class AuthStep { Email, Code, SignedIn }

enum class ExportFormat { MwCsv, SetTableACsv, Json }

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
    val healthConnectStepsRead: Boolean = false,
    val outbox: OutboxStatus = OutboxStatus(),
    val syncBusy: Boolean = false,
    val weightUnit: String = "kg",
    val equipment: String = "bodyweight",
    val reseeding: Boolean = false,
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val repository: MwRepository,
    private val syncScheduler: SyncScheduler,
) : ViewModel() {
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
        viewModelScope.launch {
            refreshPrivacyToggles()
            refreshOutbox()
            refreshTrainingPrefs()
        }
    }

    fun healthConnectPermissions(): Set<String> =
        HealthConnectAccountBridge.requiredPermissionsWithSteps()

    private suspend fun refreshTrainingPrefs() {
        _local.update {
            it.copy(
                weightUnit = repository.weightUnit(),
                equipment = repository.equipmentProfile(),
            )
        }
    }

    fun setWeightUnit(unit: String) {
        viewModelScope.launch {
            val normalized = AuthPrefsFeedback.normalizeWeightUnit(unit)
            repository.setWeightUnit(normalized)
            _local.update {
                it.copy(
                    weightUnit = normalized,
                    message = AuthPrefsFeedback.weightUnitMessage(normalized),
                    error = null,
                )
            }
        }
    }

    fun setEquipment(profile: String) {
        viewModelScope.launch {
            if (profile == _local.value.equipment) return@launch
            _local.update { it.copy(reseeding = true, message = null, error = null) }
            val result = runCatching { repository.setEquipmentAndReseed(profile) }
            _local.update {
                it.copy(
                    equipment = repository.equipmentProfile(),
                    reseeding = false,
                    message = if (result.isSuccess) {
                        AuthPrefsFeedback.reseedSuccessMessage(profile)
                    } else {
                        it.message
                    },
                    error = result.exceptionOrNull()?.message,
                )
            }
        }
    }

    private suspend fun refreshPrivacyToggles() {
        _local.update {
            it.copy(
                crashReporting = repository.crashReportingEnabled(),
                telemetryOptIn = repository.telemetryOptIn(),
                sentryConfigured = CrashReportingBridge.isConfigured(),
                healthConnectExport = repository.healthConnectExportEnabled(),
                healthConnectAvailable = HealthConnectAccountBridge.isAvailable(),
                healthConnectStepsRead = repository.healthConnectStepsReadEnabled(),
            )
        }
    }

    private suspend fun refreshOutbox() {
        val status = runCatching { repository.outboxStatus() }.getOrDefault(OutboxStatus())
        _local.update { it.copy(outbox = status) }
    }

    fun retrySync() {
        viewModelScope.launch {
            _local.update { it.copy(syncBusy = true, error = null, message = null) }
            runCatching {
                val result = repository.syncNow()
                syncScheduler.enqueueNow()
                result
            }.onSuccess { result ->
                refreshOutbox()
                val conflict = result.lastConflictNote ?: _local.value.outbox.lastConflictNote
                _local.update {
                    it.copy(
                        syncBusy = false,
                        message = buildString {
                            append(result.summaryLine)
                            if (conflict != null) append(" · $conflict")
                        },
                        error = result.error,
                    )
                }
            }.onFailure { e ->
                refreshOutbox()
                _local.update {
                    it.copy(syncBusy = false, error = e.message ?: "Sync failed")
                }
            }
        }
    }

    fun importCsvText(csv: String) {
        viewModelScope.launch {
            _local.update { it.copy(busy = true, error = null, message = null) }
            val unit = repository.weightUnit()
            runCatching { repository.importWorkoutsCsv(csv, unit) }
                .onSuccess { summary ->
                    refreshOutbox()
                    _local.update {
                        it.copy(
                            busy = false,
                            message = if (summary.imported > 0) {
                                "Imported ${summary.imported} workout(s) · ${summary.sets} sets (${summary.format})"
                            } else {
                                summary.error ?: "No workouts found in file"
                            },
                            error = if (summary.imported == 0) summary.error else null,
                        )
                    }
                }
                .onFailure { e ->
                    _local.update {
                        it.copy(busy = false, error = e.message ?: "Import failed")
                    }
                }
        }
    }

    /** @return file text for share sheet, or null */
    suspend fun buildExport(format: ExportFormat): String? =
        runCatching {
            when (format) {
                ExportFormat.MwCsv -> repository.exportWorkoutsMwCsv()
                ExportFormat.SetTableACsv -> repository.exportWorkoutsSetTableACsv()
                ExportFormat.Json -> repository.exportWorkoutsJson()
            }
        }.getOrNull()

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
                    val syncResult = runCatching { repository.syncNow() }.getOrNull()
                    syncScheduler.enqueueNow()
                    refreshOutbox()
                    _local.update {
                        it.copy(
                            busy = false,
                            step = AuthStep.SignedIn,
                            code = "",
                            message = buildString {
                                append("Signed in. ")
                                append(syncResult?.summaryLine ?: "Syncing workouts & routines…")
                            },
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

    fun toggleCrashReporting() {
        viewModelScope.launch {
            val next = !_local.value.crashReporting
            repository.setCrashReportingEnabled(next)
            CrashReportingBridge.setEnabled?.invoke(next)
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
                        "Health Connect export on — sessions + estimated active calories"
                    } else {
                        "Health Connect export off"
                    },
                )
            }
        }
    }

    fun setHealthConnectStepsRead(enabled: Boolean) {
        viewModelScope.launch {
            repository.setHealthConnectStepsReadEnabled(enabled)
            _local.update {
                it.copy(
                    healthConnectStepsRead = enabled,
                    message = if (enabled) {
                        "Steps on Today when Health Connect grants read"
                    } else {
                        "Steps hidden on Today"
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
                val hasWrite = HealthConnectAccountBridge.hasWritePermission?.invoke() == true
                if (hasWrite) {
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
            val ok = HealthConnectAccountBridge.requiredWritePermissions().all { it in granted }
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
