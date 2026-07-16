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
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    localStorage.setItem(
      'mw_nutrition_log',
      JSON.stringify([{ date: today, name: 'seed meal', protein: 40, cals: 400 }])
    );
    localStorage.setItem(
      'mw_pillar_wins',
      JSON.stringify([
        { id: 'seed-move', pillar: 'move', title: 'Seed move', completedAt: now },
        { id: 'seed-mind', pillar: 'mind', title: 'Seed mind', completedAt: now },
      ])
    );
    localStorage.setItem('mw_mind_checkins', JSON.stringify([{ at: now }]));
    localStorage.setItem('mw_learn_completed', JSON.stringify(['seed-lesson']));
    localStorage.setItem('mw_guidebook_progress', JSON.stringify(['seed-section']));
    localStorage.setItem('mw_last_assessment', JSON.stringify({ risk: 'low', date: today }));
    localStorage.setItem(
      'mw_journey_state',
      JSON.stringify({
        phase: 'readiness',
        iDay: { startedAt: now, acceptedMissionAt: now, completedAt: now },
        basic: { workout: true, fuel: true, move: true, mind: true, learn: true },
        readiness: { parq: true, streakMet: false, winScoreSeen: true },
      })
    );
  });
}
