#!/usr/bin/env node
/**
 * Send the Modernist beta-invite email to one tester.
 *
 * Until now the invite existed only as text printed to stdout by
 * `print-beta-invite` for manual copy-paste; this is the first sender.
 *
 * Usage (dry-run prints the resolved values and exits):
 *   npm run send-beta-invite -- --to=tester@example.com
 *   npm run send-beta-invite -- --to=tester@example.com --code=MW-B-7F2Q --send
 *
 * Founder-owned prerequisites (never invented here):
 *   RESEND_API_KEY        real sends
 *   RESEND_FROM           verified sending domain — resend.dev is refused for --send
 *   MAIL_POSTAL_ADDRESS   CAN-SPAM physical address
 *   BETA_INVITE_CODE      or --code=; the access code the tester types at /private
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Resend } from 'resend';

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3).trim() : undefined;
}

const send = process.argv.includes('--send');
const to = arg('to');
const code = (arg('code') || process.env.BETA_INVITE_CODE || '').trim();
const postal = (process.env.MAIL_POSTAL_ADDRESS || '').trim();
const origin = (process.env.MISSION_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.missionwinning.com').replace(/\/$/, '');
const from = process.env.RESEND_FROM?.trim() || 'Mission Winning <onboarding@resend.dev>';
const apiKey = process.env.RESEND_API_KEY?.trim();

if (!to) {
  console.error('Usage: npm run send-beta-invite -- --to=tester@example.com [--code=MW-B-XXXX] [--send]');
  process.exit(1);
}
if (!code) {
  console.error('No access code: pass --code=MW-B-XXXX or set BETA_INVITE_CODE.');
  process.exit(1);
}
if (!postal) {
  console.error('MAIL_POSTAL_ADDRESS required — CAN-SPAM needs a physical address in the footer. See docs/ENV.md.');
  process.exit(1);
}

const html = readFileSync(path.join(process.cwd(), 'src/emails/templates/beta-invite.html'), 'utf8')
  .split('MW-ALPHA-2026')
  .join(code)
  .split('[postal address], USA')
  .join(postal)
  .split('https://www.missionwinning.com')
  .join(origin);

const text = [
  "You're invited — Mission Winning private beta.",
  '',
  `Access code: ${code}`,
  '',
  `1. Open ${origin} and enter the code.`,
  `2. Complete I-Day at ${origin}/welcome.`,
  `3. Log one workout from Today (${origin}/log).`,
  `4. Open Mission Coach (${origin}/coach) after your first log.`,
  '',
  `Beta guide: ${origin}/beta`,
  '',
  'The logger is free forever, no account required.',
  '',
  `Mission Winning, ${postal}`,
].join('\n');

console.log('=== Beta invite ===');
console.log(`Mode:   ${send ? 'SEND' : 'DRY-RUN (pass --send to deliver)'}`);
console.log(`To:     ${to}`);
console.log(`Code:   ${code}`);
console.log(`Origin: ${origin}`);
console.log(`From:   ${from}`);
console.log(`HTML:   ${html.length} bytes`);

if (!send) {
  console.log('\nDry-run complete. Re-run with --send to deliver.');
  process.exit(0);
}
if (!apiKey) {
  console.error('RESEND_API_KEY required for --send.');
  process.exit(1);
}
if (/@resend\.dev\b/i.test(from)) {
  console.error('RESEND_FROM is still the resend.dev test sender — set a verified domain before inviting testers.');
  process.exit(1);
}

// Wrapped rather than top-level await: this file runs both under `node
// --env-file` (ESM) and `tsx` (CJS transform, which rejects top-level await).
async function main() {
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: to as string,
    subject: "You're invited — Mission Winning private beta",
    text,
    html,
    tags: [{ name: 'kind', value: 'beta-invite' }],
  });

  if (error) {
    console.error('FAIL:', error.message || error);
    process.exit(1);
  }
  console.log(`\nSent to ${to}.`);
}

void main();
