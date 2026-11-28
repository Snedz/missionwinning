package com.missionwinning.app.preview

import android.content.Intent
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.By
import androidx.test.uiautomator.UiDevice
import androidx.test.uiautomator.Until
import com.missionwinning.app.MainActivity
import com.missionwinning.app.nav.RepoEntryPoint
import com.missionwinning.core.data.MwDatabase
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.data.SessionDraftRepository
import com.missionwinning.core.data.SetLogEntity
import dagger.hilt.android.EntryPointAccessors
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import java.time.Instant
import java.util.UUID
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import kotlin.math.roundToInt

@RunWith(AndroidJUnit4::class)
class ShellUpgradeTest {
    private val instrumentation = InstrumentationRegistry.getInstrumentation()
    private val context = instrumentation.targetContext
    private val device = UiDevice.getInstance(instrumentation)

    @After fun resetPreview() {
        context.getSharedPreferences(ShellPreview.PREFERENCES, 0).edit().clear().commit()
    }

    @Test fun legacyGuestWorkoutAndDraftLoadAfterOptInAndLegacyStillOpens() {
        val label = UUID.randomUUID().toString().take(7)
        val workout = "Saved guest $label"
        val draft = "Guest draft $label"
        val repository = EntryPointAccessors.fromApplication(context.applicationContext, RepoEntryPoint::class.java)
        context.getSharedPreferences(ShellPreview.PREFERENCES, 0).edit().clear().commit()
        runBlocking {
            val sessionId = MwRepository.freeformSessionId()
            repository.repository().markIdayDone()
            repository.repository().finishWorkout(
                workout, 60,
                listOf(SetLogEntity("saved-$label", "goblet-squat", "Goblet squat", 0, 10, 22.5, Instant.now().toString(), sessionId)),
                sessionId,
            )
            val pending = SessionDraftRepository.DraftSet("draft-$label", "goblet-squat", "Goblet squat", 0, 9, 27.5)
            repository.drafts().save(SessionDraftRepository.DraftPayload(
                MwRepository.freeformSessionId(), draft, System.currentTimeMillis(), "kg",
                exercises = listOf(SessionDraftRepository.DraftExercise("goblet-squat", "Goblet squat", listOf(pending))),
            ))
        }
        launch()
        await("Today")
        assertFalse(device.hasObject(By.text("MISSION WINNING / 01")))

        launch(preview = true)
        await("MISSION WINNING / 01")
        val minTargetPx = (48 * context.resources.displayMetrics.density).roundToInt()
        val todayTab = checkNotNull(device.findObjects(By.text("Today")).firstNotNullOfOrNull { label ->
            generateSequence(label) { it.parent }.firstOrNull { it.isSelected }
        })
        assertTrue(todayTab.visibleBounds.height() >= minTargetPx)
        val resume = await("Resume workout")
        val resumeTarget = checkNotNull(generateSequence(resume) { it.parent }.firstOrNull { it.isClickable })
        assertTrue(resumeTarget.visibleBounds.height() >= minTargetPx)
        resume.click()
        await("SET BY SET / 02")
        await(draft)
        await("Set 1 of 1 for this exercise")
        await("27.5")
        await("9")
        device.pressBack()
        await("Leave workout").click()
        await("MISSION WINNING / 01")
        await("Open history").click()
        await("WORKOUT LOG / 05")
        await("View $workout").click()
        await("Set 1 · 22.5 kg × 10")

        launch(preview = false)
        await("Today")
        assertFalse(device.hasObject(By.text("MISSION WINNING / 01")))
        assertTrue(device.hasObject(By.desc("Account tab")))
        runBlocking {
            assertTrue(repository.drafts().load()?.workoutName == draft)
            assertTrue(repository.repository().recentWorkouts().any { it.workoutName == workout })
        }

        launch(preview = true)
        await("Resume workout").click()
        await("Complete set").click()
        await("Finish workout").click()
        await("Workout saved")
        await("Open Coach").click()
        await("THE TRAINING PLAN / 04")
        await("Today").click()
        await("MISSION WINNING / 01")
        assertFalse(device.hasObject(By.text("Workout saved")))
        await("Quick log")
        runBlocking { assertNull(repository.drafts().load()) }
    }

    @Test fun coachResumesTheExistingDraftInsteadOfStartingOver() {
        val entry = seedCompletedDraft()
        launch(preview = true)
        await("Resume workout")
        await("Coach").click()
        await("THE TRAINING PLAN / 04")
        assertFalse(device.hasObject(By.text("Start workout")))
        await("Resume workout").click()
        await("Completed quick-log draft")
        await("Set 1 · 9 reps at 27.5 kg")
        assertTrue(runBlocking { entry.drafts().load()?.exercises?.single()?.sets?.single()?.done == true })
    }

    @Test fun discardingFromPreviewFullControlsClearsTheDraft() {
        val entry = seedCompletedDraft()
        launch(preview = true)
        await("Resume workout").click()
        await("More workout controls").click()
        device.pressBack()
        await("Discard").click()
        await("MISSION WINNING / 01")
        await("Quick log")
        assertNull(runBlocking { entry.drafts().load() })
    }

    @Test fun backCannotLeavePreviewTrainWhileSaving() {
        val entry = seedCompletedDraft()
        launch(preview = true)
        await("Resume workout").click()
        await("SET BY SET / 02")
        val locked = CountDownLatch(1)
        val release = CountDownLatch(1)
        val writer = Thread {
            MwDatabase.get(context).runInTransaction {
                locked.countDown()
                release.await(30, TimeUnit.SECONDS)
                Unit
            }
        }
        writer.start()
        try {
            assertTrue(locked.await(5, TimeUnit.SECONDS))
            await("Finish workout").click()
            await("Saving…")
            device.pressBack()
            assertFalse("Back popped a saving workout", device.wait(Until.gone(By.text("SET BY SET / 02")), 1_000))
        } finally {
            release.countDown()
            writer.join()
        }
        await("Workout saved")
        assertNull(runBlocking { entry.drafts().load() })
    }

    private fun seedCompletedDraft(): RepoEntryPoint {
        val entry = EntryPointAccessors.fromApplication(context.applicationContext, RepoEntryPoint::class.java)
        runBlocking {
            entry.repository().markIdayDone()
            entry.repository().forceReseedPlan()
            entry.drafts().save(SessionDraftRepository.DraftPayload(
                MwRepository.freeformSessionId(), "Completed quick-log draft", System.currentTimeMillis(), "kg",
                exercises = listOf(SessionDraftRepository.DraftExercise(
                    "goblet-squat", "Goblet squat",
                    listOf(SessionDraftRepository.DraftSet("completed-draft", "goblet-squat", "Goblet squat", 0, 9, 27.5, done = true)),
                )),
            ))
        }
        return entry
    }

    private fun launch(preview: Boolean? = null) {
        val intent = Intent(context, MainActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
        if (preview != null) intent.putExtra(ShellPreview.EXTRA, preview)
        context.startActivity(intent)
    }

    private fun await(text: String) =
        checkNotNull(device.wait(Until.findObject(By.text(text)), 10_000)) { "Not visible: $text" }
}
