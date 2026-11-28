package com.missionwinning.app.preview

internal object ShellPreview {
    const val PREFERENCES = "shell_preview"
    const val KEY = "android_v2"
    const val EXTRA = "mw_android_v2"

    fun enabled(debug: Boolean, savedOptIn: Boolean, requested: Boolean?): Boolean =
        debug && (requested ?: savedOptIn)
}
