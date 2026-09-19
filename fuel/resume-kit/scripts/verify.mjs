#!/usr/bin/env node
/**
 * Honesty + file checks for Resume Kit. Exit 0 only if the pack matches PLAN.md.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(path.join(root, rel), 'utf8');
const failures = [];
const check = (ok, msg) => {
  if (!ok) failures.push(msg);
};

const required = [
  'PLAN.md',
  'INDEX.md',
  'README.md',
  'config.js',
  'listing.md',
  'fulfill/CHECKLIST.md',
  'fulfill/DELIVER.md',
  'templates/one-page.html',
  'gtm/ICP.md',
  'gtm/OUTREACH_DRAFTS.md',
  'pages/index.html',
  'pages/listing.html',
  'pages/icp.html',
  'pages/outreach.html',
  'pages/fulfill.html',
  'scripts/verify.mjs',
];

for (const rel of required) {
  check(existsSync(path.join(root, rel)), `missing ${rel}`);
}

const cfg = require(path.join(root, 'config.js'));
check(cfg.sku === 'resume-kit', `sku is ${cfg.sku}`);
check(cfg.paymentUrl === '', `paymentUrl must be "" (got ${JSON.stringify(cfg.paymentUrl)})`);
check(cfg.checkout == null, 'checkout must be null / absent');
check(cfg.status === 'unpublished-draft', 'status must stay unpublished-draft');
check(cfg.price?.amountUsd === 29, `price must be $29 (got ${cfg.price?.amountUsd})`);
check(cfg.price?.cadence === 'one-time', `cadence must be one-time (got ${cfg.price?.cadence})`);
check(cfg.fulfillStatus === 'UNKNOWN', 'fulfillStatus must stay UNKNOWN until a real payment');

const corpus = [
  'README.md',
  'listing.md',
  'fulfill/CHECKLIST.md',
  'fulfill/DELIVER.md',
  'gtm/ICP.md',
  'gtm/OUTREACH_DRAFTS.md',
  'templates/one-page.html',
  'pages/index.html',
  'pages/listing.html',
  'pages/icp.html',
  'pages/outreach.html',
  'pages/fulfill.html',
]
  .map(read)
  .join('\n');

const poison = [
  /bestseller/i,
  /landed in 7 days/i,
  /\b10,?000\s+(customers|hires|sales)/i,
  /gumroad\.com/i,
  /lemonsqueezy/i,
  /buy now/i,
  /add to cart/i,
  /tip-promote/i,
];
for (const re of poison) {
  check(!re.test(corpus), `poison phrase matched ${re}`);
}

check(/UNPUBLISHED DRAFT/.test(read('listing.md')), 'listing.md must say UNPUBLISHED DRAFT');
check(/\$29/.test(read('listing.md')), 'listing.md must keep the $29 price label');
check(/one-time/.test(read('listing.md')), 'listing.md must say one-time');
check(/DO NOT SEND/.test(read('gtm/OUTREACH_DRAFTS.md')), 'outreach must say DO NOT SEND');
const sendCount = (read('gtm/OUTREACH_DRAFTS.md').match(/DO NOT SEND/g) || []).length;
check(sendCount >= 4, `outreach needs the header plus 3 drafts marked DO NOT SEND (found ${sendCount})`);
check(/UNKNOWN/.test(read('fulfill/CHECKLIST.md')), 'checklist must keep UNKNOWN first-class');

check(!/paymentUrl\s*[:=]\s*["']https?:/.test(read('config.js')), 'config.js must not set a http paymentUrl');
check(!/ClearShot/.test(corpus), 'ClearShot stays parked — do not mention it in this pack');

const pages = [
  'pages/index.html',
  'pages/listing.html',
  'pages/icp.html',
  'pages/outreach.html',
  'pages/fulfill.html',
].map(read).join('\n');
check(!/<button[^>]*>/i.test(pages), 'static pages must not ship a button (no buy control)');
check(!/type=["']submit["']/.test(pages), 'no submit controls');
check(!/mailto:/i.test(pages), 'no mailto: — drafts must not send');
check((read('pages/outreach.html').match(/DO NOT SEND/g) || []).length >= 4, 'outreach.html must mark header + 3 drafts');
check(/\$29/.test(read('pages/index.html')), 'hub must show the $29 label');
check(/UNKNOWN/.test(read('pages/fulfill.html')), 'fulfill page must keep UNKNOWN rows');

if (failures.length) {
  console.error(`verify failed (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('Resume Kit verify ok — $29 one-time label, paymentUrl "", unpublished, fulfill UNKNOWN, drafts unsent.');
