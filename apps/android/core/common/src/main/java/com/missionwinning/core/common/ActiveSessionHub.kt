package com.missionwinning.core.common

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Process-wide active workout snapshot for notification + Wear remote.
 * ViewModel publishes; services/watch read. Phone remains SoT.
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
        /** Current incomplete set (for Wear). */
        val currentSetId: String = "",
        val exerciseName: String = "",
        val setIndex: Int = 0,
        val reps: Int = 10,
        val weight: Double = 0.0,
        val weightUnit: String = "kg",
        val streakDays: Int = 0,
    ) {
        fun restSecondsLeft(nowMs: Long = System.currentTimeMillis()): Int {
            val deadline = restDeadlineMs ?: return 0
            return ((deadline - nowMs) / 1000L).toInt().coerceAtLeast(0)
        }
    }

    sealed interface Command {
        data object SkipRest : Command
        /** Watch completed the current set with optional load override. */
        data class CompleteSet(
            val setId: String,
            val reps: Int,
            val weight: Double,
        ) : Command
    }

    private val _snapshot = MutableStateFlow(Snapshot())
    val snapshot: StateFlow<Snapshot> = _snapshot.asStateFlow()

    private val _commands = MutableSharedFlow<Command>(extraBufferCapacity = 8)
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
