import { readFileSync } from 'node:fs';
import { test, expect, type Browser, type Page } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';
import { gotoHydrated } from './helpers/gotoHydrated';
import { UNCONTENDED_HOUR, fixedTimeAt } from './helpers/fixedClock';
import {
  seedLoggerReentryGap,
  type ReentryGapDays,
} from './helpers/seedLoggerReentryGap';

/**
 * GNT-1 U4 R2 — Today’s quiet line after 3 / 7 / 14 missed days.
 * Copy pin stays `reentryCopyGuard.test.ts`. This file is the render instrument.
 * Viewport is the project default 390×844. Seeds via logger persist, not
 * `seed-coach-adapt-demo.mjs`.
 */

const FORBIDDEN = [
  /you missed/i,
  /broken streak/i,
  /failed/i,
  /guilt/i,
  /lazy/i,
  /you quit/i,
  /most people quit/i,
];

const EXPECTED_LINE: Record<ReentryGapDays, string> = {
  3: "Three days off. Here's the 20-minute version.",
  7: "Seven days off. Here's the 20-minute version.",
  14: "14 days off. Here's the 20-minute version.",
};

async function dumpLogShell(page: Page, days: ReentryGapDays) {
  const info = await page.evaluate(() => {
    let phase = '';
    let hist = 0;
    try {
      phase = JSON.parse(localStorage.getItem('mw_journey_state') || '{}').phase ?? '';
    } catch {
      phase = '';
    }
    try {
      hist =
        JSON.parse(localStorage.getItem('workout-tracker-storage') || '{}').state
          ?.workoutHistory?.length ?? 0;
    } catch {
      hist = 0;
    }
    const dock = document.getElementById('screen-dock');
    return {
      href: location.href,
      title: document.title,
      phase,
      hist,
      plan: !!localStorage.getItem('mw_coach_plan'),
      gap: (window as Window & { __gnt1_u4_gap_days?: number }).__gnt1_u4_gap_days ?? null,
      completedAt:
        (window as Window & { __gnt1_u4_completed_at?: string }).__gnt1_u4_completed_at ??
        null,
      dockText: dock?.innerText?.slice(0, 400) ?? '',
    };
  });
  console.log(`gnt1_u4_diag_${days}=${JSON.stringify(info)}`);
}

async function paintGap(
  browser: Browser,
  baseURL: string,
  days: ReentryGapDays
): Promise<{ days: ReentryGapDays; line: string; url: string; forbidden: number }> {
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

    await page.clock.setFixedTime(fixedTimeAt(UNCONTENDED_HOUR));
    await seedLoggerReentryGap(page, days);
    await gotoHydrated(page, '/log');

    expect(page.url(), `${days}d must stay on Today`).toMatch(/\/log/);
    expect(page.url(), `${days}d must not be the teaser`).not.toMatch(/private/);

    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            try {
              return JSON.parse(localStorage.getItem('mw_journey_state') || '{}').phase ?? '';
            } catch {
              return '';
            }
          }),
        { timeout: 15_000 }
      )
      .not.toBe('i-day');

    const expected = EXPECTED_LINE[days];
    const dock = page.locator('#screen-dock');
    const line = dock.getByRole('status').filter({ hasText: expected });
    try {
      await expect(line, `${days}d quiet line on Today dock`).toBeVisible({ timeout: 15_000 });
    } catch (err) {
      await dumpLogShell(page, days);
      throw err;
    }

    const dockText = ((await dock.innerText().catch(() => '')) || '').trim();
    let forbidden = 0;
    for (const re of FORBIDDEN) {
      if (re.test(dockText)) forbidden += 1;
    }
    expect(forbidden, `${days}d dock stays shame-free`).toBe(0);
    expect(dockText, `${days}d dock has no streak-loss chrome`).not.toMatch(/streak/i);

    const shown = (await line.innerText()).trim();
    console.log(`gnt1_u4_missed_${days}_url=${page.url()}`);
    console.log(`gnt1_u4_missed_${days}_line=${JSON.stringify(shown)}`);
    console.log(`gnt1_u4_missed_${days}_forbidden=${forbidden}`);

    return { days, line: shown, url: page.url(), forbidden };
  } finally {
    await context.close();
  }
}

test('helper never plants mw_coach_plan', () => {
  const src = readFileSync('tests/e2e/helpers/seedLoggerReentryGap.ts', 'utf8');
  expect(src).toMatch(/removeItem\(\s*'mw_coach_plan'/);
  expect(src).not.toMatch(/setItem\(\s*'mw_coach_plan'/);
  expect(src).not.toMatch(/you missed/i);
  expect(src).not.toMatch(/broken streak/i);
});

test('render spec names 3 / 7 / 14 quiet lines', () => {
  const src = readFileSync('tests/e2e/gnt1-reentry-render.spec.ts', 'utf8');
  expect(src).toMatch(/3:\s*"Three days off/);
  expect(src).toMatch(/7:\s*"Seven days off/);
  expect(src).toMatch(/14:\s*"14 days off/);
});

test('Today shows the quiet line after 3 / 7 / 14 missed days', async ({
  browser,
  baseURL,
}) => {
  if (!baseURL) throw new Error('baseURL required');

  const painted = [];
  for (const days of [3, 7, 14] as const) {
    painted.push(await paintGap(browser, baseURL, days));
  }

  expect(painted.map((p) => p.days)).toEqual([3, 7, 14]);
  expect(painted.map((p) => p.line)).toEqual([
    EXPECTED_LINE[3],
    EXPECTED_LINE[7],
    EXPECTED_LINE[14],
  ]);
  expect(painted.every((p) => p.forbidden === 0)).toBe(true);
  expect(painted.every((p) => /\/log/.test(p.url))).toBe(true);
});
