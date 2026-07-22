#!/usr/bin/env node
/**
 * Week-4 measurement smoke — digest dryRun + optional Supabase RPC probe.
 *
 * Usage:
 *   SMOKE_BASE_URL=https://www.missionwinning.com CRON_SECRET=… npm run week4-smoke
 *
 * Optional:
 *   SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL — probe mw_week4_retention()
 *
 * Exit 0 on success; 1 on hard fail; 2 if CRON_SECRET / base missing (skip).
 */
const base = (process.env.SMOKE_BASE_URL || '').replace(/\/$/, '');
const cronSecret = process.env.CRON_SECRET?.trim();

if (!base) {
  console.error('Set SMOKE_BASE_URL (e.g. https://www.missionwinning.com)');
  process.exit(2);
}
if (!cronSecret) {
  console.error('Set CRON_SECRET to probe GET /api/cron/weekly-digest?dryRun=1');
  process.exit(2);
}

console.log(`\nWeek-4 smoke — ${base}\n`);

const digestUrl = `${base}/api/cron/weekly-digest?dryRun=1`;
const res = await fetch(digestUrl, {
  headers: { Authorization: `Bearer ${cronSecret}` },
  signal: AbortSignal.timeout(20_000),
});

let body = {};
try {
  body = await res.json();
} catch {
  body = {};
}

if (res.status === 401 || res.status === 403) {
  console.error(`FAIL — digest auth rejected (${res.status}). Check CRON_SECRET matches Production.`);
  process.exit(1);
}
if (res.status === 503) {
  console.error('FAIL — CRON_SECRET not configured on server (503).');
  process.exit(1);
}
if (!res.ok || body.ok !== true || body.dryRun !== true) {
  console.error(`FAIL — digest dryRun unexpected: status=${res.status}`, body);
  process.exit(1);
}

const hasRetention =
  body.data?.week4 != null ||
  body.data?.retention != null ||
  typeof body.text === 'string';
console.log('✓ weekly-digest dryRun ok');
console.log(`  subject: ${body.subject ?? '(none)'}`);
console.log(`  retention payload: ${hasRetention ? 'present in compose' : 'check data shape'}`);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
if (url && key) {
  try {
    const rpc = await fetch(`${url}/rest/v1/rpc/mw_week4_retention`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
      signal: AbortSignal.timeout(15_000),
    });
    if (rpc.ok) {
      const rows = await rpc.json();
      console.log(`✓ mw_week4_retention() OK (${Array.isArray(rows) ? rows.length : 1} row(s))`);
    } else {
      const errText = await rpc.text();
      console.error(`FAIL — mw_week4_retention HTTP ${rpc.status}: ${errText.slice(0, 200)}`);
      process.exit(1);
    }
  } catch (e) {
    console.error('FAIL — Supabase RPC probe:', e instanceof Error ? e.message : e);
    process.exit(1);
  }
} else {
  console.log('· mw_week4_retention RPC skipped (set SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL)');
}

console.log('\nFounder (not agent): confirm PostHog Insight for iday_* → first_workout_completed → workout_completed');
console.log('See docs/SEO_ANALYTICS.md + docs/POST_LAUNCH_CADENCE.md\n');
process.exit(0);
