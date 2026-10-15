package com.missionwinning.feature.active

import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Health Connect export is opt-in and must never take the local log down.
 *
 * There is no device-free way to grant a real Health Connect permission, so the
 * seam that matters is the bridge: :app registers the real writer at process
 * start, and everything below it must degrade to `false` rather than throw when
 * the writer is absent or the platform refuses. That is the "deny the
 * permission and the log still saves" path, proven here with a mock.
 */
class HealthConnectExportBridgeTest {

    @After
    fun clearWriter() {
        HealthConnectExportBridge.writer = null
    }

    @Test
    fun noWriterRegistered_isFalseAndDoesNotThrow() = runBlocking {
        HealthConnectExportBridge.writer = null
        assertFalse(HealthConnectExportBridge.write(title = "Legs", durationSeconds = 600))
    }

    @Test
    fun writerReturningTrue_reportsSuccess() = runBlocking {
        HealthConnectExportBridge.writer = { true }
        assertTrue(HealthConnectExportBridge.write(title = "Legs", durationSeconds = 600))
    }

    @Test
    fun writerReturningFalse_isPropagatedAsFalse() = runBlocking {
        HealthConnectExportBridge.writer = { false }
        assertFalse(HealthConnectExportBridge.write(title = "Legs", durationSeconds = 600))
    }

    @Test
    fun writerThrowing_becomesFalseSoTheWorkoutStillSaves() = runBlocking {
        // What Health Connect actually does when the permission was revoked or
        // the provider is unavailable: insertRecords throws. The local log must
        // not depend on that call succeeding.
        HealthConnectExportBridge.writer = { throw IllegalStateException("permission revoked") }
        assertFalse(HealthConnectExportBridge.write(title = "Legs", durationSeconds = 600))
    }

    @Test
    fun sessionFieldsReachTheWriterUnchanged() = runBlocking {
        var seen: HealthConnectExportBridge.SessionExport? = null
        HealthConnectExportBridge.writer = { exp ->
            seen = exp
            true
        }
        HealthConnectExportBridge.write(
            title = "Legs + hinge",
            durationSeconds = 812,
            totalVolume = 1234.0,
            setCount = 3,
            weightUnit = "kg",
        )
        val exp = requireNotNull(seen) { "writer was never called" }
        assertEquals("Legs + hinge", exp.title)
        assertEquals(812, exp.durationSeconds)
        assertEquals(1234.0, exp.totalVolume, 0.001)
        assertEquals(3, exp.setCount)
        assertEquals("kg", exp.weightUnit)
    }

    @Test
    fun defaults_areSafe_whenTheExportCarriesNothingExtra() = runBlocking {
        var seen: HealthConnectExportBridge.SessionExport? = null
        HealthConnectExportBridge.writer = { exp ->
            seen = exp
            true
        }
        HealthConnectExportBridge.write(title = "Quick log", durationSeconds = 300)
        val exp = requireNotNull(seen) { "writer was never called" }
        assertEquals(0.0, exp.totalVolume, 0.001)
        assertEquals(0, exp.setCount)
        assertEquals("kg", exp.weightUnit)
    }
}