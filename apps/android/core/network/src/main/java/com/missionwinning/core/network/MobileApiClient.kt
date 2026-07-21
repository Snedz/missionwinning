package com.missionwinning.core.network

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

class MobileApiClient(
    private val baseUrl: String,
    /** Live token reader — never caches; AuthRepository owns refresh. */
    private val tokenProvider: () -> String? = { null },
    /** Optional `mw_private_access` cookie for PRIVATE_MODE www until public flip. */
    private val privateAccessCookie: String? = null,
) {
    private val client: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()
    private val json = Json { ignoreUnknownKeys = true; isLenient = true }
    private val media = "application/json".toMediaType()

    suspend fun fetchPremiumStatus(): Result<PremiumStatusDto> = withContext(Dispatchers.IO) {
        runCatching {
            val req = requestBuilder("/api/mobile/premium/status")
                .get()
                .build()
            client.newCall(req).execute().use { resp ->
                if (!resp.isSuccessful) error("premium/status ${resp.code}")
                json.decodeFromString<PremiumStatusDto>(resp.body!!.string())
            }
        }
    }

    suspend fun pushWorkouts(workouts: List<SyncWorkoutDto>): Result<SyncPushResponseDto> =
        withContext(Dispatchers.IO) {
            runCatching {
                val payload = json.encodeToString(SyncPushRequestDto(workouts = workouts))
                val req = requestBuilder("/api/mobile/sync/workouts")
                    .post(payload.toRequestBody(media))
                    .build()
                client.newCall(req).execute().use { resp ->
                    if (!resp.isSuccessful) error("sync push ${resp.code}")
                    json.decodeFromString<SyncPushResponseDto>(resp.body!!.string())
                }
            }
        }

    suspend fun pullWorkouts(since: String, limit: Int = 100): Result<SyncPullResponseDto> =
        withContext(Dispatchers.IO) {
            runCatching {
                val q = java.net.URLEncoder.encode(since, Charsets.UTF_8.name())
                val req = requestBuilder("/api/mobile/sync/workouts?since=$q&limit=$limit")
                    .get()
                    .build()
                client.newCall(req).execute().use { resp ->
                    if (!resp.isSuccessful) error("sync pull ${resp.code}")
                    json.decodeFromString<SyncPullResponseDto>(resp.body!!.string())
                }
            }
        }

    suspend fun fetchCoachPlan(
        equipment: String = "bodyweight",
        adaptDemo: Boolean = false,
    ): Result<CoachPlanResponseDto> = withContext(Dispatchers.IO) {
        runCatching {
            val demo = if (adaptDemo) "1" else "0"
            val req = requestBuilder("/api/mobile/coach/plan?equipment=$equipment&adaptDemo=$demo")
                .get()
                .build()
            client.newCall(req).execute().use { resp ->
                if (!resp.isSuccessful) error("coach/plan ${resp.code}")
                json.decodeFromString<CoachPlanResponseDto>(resp.body!!.string())
            }
        }
    }

    suspend fun postCoachPlan(
        equipment: String = "bodyweight",
        withAdaptDemo: Boolean = false,
    ): Result<CoachPlanResponseDto> = withContext(Dispatchers.IO) {
        runCatching {
            val body = """{"equipment":"$equipment","withAdaptDemo":$withAdaptDemo}"""
            val req = requestBuilder("/api/mobile/coach/plan")
                .post(body.toRequestBody(media))
                .build()
            client.newCall(req).execute().use { resp ->
                if (!resp.isSuccessful) error("coach/plan POST ${resp.code}")
                json.decodeFromString<CoachPlanResponseDto>(resp.body!!.string())
            }
        }
    }

    suspend fun adaptPlan(plan: CoachPlanDto, sessionId: String): Result<CoachPlanResponseDto> =
        withContext(Dispatchers.IO) {
            runCatching {
                val payload = json.encodeToString(
                    AdaptRequest(plan = plan, sessionId = sessionId),
                )
                val req = requestBuilder("/api/mobile/coach/adapt")
                    .post(payload.toRequestBody(media))
                    .build()
                client.newCall(req).execute().use { resp ->
                    if (!resp.isSuccessful) error("coach/adapt ${resp.code}")
                    json.decodeFromString<CoachPlanResponseDto>(resp.body!!.string())
                }
            }
        }

    suspend fun logWorkout(
        workoutName: String,
        durationSeconds: Int,
        setCount: Int,
        totalVolume: Double,
        sessionId: String? = null,
    ): Result<WorkoutAckDto> = withContext(Dispatchers.IO) {
        runCatching {
            val payload = json.encodeToString(
                WorkoutLogRequestDto(
                    workoutName = workoutName,
                    durationSeconds = durationSeconds,
                    setCount = setCount,
                    totalVolume = totalVolume,
                    sessionId = sessionId,
                ),
            )
            val req = requestBuilder("/api/mobile/workouts")
                .post(payload.toRequestBody(media))
                .build()
            client.newCall(req).execute().use { resp ->
                if (!resp.isSuccessful) error("workouts ${resp.code}")
                json.decodeFromString<WorkoutAckDto>(resp.body!!.string())
            }
        }
    }

    private fun requestBuilder(path: String): Request.Builder {
        val b = Request.Builder().url(baseUrl.trimEnd('/') + path)
        val token = tokenProvider()?.takeIf { it.isNotBlank() }
        if (token != null) {
            b.header("Authorization", "Bearer $token")
        }
        if (!privateAccessCookie.isNullOrBlank()) {
            b.header("Cookie", "mw_private_access=$privateAccessCookie")
        }
        return b
    }
}

@kotlinx.serialization.Serializable
private data class AdaptRequest(val plan: CoachPlanDto, val sessionId: String)

@kotlinx.serialization.Serializable
data class WorkoutLogRequestDto(
    val workoutName: String,
    val durationSeconds: Int,
    val setCount: Int,
    val totalVolume: Double,
    val sessionId: String? = null,
)

@kotlinx.serialization.Serializable
data class WorkoutAckDto(
    val ok: Boolean = true,
    val synced: Boolean = false,
    val id: String = "",
    val workoutName: String = "",
    val completedAt: String = "",
    val syncError: String? = null,
)
