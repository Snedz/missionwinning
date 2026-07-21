package com.missionwinning.core.data

import com.missionwinning.core.network.MobileApiClient
import java.util.UUID

/**
 * On-device preferences + anonymous telemetry (Room prefs table).
 */
class PrefsRepository(
    private val db: MwDatabase,
    private val api: MobileApiClient?,
) {
    private val dao = db.dao()

    suspend fun isIdayDone(): Boolean = dao.getPref(MwRepository.KEY_IDAY) == "1"

    suspend fun markIdayDone() {
        dao.setPref(PrefEntity(MwRepository.KEY_IDAY, "1"))
    }

    suspend fun crashReportingEnabled(): Boolean =
        dao.getPref(MwRepository.KEY_CRASH_REPORTING) != "0"

    suspend fun setCrashReportingEnabled(enabled: Boolean) {
        dao.setPref(PrefEntity(MwRepository.KEY_CRASH_REPORTING, if (enabled) "1" else "0"))
    }

    suspend fun telemetryOptIn(): Boolean =
        dao.getPref(MwRepository.KEY_TELEMETRY_OPT_IN) == "1"

    suspend fun setTelemetryOptIn(enabled: Boolean) {
        dao.setPref(PrefEntity(MwRepository.KEY_TELEMETRY_OPT_IN, if (enabled) "1" else "0"))
        if (enabled) ensureInstallId()
    }

    suspend fun healthConnectExportEnabled(): Boolean =
        dao.getPref(MwRepository.KEY_HEALTH_CONNECT) == "1"

    suspend fun setHealthConnectExportEnabled(enabled: Boolean) {
        dao.setPref(PrefEntity(MwRepository.KEY_HEALTH_CONNECT, if (enabled) "1" else "0"))
    }

    suspend fun ensureInstallId(): String {
        val existing = dao.getPref(MwRepository.KEY_INSTALL_ID)
        if (!existing.isNullOrBlank()) return existing
        val id = UUID.randomUUID().toString()
        dao.setPref(PrefEntity(MwRepository.KEY_INSTALL_ID, id))
        return id
    }

    suspend fun maybeSendWeeklyHeartbeat(appVersion: String): Boolean {
        if (!telemetryOptIn()) return false
        val week = MwRepository.currentIsoWeekKey()
        if (dao.getPref(MwRepository.KEY_LAST_HEARTBEAT_WEEK) == week) return false
        val client = api ?: return false
        val installId = ensureInstallId()
        val ok = client.postTelemetryHeartbeat(installId, week, appVersion).isSuccess
        if (ok) {
            dao.setPref(PrefEntity(MwRepository.KEY_LAST_HEARTBEAT_WEEK, week))
        }
        return ok
    }

    suspend fun weightUnit(): String = dao.getPref(MwRepository.KEY_WEIGHT_UNIT) ?: "kg"

    suspend fun setWeightUnit(unit: String) {
        dao.setPref(PrefEntity(MwRepository.KEY_WEIGHT_UNIT, unit))
    }

    suspend fun defaultRestSeconds(): Int {
        val raw = dao.getPref(MwRepository.KEY_DEFAULT_REST)?.toIntOrNull() ?: 60
        return MwRepository.normalizeRestSeconds(raw)
    }

    suspend fun setDefaultRestSeconds(seconds: Int) {
        dao.setPref(
            PrefEntity(
                MwRepository.KEY_DEFAULT_REST,
                MwRepository.normalizeRestSeconds(seconds).toString(),
            ),
        )
    }

    suspend fun restVibrateEnabled(): Boolean =
        dao.getPref(MwRepository.KEY_REST_VIBRATE) != "0"

    suspend fun setRestVibrateEnabled(enabled: Boolean) {
        dao.setPref(PrefEntity(MwRepository.KEY_REST_VIBRATE, if (enabled) "1" else "0"))
    }

    suspend fun restBeepEnabled(): Boolean =
        dao.getPref(MwRepository.KEY_REST_BEEP) == "1"

    suspend fun setRestBeepEnabled(enabled: Boolean) {
        dao.setPref(PrefEntity(MwRepository.KEY_REST_BEEP, if (enabled) "1" else "0"))
    }

    suspend fun equipmentProfile(): String =
        LocalCoachSeed.normalizeEquipment(
            dao.getPref(MwRepository.KEY_EQUIPMENT) ?: "bodyweight",
        )

    suspend fun setEquipmentProfile(profile: String) {
        dao.setPref(
            PrefEntity(
                MwRepository.KEY_EQUIPMENT,
                LocalCoachSeed.normalizeEquipment(profile),
            ),
        )
    }

    /** Optional body weight for Progress (free, local-only). */
    suspend fun bodyWeight(): Double? =
        dao.getPref(MwRepository.KEY_BODY_WEIGHT)?.toDoubleOrNull()?.takeIf { it > 0 }

    suspend fun setBodyWeight(value: Double?) {
        if (value == null || value <= 0) {
            dao.setPref(PrefEntity(MwRepository.KEY_BODY_WEIGHT, ""))
        } else {
            dao.setPref(PrefEntity(MwRepository.KEY_BODY_WEIGHT, value.toString()))
        }
    }

    suspend fun bodyWeightUnit(): String =
        dao.getPref(MwRepository.KEY_BODY_WEIGHT_UNIT) ?: weightUnit()

    suspend fun setBodyWeightUnit(unit: String) {
        dao.setPref(
            PrefEntity(
                MwRepository.KEY_BODY_WEIGHT_UNIT,
                if (unit.equals("lb", true)) "lb" else "kg",
            ),
        )
    }

    /** Optional Health Connect steps read for Today (off by default). */
    suspend fun healthConnectStepsReadEnabled(): Boolean =
        dao.getPref(MwRepository.KEY_HEALTH_CONNECT_STEPS) == "1"

    suspend fun setHealthConnectStepsReadEnabled(enabled: Boolean) {
        dao.setPref(PrefEntity(MwRepository.KEY_HEALTH_CONNECT_STEPS, if (enabled) "1" else "0"))
    }
}
