#!/usr/bin/env node
/**
 * Founder launch broadcast to leads (Resend + service role).
 *
 * Dry-run by default. Live:
 *   node --env-file=.env.local scripts/send-launch-broadcast.mjs --send --limit 1 --to you@example.com
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL, RESEND_API_KEY
 * Optional: RESEND_FROM, NUDGE_SECRET (unsubscribe tokens), NEXT_PUBLIC_SITE_URL
 */
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'node:crypto';
import { Resend } from 'resend';

const args = process.argv.slice(2);
const send = args.includes('--send');
const limitIdx = args.indexOf('--limit');
const limit = limitIdx >= 0 ? Math.max(1, parseInt(args[limitIdx + 1] || '50', 10)) : 500;
const toIdx = args.indexOf('--to');
const forceTo = toIdx >= 0 ? args[toIdx + 1] : null;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM || 'Mission Winning <onboarding@resend.dev>';
const site =
  (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.missionwinning.com').replace(/\/$/, '');
const nudgeSecret =
  process.env.NUDGE_SECRET?.trim() ||
  process.env.PRIVATE_ACCESS_SECRET ||
  '';

function unsubToken(email) {
  return createHmac('sha256', nudgeSecret).update(`lead-unsub:${email.trim().toLowerCase()}`).digest('hex');
}

function unsubUrl(email) {
  return `${site}/api/leads/unsubscribe?e=${encodeURIComponent(email.trim().toLowerCase())}&t=${unsubToken(email)}`;
}

function bodyFor(email) {
  return [
    "You're on the list — we're public.",
    '',
    `Start free (no account needed): ${site}/welcome`,
    '',
    'Super Bundle founders pricing is open for early supporters (12-month + lifetime). Free core stays free forever.',
    '',
    "If this isn't useful, just ignore — no spam cadence promised beyond this launch note.",
    '',
    `Unsubscribe: ${unsubUrl(email)}`,
    '',
    '— Mission Winning',
  ].join('\n');
}

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

const { data: rows, error } = await admin
  .from('leads')
  .select('id, email, package_interest, unsubscribed_at, launch_email_sent_at, created_at')
  .order('created_at', { ascending: false })
  .limit(2000);

if (error) {
  console.error('Fetch leads failed:', error.message);
  process.exit(1);
}

const sources = new Set();
const byEmail = new Map();
for (const row of rows || []) {
  const email = String(row.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) continue;
  const src = row.package_interest || 'general';
  sources.add(src);
  if (byEmail.has(email)) continue;
  byEmail.set(email, row);
}

const candidates = [];
let suppressedUnsub = 0;
let suppressedSent = 0;
for (const [email, row] of byEmail) {
  if (row.unsubscribed_at) {
    suppressedUnsub++;
    continue;
  }
  if (row.launch_email_sent_at) {
    suppressedSent++;
    continue;
  }
  candidates.push({ email, id: row.id, source: row.package_interest });
}

const slice = candidates.slice(0, limit);

console.log('=== Launch broadcast ===');
console.log(`Mode: ${send ? 'SEND' : 'DRY-RUN (pass --send to deliver)'}`);
console.log(`Fetched rows: ${(rows || []).length}`);
console.log(`Deduped emails: ${byEmail.size}`);
console.log(`Suppressed unsubscribed: ${suppressedUnsub}`);
console.log(`Suppressed already launched: ${suppressedSent}`);
console.log(`Candidates this run: ${slice.length} (limit ${limit})`);
console.log(`Sources seen: ${[...sources].sort().join(', ') || '(none)'}`);
if (forceTo) console.log(`Redirect all recipients → ${forceTo}`);
console.log('');

if (!send) {
  console.log('Sample recipients (first 10):');
  for (const c of slice.slice(0, 10)) {
    console.log(`  ${c.email}  [${c.source || 'general'}]`);
  }
  console.log('\nDry-run complete. Re-run with --send to deliver.');
  process.exit(0);
}

if (!resendKey) {
  console.error('RESEND_API_KEY required for --send');
  process.exit(1);
}
if (!nudgeSecret) {
  console.warn('Warning: NUDGE_SECRET unset — unsubscribe tokens will not verify in prod.');
}

const resend = new Resend(resendKey);
let sent = 0;
let failed = 0;

for (const c of slice) {
  const to = forceTo || c.email;
  try {
    const { error: sendErr } = await resend.emails.send({
      from,
      to,
      subject: 'Mission Winning is live — founders offer',
      text: bodyFor(c.email),
      tags: [{ name: 'kind', value: 'launch-broadcast' }],
    });
    if (sendErr) {
      console.error(`FAIL ${c.email}:`, sendErr.message || sendErr);
      failed++;
      continue;
    }
    const { error: stampErr } = await admin
      .from('leads')
      .update({ launch_email_sent_at: new Date().toISOString() })
      .ilike('email', c.email);
    if (stampErr) {
      console.warn(`Sent but stamp failed for ${c.email}:`, stampErr.message);
    }
    sent++;
    console.log(`OK ${c.email}${forceTo ? ` → ${forceTo}` : ''}`);
  } catch (err) {
    console.error(`FAIL ${c.email}:`, err.message || err);
    failed++;
  }
}

console.log('');
console.log(`Summary: sent=${sent} failed=${failed} limit=${limit}`);
process.exit(failed > 0 && sent === 0 ? 1 : 0);
