#!/usr/bin/env node
/**
 * Week-4 measurement smoke — digest dryRun + Supabase retention probes.
 *
 * Usage:
 *   SMOKE_BASE_URL=https://www.missionwinning.com CRON_SECRET=… npm run week4-smoke
 *
 * Optional:
 *   SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL — probe both retention RPCs
 *
 * Exit 0 on success; 1 on hard fail; 2 if CRON_SECRET / base missing (skip).
 *
 * This script also settles a contradiction that had been sitting in the repo unresolved:
 * docs/THESIS.md said `mw_week4_retention()` was unapplied while
 * docs/LAUNCH_RUNBOOK.md said it existed in prod. Whichever is true, it is one run away
 * — so the RPC is called, and a 404 is reported as "function missing" rather than being
 * folded into a generic failure where nobody can tell it apart from a bad key.
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

/** Call one RPC. Returns { ok, rows } or { ok:false, status, detail }. */
async function probeRpc(name) {
  const rpc = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
    signal: AbortSignal.timeout(15_000),
  });
  if (!rpc.ok) {
    return { ok: false, status: rpc.status, detail: (await rpc.text()).slice(0, 200) };
  }
  return { ok: true, rows: await rpc.json() };
}

if (url && key) {
  // The boss instrument. A missing function here is the single most important thing this
  // script can report: it means the north star is not merely empty, it is uncomputable.
  const weekly = await probeRpc('mw_week4_retention_weekly');
  if (!weekly.ok) {
    if (weekly.status === 404) {
      console.error(
        'FAIL — mw_week4_retention_weekly() does not exist (404).\n' +
          '      Apply supabase/migrations/20261009_week_logged_device_owners.sql first.\n' +
          '      Until it exists, week_logged is write-only and the north star cannot be\n' +
          '      computed at all — not even for signed-in athletes.',
      );
    } else {
      console.error(`FAIL — mw_week4_retention_weekly HTTP ${weekly.status}: ${weekly.detail}`);
    }
    process.exit(1);
  }
  const weeklyRows = Array.isArray(weekly.rows) ? weekly.rows : [];
  console.log(`✓ mw_week4_retention_weekly() OK — ${weeklyRows.length} cohort row(s)`);
  if (weeklyRows.length === 0) {
    console.log('  (no cohorts yet — expected until athletes log across an ISO week boundary)');
  } else {
    for (const row of weeklyRows.slice(-5)) {
      const retained = Number(row.week4_retained ?? 0);
      const eligible = Number(row.cohort_eligible ?? 0);
      const pct = eligible > 0 ? ((retained / eligible) * 100).toFixed(1) : '—';
      console.log(`  ${row.cohort_iso_week}: ${retained}/${eligible} (${pct}%)`);
    }
  }

  // Continuity only. Signed-in athletes exclusively — it reads workout_logs.user_id, so
  // it excludes every guest. Quoting it as the north star would be measuring the
  // minority that created an account, which is the bug the weekly RPC exists to fix.
  const signedIn = await probeRpc('mw_week4_retention');
  if (signedIn.ok) {
    const rows = Array.isArray(signedIn.rows) ? signedIn.rows : [];
    console.log(
      `· mw_week4_retention() OK — ${rows[0]?.cohort_eligible ?? 0} eligible / ` +
        `${rows[0]?.week4_retained ?? 0} retained (SIGNED-IN ONLY, not the north star)`,
    );
  } else if (signedIn.status === 404) {
    console.log(
      '· mw_week4_retention() missing (404) — docs/THESIS.md was right, docs/LAUNCH_RUNBOOK.md was not.\n' +
        '  Apply it if you want the signed-in continuity number; the weekly RPC does not depend on it.',
    );
  } else {
    console.log(`· mw_week4_retention() HTTP ${signedIn.status}: ${signedIn.detail}`);
  }
} else {
  console.log(
    '· retention RPCs skipped (set SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL)',
  );
}

console.log('\nFounder (not agent): confirm PostHog Insight for iday_* → first_workout_completed → workout_completed');
console.log('See docs/SEO_ANALYTICS.md + docs/POST_LAUNCH_CADENCE.md\n');
process.exit(0);