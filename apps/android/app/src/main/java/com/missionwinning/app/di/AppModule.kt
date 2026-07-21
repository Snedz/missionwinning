package com.missionwinning.app.di

import android.content.Context
import com.missionwinning.app.BuildConfig
import com.missionwinning.core.data.AuthRepository
import com.missionwinning.core.data.MwDatabase
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.data.SyncEngine
import com.missionwinning.core.data.SyncScheduler
import com.missionwinning.core.data.TokenStore
import com.missionwinning.core.network.MobileApiClient
import com.missionwinning.core.network.SupabaseAuthClient
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
    fun provideSupabaseAuthClient(): SupabaseAuthClient =
        SupabaseAuthClient(
            supabaseUrl = BuildConfig.SUPABASE_URL,
            anonKey = BuildConfig.SUPABASE_ANON_KEY,
        )

    @Provides
    @Singleton
    fun provideTokenStore(db: MwDatabase): TokenStore = TokenStore(db)

    /**
     * Api + Auth are co-dependent: api needs tokenProvider, auth needs api for premium.
     * Construct both, then wire tokenProvider via AuthRepository.accessTokenOrNull.
     */
    @Provides
    @Singleton
    fun provideAuthAndApi(
        authClient: SupabaseAuthClient,
        tokenStore: TokenStore,
    ): AuthAndApi {
        val holder = AuthAndApiHolder()
        val api = MobileApiClient(
            baseUrl = BuildConfig.API_BASE_URL,
            tokenProvider = { holder.auth?.accessTokenOrNull() },
            privateAccessCookie = BuildConfig.PRIVATE_ACCESS_COOKIE.takeIf { it.isNotBlank() },
        )
        val auth = AuthRepository(authClient, tokenStore, api)
        holder.auth = auth
        return AuthAndApi(auth = auth, api = api)
    }

    @Provides
    @Singleton
    fun provideApiClient(bundle: AuthAndApi): MobileApiClient = bundle.api

    @Provides
    @Singleton
    fun provideAuthRepository(bundle: AuthAndApi): AuthRepository = bundle.auth

    @Provides
    @Singleton
    fun provideSyncEngine(
        db: MwDatabase,
        api: MobileApiClient,
        auth: AuthRepository,
    ): SyncEngine = SyncEngine(db, api, auth)

    @Provides
    @Singleton
    fun provideRepository(
        db: MwDatabase,
        api: MobileApiClient,
        syncEngine: SyncEngine,
    ): MwRepository = MwRepository(db, api, syncEngine)

    @Provides
    @Singleton
    fun provideSyncScheduler(
        @ApplicationContext context: Context,
    ): SyncScheduler = SyncScheduler(context)
}

/** Package of co-constructed auth + mobile API. */
data class AuthAndApi(
    val auth: AuthRepository,
    val api: MobileApiClient,
)

private class AuthAndApiHolder {
    @Volatile var auth: AuthRepository? = null
}
