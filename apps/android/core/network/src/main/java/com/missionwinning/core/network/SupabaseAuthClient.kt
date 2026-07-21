package com.missionwinning.core.network

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

/**
 * Minimal Supabase Auth REST client (email OTP + refresh).
 * No supabase-kt / Ktor — mirrors [MobileApiClient] style.
 */
class SupabaseAuthClient(
    private val supabaseUrl: String,
    private val anonKey: String,
) {
    private val client: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()
    private val json = Json { ignoreUnknownKeys = true; isLenient = true }
    private val media = "application/json".toMediaType()

    val isConfigured: Boolean
        get() = supabaseUrl.isNotBlank() && anonKey.isNotBlank()

    /**
     * Send a 6-digit email OTP. Supabase project must have email OTP enabled.
     */
    suspend fun requestOtp(email: String): Result<Unit> = withContext(Dispatchers.IO) {
        if (!isConfigured) return@withContext Result.failure(IllegalStateException("Auth not configured"))
        val normalized = email.trim().lowercase()
        if (!normalized.contains("@")) {
            return@withContext Result.failure(IllegalArgumentException("Enter a valid email"))
        }
        runCatching {
            val body = json.encodeToString(SupabaseOtpRequest(email = normalized))
            val req = authRequest("/auth/v1/otp")
                .post(body.toRequestBody(media))
                .build()
            client.newCall(req).execute().use { resp ->
                if (!resp.isSuccessful) {
                    val err = resp.body?.string().orEmpty().take(200)
                    error("OTP request failed (${resp.code})${if (err.isNotBlank()) ": $err" else ""}")
                }
            }
        }
    }

    suspend fun verifyOtp(email: String, code: String): Result<AuthSession> = withContext(Dispatchers.IO) {
        if (!isConfigured) return@withContext Result.failure(IllegalStateException("Auth not configured"))
        val normalized = email.trim().lowercase()
        val token = code.trim().filter { it.isDigit() }
        if (token.length < 6) {
            return@withContext Result.failure(IllegalArgumentException("Enter the 6-digit code"))
        }
        runCatching {
            val body = json.encodeToString(
                SupabaseVerifyRequest(email = normalized, token = token),
            )
            val req = authRequest("/auth/v1/verify")
                .post(body.toRequestBody(media))
                .build()
            client.newCall(req).execute().use { resp ->
                if (!resp.isSuccessful) {
                    val err = resp.body?.string().orEmpty().take(200)
                    error("Invalid or expired code (${resp.code})${if (err.isNotBlank()) ": $err" else ""}")
                }
                val session = json.decodeFromString<SupabaseSessionResponse>(resp.body!!.string())
                session.toAuthSession(fallbackEmail = normalized)
            }
        }
    }

    suspend fun refresh(refreshToken: String): Result<AuthSession> = withContext(Dispatchers.IO) {
        if (!isConfigured) return@withContext Result.failure(IllegalStateException("Auth not configured"))
        if (refreshToken.isBlank()) {
            return@withContext Result.failure(IllegalStateException("No refresh token"))
        }
        runCatching {
            val body = json.encodeToString(SupabaseRefreshRequest(refreshToken = refreshToken))
            val req = authRequest("/auth/v1/token?grant_type=refresh_token")
                .post(body.toRequestBody(media))
                .build()
            client.newCall(req).execute().use { resp ->
                if (!resp.isSuccessful) {
                    error("Session refresh failed (${resp.code})")
                }
                val session = json.decodeFromString<SupabaseSessionResponse>(resp.body!!.string())
                session.toAuthSession(fallbackEmail = "")
            }
        }
    }

    private fun authRequest(path: String): Request.Builder {
        val base = supabaseUrl.trimEnd('/')
        return Request.Builder()
            .url(base + path)
            .header("apikey", anonKey)
            .header("Authorization", "Bearer $anonKey")
            .header("Content-Type", "application/json")
    }

    private fun SupabaseSessionResponse.toAuthSession(fallbackEmail: String): AuthSession {
        require(accessToken.isNotBlank()) { "Missing access token" }
        require(refreshToken.isNotBlank()) { "Missing refresh token" }
        val email = user?.email?.takeIf { it.isNotBlank() } ?: fallbackEmail
        val userId = user?.id.orEmpty()
        val expiresAt = System.currentTimeMillis() + (expiresIn.coerceAtLeast(60) * 1000L)
        return AuthSession(
            accessToken = accessToken,
            refreshToken = refreshToken,
            expiresAtEpochMs = expiresAt,
            userId = userId,
            email = email,
        )
    }
}
