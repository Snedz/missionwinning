package com.missionwinning.core.common

/**
 * Data Layer paths + minimal JSON codec shared by phone and Wear.
 * Phone is SoT; watch is a remote control for the active session.
 */
object WearProtocol {
    const val PATH_ACTIVE = "/mw/active"
    const val PATH_COMPLETE = "/mw/complete"
    const val PATH_SKIP_REST = "/mw/skip_rest"
    const val PATH_PING = "/mw/ping"

    const val CAPABILITY_PHONE = "mw_phone"
    const val CAPABILITY_WATCH = "mw_watch"

    fun encodeActive(s: ActiveSessionHub.Snapshot): ByteArray {
        val rest = s.restDeadlineMs?.toString() ?: ""
        return buildString {
            append("v=1")
            append("&active=").append(if (s.active) "1" else "0")
            append("&name=").append(enc(s.workoutName))
            append("&sid=").append(enc(s.sessionId))
            append("&done=").append(s.doneSets)
            append("&total=").append(s.totalSets)
            append("&restEnd=").append(rest)
            append("&setId=").append(enc(s.currentSetId))
            append("&ex=").append(enc(s.exerciseName))
            append("&idx=").append(s.setIndex)
            append("&reps=").append(s.reps)
            append("&wt=").append(s.weight)
            append("&unit=").append(enc(s.weightUnit))
            append("&streak=").append(s.streakDays)
        }.toByteArray(Charsets.UTF_8)
    }

    fun decodeActive(bytes: ByteArray?): ActiveSessionHub.Snapshot? {
        if (bytes == null || bytes.isEmpty()) return null
        val map = parse(String(bytes, Charsets.UTF_8)) ?: return null
        return ActiveSessionHub.Snapshot(
            active = map["active"] == "1",
            workoutName = map["name"].orEmpty(),
            sessionId = map["sid"].orEmpty(),
            doneSets = map["done"]?.toIntOrNull() ?: 0,
            totalSets = map["total"]?.toIntOrNull() ?: 0,
            restDeadlineMs = map["restEnd"]?.takeIf { it.isNotBlank() }?.toLongOrNull(),
            currentSetId = map["setId"].orEmpty(),
            exerciseName = map["ex"].orEmpty(),
            setIndex = map["idx"]?.toIntOrNull() ?: 0,
            reps = map["reps"]?.toIntOrNull() ?: 10,
            weight = map["wt"]?.toDoubleOrNull() ?: 0.0,
            weightUnit = map["unit"] ?: "kg",
            streakDays = map["streak"]?.toIntOrNull() ?: 0,
        )
    }

    fun encodeComplete(setId: String, reps: Int, weight: Double): ByteArray =
        "v=1&setId=${enc(setId)}&reps=$reps&wt=$weight".toByteArray(Charsets.UTF_8)

    fun decodeComplete(bytes: ByteArray?): Triple<String, Int, Double>? {
        if (bytes == null || bytes.isEmpty()) return null
        val map = parse(String(bytes, Charsets.UTF_8)) ?: return null
        val setId = map["setId"].orEmpty()
        if (setId.isBlank()) return null
        val reps = map["reps"]?.toIntOrNull() ?: return null
        val weight = map["wt"]?.toDoubleOrNull() ?: 0.0
        return Triple(setId, reps, weight)
    }

    private fun enc(value: String): String =
        java.net.URLEncoder.encode(value, Charsets.UTF_8.name())

    private fun parse(raw: String): Map<String, String>? {
        if (!raw.startsWith("v=1")) return null
        return raw.split('&').mapNotNull { part ->
            val i = part.indexOf('=')
            if (i <= 0) null
            else {
                val k = part.substring(0, i)
                val v = java.net.URLDecoder.decode(part.substring(i + 1), Charsets.UTF_8.name())
                k to v
            }
        }.toMap()
    }
}
