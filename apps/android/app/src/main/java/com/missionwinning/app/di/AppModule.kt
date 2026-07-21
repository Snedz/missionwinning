package com.missionwinning.app.di

import android.content.Context
import com.missionwinning.app.BuildConfig
import com.missionwinning.core.data.MwDatabase
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.network.MobileApiClient
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): MwDatabase =
        MwDatabase.get(context)

    @Provides
    @Singleton
    fun provideApiClient(): MobileApiClient {
        val cookie = BuildConfig.PRIVATE_ACCESS_COOKIE.takeIf { it.isNotBlank() }
        return MobileApiClient(
            baseUrl = BuildConfig.API_BASE_URL,
            privateAccessCookie = cookie,
        )
    }

    @Provides
    @Singleton
    fun provideRepository(db: MwDatabase, api: MobileApiClient): MwRepository =
        MwRepository(db, api)
}
