package com.missionwinning.app

import android.app.Application
import com.missionwinning.app.crash.CrashReporting
import com.missionwinning.core.data.AuthRepository
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.data.SyncScheduler
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

    override fun onCreate() {
        super.onCreate()
        syncScheduler.ensurePeriodic()
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
