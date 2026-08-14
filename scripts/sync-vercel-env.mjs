#!/usr/bin/env node
/**
 * Upsert Mission Winning env vars to Vercel via REST API.
 *
 * Required env:
 *   VERCEL_TOKEN
 *   VERCEL_PROJECT_ID
 *
 * Optional:
 *   VERCEL_ORG_ID — team id when project lives under a team
 *   VERCEL_DEPLOY_HOOK_URL — POST after successful sync to trigger redeploy
 *
 * Each listed variable is synced only when set in process.env (GitHub Secrets in CI).
 */
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const TEAM_ID = process.env.VERCEL_ORG_ID;
const DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK_URL;

const TARGETS = ['production', 'preview', 'development'];

/** Keys synced when present in process.env. PRIVATE_ACCESS_SECRET must be set. */
const SYNC_KEYS = [
  'PRIVATE_ACCESS_SECRET',
  // Aliases (e.g. Done) must ship to Preview too — Production-only CODES is
  // why the beta code works on www and 401s on every *.vercel.app.
  'PRIVATE_ACCESS_CODES',
  'PRIVATE_MODE',
  'PRIVATE_ALLOW_AUTH_BYPASS',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'BETA_ADMIN_EMAILS',
  'BETA_ADMIN_SECRET',
  'DEMO_PREMIUM',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_OAUTH_GOOGLE',
  'NEXT_PUBLIC_OAUTH_APPLE',
  'NEXT_PUBLIC_OAUTH_AZURE',
  'NEXT_PUBLIC_OAUTH_FACEBOOK',
  'RESEND_API_KEY',
  'RESEND_FROM',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_STRIPE_LINK_BUNDLE',
  'NEXT_PUBLIC_STRIPE_LINK_PREMIUM',
  'PAYPAL_WEBHOOK_ID',
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET',
  'PAYPAL_ENV',
  'CSP_ENFORCE',
  'COACH_LLM_API_URL',
  'COACH_LLM_API_KEY',
  'COACH_LLM_MODEL',
  'NEXT_PUBLIC_SENTRY_DSN',
  'SENTRY_ORG',
  'SENTRY_PROJECT',
  'SENTRY_AUTH_TOKEN',
];

function fail(msg) {
  console.error(`sync-vercel-env: ${msg}`);
  process.exit(1);
}

async function vercelFetch(path, init = {}) {
  const url = new URL(`https://api.vercel.com${path}`);
  if (TEAM_ID) url.searchParams.set('teamId', TEAM_ID);
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const detail = typeof body === 'object' ? JSON.stringify(body) : String(body);
    throw new Error(`${init.method || 'GET'} ${path} → ${res.status}: ${detail}`);
  }
  return body;
}

async function listProjectEnv() {
  const data = await vercelFetch(`/v9/projects/${PROJECT_ID}/env`);
  return data.envs || [];
}

async function upsertEnv(key, value) {
  const existing = (await listProjectEnv()).filter((e) => e.key === key);
  const payload = {
    key,
    value,
    type: 'encrypted',
    target: TARGETS,
    comment: 'Synced from GitHub Actions (scripts/sync-vercel-env.mjs)',
  };

  if (existing.length === 0) {
    await vercelFetch(`/v10/projects/${PROJECT_ID}/env`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return 'created';
  }

  for (const row of existing) {
    await vercelFetch(`/v9/projects/${PROJECT_ID}/env/${row.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        value,
        target: TARGETS,
        type: 'encrypted',
      }),
    });
  }
  return existing.length > 1 ? `updated (${existing.length} rows)` : 'updated';
}

async function triggerDeployHook() {
  if (!DEPLOY_HOOK) return;
  const res = await fetch(DEPLOY_HOOK, { method: 'POST' });
  if (!res.ok) {
    throw new Error(`Deploy hook failed: ${res.status}`);
  }
  console.log('  ✓ Deploy hook triggered');
}

async function main() {
  if (!VERCEL_TOKEN) fail('VERCEL_TOKEN is required');
  if (!PROJECT_ID) fail('VERCEL_PROJECT_ID is required');
  if (!process.env.PRIVATE_ACCESS_SECRET) {
    fail('PRIVATE_ACCESS_SECRET must be set in GitHub Secrets before sync');
  }

  const toSync = SYNC_KEYS.filter((k) => {
    const v = process.env[k];
    return v != null && String(v).trim() !== '';
  });

  console.log('\nMission Winning — sync env to Vercel\n');
  console.log(`  Project: ${PROJECT_ID}`);
  console.log(`  Variables: ${toSync.length}\n`);

  for (const key of toSync) {
    const action = await upsertEnv(key, process.env[key]);
    console.log(`  ✓ ${key} (${action})`);
  }

  await triggerDeployHook();
  console.log('\nDone. Vercel will apply vars on the next deployment.\n');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
