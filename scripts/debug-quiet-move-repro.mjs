/**
 * Quiet Move Log repro — writes NDJSON to /opt/cursor/logs/debug.log
 *
 * Usage (dev server already on :3000):
 *   node scripts/debug-quiet-move-repro.mjs
 *
 * Requires Playwright Chromium. If missing:
 *   npx playwright install chromium
 */
import http from 'node:http';
import fs from 'node:fs';
import { chromium } from 'playwright';

const LOG = '/opt/cursor/logs/debug.log';
const BASE = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';

function writeLine(payload) {
  fs.appendFileSync(LOG, `${JSON.stringify({ timestamp: Date.now(), ...payload })}\n`);
}

function startCollector() {
  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf8');
      try {
        writeLine(JSON.parse(body));
      } catch {
        writeLine({
          hypothesisId: 'F',
          location: 'debug-quiet-move-repro.mjs:collector',
          message: 'non-json body',
          data: { body: body.slice(0, 500) },
        });
      }
      res.writeHead(204);
      res.end();
    });
  });
  return new Promise((resolve) => {
    server.listen(7931, '127.0.0.1', () => resolve(server));
  });
}

async function runCase(browser, name, { seedIDay }) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  page.on('console', (msg) => {
    const text = msg.text();
    if (!text.startsWith('[qm-debug]')) return;
    try {
      writeLine(JSON.parse(text.slice('[qm-debug] '.length)));
    } catch {
      writeLine({
        hypothesisId: 'F',
        location: 'debug-quiet-move-repro.mjs:console',
        message: 'unparsed qm-debug',
        data: { text: text.slice(0, 400), case: name },
      });
    }
  });

  if (seedIDay) {
    await context.addInitScript(() => {
      localStorage.setItem('mw_experience', 'beginner');
      localStorage.setItem('mw_equipment', 'bodyweight');
    });
  }

  await page.goto(`${BASE}/move`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForTimeout(1500);

  const urlAfterLoad = page.url();
  const card = page.locator('[data-testid="quiet-move-log"]');
  const cardCount = await card.count();
  const instrumented = cardCount
    ? await card.getAttribute('data-qm-instrumented')
    : null;

  writeLine({
    hypothesisId: 'F',
    location: 'debug-quiet-move-repro.mjs:load',
    message: 'page after load',
    data: { case: name, urlAfterLoad, cardCount, instrumented, seedIDay },
  });

  if (!cardCount) {
    writeLine({
      hypothesisId: 'E',
      location: 'debug-quiet-move-repro.mjs:no-card',
      message: 'QuietMoveLogCard not in DOM',
      data: { case: name, urlAfterLoad },
    });
    await context.close();
    return;
  }

  const hydrated = await page
    .waitForSelector('[data-testid="quiet-move-log"][data-qm-hydrated="1"]', {
      timeout: 5_000,
    })
    .then(() => true)
    .catch(() => false);

  const btn = page.locator('[data-testid="quiet-move-log-submit"]');
  const btnCount = await btn.count();
  const hit = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="quiet-move-log-submit"]');
    if (!el) return { ok: false, reason: 'no-button' };
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const top = document.elementFromPoint(cx, cy);
    return {
      ok: true,
      box: { x: r.x, y: r.y, w: r.width, h: r.height },
      cx,
      cy,
      topTestId: top?.getAttribute?.('data-testid') ?? null,
      topTag: top?.tagName ?? null,
      topText: (top?.textContent ?? '').trim().slice(0, 48),
      hitIsButton: !!(top && (top === el || el.contains(top))),
    };
  });

  writeLine({
    hypothesisId: 'A',
    location: 'debug-quiet-move-repro.mjs:preclick',
    message: 'button geometry',
    data: { case: name, hydrated, btnCount, hit },
  });

  await page.locator('[data-testid="quiet-move-minutes"]').fill('20');
  if (btnCount) await btn.click({ timeout: 5_000 });
  await page.waitForTimeout(800);

  const after = await page.evaluate(() => {
    const cardEl = document.querySelector('[data-testid="quiet-move-log"]');
    return {
      href: location.href,
      emptyCopy: /Nothing logged/.test(document.body.innerText),
      rowCountDom: document.querySelectorAll('[data-testid="quiet-move-row"]').length,
      minutesValue: document.querySelector('[data-testid="quiet-move-minutes"]')?.value ?? null,
      attrs: cardEl
        ? {
            instrumented: cardEl.getAttribute('data-qm-instrumented'),
            hydrated: cardEl.getAttribute('data-qm-hydrated'),
            today: cardEl.getAttribute('data-qm-today'),
            rowCount: cardEl.getAttribute('data-qm-row-count'),
            mount: cardEl.getAttribute('data-qm-mount'),
          }
        : null,
      storage: localStorage.getItem('mw_quiet_move_log'),
      debugEvents: (globalThis.__QM_DEBUG ?? []).length,
    };
  });

  writeLine({
    hypothesisId: 'A',
    location: 'debug-quiet-move-repro.mjs:afterclick',
    message: 'DOM + storage after Log',
    data: { case: name, after },
  });

  await context.close();
}

const collector = await startCollector();
let browser;
try {
  writeLine({
    hypothesisId: 'F',
    location: 'debug-quiet-move-repro.mjs:start',
    message: 'repro start',
    data: { base: BASE },
  });
  browser = await chromium.launch({ headless: true });
  await runCase(browser, 'fresh-no-iday', { seedIDay: false });
  await runCase(browser, 'seeded-iday', { seedIDay: true });
  writeLine({
    hypothesisId: 'F',
    location: 'debug-quiet-move-repro.mjs:done',
    message: 'repro finished',
    data: {},
  });
} catch (error) {
  writeLine({
    hypothesisId: 'F',
    location: 'debug-quiet-move-repro.mjs:error',
    message: error instanceof Error ? error.message : String(error),
    data: { name: error instanceof Error ? error.name : 'unknown' },
  });
  throw error;
} finally {
  await browser?.close();
  collector.close();
}
