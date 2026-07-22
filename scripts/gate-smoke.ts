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

/** Obtain gate cookie via POST /api/private-access (preferred over ?access= URL). */
async function unlockCookie(baseUrl: string, secret: string): Promise<string> {
  const res = await fetch(`${baseUrl}/api/private-access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: secret }),
    signal: AbortSignal.timeout(15_000),
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  const raw = setCookie[0] ?? res.headers.get('set-cookie') ?? '';
  const match = raw.match(/^([^=]+=[^;]+)/);
  if (!res.ok || !match) {
    throw new Error(`Gate unlock failed: HTTP ${res.status}`);
  }
  return match[1];
}

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
    // /beta is intentionally public while gated (PRIVATE_GATE_PUBLIC_PATHS)
    const beta = await headOrGet('/beta', { redirect: 'manual' });
    const betaLoc = beta.headers.get('location') || '';
    const betaOk = beta.status === 200;
    checks.push({
      name: 'GET /beta public while gated',
      ok: betaOk,
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
    const privatePage = await headOrGet('/private');
    checks.push({
      name: 'GET /private (200)',
      ok: privatePage.status === 200,
      detail: `status ${privatePage.status}`,
    });
  } catch (e) {
    checks.push({ name: 'GET /private', ok: false, detail: String(e) });
  }

  try {
    // Invitee path: SSR must expose data-mw-invitee="1" (not waitlist-only).
    const inviteCode = 'MW-B-SMOKE';
    const invitePage = await headOrGet(`/private?invite=${inviteCode}`);
    let inviteOk = invitePage.status === 200;
    let inviteDetail = `status ${invitePage.status}`;
    if (invitePage.status === 200) {
      const html = await invitePage.text();
      const marked = /data-mw-invitee=["']1["']/.test(html);
      const hasInviteCopy = /you.?re invited|beta invite|enter your access code/i.test(html);
      inviteOk = marked || hasInviteCopy;
      inviteDetail = marked
        ? 'data-mw-invitee=1'
        : hasInviteCopy
          ? 'invitee copy present'
          : 'missing data-mw-invitee=1 — check app/private SSR invite expand';
    }
    checks.push({
      name: 'GET /private?invite=… invitee path',
      ok: inviteOk,
      detail: inviteDetail,
    });
  } catch (e) {
    checks.push({ name: 'GET /private?invite=', ok: false, detail: String(e) });
  }

  try {
    const log = await headOrGet('/log', { redirect: 'manual' });
    const logLoc = log.headers.get('location') || '';
    const logGated =
      (log.status >= 300 && log.status < 400 && logLoc.includes('/private')) || log.status === 403;
    checks.push({
      name: 'GET /log gated without cookie',
      ok: logGated,
      detail: logGated ? `${log.status}${logLoc ? ` → ${logLoc}` : ''}` : `status ${log.status}`,
    });
  } catch (e) {
    checks.push({ name: 'GET /log gated', ok: false, detail: String(e) });
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
    const statsProtected = classStats.status === 401 || classStats.status === 403;
    checks.push({
      name: 'GET /api/school/class/[code]/stats (no teacher auth)',
      ok: statsProtected,
      detail: `status ${classStats.status}${statsProtected ? '' : ' — expected 401/403'}`,
    });
  } catch (e) {
    checks.push({ name: 'GET /api/school/class/stats', ok: false, detail: String(e) });
  }

  try {
    const classLb = await headOrGet('/api/school/class/MWTEST/leaderboard');
    const lbProtected = classLb.status === 401 || classLb.status === 403;
    checks.push({
      name: 'GET /api/school/class/[code]/leaderboard (no teacher auth)',
      ok: lbProtected,
      detail: `status ${classLb.status}${lbProtected ? '' : ' — expected 401/403'}`,
    });
  } catch (e) {
    checks.push({ name: 'GET /api/school/class/leaderboard', ok: false, detail: String(e) });
  }

  try {
    const stripeForgery = await headOrGet('/api/stripe-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    const stripeOk = stripeForgery.status === 401 || stripeForgery.status === 503;
    checks.push({
      name: 'POST /api/stripe-webhook rejects unsigned body',
      ok: stripeOk,
      detail: `status ${stripeForgery.status}`,
    });
  } catch (e) {
    checks.push({ name: 'POST /api/stripe-webhook', ok: false, detail: String(e) });
  }

  try {
    const paypalForgery = await headOrGet('/api/paypal-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    const paypalOk = paypalForgery.status === 401 || paypalForgery.status === 400 || paypalForgery.status === 503;
    checks.push({
      name: 'POST /api/paypal-webhook rejects unsigned body',
      ok: paypalOk,
      detail: `status ${paypalForgery.status}`,
    });
  } catch (e) {
    checks.push({ name: 'POST /api/paypal-webhook', ok: false, detail: String(e) });
  }

  try {
    const cron = await headOrGet('/api/cron/nudges');
    const cronOk = cron.status === 401 || cron.status === 403;
    checks.push({
      name: 'GET /api/cron/nudges without CRON_SECRET',
      ok: cronOk,
      detail: `status ${cron.status}${cronOk ? '' : ' — expected 401/403'}`,
    });
  } catch (e) {
    checks.push({ name: 'GET /api/cron/nudges', ok: false, detail: String(e) });
  }

  try {
    const beta = await headOrGet('/api/beta/metrics');
    const betaOk = beta.status === 403 || beta.status === 401 || beta.status === 503;
    checks.push({
      name: 'GET /api/beta/metrics without admin',
      ok: betaOk,
      detail: `status ${beta.status}${betaOk ? '' : ' — expected 403'}`,
    });
  } catch (e) {
    checks.push({ name: 'GET /api/beta/metrics', ok: false, detail: String(e) });
  }

  try {
    const cryptoIntent = await headOrGet('/api/crypto-checkout/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    // Unauthenticated → 401; gated private mode may return 403 before route
    const cryptoOk =
      cryptoIntent.status === 401 ||
      cryptoIntent.status === 403 ||
      cryptoIntent.status === 503;
    checks.push({
      name: 'POST /api/crypto-checkout/intent without session',
      ok: cryptoOk,
      detail: `status ${cryptoIntent.status}`,
    });
  } catch (e) {
    checks.push({ name: 'POST /api/crypto-checkout/intent', ok: false, detail: String(e) });
  }

  try {
    const cryptoConfirm = await headOrGet('/api/crypto-checkout/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intentId: '00000000-0000-0000-0000-000000000000', signature: 'x'.repeat(64) }),
    });
    const confirmOk =
      cryptoConfirm.status === 401 ||
      cryptoConfirm.status === 403 ||
      cryptoConfirm.status === 503;
    checks.push({
      name: 'POST /api/crypto-checkout/confirm without session',
      ok: confirmOk,
      detail: `status ${cryptoConfirm.status}`,
    });
  } catch (e) {
    checks.push({ name: 'POST /api/crypto-checkout/confirm', ok: false, detail: String(e) });
  }

  try {
    const premiumStatus = await headOrGet('/api/premium/status');
    let body: { premium?: boolean; source?: string } = {};
    try {
      body = (await premiumStatus.json()) as { premium?: boolean; source?: string };
    } catch {
      body = {};
    }
    const statusOk =
      premiumStatus.status === 200 &&
      body.premium === false &&
      (body.source === 'anonymous' ||
        body.source === 'unconfigured' ||
        body.source === 'free');
    checks.push({
      name: 'GET /api/premium/status (anonymous)',
      ok: statusOk,
      detail: `status ${premiumStatus.status} premium=${String(body.premium)} source=${body.source ?? '?'}`,
    });
  } catch (e) {
    checks.push({ name: 'GET /api/premium/status', ok: false, detail: String(e) });
  }

  try {
    const offline = await headOrGet('/offline');
    checks.push({
      name: 'GET /offline fallback page',
      ok: offline.status === 200,
      detail: `status ${offline.status}`,
    });
  } catch (e) {
    checks.push({ name: 'GET /offline', ok: false, detail: String(e) });
  }

  try {
    const homeHeaders = await headOrGet('/');
    const nosniff = homeHeaders.headers.get('x-content-type-options');
    const frame = homeHeaders.headers.get('x-frame-options');
    const headersOk =
      (nosniff?.toLowerCase() === 'nosniff' || !!nosniff) &&
      (frame?.toLowerCase() === 'sameorigin' || !!frame);
    checks.push({
      name: 'Security headers on /',
      ok: headersOk,
      detail: `X-Content-Type-Options=${nosniff ?? 'missing'}, X-Frame-Options=${frame ?? 'missing'}`,
    });
  } catch (e) {
    checks.push({ name: 'Security headers', ok: false, detail: String(e) });
  }

  if (process.env.SMOKE_EXPECT_PWA === 'true') {
    try {
      const sw = await headOrGet('/sw.js');
      const manifest = await headOrGet('/manifest.webmanifest');
      const pwaOk = sw.status === 200 && manifest.status === 200;
      checks.push({
        name: 'PWA assets (sw.js + manifest)',
        ok: pwaOk,
        detail: `sw.js=${sw.status}, manifest=${manifest.status}`,
      });
    } catch (e) {
      checks.push({ name: 'PWA assets', ok: false, detail: String(e) });
    }
  } else {
    checks.push({
      name: 'PWA assets',
      ok: true,
      detail: 'skipped — set SMOKE_EXPECT_PWA=true after PRIVATE_MODE=false',
    });
  }

  const accessSecret = process.env.SMOKE_ACCESS_SECRET;
  if (accessSecret) {
    try {
      const cookie = await unlockCookie(base, accessSecret);
      const unlocked = await headOrGet('/welcome', {
        headers: { Cookie: cookie },
      });
      const ok = unlocked.status === 200;
      checks.push({
        name: 'GET /welcome (unlocked via gate cookie)',
        ok,
        detail: ok ? '200 OK' : `status ${unlocked.status}`,
      });

      const logUnlocked = await headOrGet('/log', {
        headers: { Cookie: cookie },
        redirect: 'manual',
      });
      const logLoc = logUnlocked.headers.get('location') || '';
      const logOk =
        logUnlocked.status === 200 ||
        (logUnlocked.status >= 300 && logUnlocked.status < 400 && !logLoc.includes('/private'));
      checks.push({
        name: 'GET /log (unlocked via gate cookie)',
        ok: logOk,
        detail: logOk
          ? `${logUnlocked.status}${logLoc ? ` → ${logLoc}` : ''}`
          : `status ${logUnlocked.status}${logLoc ? ` → ${logLoc}` : ''}`,
      });

      const profile = await headOrGet('/profile', {
        headers: { Cookie: cookie },
      });
      let buildDetail = `status ${profile.status}`;
      let buildOk = profile.status === 200;
      if (profile.status === 200) {
        const html = await profile.text();
        const labelMatch = html.match(/20\d{2}\.\d{2}-unified\.\d+/);
        const expected = process.env.SMOKE_EXPECT_BUILD_LABEL?.trim();
        if (expected) {
          buildOk = !!labelMatch && labelMatch[0] === expected;
          buildDetail = labelMatch
            ? `build label ${labelMatch[0]}${buildOk ? '' : ` (expected ${expected})`}`
            : `200 but expected build ${expected} not found`;
        } else {
          buildOk = !!labelMatch;
          buildDetail = labelMatch
            ? `build label ${labelMatch[0]}`
            : '200 but APP_BUILD_LABEL pattern not found in HTML';
        }
      }
      checks.push({
        name: 'GET /profile shows build label',
        ok: buildOk,
        detail: buildDetail,
      });
    } catch (e) {
      checks.push({ name: 'GET /welcome unlocked', ok: false, detail: String(e) });
    }
  } else {
    checks.push({
      name: 'GET /welcome (unlocked)',
      ok: true,
      detail: 'skipped — set SMOKE_ACCESS_SECRET to probe gated welcome route',
    });
  }

  try {
    const icon192 = await headOrGet('/pwa-192x192.png');
    const icon512 = await headOrGet('/pwa-512x512.png');
    const iconsOk = icon192.status === 200 && icon512.status === 200;
    checks.push({
      name: 'PWA icon assets (192 + 512)',
      ok: iconsOk,
      detail: `192=${icon192.status}, 512=${icon512.status}`,
    });
  } catch (e) {
    checks.push({ name: 'PWA icon assets', ok: false, detail: String(e) });
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
