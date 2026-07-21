package com.missionwinning.core.data

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import dagger.hilt.EntryPoint
import dagger.hilt.InstallIn
import dagger.hilt.android.EntryPointAccessors
import dagger.hilt.components.SingletonComponent

/**
 * Background sync when connected. Max retries handled by WorkManager + SyncEngine ceiling.
 */
class SyncWorker(
    appContext: Context,
    params: WorkerParameters,
) : CoroutineWorker(appContext, params) {

    @EntryPoint
    @InstallIn(SingletonComponent::class)
    interface SyncEntryPoint {
        fun syncEngine(): SyncEngine
        fun authRepository(): AuthRepository
    }

    override suspend fun doWork(): Result {
        return try {
            val entry = EntryPointAccessors.fromApplication(
                applicationContext,
                SyncEntryPoint::class.java,
            )
            // Skip when signed out
            if (entry.authRepository().accessTokenOrNull().isNullOrBlank()) {
                return Result.success()
            }
            entry.syncEngine().syncAll()
            Result.success()
        } catch (_: Exception) {
            if (runAttemptCount >= SyncEngine.MAX_ATTEMPTS) {
                Result.failure()
            } else {
                Result.retry()
            }
        }
    }
}
