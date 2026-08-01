import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const RATE = Number(process.env.CPU_RATE || 20);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const p = await ctx.newPage();

const cdp = await ctx.newCDPSession(p);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: RATE });

await p.goto('http://localhost:3000/welcome', { waitUntil: 'domcontentloaded' });
await p.evaluate(() => {
  localStorage.setItem('mw_experience', 'beginner');
  localStorage.setItem('mw_equipment', 'bodyweight');
  localStorage.setItem('mw_primary_goal', 'goal:general');
  localStorage.setItem('mw_goals', 'goal:general');
});

await p.goto('http://localhost:3000/profile', { waitUntil: 'domcontentloaded' });
await p.locator('body').waitFor({ state: 'visible' });

// The spec's own settle(), verbatim in behaviour.
await p.evaluate(async () => {
  const quiet = () => document.getAnimations().filter((a) => a.playState === 'running');
  const deadline = Date.now() + 5_000;
  let consecutiveQuiet = 0;
  while (Date.now() < deadline && consecutiveQuiet < 2) {
    const running = quiet();
    if (running.length === 0) consecutiveQuiet += 1;
    else {
      consecutiveQuiet = 0;
      await Promise.race([
        Promise.allSettled(running.map((a) => a.finished.catch(() => undefined))),
        new Promise((r) => setTimeout(r, 1_200)),
      ]);
    }
    await new Promise((r) => setTimeout(r, 150));
  }
}).catch(() => undefined);

const results = await new AxeBuilder({ page: p })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .exclude('[data-brand-monogram]')
  .analyze();

const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
const cc = results.violations.find((v) => v.id === 'color-contrast');
if (cc) console.log(`  color-contrast impact=${cc.impact} nodes=${cc.nodes.length}`);
console.log(`CPU_RATE=${RATE}  serious/critical: ${serious.length}`);
for (const v of serious) {
  console.log(`  ${v.id} — ${v.nodes.length} nodes`);
  for (const n of v.nodes.slice(0, 3)) {
    const d = n.any?.[0]?.data;
    if (d?.contrastRatio) console.log(`    ratio ${d.contrastRatio}  fg ${d.fgColor} bg ${d.bgColor}  "${(n.html||'').slice(0,90)}"`);
    else console.log(`    ${(n.html || '').slice(0, 110)}`);
  }
}
// Was a loading placeholder still on screen when axe ran?
const busy = await p.locator('[aria-busy="true"]').count();
console.log('aria-busy nodes at scan time:', busy);
if (busy) {
  const labels = await p.locator('[aria-busy="true"]').evaluateAll(
    (ns) => ns.map((n) => n.getAttribute('aria-label') || n.className.slice(0, 40))
  );
  console.log('  still loading:', labels.join(' | '));
}
console.log('running animations at scan time:', await p.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length));
await b.close();
