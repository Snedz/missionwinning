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
