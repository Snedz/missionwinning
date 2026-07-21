package com.missionwinning.app

import android.app.Application
import com.missionwinning.core.data.AuthRepository
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

    private val appScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onCreate() {
        super.onCreate()
        syncScheduler.ensurePeriodic()
        appScope.launch {
            runCatching { authRepository.bootstrap() }
            // Foreground-when-signed-in: attempt sync after bootstrap
            if (!authRepository.accessTokenOrNull().isNullOrBlank()) {
                syncScheduler.enqueueNow()
            }
        }
    }
}
