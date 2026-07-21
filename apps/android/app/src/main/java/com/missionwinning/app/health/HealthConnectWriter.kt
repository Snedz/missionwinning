package com.missionwinning.app.health

import android.content.Context
import android.os.Build
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.metadata.Metadata
import java.time.Instant
import java.time.ZoneOffset

/**
 * Write-only Health Connect export after a finished workout.
 * Opt-in from Account; never required for logging.
 */
class HealthConnectWriter(
    private val context: Context,
) {
    private val appContext = context.applicationContext

    fun sdkStatus(): Int = HealthConnectClient.getSdkStatus(appContext)

    fun isAvailable(): Boolean =
        sdkStatus() == HealthConnectClient.SDK_AVAILABLE

    fun clientOrNull(): HealthConnectClient? =
        if (isAvailable()) HealthConnectClient.getOrCreate(appContext) else null

    fun requiredPermissions(): Set<String> = setOf(
        HealthPermission.getWritePermission(ExerciseSessionRecord::class),
    )

    suspend fun hasWritePermission(): Boolean {
        val client = clientOrNull() ?: return false
        val granted = client.permissionController.getGrantedPermissions()
        return requiredPermissions().all { it in granted }
    }

    /**
     * Insert a strength-training exercise session spanning the workout duration.
     * @return true if a record was written.
     */
    suspend fun writeExerciseSession(
        title: String,
        durationSeconds: Int,
        endInstant: Instant = Instant.now(),
    ): Boolean {
        val client = clientOrNull() ?: return false
        if (!hasWritePermission()) return false
        val duration = durationSeconds.coerceAtLeast(30).toLong()
        val start = endInstant.minusSeconds(duration)
        val record = ExerciseSessionRecord(
            startTime = start,
            startZoneOffset = ZoneOffset.systemDefault().rules.getOffset(start),
            endTime = endInstant,
            endZoneOffset = ZoneOffset.systemDefault().rules.getOffset(endInstant),
            exerciseType = ExerciseSessionRecord.EXERCISE_TYPE_STRENGTH_TRAINING,
            title = title.take(200).ifBlank { "Workout" },
            metadata = Metadata.manualEntry(),
        )
        client.insertRecords(listOf(record))
        return true
    }

    companion object {
        /** Play Store / package for install prompt when HC missing. */
        const val PROVIDER_PACKAGE = "com.google.android.apps.healthdata"
    }
}
