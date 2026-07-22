#!/usr/bin/env node
/**
 * Growth Wave 2 smoke — leads capture + unsubscribe perimeter.
 *
 * Usage:
 *   SMOKE_BASE_URL=http://localhost:3000 npm run growth-smoke
 *   SMOKE_BASE_URL=https://www.missionwinning.com npm run growth-smoke
 *
 * Optional: SMOKE_ACCESS_SECRET — unlocks private gate for HTML routes if needed.
 * Leads/unsub APIs are public while gated (no cookie required).
 *
 * Expected without Resend / with or without Supabase admin:
 *   - POST /api/leads → 200 {ok:true} or 202 {localOnly:true} or 500 only if DB misconfigured
 *   - GET unsub bad token → 400
 */
const base = (process.env.SMOKE_BASE_URL || process.argv[2] || '').replace(/\/$/, '');

if (!base) {
  console.error('Usage: SMOKE_BASE_URL=https://your-domain npm run growth-smoke');
  process.exit(1);
}

/** @type {{ name: string; ok: boolean; detail: string }[]} */
const checks = [];

async function req(path, init) {
  const url = `${base}${path}`;
  const res = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(15_000),
  });
  return res;
}

console.log(`\nGrowth smoke — ${base}\n`);

// 1) Invalid lead body
try {
  const res = await req('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email' }),
  });
  const ok = res.status === 400;
  checks.push({
    name: 'POST /api/leads rejects invalid email',
    ok,
    detail: `status ${res.status}`,
  });
} catch (e) {
  checks.push({ name: 'POST /api/leads invalid', ok: false, detail: String(e) });
}

// 2) Valid lead with explicit source (attribution regression guard)
const probeEmail = `growth-smoke+${Date.now()}@example.com`;
try {
  const res = await req('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: probeEmail,
      name: 'Growth Smoke',
      source: 'growth-smoke',
      goals: 'Automated smoke — safe to ignore',
    }),
  });
  let body = {};
  try {
    body = await res.json();
  } catch {
    body = {};
  }
  const ok =
    (res.status === 200 && body.ok === true) ||
    (res.status === 202 && body.localOnly === true);
  checks.push({
    name: 'POST /api/leads accepts source (200/202)',
    ok,
    detail: `status ${res.status} body=${JSON.stringify(body).slice(0, 120)}`,
  });
} catch (e) {
  checks.push({ name: 'POST /api/leads source', ok: false, detail: String(e) });
}

// 3) Unsubscribe bad token → 400
try {
  const res = await req(
    `/api/leads/unsubscribe?e=${encodeURIComponent(probeEmail)}&t=deadbeef`
  );
  const text = await res.text();
  const ok = res.status === 400;
  checks.push({
    name: 'GET /api/leads/unsubscribe rejects bad token',
    ok,
    detail: `status ${res.status} (${text.slice(0, 60)})`,
  });
} catch (e) {
  checks.push({ name: 'GET /api/leads/unsubscribe', ok: false, detail: String(e) });
}

// 4) Welcome without session → 401 from route, or 403 from private gate while PRIVATE_MODE
try {
  const res = await req('/api/journey/welcome', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  const ok = res.status === 401 || res.status === 403 || res.status === 503;
  checks.push({
    name: 'POST /api/journey/welcome without session',
    ok,
    detail: `status ${res.status}`,
  });
} catch (e) {
  checks.push({ name: 'POST /api/journey/welcome', ok: false, detail: String(e) });
}

// 5) Public SEO surfaces reachable (guide is public while gated)
try {
  const res = await req('/guide', { redirect: 'manual' });
  const loc = res.headers.get('location') || '';
  const ok = res.status === 200 || (res.status >= 300 && res.status < 400 && !loc.includes('/private'));
  checks.push({
    name: 'GET /guide public SEO surface',
    ok: res.status === 200,
    detail: `status ${res.status}${loc ? ` → ${loc}` : ''}${ok ? '' : ' — expected 200'}`,
  });
} catch (e) {
  checks.push({ name: 'GET /guide', ok: false, detail: String(e) });
}

let failed = 0;
for (const c of checks) {
  const mark = c.ok ? '✓' : '✗';
  console.log(`  ${mark} ${c.name} — ${c.detail}`);
  if (!c.ok) failed++;
}

console.log(
  failed
    ? `\nGrowth smoke FAILED (${failed}/${checks.length}).\n`
    : `\nGrowth smoke passed (${checks.length} checks).\n`
);
process.exit(failed ? 1 : 0);
