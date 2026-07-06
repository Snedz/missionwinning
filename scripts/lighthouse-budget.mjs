#!/usr/bin/env node
/**
 * Lighthouse budget check (soft warning) for key public + app routes.
 * Usage: SMOKE_BASE_URL=http://localhost:3000 node scripts/lighthouse-budget.mjs
 */
const base = (process.env.SMOKE_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const MIN_SCORE = Number(process.env.LIGHTHOUSE_MIN_SCORE || 90);

const PATHS = ['/', '/log', '/guide/human-performance', '/exercises/squats'];

async function main() {
  let lighthouse;
  let chromeLauncher;
  try {
    lighthouse = (await import('lighthouse')).default;
    chromeLauncher = await import('chrome-launcher');
  } catch {
    console.warn('Lighthouse not installed — skipping budget check (npm i -D lighthouse chrome-launcher)');
    process.exit(0);
  }

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const warnings = [];
  const snapshot = [];

  for (const path of PATHS) {
    const url = `${base}${path}`;
    const result = await lighthouse(url, {
      port: chrome.port,
      onlyCategories: ['performance', 'accessibility', 'best-practices'],
      formFactor: 'mobile',
      screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2, disabled: false },
    });
    const row = { path, scores: {} };
    for (const cat of ['performance', 'accessibility', 'best-practices']) {
      const score = Math.round((result.lhr.categories[cat]?.score ?? 0) * 100);
      row.scores[cat] = score;
      console.log(`${path} ${cat}: ${score}`);
      if (score < MIN_SCORE) warnings.push(`${path} ${cat}=${score} (<${MIN_SCORE})`);
    }
    snapshot.push(row);
  }

  await chrome.kill();

  if (process.env.LIGHTHOUSE_SNAPSHOT === '1') {
    console.log('\n--- JSON snapshot ---');
    console.log(JSON.stringify({ base, minScore: MIN_SCORE, at: new Date().toISOString(), rows: snapshot }, null, 2));
  }

  if (warnings.length) {
    console.warn('\nLighthouse budget warnings (non-blocking):');
    warnings.forEach((w) => console.warn(`  - ${w}`));
  } else {
    console.log('\nLighthouse budgets OK');
  }
}

main().catch((e) => {
  console.warn('Lighthouse check failed:', e.message);
  process.exit(0);
});
