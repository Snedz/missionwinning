package com.missionwinning.core.data

import java.util.UUID

/**
 * Session id conventions shared by Active / Today / routines.
 * Coach week sessions use opaque plan session ids (not these prefixes).
 */
object SessionIds {
    const val ROUTINE_SESSION_PREFIX = "routine:"
    const val FREEFORM_SESSION_PREFIX = "freeform:"

    fun isRoutineSession(sessionId: String): Boolean =
        sessionId.startsWith(ROUTINE_SESSION_PREFIX)

    fun isFreeformSession(sessionId: String): Boolean =
        sessionId.startsWith(FREEFORM_SESSION_PREFIX)

    /** Coach week sessions only — not routines or freeform logs. */
    fun isCoachSession(sessionId: String): Boolean =
        sessionId.isNotBlank() && !isRoutineSession(sessionId) && !isFreeformSession(sessionId)

    fun routineSessionId(routineId: String): String =
        ROUTINE_SESSION_PREFIX + routineId

    fun freeformSessionId(): String =
        FREEFORM_SESSION_PREFIX + UUID.randomUUID().toString()

    fun routineIdFromSession(sessionId: String): String? =
        if (isRoutineSession(sessionId)) sessionId.removePrefix(ROUTINE_SESSION_PREFIX) else null
}
