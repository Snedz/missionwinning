package com.missionwinning.core.data

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/**
 * AES-GCM with Android Keystore-backed key (no third-party crypto deps).
 * Falls back to plain Base64 if Keystore is unavailable (emulator edge cases).
 */
object TokenCrypto {
    private const val ANDROID_KEYSTORE = "AndroidKeyStore"
    private const val ALIAS = "mw_auth_aes_v1"
    private const val TRANSFORMATION = "AES/GCM/NoPadding"
    private const val GCM_TAG_BITS = 128
    private const val PREFIX_KS = "ks1:"
    private const val PREFIX_PLAIN = "b64:"

    fun encrypt(plain: String): String {
        if (plain.isEmpty()) return plain
        return runCatching {
            val key = getOrCreateKey()
            val cipher = Cipher.getInstance(TRANSFORMATION)
            cipher.init(Cipher.ENCRYPT_MODE, key)
            val iv = cipher.iv
            val encrypted = cipher.doFinal(plain.toByteArray(Charsets.UTF_8))
            val pack = ByteArray(iv.size + encrypted.size)
            System.arraycopy(iv, 0, pack, 0, iv.size)
            System.arraycopy(encrypted, 0, pack, iv.size, encrypted.size)
            PREFIX_KS + Base64.encodeToString(pack, Base64.NO_WRAP)
        }.getOrElse {
            PREFIX_PLAIN + Base64.encodeToString(plain.toByteArray(Charsets.UTF_8), Base64.NO_WRAP)
        }
    }

    fun decrypt(payload: String): String {
        if (payload.isEmpty()) return payload
        if (payload.startsWith(PREFIX_PLAIN)) {
            val raw = Base64.decode(payload.removePrefix(PREFIX_PLAIN), Base64.NO_WRAP)
            return String(raw, Charsets.UTF_8)
        }
        val data = if (payload.startsWith(PREFIX_KS)) {
            Base64.decode(payload.removePrefix(PREFIX_KS), Base64.NO_WRAP)
        } else {
            // Legacy unprefixed values
            return payload
        }
        return runCatching {
            val key = getOrCreateKey()
            val iv = data.copyOfRange(0, 12)
            val cipherBytes = data.copyOfRange(12, data.size)
            val cipher = Cipher.getInstance(TRANSFORMATION)
            cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(GCM_TAG_BITS, iv))
            String(cipher.doFinal(cipherBytes), Charsets.UTF_8)
        }.getOrDefault("")
    }

    private fun getOrCreateKey(): SecretKey {
        val ks = KeyStore.getInstance(ANDROID_KEYSTORE).apply { load(null) }
        (ks.getEntry(ALIAS, null) as? KeyStore.SecretKeyEntry)?.secretKey?.let { return it }
        val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEYSTORE)
        keyGenerator.init(
            KeyGenParameterSpec.Builder(
                ALIAS,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT,
            )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setRandomizedEncryptionRequired(true)
                .build(),
        )
        return keyGenerator.generateKey()
    }
}
