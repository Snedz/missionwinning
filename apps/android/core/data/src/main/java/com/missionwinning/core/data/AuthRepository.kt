package com.missionwinning.core.data

import com.missionwinning.core.network.AuthSession
import com.missionwinning.core.network.MobileApiClient
import com.missionwinning.core.network.PremiumStatusDto
import com.missionwinning.core.network.SupabaseAuthClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.util.concurrent.atomic.AtomicReference

data class AuthUiSnapshot(
    val signedIn: Boolean = false,
    val email: String = "",
    val userId: String = "",
    val premium: Boolean = false,
    val premiumSource: String = "anonymous",
    val configured: Boolean = false,
)

/**
 * Session lifecycle for optional sign-in. Logging never requires this.
 * Access tokens exposed synchronously for [MobileApiClient] via [accessTokenOrNull].
 */
class AuthRepository(
    private val authClient: SupabaseAuthClient,
    private val tokenStore: TokenStore,
    private val mobileApi: MobileApiClient,
) {
    private val tokenRef = AtomicReference<String?>(null)
    private val refreshMutex = Mutex()
    private val _state = MutableStateFlow(
        AuthUiSnapshot(configured = authClient.isConfigured),
    )
    val state: StateFlow<AuthUiSnapshot> = _state.asStateFlow()

    fun accessTokenOrNull(): String? = tokenRef.get()

    val isConfigured: Boolean get() = authClient.isConfigured

    /** Load disk session into memory (call from Application onCreate). */
    suspend fun bootstrap() {
        val session = tokenStore.load()
        if (session == null) {
            tokenRef.set(null)
            _state.value = AuthUiSnapshot(configured = authClient.isConfigured)
            return
        }
        val live = if (session.needsRefresh()) {
            authClient.refresh(session.refreshToken).getOrElse {
                tokenStore.clear()
                tokenRef.set(null)
                _state.value = AuthUiSnapshot(configured = authClient.isConfigured)
                return
            }.also { tokenStore.save(it) }
        } else {
            session
        }
        applySession(live)
        refreshPremiumQuietly()
    }

    suspend fun requestOtp(email: String): Result<Unit> =
        authClient.requestOtp(email)

    suspend fun verifyOtp(email: String, code: String): Result<AuthSession> {
        val result = authClient.verifyOtp(email, code)
        result.getOrNull()?.let {
            tokenStore.save(it)
            applySession(it)
            refreshPremiumQuietly()
        }
        return result
    }

    suspend fun signOut() {
        tokenStore.clear()
        tokenRef.set(null)
        _state.value = AuthUiSnapshot(configured = authClient.isConfigured)
    }

    /**
     * Ensure a non-expired access token when signed in.
     * On hard failure, signs out of tokens only (local logs kept).
     */
    suspend fun ensureFreshAccessToken(): String? {
        val current = tokenStore.load() ?: run {
            tokenRef.set(null)
            return null
        }
        if (!current.needsRefresh()) {
            tokenRef.set(current.accessToken)
            return current.accessToken
        }
        return refreshMutex.withLock {
            val again = tokenStore.load() ?: return@withLock null
            if (!again.needsRefresh()) {
                tokenRef.set(again.accessToken)
                return@withLock again.accessToken
            }
            val refreshed = authClient.refresh(again.refreshToken).getOrElse {
                tokenStore.clear()
                tokenRef.set(null)
                _state.value = AuthUiSnapshot(configured = authClient.isConfigured)
                return@withLock null
            }
            tokenStore.save(refreshed)
            applySession(refreshed)
            refreshed.accessToken
        }
    }

    suspend fun refreshPremium(): PremiumStatusDto {
        val token = ensureFreshAccessToken()
        if (token.isNullOrBlank()) {
            _state.value = _state.value.copy(premium = false, premiumSource = "anonymous")
            return PremiumStatusDto(premium = false, source = "anonymous")
        }
        val result = mobileApi.fetchPremiumStatus().getOrElse {
            PremiumStatusDto(premium = false, source = "error")
        }
        _state.value = _state.value.copy(
            premium = result.premium,
            premiumSource = result.source,
        )
        return result
    }

    private fun applySession(session: AuthSession) {
        tokenRef.set(session.accessToken)
        _state.value = AuthUiSnapshot(
            signedIn = true,
            email = session.email,
            userId = session.userId,
            premium = _state.value.premium,
            premiumSource = _state.value.premiumSource,
            configured = authClient.isConfigured,
        )
    }

    private suspend fun refreshPremiumQuietly() {
        runCatching { refreshPremium() }
    }
}
