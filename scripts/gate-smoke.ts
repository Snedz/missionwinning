#!/usr/bin/env node
/**
 * Post-deploy gate smoke — curl-style checks against a running deployment.
 * Usage: SMOKE_BASE_URL=https://www.missionwinning.com npm run gate-smoke
 */
const base = (process.env.SMOKE_BASE_URL || process.argv[2] || '').replace(/\/$/, '');

if (!base) {
  console.error('Usage: SMOKE_BASE_URL=https://your-domain npm run gate-smoke');
  process.exit(1);
}

type Check = { name: string; ok: boolean; detail: string };

async function headOrGet(path: string, init?: RequestInit): Promise<Response> {
  const url = `${base}${path}`;
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(15_000) });
  } catch (e) {
    throw new Error(`${url} — ${e instanceof Error ? e.message : String(e)}`);
  }
}

async function main() {
  console.log(`\nGate smoke — ${base}\n`);
  const checks: Check[] = [];

  try {
    const home = await headOrGet('/', { redirect: 'manual' });
    const loc = home.headers.get('location') || '';
    const gated =
      home.status >= 300 &&
      home.status < 400 &&
      (loc.includes('/private') || loc.endsWith('/private'));
    if (gated) {
      checks.push({ name: 'GET / redirects to /private', ok: true, detail: `${home.status} → ${loc}` });
    } else if (home.status === 200 && process.env.SMOKE_ALLOW_PUBLIC === 'true') {
      checks.push({
        name: 'GET / (public mode)',
        ok: true,
        detail: '200 OK — SMOKE_ALLOW_PUBLIC set',
      });
    } else if (home.status === 200) {
      checks.push({
        name: 'GET / redirects to /private',
        ok: false,
        detail: `Got ${home.status} (PRIVATE_MODE may be off — expected in local dev)`,
      });
    } else {
      checks.push({
        name: 'GET / gate redirect',
        ok: false,
        detail: `status ${home.status}, location ${loc || 'none'}`,
      });
    }
  } catch (e) {
    checks.push({ name: 'GET /', ok: false, detail: String(e) });
  }

  try {
    const welcome = await headOrGet('/welcome', { redirect: 'manual' });
    const welcomeLoc = welcome.headers.get('location') || '';
    const welcomeGated =
      welcome.status >= 300 &&
      welcome.status < 400 &&
      welcomeLoc.includes('/private');
    checks.push({
      name: 'GET /welcome redirects to /private',
      ok: welcomeGated,
      detail: welcomeGated
        ? `${welcome.status} → ${welcomeLoc}`
        : `status ${welcome.status} (welcome must not bypass gate)`,
    });
  } catch (e) {
    checks.push({ name: 'GET /welcome', ok: false, detail: String(e) });
  }

  try {
    const beta = await headOrGet('/beta', { redirect: 'manual' });
    const betaLoc = beta.headers.get('location') || '';
    const betaGated =
      (beta.status >= 300 && beta.status < 400 && betaLoc.includes('/private')) ||
      betaLoc.includes('/bundle');
    checks.push({
      name: 'GET /beta does not expose app shell',
      ok: betaGated,
      detail: `${beta.status}${betaLoc ? ` → ${betaLoc}` : ''}`,
    });
  } catch (e) {
    checks.push({ name: 'GET /beta', ok: false, detail: String(e) });
  }

  try {
    const recipes = await headOrGet('/api/premium/recipes');
    const ok = recipes.status === 403 || recipes.status === 401;
    checks.push({
      name: 'GET /api/premium/recipes (no auth)',
      ok,
      detail: `status ${recipes.status}${ok ? '' : ' — expected 403'}`,
    });
  } catch (e) {
    checks.push({ name: 'GET /api/premium/recipes', ok: false, detail: String(e) });
  }

  try {
    const privateAccess = await headOrGet('/api/private-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'gate-smoke-probe' }),
    });
    const ok = privateAccess.status === 401 || privateAccess.status === 500;
    checks.push({
      name: 'POST /api/private-access reachable without gate cookie',
      ok,
      detail: `status ${privateAccess.status}`,
    });
  } catch (e) {
    checks.push({ name: 'POST /api/private-access', ok: false, detail: String(e) });
  }

  try {
    const mindSessions = await headOrGet('/api/premium/mind-sessions');
    const ok = mindSessions.status === 403 || mindSessions.status === 401 || mindSessions.status === 503;
    checks.push({
      name: 'GET /api/premium/mind-sessions (no auth)',
      ok,
      detail: `status ${mindSessions.status}`,
    });
  } catch (e) {
    checks.push({ name: 'GET /api/premium/mind-sessions', ok: false, detail: String(e) });
  }

  try {
    const moveFlows = await headOrGet('/api/premium/move-flows');
    const ok = moveFlows.status === 403 || moveFlows.status === 401 || moveFlows.status === 503;
    checks.push({
      name: 'GET /api/premium/move-flows (no auth)',
      ok,
      detail: `status ${moveFlows.status}`,
    });
  } catch (e) {
    checks.push({ name: 'GET /api/premium/move-flows', ok: false, detail: String(e) });
  }

  try {
    const programs = await headOrGet('/api/premium/programs');
    const ok = programs.status === 403 || programs.status === 401 || programs.status === 503;
    checks.push({
      name: 'GET /api/premium/programs (no auth)',
      ok,
      detail: `status ${programs.status}`,
    });
  } catch (e) {
    checks.push({ name: 'GET /api/premium/programs', ok: false, detail: String(e) });
  }

  try {
    const coachPlan = await headOrGet('/api/coach/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readiness: 70, strain: 50, recovery: 55 }),
    });
    const ok = coachPlan.status === 403;
    checks.push({
      name: 'POST /api/coach/generate-plan (no premium)',
      ok,
      detail: `status ${coachPlan.status}${ok ? '' : ' — expected 403'}`,
    });
  } catch (e) {
    checks.push({ name: 'POST /api/coach/generate-plan', ok: false, detail: String(e) });
  }

  try {
    const privatePage = await headOrGet('/private');
    checks.push({
      name: 'GET /private (200)',
      ok: privatePage.status === 200,
      detail: `status ${privatePage.status}`,
    });
  } catch (e) {
    checks.push({ name: 'GET /private', ok: false, detail: String(e) });
  }

  for (const path of ['/privacy', '/terms', '/about']) {
    try {
      const res = await headOrGet(path);
      checks.push({
        name: `GET ${path} (public legal/info)`,
        ok: res.status === 200,
        detail: `status ${res.status}`,
      });
    } catch (e) {
      checks.push({ name: `GET ${path}`, ok: false, detail: String(e) });
    }
  }

  try {
    const manifest = await headOrGet('/manifest.json');
    checks.push({
      name: 'GET /manifest.json',
      ok: manifest.status === 200,
      detail: `status ${manifest.status}`,
    });
  } catch (e) {
    checks.push({ name: 'GET /manifest.json', ok: false, detail: String(e) });
  }

  try {
    const america = await headOrGet('/america', { redirect: 'manual' });
    const americaOk = america.status === 200;
    checks.push({
      name: 'GET /america (public while gated)',
      ok: americaOk,
      detail: americaOk ? '200 OK' : `status ${america.status}`,
    });
  } catch (e) {
    checks.push({ name: 'GET /america', ok: false, detail: String(e) });
  }

  try {
    const classStats = await headOrGet('/api/school/class/MWTEST/stats');
    const statsOk = classStats.status === 200 || classStats.status === 503;
    checks.push({
      name: 'GET /api/school/class/[code]/stats',
      ok: statsOk,
      detail: `status ${classStats.status}`,
    });
  } catch (e) {
    checks.push({ name: 'GET /api/school/class/stats', ok: false, detail: String(e) });
  }

  const accessSecret = process.env.SMOKE_ACCESS_SECRET;
  if (accessSecret) {
    try {
      const unlocked = await headOrGet(
        `/fitness-test?access=${encodeURIComponent(accessSecret)}`
      );
      const ok = unlocked.status === 200;
      checks.push({
        name: 'GET /fitness-test (unlocked via ?access=)',
        ok,
        detail: ok ? '200 OK' : `status ${unlocked.status}`,
      });
    } catch (e) {
      checks.push({ name: 'GET /fitness-test', ok: false, detail: String(e) });
    }
  } else {
    checks.push({
      name: 'GET /fitness-test (gated)',
      ok: true,
      detail: 'skipped — set SMOKE_ACCESS_SECRET to probe unlocked route',
    });
  }

  let failed = 0;
  for (const c of checks) {
    const icon = c.ok ? '✓' : '✗';
    console.log(`  ${icon} ${c.name}`);
    console.log(`    ${c.detail}`);
    if (!c.ok) failed++;
  }

  console.log(failed ? `\n${failed} check(s) failed.\n` : '\nAll gate checks passed.\n');
  process.exit(failed ? 1 : 0);
}

main();
