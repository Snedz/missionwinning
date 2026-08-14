import { chromium } from '@playwright/test';
const base = 'http://localhost:3000';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('PAGE ERROR:', String(e).slice(0, 200)));
await p.goto(base + '/private', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1500);
await p.locator('[data-mw-free-logger]').click();
await p.waitForTimeout(1500);
for (const rx of [/^begin$/i, /^continue$/i]) {
  const btn = p.getByRole('button', { name: rx }).first();
  if (await btn.count()) { await btn.click(); await p.waitForTimeout(1200); }
}
console.log('url after I-Day:', p.url());
await p.waitForTimeout(2500);
const btns = await p.locator('button:visible').allInnerTexts();
console.log('visible buttons:', btns.map((t) => t.replace(/\n/g, '/').slice(0, 28)).slice(0, 14));
const start = p.locator('.primary-action:visible').first();
console.log('primary action:', await start.innerText().catch(() => '(none)'));
await start.click();
await p.waitForTimeout(3000);
console.log('url after start:', p.url());
const btns2 = await p.locator('button:visible').allInnerTexts();
console.log('buttons after start:', btns2.map((t) => t.replace(/\n/g, '/').slice(0, 28)).slice(0, 14));
await p.screenshot({ path: '/tmp/dbg769.png' });
await b.close();
