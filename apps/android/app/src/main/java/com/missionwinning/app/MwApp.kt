package com.missionwinning.app

import android.app.Application
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.network.MobileApiClient

class MwApp : Application() {
    lateinit var repository: MwRepository
        private set

    override fun onCreate() {
        super.onCreate()
        val cookie = BuildConfig.PRIVATE_ACCESS_COOKIE.takeIf { it.isNotBlank() }
        val api = MobileApiClient(
            baseUrl = BuildConfig.API_BASE_URL,
            privateAccessCookie = cookie,
        )
        repository = MwRepository(this, api)
    }
}
