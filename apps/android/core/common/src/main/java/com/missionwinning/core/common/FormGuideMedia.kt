package com.missionwinning.core.common

/**
 * Shared form-guide URLs — same assets as web `public/form-guides/{id}.svg`.
 * See docs/MEDIA_SYSTEM.md · media/manifest.json
 */
object FormGuideMedia {
    /** Production CDN base (long-cached static). Override in tests if needed. */
    const val DEFAULT_BASE_URL = "https://www.missionwinning.com"

    /**
     * Exercise ids with shipped instructional SVGs (keep in sync with
     * `FORM_MEDIA_IDS` in src/lib/formGuides.ts).
     */
    val MEDIA_IDS: Set<String> = setOf(
        "push-ups",
        "air-squat",
        "squats",
        "deadlift",
        "pull-ups",
        "plank",
        "glute-bridge",
        "lunges",
        "overhead-press",
        "barbell-row",
        "burpees",
        "inverted-row",
        "bench-press",
        "romanian-deadlift",
        "hip-thrust",
        "lat-pulldown",
        "kettlebell-swing",
        "face-pull",
        "bicep-curl",
        "tricep-pushdown",
        "bird-dog",
        "wall-sit",
        "pike-pushup",
        "side-plank",
        "mountain-climbers",
        "dips-chair",
        "step-ups",
        "front-squat",
        "goblet-squat",
        "jump-squats",
    )

    fun hasMedia(exerciseId: String): Boolean = exerciseId in MEDIA_IDS

    /** Absolute URL for the instructional SVG, or null if no media. */
    fun url(exerciseId: String, baseUrl: String = DEFAULT_BASE_URL): String? {
        if (!hasMedia(exerciseId)) return null
        val root = baseUrl.trimEnd('/')
        return "$root/form-guides/$exerciseId.svg"
    }
}
