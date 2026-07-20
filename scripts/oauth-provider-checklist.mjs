#!/usr/bin/env node
/**
 * Founder checklist: OAuth providers (Google, Apple, Microsoft/Azure, Facebook).
 * Run: node scripts/oauth-provider-checklist.mjs
 *
 * Does not call APIs — prints the enable order and env flags.
 * Full steps: ENV.md § OAuth sign-in
 */
const STEPS = [
  {
    id: 'urls',
    title: 'Supabase URL Configuration',
    checks: [
      'Site URL = https://www.missionwinning.com (or localhost for pure local)',
      'Redirect URLs include https://www.missionwinning.com/auth/callback',
      'Redirect URLs include http://localhost:3000/auth/callback',
    ],
  },
  {
    id: 'google',
    title: 'Google (fixes “provider is not enabled”)',
    checks: [
      'Google Cloud OAuth Web client redirect = https://<ref>.supabase.co/auth/v1/callback',
      'Supabase Client IDs = only ….apps.googleusercontent.com (comma-separated if many; no secret/JSON/spaces)',
      'Supabase Client Secret = GOCSPX-… in the Secret field only',
      'Supabase → Providers → Google enabled → Save',
      'Smoke-test Profile → Continue with Google',
    ],
  },
  {
    id: 'azure',
    title: 'Microsoft (Azure) — then set NEXT_PUBLIC_OAUTH_AZURE=true',
    checks: [
      'Entra app Web redirect = https://<ref>.supabase.co/auth/v1/callback',
      'Supabase → Providers → Azure enabled',
      'Vercel/local: NEXT_PUBLIC_OAUTH_AZURE=true + redeploy',
    ],
  },
  {
    id: 'facebook',
    title: 'Facebook — then set NEXT_PUBLIC_OAUTH_FACEBOOK=true',
    checks: [
      'Meta Valid OAuth Redirect URI = https://<ref>.supabase.co/auth/v1/callback',
      'Email permission + Live mode for public users',
      'Supabase → Providers → Facebook enabled',
      'Vercel/local: NEXT_PUBLIC_OAUTH_FACEBOOK=true + redeploy',
    ],
  },
  {
    id: 'apple',
    title: 'Apple — then set NEXT_PUBLIC_OAUTH_APPLE=true',
    checks: [
      'Services ID + Return URL = https://<ref>.supabase.co/auth/v1/callback',
      'Supabase Apple: Services ID, .p8 secret, Key ID, Team ID (all filled)',
      'Vercel/local: NEXT_PUBLIC_OAUTH_APPLE=true + redeploy',
    ],
  },
];

console.log('Mission Winning — OAuth provider checklist\n');
for (const step of STEPS) {
  console.log(`## ${step.title}`);
  for (const c of step.checks) console.log(`  [ ] ${c}`);
  console.log('');
}
console.log('Never flip NEXT_PUBLIC_OAUTH_* before the matching Supabase provider is enabled.');
console.log('Details: ENV.md');
