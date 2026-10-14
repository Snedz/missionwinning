package com.missionwinning.core.model

/**
 * OpenAI-compatible coach seats. Groq is the default, OpenRouter `:free` is the
 * fallback, and an explicit base URL is any other compatible host.
 *
 * Keys are arguments. This type never embeds one. Gemini free-tier hosts and
 * `gemini` model ids are dropped — workout text is health data.
 */
object CoachProvider {
    const val GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"
    const val OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions"
    const val DEFAULT_GROQ_MODEL = "openai/gpt-oss-20b"
    const val DEFAULT_OPENROUTER_FREE_MODEL = "openai/gpt-oss-20b:free"

    data class Seat(
        val id: String,
        val url: String,
        val model: String,
    )

    data class Env(
        val groqKey: String? = null,
        val groqUrl: String? = null,
        val groqModel: String? = null,
        val openRouterKey: String? = null,
        val openRouterUrl: String? = null,
        val openRouterModel: String? = null,
        val coachUrl: String? = null,
        val coachKey: String? = null,
        val coachModel: String? = null,
    )

    fun isGeminiFreeTier(raw: String): Boolean {
        val trimmed = raw.trim()
        if (trimmed.isEmpty()) return false
        val host = runCatching {
            java.net.URI(trimmed).host?.lowercase().orEmpty()
        }.getOrDefault("")
        if (host.isEmpty()) {
            return trimmed.contains("gemini", ignoreCase = true) ||
                trimmed.contains("generativelanguage", ignoreCase = true)
        }
        if (host == "generativelanguage.googleapis.com") return true
        if (host.endsWith(".generativelanguage.googleapis.com")) return true
        if (host.contains("gemini")) return true
        return false
    }

    fun isGeminiModel(model: String): Boolean = model.contains("gemini", ignoreCase = true)

    fun openRouterFreeModel(raw: String?): String {
        val model = raw?.trim().orEmpty().ifEmpty { DEFAULT_OPENROUTER_FREE_MODEL }
        if (isGeminiModel(model)) return DEFAULT_OPENROUTER_FREE_MODEL
        return if (model.endsWith(":free")) model else "$model:free"
    }

    fun resolve(env: Env): List<Seat> {
        val seats = mutableListOf<Seat>()
        fun push(id: String, url: String, key: String?, model: String) {
            val secret = key?.trim().orEmpty()
            val endpoint = url.trim()
            if (secret.isEmpty() || endpoint.isEmpty() || model.isBlank()) return
            if (isGeminiFreeTier(endpoint) || isGeminiModel(model)) return
            if (seats.any { it.url == endpoint }) return
            seats += Seat(id, endpoint, model.trim())
        }
        if (!env.groqKey.isNullOrBlank()) {
            push(
                "groq",
                env.groqUrl?.trim().orEmpty().ifEmpty { GROQ_CHAT_URL },
                env.groqKey,
                env.groqModel?.trim().orEmpty().ifEmpty { DEFAULT_GROQ_MODEL },
            )
        }
        if (!env.coachUrl.isNullOrBlank() && !env.coachKey.isNullOrBlank()) {
            push(
                "openai-compatible",
                env.coachUrl,
                env.coachKey,
                env.coachModel?.trim().orEmpty().ifEmpty { "grok-4.6" },
            )
        }
        if (!env.openRouterKey.isNullOrBlank()) {
            push(
                "openrouter",
                env.openRouterUrl?.trim().orEmpty().ifEmpty { OPENROUTER_CHAT_URL },
                env.openRouterKey,
                openRouterFreeModel(env.openRouterModel),
            )
        }
        return seats
    }
}
