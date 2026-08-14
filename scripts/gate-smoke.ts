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
  /** Checks that did not run. Counted separately so "passed" means measured (`.213`). */
  const skipped: string[] = [];

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
    // /welcome is public while gated (.97+) so SEO /guide "Start free" reaches I-Day
    const welcome = await headOrGet('/welcome', { redirect: 'manual' });
    const welcomeLoc = welcome.headers.get('location') || '';
    const welcomePublic = welcome.status === 200;
    checks.push({
      name: 'GET /welcome public while gated',
      ok: welcomePublic,
      detail: welcomePublic
        ? '200 OK'
        : `status ${welcome.status}${welcomeLoc ? ` → ${welcomeLoc}` : ''} (expected 200; Today/Train stay gated)`,
    });
  } catch (e) {
    checks.push({ name: 'GET /welcome', ok: false, detail: String(e) });
  }

  /*
   * `.765` — what the first byte says, measured off the wire.
   *
   * On 2026-08-13 the whole visible body of `/private` — which is www itself
   * while the gate is up — was the words "Checking sign-in…", and `/welcome`
   * server-rendered no text at all. Both were invisible to every existing
   * check, because a browser test reads the hydrated DOM and a source guard
   * cannot see what streamed. This reads the bytes.
   */
  for (const { path, needle, why } of [
    {
      path: '/private',
      needle: 'Train anywhere',
      why: 'gate poster must not wait on the session probe (PrivateTeaserClient)',
    },
    {
      /* Not the word "Welcome": that is in `<title>`, so it passes on a blank
         page. The first draft of this check did exactly that and went green
         against the very deploy whose `/welcome` body was one grey box. */
      path: '/welcome',
      needle: 'first session',
      why: 'I-Day step one must be server-rendered (app/welcome/page.tsx resolves ?edit=)',
    },
  ]) {
    try {
      const res = await headOrGet(path, { redirect: 'manual' });
      if (res.status !== 200) {
        checks.push({
          name: `GET ${path} first paint carries copy`,
          ok: false,
          detail: `status ${res.status} (expected 200 — public while gated)`,
        });
        continue;
      }
      const html = await res.text();
      /* Body text nodes only. The copy also lives in the RSC payload and the
         `<title>`, neither of which a reader sees as page content, so matching
         raw HTML would pass on a blank page. */
      const text = html
        .replace(/<head[\s\S]*?<\/head>/i, ' ')
        .replace(/<script[\s\S]*?<\/script>/g, ' ')
        .replace(/<style[\s\S]*?<\/style>/g, ' ')
        .replace(/<[^>]+>/g, '\n');
      const ok = text.includes(needle);
      checks.push({
        name: `GET ${path} first paint carries copy`,
        ok,
        detail: ok ? `200 — "${needle}" in the served HTML` : `no "${needle}" text node — ${why}`,
      });
    } catch (e) {
      checks.push({ name: `GET ${path} first paint`, ok: false, detail: String(e) });
    }
  }

  // Production smoke ratchet (.682): retired compare hub + legal English floors.
  // Live `.618` returned 200 with Hevy/Strong; tip redirects permanently to /welcome.
  for (const path of ['/compare', '/compare/forge']) {
    try {
      const res = await headOrGet(path, { redirect: 'manual' });
      const loc = res.headers.get('location') || '';
      const redirected =
        res.status >= 300 &&
        res.status < 400 &&
        (loc.includes('/welcome') || loc.endsWith('/welcome'));
      let ok = redirected;
      let detail = redirected
        ? `${res.status} → ${loc}`
        : `status ${res.status}${loc ? ` → ${loc}` : ''} (expected permanent redirect to /welcome)`;
      if (res.status === 200) {
        const html = await res.text();
        const competitorHub = /\bHevy\b/.test(html) && /\bStrong\b/.test(html);
        ok = false;
        detail = competitorHub
          ? '200 with Hevy/Strong compare hub — deploy tip (.668+) or restore next.config redirects'
          : '200 without redirect to /welcome';
      }
      checks.push({ name: `GET ${path} → /welcome`, ok, detail });
    } catch (e) {
      checks.push({ name: `GET ${path}`, ok: false, detail: String(e) });
    }
  }

  // Raw i18n keys as HTML text nodes (`>infoPrivacyOverview<`) — the .618 paint bug.
  // Script/RSC key strings alone are not this pattern; text-node paint is.
  for (const path of ['/privacy', '/terms']) {
    try {
      const res = await headOrGet(path, { redirect: 'manual' });
      const loc = res.headers.get('location') || '';
      if (res.status !== 200) {
        checks.push({
          name: `GET ${path} no raw info keys`,
          ok: false,
          detail: `status ${res.status}${loc ? ` → ${loc}` : ''} (expected 200 public legal page)`,
        });
        continue;
      }
      const html = await res.text();
      const painted = [
        ...html.matchAll(/>(info(?:Privacy|Terms)[A-Za-z0-9]+)</g),
      ].map((m) => m[1]!);
      const unique = [...new Set(painted)].slice(0, 8);
      const ok = unique.length === 0;
      checks.push({
        name: `GET ${path} no raw info keys`,
        ok,
        detail: ok
          ? '200 — no raw infoPrivacy*/infoTerms* text nodes'
          : `raw keys painted: ${unique.join(', ')} — need infoEnFloor (.653+)`,
      });
    } catch (e) {
      checks.push({ name: `GET ${path} no raw info keys`, ok: false, detail: String(e) });
    }
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
    // Public calculators are SEO surfaces — reachable while gated (Phase 2 rebrand)
    const calc = await headOrGet('/calculators/1rm', { redirect: 'manual' });
    const calcLoc = calc.headers.get('location') || '';
    checks.push({
      name: 'GET /calculators/1rm public while gated',
      ok: calc.status === 200,
      detail: `${calc.status}${calcLoc ? ` → ${calcLoc}` : ''}`,
    });
  } catch (e) {
    checks.push({ name: 'GET /calculators/1rm', ok: false, detail: String(e) });
  }

  try {
    const pdf = await headOrGet('/magazine/beyond-the-basics.pdf', { redirect: 'manual' });
    const pdfLoc = pdf.headers.get('location') || '';
    const pdfOk = pdf.status === 200;
    checks.push({
      name: 'GET /magazine PDF public while gated',
      ok: pdfOk,
      detail: pdfOk
        ? '200 OK'
        : `status ${pdf.status}${pdfLoc ? ` → ${pdfLoc}` : ''}`,
    });
  } catch (e) {
    checks.push({ name: 'GET /magazine PDF', ok: false, detail: String(e) });
  }

  try {
    const locales = await headOrGet('/locales/en/common.json', { redirect: 'manual' });
    const localesLoc = locales.headers.get('location') || '';
    const localesOk = locales.status === 200;
    checks.push({
      name: 'GET /locales JSON public while gated',
      ok: localesOk,
      detail: localesOk
        ? '200 OK'
        : `status ${locales.status}${localesLoc ? ` → ${localesLoc}` : ''}`,
    });
  } catch (e) {
    checks.push({ name: 'GET /locales', ok: false, detail: String(e) });
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
    const meal = await headOrGet('/api/fuel/estimate-meal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    // Requires gate cookie or session — anonymous must not reach vision/heuristic.
    const mealOk = meal.status === 401 || meal.status === 403;
    checks.push({
      name: 'POST /api/fuel/estimate-meal without access',
      ok: mealOk,
      detail: `status ${meal.status}${mealOk ? '' : ' — expected 401/403'}`,
    });
  } catch (e) {
    checks.push({ name: 'POST /api/fuel/estimate-meal', ok: false, detail: String(e) });
  }

  try {
    const schoolGet = await headOrGet('/api/school/class/SMOKE/verify?pin=0000');
    // GET PIN-in-query removed — expect 405 Method Not Allowed (or 404).
    const schoolGetOk =
      schoolGet.status === 405 || schoolGet.status === 404 || schoolGet.status === 403;
    checks.push({
      name: 'GET /api/school/class/[code]/verify (PIN in query) rejected',
      ok: schoolGetOk,
      detail: `status ${schoolGet.status}`,
    });
  } catch (e) {
    checks.push({ name: 'GET /api/school/class/verify', ok: false, detail: String(e) });
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
    /*
     * `.213` — a skipped check is not a passed check.
     *
     * This pushed `ok: true` with detail "skipped", so the summary counted a
     * PWA check that never ran. That is the same defect `ci-extended.yml`
     * documents at length for the visual job and `.200` was written about: a
     * check that reports success while measuring nothing.
     *
     * Reporting it as *skipped* rather than *passed* keeps the count honest.
     * Note this does not change the PWA policy — the service worker is
     * deliberately off while `PRIVATE_MODE=true` (do not offline-cache a
     * private app). It only stops the check lying about itself.
     */
    skipped.push('PWA assets — set SMOKE_EXPECT_PWA=true after PRIVATE_MODE=false');
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
    // `.213` — same shape as the PWA check above: skipped is not passed.
    skipped.push('GET /welcome (unlocked) — set SMOKE_ACCESS_SECRET to probe the gated route');
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

  for (const s of skipped) console.log(`  – ${s}`);
  const tail = skipped.length ? ` (${skipped.length} skipped — not measured)` : '';
  console.log(
    failed ? `\n${failed} check(s) failed.${tail}\n` : `\nAll gate checks passed.${tail}\n`
  );
  process.exit(failed ? 1 : 0);
}

main();
