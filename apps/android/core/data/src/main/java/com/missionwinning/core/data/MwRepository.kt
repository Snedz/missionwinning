package com.missionwinning.core.data

import com.missionwinning.core.network.CoachPlanResponseDto
import com.missionwinning.core.network.MobileApiClient

/**
 * Product-facing data façade.
 *
 * Implementation is split across focused repositories for scale:
 * [PrefsRepository], [CoachPlanRepository], [WorkoutRepository],
 * [RoutineRepository], [SyncCoordinator]. ViewModels keep injecting this type.
 */
class MwRepository(
    private val prefs: PrefsRepository,
    private val coach: CoachPlanRepository,
    private val workouts: WorkoutRepository,
    private val routines: RoutineRepository,
    private val sync: SyncCoordinator,
) {

    // —— Prefs ——
    suspend fun isIdayDone(): Boolean = prefs.isIdayDone()
    suspend fun markIdayDone() = prefs.markIdayDone()
    suspend fun crashReportingEnabled(): Boolean = prefs.crashReportingEnabled()
    suspend fun setCrashReportingEnabled(enabled: Boolean) = prefs.setCrashReportingEnabled(enabled)
    suspend fun telemetryOptIn(): Boolean = prefs.telemetryOptIn()
    suspend fun setTelemetryOptIn(enabled: Boolean) = prefs.setTelemetryOptIn(enabled)
    suspend fun healthConnectExportEnabled(): Boolean = prefs.healthConnectExportEnabled()
    suspend fun setHealthConnectExportEnabled(enabled: Boolean) =
        prefs.setHealthConnectExportEnabled(enabled)
    suspend fun ensureInstallId(): String = prefs.ensureInstallId()
    suspend fun maybeSendWeeklyHeartbeat(appVersion: String): Boolean =
        prefs.maybeSendWeeklyHeartbeat(appVersion)
    suspend fun weightUnit(): String = prefs.weightUnit()
    suspend fun setWeightUnit(unit: String) = prefs.setWeightUnit(unit)
    suspend fun defaultRestSeconds(): Int = prefs.defaultRestSeconds()
    suspend fun setDefaultRestSeconds(seconds: Int) = prefs.setDefaultRestSeconds(seconds)
    suspend fun restVibrateEnabled(): Boolean = prefs.restVibrateEnabled()
    suspend fun setRestVibrateEnabled(enabled: Boolean) = prefs.setRestVibrateEnabled(enabled)
    suspend fun restBeepEnabled(): Boolean = prefs.restBeepEnabled()
    suspend fun setRestBeepEnabled(enabled: Boolean) = prefs.setRestBeepEnabled(enabled)
    suspend fun equipmentProfile(): String = prefs.equipmentProfile()
    suspend fun setEquipmentProfile(profile: String) = prefs.setEquipmentProfile(profile)

    // —— Coach ——
    suspend fun setEquipmentAndReseed(profile: String): CoachPlanResponseDto =
        coach.setEquipmentAndReseed(profile)
    suspend fun ensureCoachPlan(preferNetwork: Boolean = true): CoachPlanResponseDto =
        coach.ensureCoachPlan(preferNetwork)
    suspend fun seedAdaptDemo(): CoachPlanResponseDto = coach.seedAdaptDemo()
    suspend fun markSessionDone(sessionId: String): CoachPlanResponseDto =
        coach.markSessionDone(sessionId)
    suspend fun forceReseedPlan(): CoachPlanResponseDto = coach.forceReseedPlan()

    // —— Workouts ——
    suspend fun previousSet(exerciseId: String, setIndex: Int): SetLogEntity? =
        workouts.previousSet(exerciseId, setIndex)
    suspend fun finishWorkout(
        workoutName: String,
        durationSeconds: Int,
        sets: List<SetLogEntity>,
        sessionId: String?,
    ): FinishWorkoutResult = workouts.finishWorkout(workoutName, durationSeconds, sets, sessionId)
    suspend fun workoutById(id: String): WorkoutLogEntity? = workouts.workoutById(id)
    suspend fun setsForWorkout(workoutId: String): List<SetLogEntity> =
        workouts.setsForWorkout(workoutId)
    suspend fun recentWeightedSets(limit: Int = 500): List<SetLogEntity> =
        workouts.recentWeightedSets(limit)
    suspend fun workoutCount(): Int = workouts.workoutCount()
    suspend fun recentWorkouts(limit: Int = 5): List<WorkoutLogEntity> =
        workouts.recentWorkouts(limit)
    suspend fun workoutsSince(sinceIso: String): List<WorkoutLogEntity> =
        workouts.workoutsSince(sinceIso)
    suspend fun workoutStreakDays(): Int = workouts.workoutStreakDays()

    // —— Routines ——
    suspend fun allRoutines(): List<RoutineEntity> = routines.allRoutines()
    suspend fun routineById(id: String): RoutineEntity? = routines.routineById(id)
    suspend fun deleteRoutine(id: String) = routines.deleteRoutine(id)
    fun parseRoutineExercises(exercisesJson: String): List<RoutineExerciseDto> =
        routines.parseRoutineExercises(exercisesJson)
    suspend fun saveRoutineFromWorkout(workoutId: String, nameOverride: String? = null): String? =
        routines.saveRoutineFromWorkout(workoutId, nameOverride)

    // —— Sync ——
    suspend fun pendingSyncCount(): Int = sync.pendingSyncCount()
    suspend fun outboxStatus(): OutboxStatus = sync.outboxStatus()
    suspend fun flushOutboxAndCount(): Int = sync.flushOutboxAndCount()
    suspend fun flushOutbox() = sync.flushOutbox()
    suspend fun syncNow(): Int = sync.syncNow()

    companion object {
        /**
         * Lightweight construction for widgets / tests without Hilt
         * (single shared Prefs + SyncCoordinator graph).
         */
        fun create(
            db: MwDatabase,
            api: MobileApiClient? = null,
            syncEngine: SyncEngine? = null,
        ): MwRepository {
            val prefs = PrefsRepository(db, api)
            val sync = SyncCoordinator(db, api, syncEngine)
            return MwRepository(
                prefs = prefs,
                coach = CoachPlanRepository(db, api, prefs),
                workouts = WorkoutRepository(db, prefs, sync),
                routines = RoutineRepository(db, sync),
                sync = sync,
            )
        }

        const val KEY_IDAY = "iday_done"
        const val KEY_WEIGHT_UNIT = "weight_unit"
        const val KEY_EQUIPMENT = "equipment_profile"
        const val KEY_DEFAULT_REST = "default_rest_seconds"
        const val KEY_REST_VIBRATE = "rest_vibrate"
        const val KEY_REST_BEEP = "rest_beep"
        const val KEY_CRASH_REPORTING = "crash_reporting"
        const val KEY_TELEMETRY_OPT_IN = "telemetry_opt_in"
        const val KEY_INSTALL_ID = "install_id"
        const val KEY_LAST_HEARTBEAT_WEEK = "telemetry_last_week"
        const val KEY_HEALTH_CONNECT = "health_connect_export"
        const val KIND_WORKOUT = "workout"
        const val DEFAULT_API_BASE = "https://www.missionwinning.com"

        /** @see SessionIds.ROUTINE_SESSION_PREFIX */
        const val ROUTINE_SESSION_PREFIX = SessionIds.ROUTINE_SESSION_PREFIX
        /** @see SessionIds.FREEFORM_SESSION_PREFIX */
        const val FREEFORM_SESSION_PREFIX = SessionIds.FREEFORM_SESSION_PREFIX

        fun currentIsoWeekKey(
            now: java.time.LocalDate = java.time.LocalDate.now(),
        ): String {
            val week = now.get(java.time.temporal.WeekFields.ISO.weekOfWeekBasedYear())
            val year = now.get(java.time.temporal.WeekFields.ISO.weekBasedYear())
            return "%04d-W%02d".format(year, week)
        }

        fun isRoutineSession(sessionId: String): Boolean = SessionIds.isRoutineSession(sessionId)
        fun isFreeformSession(sessionId: String): Boolean = SessionIds.isFreeformSession(sessionId)
        fun isCoachSession(sessionId: String): Boolean = SessionIds.isCoachSession(sessionId)
        fun routineSessionId(routineId: String): String = SessionIds.routineSessionId(routineId)
        fun freeformSessionId(): String = SessionIds.freeformSessionId()
        fun routineIdFromSession(sessionId: String): String? = SessionIds.routineIdFromSession(sessionId)

        fun normalizeRestSeconds(seconds: Int): Int = when {
            seconds <= 45 -> 45
            seconds <= 60 -> 60
            seconds <= 90 -> 90
            else -> 120
        }
    }
}
