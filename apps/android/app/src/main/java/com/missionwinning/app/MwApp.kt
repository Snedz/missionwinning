package com.missionwinning.app

import android.app.Application
import com.missionwinning.app.crash.CrashReporting
import com.missionwinning.app.health.HealthConnectWriter
import com.missionwinning.app.wear.WearSessionBridge
import com.missionwinning.core.data.AuthRepository
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.data.SyncScheduler
import com.missionwinning.feature.active.HealthConnectExportBridge
import com.missionwinning.feature.auth.CrashReportingBridge
import com.missionwinning.feature.auth.HealthConnectAccountBridge
import com.missionwinning.feature.today.HealthConnectStepsBridge
import androidx.health.connect.client.PermissionController
import dagger.hilt.android.HiltAndroidApp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltAndroidApp
class MwApp : Application() {
    @Inject lateinit var authRepository: AuthRepository
    @Inject lateinit var syncScheduler: SyncScheduler
    @Inject lateinit var repository: MwRepository

    private val appScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private lateinit var wearBridge: WearSessionBridge

    override fun onCreate() {
        super.onCreate()
        syncScheduler.ensurePeriodic()
        wearBridge = WearSessionBridge(this).also { it.start() }
        val hc = HealthConnectWriter(this)
        HealthConnectExportBridge.writer = { exp ->
            hc.writeExerciseSession(
                title = exp.title,
                durationSeconds = exp.durationSeconds,
                totalVolume = exp.totalVolume,
                setCount = exp.setCount,
                weightUnit = exp.weightUnit,
            )
        }
        HealthConnectStepsBridge.reader = { hc.readStepsToday() }
        HealthConnectAccountBridge.isAvailable = { hc.isAvailable() }
        HealthConnectAccountBridge.requiredWritePermissions = { hc.requiredPermissions() }
        HealthConnectAccountBridge.requiredPermissionsWithSteps = { hc.requiredPermissionsWithSteps() }
        HealthConnectAccountBridge.hasWritePermission = { hc.hasWritePermission() }
        HealthConnectAccountBridge.createPermissionContract = {
            PermissionController.createRequestPermissionResultContract()
        }
        CrashReportingBridge.isConfigured = { CrashReporting.isConfigured() }
        CrashReportingBridge.setEnabled = { enabled ->
            CrashReporting.setEnabled(this@MwApp, enabled)
        }
        appScope.launch {
            runCatching {
                // Crash reporting default ON when DSN present; respect Account toggle
                val crashOn = repository.crashReportingEnabled()
                CrashReporting.init(this@MwApp, userEnabled = crashOn)
            }
            runCatching { authRepository.bootstrap() }
            if (!authRepository.accessTokenOrNull().isNullOrBlank()) {
                syncScheduler.enqueueNow()
            }
            runCatching {
                repository.maybeSendWeeklyHeartbeat(
                    appVersion = "${BuildConfig.VERSION_NAME}+${BuildConfig.VERSION_CODE}",
                )
            }
        }
    }
}
