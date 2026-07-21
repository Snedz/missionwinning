package com.missionwinning.core.common

sealed class MwResult<out T> {
    data class Ok<T>(val value: T) : MwResult<T>()
    data class Err(val message: String, val cause: Throwable? = null) : MwResult<Nothing>()
}

inline fun <T> MwResult<T>.getOrElse(fallback: (MwResult.Err) -> T): T = when (this) {
    is MwResult.Ok -> value
    is MwResult.Err -> fallback(this)
}
