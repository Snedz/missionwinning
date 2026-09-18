#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from 'node:fs';
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
  'export/NOTES.md',
  'gtm/ICP.md',
  'gtm/COVER_BRIEF.md',
  'gtm/OUTREACH_DRAFTS.md',
  'pages/index.html',
  'pages/listing.html',
  'pages/icp.html',
  'pages/outreach.html',
];
for (const rel of required) {
  check(existsSync(path.join(root, rel)), `missing ${rel}`);
}

const cfg = require(path.join(root, 'config.js'));
check(cfg.sku === 'mission-galaxy', 'sku');
check(cfg.paymentUrl === '', `paymentUrl must be "" (got ${JSON.stringify(cfg.paymentUrl)})`);
check(cfg.checkout == null, 'checkout');
check(cfg.status === 'unpublished-stub', 'status');

const platesDir = path.join(root, 'interiors/plates');
check(!existsSync(platesDir) || readdirSync(platesDir).filter((f) => f.endsWith('.svg')).length === 0, 'stub must not grow Open Plate copies as plates');

const corpus = [
  'README.md',
  'listing.md',
  'export/NOTES.md',
  'gtm/ICP.md',
  'gtm/COVER_BRIEF.md',
  'gtm/OUTREACH_DRAFTS.md',
  'pages/index.html',
  'pages/listing.html',
  'pages/icp.html',
  'pages/outreach.html',
]
  .map(read)
  .join('\n');

check(/no plates/i.test(corpus), 'stub must keep saying no plates');
check(!/bestseller/i.test(corpus), 'no rank language');
check(!/gumroad\.com/i.test(corpus), 'no gumroad');
check(!/buy now/i.test(corpus), 'no buy now');
check(!/mailto:/i.test(corpus), 'no mailto');
check(!/ClearShot/.test(corpus), 'ClearShot parked');
check(!/paymentUrl\s*[:=]\s*["']https?:/.test(read('config.js')), 'no http paymentUrl');

const pages = ['pages/index.html', 'pages/listing.html', 'pages/icp.html', 'pages/outreach.html'].map(read).join('\n');
check(!/<button/i.test(pages), 'no buy button');
check(!/type=["']submit["']/.test(pages), 'no submit');
check((read('gtm/OUTREACH_DRAFTS.md').match(/DO NOT SEND/g) || []).length >= 4, 'outreach md header + 3 drafts');
check((read('pages/outreach.html').match(/DO NOT SEND/g) || []).length >= 4, 'outreach html header + 3 drafts');

if (failures.length) {
  console.error(`mission-galaxy verify failed:\n${failures.map((f) => `  - ${f}`).join('\n')}`);
  process.exit(1);
}
console.log('Mission Galaxy stub verify ok — paymentUrl "", unpublished, no interiors claimed.');
