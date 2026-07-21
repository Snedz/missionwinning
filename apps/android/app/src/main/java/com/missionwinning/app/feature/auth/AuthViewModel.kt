package com.missionwinning.app.feature.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.missionwinning.core.data.AuthRepository
import com.missionwinning.core.data.AuthUiSnapshot
import com.missionwinning.core.data.MwRepository
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

data class AuthScreenState(
    val step: AuthStep = AuthStep.Email,
    val email: String = "",
    val code: String = "",
    val busy: Boolean = false,
    val message: String? = null,
    val error: String? = null,
    val session: AuthUiSnapshot = AuthUiSnapshot(),
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
                    // Pull remote history + push local pending (sync v2)
                    runCatching { repository.syncNow() }
                    syncScheduler.enqueueNow()
                    _local.update {
                        it.copy(
                            busy = false,
                            step = AuthStep.SignedIn,
                            code = "",
                            message = "Signed in. Syncing workouts when online…",
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
}
