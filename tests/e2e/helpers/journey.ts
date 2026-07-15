import type { Page } from '@playwright/test';

/** Seed legacy onboarding flags so JourneyGuard allows app routes (profile, etc.). */
export async function seedLegacyOnboarding(page: Page): Promise<void> {
  await page.goto('/welcome', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('mw_experience', 'beginner');
    localStorage.setItem('mw_equipment', 'bodyweight');
    localStorage.setItem('mw_primary_goal', 'goal:general');
    localStorage.setItem('mw_goals', 'goal:general');
  });
}

/**
 * Seed readiness-phase journey so Today shows Mission Score chrome
 * (basic phase alone does not render the score ring).
 */
export async function seedReadinessPhase(page: Page): Promise<void> {
  await page.goto('/welcome', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('mw_experience', 'beginner');
    localStorage.setItem('mw_equipment', 'bodyweight');
    localStorage.setItem('mw_primary_goal', 'goal:general');
    localStorage.setItem('mw_goals', 'goal:general');
    const now = new Date().toISOString();
    localStorage.setItem(
      'mw_journey_state',
      JSON.stringify({
        phase: 'readiness',
        iDay: { startedAt: now, acceptedMissionAt: now, completedAt: now },
        basic: { workout: true, fuel: true, move: true, mind: true, learn: true },
        readiness: { parq: true, streakMet: false, winScoreSeen: false },
      })
    );
  });
}
