import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { gateRequired, unlockGate } from './helpers/gate';
import { gotoHydrated } from './helpers/gotoHydrated';
import { seedLegacyOnboarding } from './helpers/journey';
import { startEmptyActiveWorkout } from './helpers/active';
import { UNCONTENDED_HOUR, fixedTimeAt } from './helpers/fixedClock';
import { DIALOG_CONTROL_SELECTOR, expectThumbSized } from './helpers/thumbSweep';
import {
  expectOneRedAction,
  expectAtMostOneRedAction,
  redActionCount,
} from './helpers/redActions';

const STILL = 'docs/gauntlet/GNT-1/evidence';
const DUMP = '/tmp/gnt1-smoother-walk.json';

async function dumpSurface(page: Page, name: string) {
  return page.evaluate((surface) => {
    const RED: [number, number, number][] = [
      [236, 48, 19],
      [221, 43, 15],
      [174, 24, 0],
    ];
    const isRed = (rgb: string) => {
      const m = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(rgb);
      if (!m) return false;
      const a = /rgba\([^)]*,\s*([\d.]+)\s*\)/.exec(rgb);
      if (a && Number(a[1]) === 0) return false;
      const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])];
      return RED.some(
        ([rr, rg, rb]) =>
          Math.abs(r - rr) <= 24 && Math.abs(g - rg) <= 24 && Math.abs(b - rb) <= 24
      );
    };
    const controls = [
      ...document.querySelectorAll(
        'main button, main a[role="button"], main select, #screen-dock button, [role="dialog"] button'
      ),
    ] as HTMLElement[];
    const visible = controls.filter((el) => {
      const box = el.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && getComputedStyle(el).visibility !== 'hidden';
    });
    const red = visible
      .filter((el) => isRed(getComputedStyle(el).backgroundColor))
      .map((el) => (el.textContent || '').trim().slice(0, 40));
    const short = visible
      .filter((el) => el.getBoundingClientRect().height < 44)
      .map((el) => {
        const b = el.getBoundingClientRect();
        return `${(el.textContent || '').trim().slice(0, 24) || el.getAttribute('aria-label') || '(no text)'} h=${b.height} y=${Math.round(b.y)}`;
      });
    const next = document.querySelector(
      '.poster-field .primary-action, [role="dialog"] .primary-action'
    ) as HTMLElement | null;
    const nav = document.querySelector('nav[aria-label="Primary"]') as HTMLElement | null;
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement | null;
    return {
      surface,
      href: location.href,
      title: document.title,
      red,
      redCount: red.length,
      short,
      nextBox: next?.getBoundingClientRect() ?? null,
      navBox: nav?.getBoundingClientRect() ?? null,
      dialogBox: dialog?.getBoundingClientRect() ?? null,
      dock: document.getElementById('screen-dock')?.innerText?.slice(0, 240) ?? '',
      viewport: { w: window.innerWidth, h: window.innerHeight },
    };
  }, name);
}

