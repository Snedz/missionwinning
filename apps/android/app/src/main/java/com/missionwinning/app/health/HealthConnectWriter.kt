package com.missionwinning.app.health

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.metadata.Metadata
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import androidx.health.connect.client.units.Energy
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.ZoneOffset

/**
 * Health Connect bridge (Phase 13).
 * Write: exercise session + optional active calories estimate.
 * Read: optional steps today for Today metric strip.
 * Opt-in only; never required for free offline logging.
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

    fun writePermissions(): Set<String> = setOf(
        HealthPermission.getWritePermission(ExerciseSessionRecord::class),
        HealthPermission.getWritePermission(ActiveCaloriesBurnedRecord::class),
    )

    fun readStepsPermission(): Set<String> = setOf(
        HealthPermission.getReadPermission(StepsRecord::class),
    )

    /** Combined set for Account permission launcher when enabling export. */
    fun requiredPermissions(): Set<String> = writePermissions()

    fun requiredPermissionsWithSteps(): Set<String> =
        writePermissions() + readStepsPermission()

    suspend fun hasWritePermission(): Boolean {
        val client = clientOrNull() ?: return false
        val granted = client.permissionController.getGrantedPermissions()
        return writePermissions().all { it in granted }
    }

    suspend fun hasStepsReadPermission(): Boolean {
        val client = clientOrNull() ?: return false
        val granted = client.permissionController.getGrantedPermissions()
        return readStepsPermission().all { it in granted }
    }

    /**
     * Insert strength session + rough active calories (not medical).
     * Calories ≈ max(80, durationMinutes * 6) — light strength MET placeholder.
     */
    suspend fun writeExerciseSession(
        title: String,
        durationSeconds: Int,
        endInstant: Instant = Instant.now(),
        totalVolume: Double = 0.0,
        setCount: Int = 0,
        weightUnit: String = "kg",
    ): Boolean {
        val client = clientOrNull() ?: return false
        if (!hasWritePermission()) return false
        val duration = durationSeconds.coerceAtLeast(30).toLong()
        val start = endInstant.minusSeconds(duration)
        val zone = ZoneOffset.systemDefault().rules
        val detail = buildString {
            append(title.take(120).ifBlank { "Workout" })
            if (setCount > 0) append(" · $setCount sets")
            if (totalVolume > 0) append(" · vol ${totalVolume.toInt()} $weightUnit")
        }
        val session = ExerciseSessionRecord(
            startTime = start,
            startZoneOffset = zone.getOffset(start),
            endTime = endInstant,
            endZoneOffset = zone.getOffset(endInstant),
            exerciseType = ExerciseSessionRecord.EXERCISE_TYPE_STRENGTH_TRAINING,
            title = detail.take(200),
            metadata = Metadata.manualEntry(),
        )
        val minutes = (duration / 60.0).coerceAtLeast(0.5)
        // ~6 kcal/min strength placeholder; volume slightly bumps estimate
        val kcal = (minutes * 6.0 + (totalVolume / 500.0).coerceAtMost(80.0))
            .coerceIn(40.0, 1200.0)
        val calories = ActiveCaloriesBurnedRecord(
            startTime = start,
            startZoneOffset = zone.getOffset(start),
            endTime = endInstant,
            endZoneOffset = zone.getOffset(endInstant),
            energy = Energy.kilocalories(kcal),
            metadata = Metadata.manualEntry(),
        )
        // Insert separately — mixed IntervalRecord types break type inference on some HC versions
        client.insertRecords(listOf(session))
        runCatching { client.insertRecords(listOf(calories)) }
        return true
    }

    /**
     * Sum steps recorded for local calendar today (0 if unavailable / no permission).
     */
    suspend fun readStepsToday(): Long? {
        val client = clientOrNull() ?: return null
        if (!hasStepsReadPermission()) return null
        val zone = ZoneId.systemDefault()
        val start = LocalDate.now(zone).atStartOfDay(zone).toInstant()
        val end = Instant.now()
        val response = client.readRecords(
            ReadRecordsRequest(
                recordType = StepsRecord::class,
                timeRangeFilter = TimeRangeFilter.between(start, end),
            ),
        )
        return response.records.sumOf { it.count }
    }

    companion object {
        const val PROVIDER_PACKAGE = "com.google.android.apps.healthdata"
    }
}
