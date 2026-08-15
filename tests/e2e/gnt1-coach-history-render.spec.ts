import { readFileSync } from 'node:fs';
import { test, expect, type Browser, type Page } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';
import { gotoHydrated } from './helpers/gotoHydrated';
import {
  mondayMorningUncontended,
  seedLoggerCoachHistory,
  type LoggerHistoryKind,
} from './helpers/seedLoggerCoachHistory';

/**
 * GNT-1 U3 R2 — two logger histories must paint different dose/adapt on
 * `/coach` and `/log`. Engine pin stays `gnt1HistoryDose.test.ts`. This file
 * is the render instrument. Viewport is the project default 390×844.
 */

type HistoryPaint = {
  kind: LoggerHistoryKind;
  coachDose: string;
  todayDose: string;
  mobilityCount: number;
  cite: string | null;
  planWasAbsentBeforeGenerate: boolean;
};

async function openTodayDose(page: Page) {
  const todayDose = page.getByTestId('today-coach-week-dose');
  if (await todayDose.isVisible().catch(() => false)) return todayDose;

  const details = page.getByText(/today details/i).first();
  if (await details.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await details.click();
  }
  return todayDose;
}

async function paintHistory(
  browser: Browser,
  baseURL: string,
  kind: LoggerHistoryKind
): Promise<HistoryPaint> {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  try {
    const unlocked = await unlockGate(page, context, baseURL);
    if (gateRequired() && !unlocked) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }

    await page.clock.setFixedTime(mondayMorningUncontended());
    await page.goto('/welcome', { waitUntil: 'domcontentloaded' });
    await seedLoggerCoachHistory(page, kind);

    const planBefore = await page.evaluate(() => localStorage.getItem('mw_coach_plan'));
    expect(planBefore, `${kind}: helper must not plant mw_coach_plan`).toBeNull();

    await page.goto('/coach', { waitUntil: 'domcontentloaded' });
    const coachDose = page.getByTestId('coach-week-dose');
    const generateDock = page.getByTestId('coach-generate-dock');
    await Promise.race([
      coachDose.waitFor({ state: 'visible', timeout: 15_000 }),
      generateDock.waitFor({ state: 'visible', timeout: 15_000 }),
    ]).catch(() => undefined);
    if (
      (await generateDock.isVisible().catch(() => false)) &&
      !(await coachDose.isVisible().catch(() => false))
    ) {
      await generateDock.click();
    }
    await expect(coachDose, `${kind} /coach dose`).toBeVisible({ timeout: 15_000 });
    const coachDoseText = (await coachDose.innerText()).trim();
    const mobilityCount = await page.getByText(/^mobility$/i).count();
    const citeNode = page.locator('[data-mw-coach-cite]').first();
    await expect(citeNode, `${kind} /coach log cite`).toBeVisible({ timeout: 10_000 });
    const cite = await citeNode.getAttribute('data-mw-coach-cite');

    await gotoHydrated(page, '/log');
    const todayDose = await openTodayDose(page);
    await expect(todayDose, `${kind} /log dose`).toBeVisible({ timeout: 15_000 });

    return {
      kind,
      coachDose: coachDoseText,
      todayDose: (await todayDose.innerText()).trim(),
      mobilityCount,
      cite,
      planWasAbsentBeforeGenerate: planBefore === null,
    };
  } finally {
    await context.close();
  }
}

test('helper never plants mw_coach_plan', () => {
  const src = readFileSync(
    path.join(process.cwd(), 'tests/e2e/helpers/seedLoggerCoachHistory.ts'),
    'utf8'
  );
  expect(src).toMatch(/removeItem\(\s*'mw_coach_plan'/);
  expect(src).not.toMatch(/setItem\(\s*'mw_coach_plan'/);
  expect(src).not.toMatch(/seed-coach-adapt-demo/);
});

test('two logger histories render different Coach and Today dose', async ({
  browser,
  baseURL,
}) => {
  if (!baseURL) throw new Error('baseURL required');

  const cold = await paintHistory(browser, baseURL, 'cold');
  const strained = await paintHistory(browser, baseURL, 'strained');

  console.log(`gnt1_u3_history_a_coach_dose=${JSON.stringify(cold.coachDose)}`);
  console.log(`gnt1_u3_history_b_coach_dose=${JSON.stringify(strained.coachDose)}`);
  console.log(`gnt1_u3_history_a_today_dose=${JSON.stringify(cold.todayDose)}`);
  console.log(`gnt1_u3_history_b_today_dose=${JSON.stringify(strained.todayDose)}`);
  console.log(`gnt1_u3_history_a_mobility=${cold.mobilityCount}`);
  console.log(`gnt1_u3_history_b_mobility=${strained.mobilityCount}`);
  console.log(`gnt1_u3_history_a_cite=${cold.cite}`);
  console.log(`gnt1_u3_history_b_cite=${strained.cite}`);

  expect(cold.planWasAbsentBeforeGenerate).toBe(true);
  expect(strained.planWasAbsentBeforeGenerate).toBe(true);

  expect(cold.coachDose.length).toBeGreaterThan(0);
  expect(strained.coachDose.length).toBeGreaterThan(0);
  expect(cold.coachDose, 'Coach dose must move with history').not.toBe(strained.coachDose);
  expect(cold.todayDose, 'Today dose must move with history').not.toBe(strained.todayDose);

  expect(cold.mobilityCount, 'cold week stays off recovery chrome').toBe(0);
  expect(strained.mobilityCount, 'high-strain week shows recovery on the strip').toBeGreaterThan(
    0
  );

  expect(cold.cite).toBe('no-logs');
  expect(strained.cite).toBe('set');
});