test.describe('GNT-1 smoother walk 390×844', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required');
    }
    await page.clock.setFixedTime(fixedTimeAt(UNCONTENDED_HOUR));
  });

  test('wedge surfaces: red/thumb + Victory next fully in viewport', async ({ page }) => {
    mkdirSync(STILL, { recursive: true });
    const report: unknown[] = [];

    await seedLegacyOnboarding(page);

    await gotoHydrated(page, '/log');
    await expect(page).toHaveURL(/\/log/);
    await expect(page.locator('#screen-dock')).toBeVisible({ timeout: 15_000 });
    const todayDump = await dumpSurface(page, 'today');
    report.push(todayDump);
    await page.screenshot({ path: `${STILL}/SMOOTHER-today.png`, fullPage: false });
    await expectOneRedAction(page, '/log zero');
    await expectThumbSized(page, '/log');

    await gotoHydrated(page, '/active');
    await expect(page.getByRole('button', { name: /^start workout$/i })).toBeVisible({
      timeout: 15_000,
    });
    const trainDump = await dumpSurface(page, 'train');
    report.push(trainDump);
    await page.screenshot({ path: `${STILL}/SMOOTHER-train.png`, fullPage: false });
    await expectAtMostOneRedAction(page, '/active empty');
    await expectThumbSized(page, '/active empty');

    await page.goto('/coach', { waitUntil: 'domcontentloaded' });
    await page
      .getByRole('navigation', { name: /primary/i })
      .getByRole('button', { name: /more/i })
      .waitFor({ timeout: 15_000 });
    await expect(
      page.getByText(/no plan this week/i).or(page.getByRole('button', { name: /generate/i }))
    ).toBeVisible({ timeout: 15_000 });
    const coachDump = await dumpSurface(page, 'coach');
    report.push(coachDump);
    await page.screenshot({ path: `${STILL}/SMOOTHER-coach.png`, fullPage: false });
    await expectAtMostOneRedAction(page, '/coach empty');
    await expectThumbSized(page, '/coach empty');

    await startEmptyActiveWorkout(page);
    await page.getByRole('button', { name: /^add exercise$/i }).click();
    const search = page.getByPlaceholder(/search exercises/i);
    await expect(search).toBeVisible({ timeout: 10_000 });
    await search.fill('push-ups');
    await page.getByRole('option', { name: /push-ups/i }).first().click();
    await page.getByRole('button', { name: /add selected exercise/i }).click();
    const logBtn = page.getByRole('button', { name: /^log( set)?$/i }).first();
    await expect(logBtn).toBeVisible({ timeout: 15_000 });
    await logBtn.click();
    const skipRest = page.getByRole('button', { name: /^skip$/i });
    if (await skipRest.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await skipRest.click();
    }
    await page.getByRole('button', { name: /^finish$/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/session locked/i).first()).toBeVisible({ timeout: 10_000 });
    const victoryDump = await dumpSurface(page, 'victory');
    report.push(victoryDump);
    await page.screenshot({ path: `${STILL}/SMOOTHER-victory.png`, fullPage: false });

    const next = page.locator('[role="dialog"] .primary-action').first();
    const back = page.getByRole('button', { name: /back to today/i }).first();
    const nextVisible = await next.isVisible().catch(() => false);
    const backVisible = await back.isVisible().catch(() => false);
    const nextBox = nextVisible ? await next.boundingBox() : null;
    const backBox = backVisible ? await back.boundingBox() : null;
    const navBox = await page.locator('nav[aria-label="Primary"]').boundingBox();
    console.log(`smoother_today_red=${todayDump.redCount} short=${JSON.stringify(todayDump.short)}`);
    console.log(`smoother_train_red=${trainDump.redCount} short=${JSON.stringify(trainDump.short)}`);
    console.log(`smoother_coach_red=${coachDump.redCount} short=${JSON.stringify(coachDump.short)}`);
    console.log(`smoother_victory_red=${victoryDump.redCount} short=${JSON.stringify(victoryDump.short)}`);
    console.log(`smoother_victory_nextBox=${JSON.stringify(nextBox)}`);
    console.log(`smoother_victory_backBox=${JSON.stringify(backBox)}`);
    console.log(`smoother_victory_navBox=${JSON.stringify(navBox)}`);
    console.log(`smoother_victory_dialogBox=${JSON.stringify(victoryDump.dialogBox)}`);
    writeFileSync(DUMP, JSON.stringify(report, null, 2));

    const target = nextBox ?? backBox;
    expect(target, 'Victory next or Back to Today must have a box').toBeTruthy();
    if (target) {
      const bottom = target.y + target.height;
      const viewH = victoryDump.viewport.h;
      console.log(`smoother_victory_cta_bottom=${bottom} viewport=${viewH} navTop=${navBox?.y}`);
      expect(target.y, 'CTA top in viewport').toBeGreaterThanOrEqual(0);
      expect(bottom, 'CTA bottom in viewport').toBeLessThanOrEqual(viewH + 1);
      const hit = await page.evaluate(() => {
        const el =
          (document.querySelector('[role="dialog"] .primary-action') as HTMLElement | null) ??
          ([...document.querySelectorAll('[role="dialog"] button')].find((b) =>
            /back to today/i.test(b.textContent || '')
          ) as HTMLElement | undefined) ??
          null;
        if (!el) return { ok: false, reason: 'no-cta' };
        const box = el.getBoundingClientRect();
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        const top = document.elementFromPoint(x, y);
        const ok = Boolean(top && (el === top || el.contains(top) || top.contains(el)));
        return { ok, reason: top ? (top as HTMLElement).tagName : 'null', x, y };
      });
      console.log(`smoother_victory_cta_hit=${JSON.stringify(hit)}`);
      expect(hit.ok, 'Victory CTA must be the topmost control at its center').toBeTruthy();
    }
    await expectThumbSized(page, 'victory sheet', DIALOG_CONTROL_SELECTOR);
    await expectAtMostOneRedAction(page, 'victory sheet');
    expect(await redActionCount(page)).toBeLessThanOrEqual(1);
  });
});
