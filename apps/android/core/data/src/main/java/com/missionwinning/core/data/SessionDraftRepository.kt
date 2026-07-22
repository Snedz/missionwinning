package com.missionwinning.core.data

import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

/**
 * Persist in-progress Active session so process death does not lose sets.
 */
class SessionDraftRepository(
    private val db: MwDatabase,
) {
    private val dao = db.dao()
    private val json = Json { ignoreUnknownKeys = true }

    @Serializable
    data class DraftSet(
        val id: String,
        val exerciseId: String,
        val exerciseName: String,
        val setIndex: Int,
        val reps: Int,
        val weight: Double,
        val done: Boolean = false,
        val previousReps: Int? = null,
        val previousWeight: Double? = null,
        val rpe: Int? = null,
        val kind: String = "normal",
        val note: String = "",
        val isPr: Boolean = false,
    )

    @Serializable
    data class DraftExercise(
        val exerciseId: String,
        val name: String,
        val sets: List<DraftSet>,
        val supersetGroup: String = "",
        val defaultRestSeconds: Int? = null,
    )

    @Serializable
    data class DraftPayload(
        val sessionId: String,
        val workoutName: String,
        val startedAtMs: Long,
        val weightUnit: String,
        val restSeconds: Int = 0,
        val defaultRestSeconds: Int = 60,
        val exercises: List<DraftExercise> = emptyList(),
    )

    suspend fun save(payload: DraftPayload) {
        val now = java.time.Instant.now().toString()
        dao.upsertSessionDraft(
            SessionDraftEntity(
                id = 1,
                sessionId = payload.sessionId,
                workoutName = payload.workoutName,
                startedAtMs = payload.startedAtMs,
                weightUnit = payload.weightUnit,
                json = json.encodeToString(DraftPayload.serializer(), payload),
                updatedAt = now,
            ),
        )
    }

    suspend fun load(): DraftPayload? {
        val row = dao.getSessionDraft() ?: return null
        return runCatching {
            json.decodeFromString(DraftPayload.serializer(), row.json)
        }.getOrNull()
    }

    suspend fun clear() {
        dao.clearSessionDraft()
    }
}
