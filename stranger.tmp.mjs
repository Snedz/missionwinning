import { chromium } from '@playwright/test';
const base = 'http://localhost:3000';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
let taps = 0;
const trail = [];
const tap = async (l, label) => { await l.click({ timeout: 10000 }); taps++; trail.push(`${taps}. ${label}`); await p.waitForTimeout(1200); };

// A stranger, no cookie, no account, no invite.
await p.goto(base + '/', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(2000);
trail.push(`0. landed ${p.url().replace(base, '')}`);
console.log('gate first paint offers:', (await p.locator('[data-mw-free-logger]').innerText().catch(() => '(none)')));

await tap(p.locator('[data-mw-free-logger]'), 'tap "Log a set" on the gate');
for (const rx of [/^begin$/i, /^continue$/i]) {
  const btn = p.getByRole('button', { name: rx }).first();
  if (await btn.count()) await tap(btn, `tap "${(await btn.innerText()).trim()}"`);
}
console.log('after I-Day:', p.url().replace(base, ''));
// The empty logger docks one Start (F-004 forbids auto-starting a session).
const start = p.locator('.primary-action:visible').first();
if (await start.count()) await tap(start, `tap "${(await start.innerText()).trim().split('\n')[0]}"`);
await p.waitForTimeout(1500);
const log = p.getByRole('button', { name: /^log( set)?$/i }).first();
if (await log.count()) {
  await tap(log, 'tap "Log set"');
  await p.waitForTimeout(1200);
  const body = await p.locator('body').innerText();
  console.log('sets counter:', (body.match(/SETS?\s*\n?\s*\d+\s*\/\s*\d+/i) || ['(none)'])[0].replace(/\n/g, ' '));
} else {
  console.log('NO LOG CONTROL — dead end at', p.url().replace(base, ''));
}
console.log('\n' + trail.join('\n'));
console.log('interactions, stranger → logged set:', taps);
await p.screenshot({ path: '/tmp/stranger-logged.png' });

// Nav to a gated surface still explains itself rather than breaking.
await p.goto(base + '/log', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1500);
console.log('gated surface from the logger →', p.url().replace(base, ''));
await b.close();
