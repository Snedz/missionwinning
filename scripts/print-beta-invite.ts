#!/usr/bin/env node
/**
 * Print beta invite link + email template for founders (local only).
 * Usage: MISSION_BASE_URL=https://www.missionwinning.com npm run print-beta-invite
 *
 * Prod blocks `?access=` unless PRIVATE_ALLOW_QUERY_ACCESS=true.
 * Default: /private?invite=… + share access code out-of-band.
 * Optional invite code: BETA_INVITE_CODE=MW-B-XXXXX (else placeholder).
 */
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env.local');

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  const text = readFileSync(path, 'utf8');
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(envPath);

const base = (process.env.MISSION_BASE_URL || process.env.SMOKE_BASE_URL || '').replace(/\/$/, '');
const secret = process.env.PRIVATE_ACCESS_SECRET;
const inviteCode = (process.env.BETA_INVITE_CODE || 'MW-B-XXXXX').trim();
const allowQuery = process.env.PRIVATE_ALLOW_QUERY_ACCESS === 'true';

if (!base) {
  console.error('Set MISSION_BASE_URL=https://your-deploy-url');
  process.exit(1);
}
if (!secret || secret.includes('change-me')) {
  console.error('Set PRIVATE_ACCESS_SECRET in .env.local (rotate before sharing invites)');
  process.exit(1);
}

const params = new URLSearchParams();
params.set('invite', inviteCode);
if (allowQuery) {
  params.set('access', secret);
}
const inviteUrl = `${base}/private?${params.toString()}`;
const privateUrl = `${base}/private`;
const betaUrl = `${base}/beta`;

console.log(`
Mission Winning — Beta invite (founder copy)
============================================

Invite link (attribution; access code shared separately):
${inviteUrl}

Gate (type access code):
${privateUrl}

Access code (send in same email/DM — do not put in public posts):
${secret}

Beta guide:
${betaUrl}

Note: Production rejects ?access= unless PRIVATE_ALLOW_QUERY_ACCESS=true.
Prefer Profile → Beta funnel → Issue invite for unique MW-B- codes.

--- Email template ---

Subject: You're invited — Mission Winning private beta

Hi [Name],

You're in the first cohort of Mission Winning — free offline workout logging (no account) plus Mission Coach: weekly plans that adapt from your logs alone (no wearable). Guided path: I-Day → first workout → Mission Coach.

Start here (2 minutes):
1. Open: ${inviteUrl}
2. Enter access code: (from this email / DM)
3. Read the beta guide: ${betaUrl}
4. Complete I-Day at ${base}/welcome
5. Log one workout from Today (${base}/log)
6. Open Mission Coach (${base}/coach) after your first log
7. Optional: sign in on Profile for cloud sync

What to try:
- Header menu → Train, Fuel, Coach, Learn
- Profile → Language
- Optional: Beyond the Basics magazine PDF — ${base}/magazine/beyond-the-basics.pdf (or ${base}/guide)

Feedback: Reply to this email or use in-app feedback. Especially: did Coach feel useful after one workout?

— Mission Winning team
`);
