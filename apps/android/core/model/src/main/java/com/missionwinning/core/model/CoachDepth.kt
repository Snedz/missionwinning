package com.missionwinning.core.model

/**
 * Pure coach depth presentation helpers (Phase 14).
 * Free: full week plan always available.
 * Premium: deeper insight stack + per-session rationale (from server beats / seed).
 * Not medical advice. No planEngine.
 */
object CoachDepth {

    data class InsightCard(
        val key: String,
        val title: String,
        val body: String,
        /** free = everyone; premium = Super Bundle depth only */
        val premiumOnly: Boolean = false,
    )

    data class SessionWhy(
        val sessionId: String,
        val headline: String,
        val detail: String,
        val focusLine: String,
        val premiumOnly: Boolean = false,
    )

    /**
     * Build insight cards from adapt beats + week shape.
     * Free users get the first free card; premium gets the full stack.
     */
    fun insightCards(
        adaptBeats: List<Pair<String, String>>,
        hasAdaptSignal: Boolean,
        revision: Int,
        equipment: String,
        doneCount: Int,
        openCount: Int,
        missedCount: Int,
        swappedCount: Int,
        premium: Boolean,
    ): List<InsightCard> {
        val cards = mutableListOf<InsightCard>()

        // Free forever: week snapshot
        cards += InsightCard(
            key = "week-snapshot",
            title = "This week",
            body = buildString {
                append("$doneCount done · $openCount open")
                if (missedCount > 0) append(" · $missedCount missed")
                if (swappedCount > 0) append(" · $swappedCount swapped")
                append(". Plan free offline forever.")
            },
            premiumOnly = false,
        )

        if (hasAdaptSignal || adaptBeats.isNotEmpty() || revision > 1) {
            cards += InsightCard(
                key = "adapt-summary",
                title = "Adapted from logs",
                body = adaptBeats.firstOrNull()?.second
                    ?: "Revision $revision — week reshaped from workouts you logged (no wearable).",
                premiumOnly = false,
            )
        }

        // Premium: full adapt beat list as separate cards
        adaptBeats.drop(1).forEach { (key, msg) ->
            cards += InsightCard(
                key = "beat-$key",
                title = beatTitle(key),
                body = msg,
                premiumOnly = true,
            )
        }

        cards += InsightCard(
            key = "equipment",
            title = "Equipment fit",
            body = equipmentCopy(equipment, premium),
            premiumOnly = false,
        )

        if (premium) {
            cards += InsightCard(
                key = "premium-depth",
                title = "Super Bundle depth",
                body = "Miss / swap beats, session rationale, and equipment intelligence stay unlocked. Logging never requires a plan.",
                premiumOnly = true,
            )
            if (missedCount > 0 || swappedCount > 0) {
                cards += InsightCard(
                    key = "recovery-bias",
                    title = "Recovery bias",
                    body = when {
                        missedCount > 0 && swappedCount > 0 ->
                            "Missed days + recovery swaps: bias volume down this week and protect the streak."
                        missedCount > 0 ->
                            "After a miss, remaining days re-spread so the week still fits life."
                        else ->
                            "Swapped recovery days lower strain using log history — not a wearable score."
                    },
                    premiumOnly = true,
                )
            }
        }

        return if (premium) {
            cards
        } else {
            // Free: keep week + first adapt + equipment; hide premium-only
            cards.filterNot { it.premiumOnly }.take(3)
        }
    }

    fun sessionWhy(
        sessionId: String,
        name: String,
        kind: String,
        status: String,
        focusGroups: List<String>,
        exerciseWhyKeys: List<String>,
        estMinutes: Int,
        premium: Boolean,
    ): SessionWhy {
        val focus = focusGroups.filter { it.isNotBlank() }
            .joinToString(" · ")
            .ifBlank { kind.ifBlank { "full body" } }
        val freeDetail = when (status) {
            "missed" -> "Marked missed earlier — use a freeform log anytime; the week still counts."
            "swapped" -> "Swapped for recovery fit. Keep it easy or skip to next planned day."
            "done" -> "Logged. Coach revision can refine remaining days from this session."
            else -> "~$estMinutes min · $focus. Free offline forever."
        }
        val premiumDetail = when {
            exerciseWhyKeys.any { it.contains("adapt", true) } ->
                "This day was rewritten from adapt rules (miss/swap). Moves prioritize recovery capacity."
            status == "swapped" ->
                "Recovery swap from log strain signals — protect joints and keep the habit alive."
            status == "missed" ->
                "Missed slot re-balanced remaining volume so you don’t stack catch-up ego sets."
            kind.contains("recover", true) ->
                "Recovery bias session: lower intensity, still movement-positive."
            else ->
                "Session intent: $focus. Est. $estMinutes min. Super Bundle surfaces why keys on each move."
        }
        return SessionWhy(
            sessionId = sessionId,
            headline = "Why · $name",
            detail = if (premium) premiumDetail else freeDetail,
            focusLine = focus,
            premiumOnly = false, // free gets short why; premium gets deeper copy
        )
    }

    fun whyKeyLabel(whyKey: String): String? {
        val k = whyKey.trim().lowercase()
        if (k.isBlank()) return null
        return when {
            k.contains("adapt") -> "Adapted move"
            k.contains("progress") -> "Progression"
            k.contains("recover") -> "Recovery"
            k.contains("balance") -> "Balance"
            k.contains("main") -> "Main lift"
            else -> whyKey.replace('-', ' ').replace('_', ' ')
        }
    }

    private fun beatTitle(key: String): String = when {
        key.contains("Missed", ignoreCase = true) -> "Missed days"
        key.contains("Swap", ignoreCase = true) -> "Recovery swaps"
        key.contains("Log", ignoreCase = true) -> "From your logs"
        else -> "Coach note"
    }

    private fun equipmentCopy(equipment: String, premium: Boolean): String {
        val eq = equipment.replace('-', ' ').ifBlank { "bodyweight" }
        return if (premium) {
            "Profile · $eq. Reseed from Today when gear changes; premium depth keeps adapt history across equipment shifts."
        } else {
            "Training with $eq. Change equipment on Today to reseed this week offline."
        }
    }
}
