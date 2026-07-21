package com.missionwinning.core.network

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class SupabaseOtpRequest(
    val email: String,
    /** Email OTP (6-digit code flow). */
    @SerialName("create_user") val createUser: Boolean = true,
)

@Serializable
data class SupabaseVerifyRequest(
    val type: String = "email",
    val email: String,
    val token: String,
)

@Serializable
data class SupabaseRefreshRequest(
    @SerialName("refresh_token") val refreshToken: String,
)

@Serializable
data class SupabaseSessionResponse(
    @SerialName("access_token") val accessToken: String = "",
    @SerialName("refresh_token") val refreshToken: String = "",
    @SerialName("expires_in") val expiresIn: Long = 3600,
    @SerialName("token_type") val tokenType: String = "bearer",
    val user: SupabaseUserDto? = null,
)

@Serializable
data class SupabaseUserDto(
    val id: String = "",
    val email: String? = null,
)

@Serializable
data class PremiumStatusDto(
    val premium: Boolean = false,
    val source: String = "anonymous",
)

@Serializable
data class TelemetryHeartbeatDto(
    val installId: String,
    val weekKey: String,
    val appVersion: String = "",
)

/** In-memory session used by AuthRepository / TokenStore. */
data class AuthSession(
    val accessToken: String,
    val refreshToken: String,
    val expiresAtEpochMs: Long,
    val userId: String,
    val email: String,
) {
    fun isExpired(nowMs: Long = System.currentTimeMillis(), skewMs: Long = 60_000L): Boolean =
        nowMs >= (expiresAtEpochMs - skewMs)

    /** True when access token expires within [windowMs] (default 5 minutes). */
    fun needsRefresh(nowMs: Long = System.currentTimeMillis(), windowMs: Long = 5 * 60_000L): Boolean =
        nowMs >= (expiresAtEpochMs - windowMs)
}
