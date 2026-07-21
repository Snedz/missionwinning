package com.missionwinning.core.data

import com.missionwinning.core.network.AuthSession

/**
 * Persists auth session fields in Room prefs, values encrypted via [TokenCrypto].
 */
class TokenStore(
    private val db: MwDatabase,
) {
    private val dao = db.dao()

    suspend fun save(session: AuthSession) {
        dao.setPref(PrefEntity(KEY_ACCESS, TokenCrypto.encrypt(session.accessToken)))
        dao.setPref(PrefEntity(KEY_REFRESH, TokenCrypto.encrypt(session.refreshToken)))
        dao.setPref(PrefEntity(KEY_EXPIRES, session.expiresAtEpochMs.toString()))
        dao.setPref(PrefEntity(KEY_USER_ID, session.userId))
        dao.setPref(PrefEntity(KEY_EMAIL, session.email))
    }

    suspend fun load(): AuthSession? {
        val access = dao.getPref(KEY_ACCESS)?.let { TokenCrypto.decrypt(it) }.orEmpty()
        val refresh = dao.getPref(KEY_REFRESH)?.let { TokenCrypto.decrypt(it) }.orEmpty()
        if (access.isBlank() || refresh.isBlank()) return null
        val expires = dao.getPref(KEY_EXPIRES)?.toLongOrNull() ?: 0L
        val userId = dao.getPref(KEY_USER_ID).orEmpty()
        val email = dao.getPref(KEY_EMAIL).orEmpty()
        return AuthSession(
            accessToken = access,
            refreshToken = refresh,
            expiresAtEpochMs = expires,
            userId = userId,
            email = email,
        )
    }

    suspend fun clear() {
        dao.setPref(PrefEntity(KEY_ACCESS, ""))
        dao.setPref(PrefEntity(KEY_REFRESH, ""))
        dao.setPref(PrefEntity(KEY_EXPIRES, "0"))
        dao.setPref(PrefEntity(KEY_USER_ID, ""))
        dao.setPref(PrefEntity(KEY_EMAIL, ""))
    }

    companion object {
        const val KEY_ACCESS = "auth_access_token"
        const val KEY_REFRESH = "auth_refresh_token"
        const val KEY_EXPIRES = "auth_expires_at"
        const val KEY_USER_ID = "auth_user_id"
        const val KEY_EMAIL = "auth_email"
    }
}
