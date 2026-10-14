package com.missionwinning.core.model

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class CoachProviderTest {
    @Test
    fun groqIsDefaultAndOpenRouterFreeIsFallback() {
        val seats = CoachProvider.resolve(
            CoachProvider.Env(
                groqKey = "gsk_test",
                openRouterKey = "sk-or-test",
            ),
        )
        assertEquals(listOf("groq", "openrouter"), seats.map { it.id })
        assertEquals(CoachProvider.GROQ_CHAT_URL, seats[0].url)
        assertEquals(CoachProvider.DEFAULT_GROQ_MODEL, seats[0].model)
        assertTrue(seats[1].model.endsWith(":free"))
    }

    @Test
    fun geminiHostAndModelAreDropped() {
        val seats = CoachProvider.resolve(
            CoachProvider.Env(
                groqKey = "gsk_test",
                groqUrl = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
                groqModel = "gemini-2.5-flash",
                coachUrl = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
                coachKey = "gemini-secret",
                coachModel = "gemini-2.5-flash",
                openRouterKey = "sk-or-test",
                openRouterModel = "google/gemini-2.0-flash:free",
            ),
        )
        assertEquals(1, seats.size)
        assertEquals("openrouter", seats[0].id)
        assertEquals(CoachProvider.DEFAULT_OPENROUTER_FREE_MODEL, seats[0].model)
        assertFalse(CoachProvider.isGeminiFreeTier(seats[0].url))
        assertFalse(seats[0].model.contains("gemini"))
    }

    @Test
    fun explicitCompatibleUrlIsKeptWhenItIsNotGemini() {
        val seats = CoachProvider.resolve(
            CoachProvider.Env(
                coachUrl = "https://api.example.test/v1/chat/completions",
                coachKey = "local",
                coachModel = "desk-model",
            ),
        )
        assertEquals("openai-compatible", seats.single().id)
        assertEquals("desk-model", seats.single().model)
    }

    @Test
    fun emptyEnvHasNoSeat() {
        assertTrue(CoachProvider.resolve(CoachProvider.Env()).isEmpty())
    }
}
