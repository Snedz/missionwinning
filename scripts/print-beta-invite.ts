#!/usr/bin/env node
/**
 * Print beta invite link + email template for founders (local only).
 * Usage: MISSION_BASE_URL=https://www.missionwinning.com npm run print-beta-invite
 * Requires PRIVATE_ACCESS_SECRET in .env.local (never commit).
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

if (!base) {
  console.error('Set MISSION_BASE_URL=https://your-deploy-url');
  process.exit(1);
}
if (!secret || secret.includes('change-me')) {
  console.error('Set PRIVATE_ACCESS_SECRET in .env.local (rotate before sharing invites)');
  process.exit(1);
}

const inviteUrl = `${base}/?access=${secret}`;
const betaUrl = `${base}/beta`;

console.log(`
Mission Winning — Beta invite (founder copy)
============================================

Invite link (send securely — do not post publicly):
${inviteUrl}

Beta guide:
${betaUrl}

--- Email template ---

Subject: You're invited — Mission Winning private beta

Hi [Name],

You're in the first cohort of Mission Winning — a free-core fitness app with a guided journey (I-Day → training → rankings).

Start here (2 minutes):
1. Open: ${inviteUrl}
2. Read the beta guide: ${betaUrl}
3. Complete I-Day at ${base}/welcome
4. Log one workout from Today (${base}/log)
5. Optional: sign in on Profile for cloud sync

What to try:
- Header menu → Move, Mind, Leaderboard, Learn, Super Bundle
- Profile → Language (Arabic RTL, Thai, Spanish, etc.)

Feedback: Reply to this email or use in-app feedback.

— Mission Winning team
`);
