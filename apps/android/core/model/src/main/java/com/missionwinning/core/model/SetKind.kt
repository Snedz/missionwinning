package com.missionwinning.core.model

/**
 * Set classification — Hevy/Strong-style warmup, failure, and drop markers.
 * Mirrors web `src/lib/workout/setKind.ts`.
 */
enum class SetKind(val code: String) {
    Normal("normal"),
    Warmup("warmup"),
    Failure("failure"),
    Drop("drop"),
    ;

    companion object {
        val ALL: List<SetKind> = entries

        fun fromCode(raw: String?): SetKind {
            if (raw.isNullOrBlank()) return Normal
            return entries.find { it.code.equals(raw, ignoreCase = true) } ?: Normal
        }

        /** Cycle for one-tap UI: normal → warmup → failure → drop → normal. */
        fun cycle(current: SetKind): SetKind = when (current) {
            Normal -> Warmup
            Warmup -> Failure
            Failure -> Drop
            Drop -> Normal
        }

        fun countsTowardVolume(kind: SetKind): Boolean = kind != Warmup

        fun countsTowardPr(kind: SetKind): Boolean = kind != Warmup && kind != Drop

        /** Short badge: W / F / D / empty for normal. */
        fun shortLabel(kind: SetKind): String = when (kind) {
            Warmup -> "W"
            Failure -> "F"
            Drop -> "D"
            Normal -> ""
        }

        fun displayLabel(kind: SetKind): String = when (kind) {
            Warmup -> "Warmup"
            Failure -> "Failure"
            Drop -> "Drop"
            Normal -> "Working"
        }
    }
}
