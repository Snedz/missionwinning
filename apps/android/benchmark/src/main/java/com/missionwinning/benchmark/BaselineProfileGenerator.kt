package com.missionwinning.benchmark

import androidx.benchmark.macro.junit4.BaselineProfileRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.uiautomator.By
import androidx.test.uiautomator.Direction
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Generates a Baseline Profile for cold start + Today scroll.
 * Run (device/emulator required):
 *   ./gradlew :app:generateBaselineProfile
 */
@RunWith(AndroidJUnit4::class)
class BaselineProfileGenerator {
    @get:Rule
    val baselineProfileRule = BaselineProfileRule()

    @Test
    fun startupAndScroll() = baselineProfileRule.collect(
        packageName = PACKAGE_NAME,
        includeInStartupProfile = true,
    ) {
        pressHome()
        startActivityAndWait()
        device.waitForIdle()
        device.findObject(By.scrollable(true))?.fling(Direction.DOWN)
        device.waitForIdle()
        device.findObject(By.scrollable(true))?.fling(Direction.UP)
        device.waitForIdle()
    }

    companion object {
        const val PACKAGE_NAME = "com.missionwinning.app"
    }
}
