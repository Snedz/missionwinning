package com.missionwinning.core.common

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Process-wide active workout snapshot for the foreground notification service.
 * ViewModel publishes; service reads. Survives Activity destroy while service runs.
 */
object ActiveSessionHub {
    data class Snapshot(
        val active: Boolean = false,
        val workoutName: String = "",
        val sessionId: String = "",
        val doneSets: Int = 0,
        val totalSets: Int = 0,
        /** Epoch ms when rest ends; null if not resting. Screen-off accurate. */
        val restDeadlineMs: Long? = null,
    ) {
        fun restSecondsLeft(nowMs: Long = System.currentTimeMillis()): Int {
            val deadline = restDeadlineMs ?: return 0
            return ((deadline - nowMs) / 1000L).toInt().coerceAtLeast(0)
        }
    }

    sealed interface Command {
        data object SkipRest : Command
    }

    private val _snapshot = MutableStateFlow(Snapshot())
    val snapshot: StateFlow<Snapshot> = _snapshot.asStateFlow()

    private val _commands = MutableSharedFlow<Command>(extraBufferCapacity = 4)
    val commands: SharedFlow<Command> = _commands.asSharedFlow()

    fun publish(snapshot: Snapshot) {
        _snapshot.value = snapshot
    }

    fun clear() {
        _snapshot.value = Snapshot()
    }

    fun offer(command: Command) {
        _commands.tryEmit(command)
    }
}
