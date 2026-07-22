import type { Page } from '@playwright/test';

/**
 * Seed legacy onboarding flags so JourneyGuard allows app routes (profile, etc.).
 * Also plants a complete today's mind check-in so Active does not open
 * SessionCheckInSheet (full-viewport overlay that intercepts Finish / picker clicks).
 */
export async function seedLegacyOnboarding(page: Page): Promise<void> {
  await page.goto('/welcome', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('mw_experience', 'beginner');
    localStorage.setItem('mw_equipment', 'bodyweight');
    localStorage.setItem('mw_primary_goal', 'goal:general');
    localStorage.setItem('mw_goals', 'goal:general');
    // Local YYYY-MM-DD — matches todayCheckInDate in mindCheckIns (not UTC ISO).
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    localStorage.setItem(
      'mw_mind_checkins',
      JSON.stringify([{ date: today, sleep: 3, mood: 3, stress: 3, energy: 3 }])
    );
  });
}

/**
 * Seed readiness-phase journey so Today shows Mission Score chrome
 * (basic phase alone does not render the score ring).
 *
 * Also plant live evidence for basic milestones — `syncJourneyPhase` re-detects
 * fuel/move/mind/learn from storage and would demote to basic without them.
 */
export async function seedReadinessPhase(page: Page): Promise<void> {
  await page.goto('/welcome', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('mw_experience', 'beginner');
    localStorage.setItem('mw_equipment', 'bodyweight');
    localStorage.setItem('mw_primary_goal', 'goal:general');
    localStorage.setItem('mw_goals', 'goal:general');
    const nowIso = new Date().toISOString();
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    localStorage.setItem(
      'mw_nutrition_log',
      JSON.stringify([{ date: today, name: 'seed meal', protein: 40, cals: 400 }])
    );
    localStorage.setItem(
      'mw_pillar_wins',
      JSON.stringify([
        { id: 'seed-move', pillar: 'move', title: 'Seed move', completedAt: nowIso },
        { id: 'seed-mind', pillar: 'mind', title: 'Seed mind', completedAt: nowIso },
      ])
    );
    // Valid MindCheckIn shape (date + 1–5 ratings) — `{ at }` was dropped by loadCheckIns.
    localStorage.setItem(
      'mw_mind_checkins',
      JSON.stringify([{ date: today, sleep: 3, mood: 3, stress: 3, energy: 3 }])
    );
    localStorage.setItem('mw_learn_completed', JSON.stringify(['seed-lesson']));
    localStorage.setItem('mw_guidebook_progress', JSON.stringify(['seed-section']));
    localStorage.setItem('mw_last_assessment', JSON.stringify({ risk: 'low', date: today }));
    localStorage.setItem(
      'mw_journey_state',
      JSON.stringify({
        phase: 'readiness',
        iDay: { startedAt: nowIso, acceptedMissionAt: nowIso, completedAt: nowIso },
        basic: { workout: true, fuel: true, move: true, mind: true, learn: true },
        readiness: { parq: true, streakMet: false, winScoreSeen: true },
      })
    );
  });
}
