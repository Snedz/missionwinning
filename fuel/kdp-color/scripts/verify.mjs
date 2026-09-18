#!/usr/bin/env node
/**
 * Honesty + file checks for Open Plate. Exit 0 only if the pack matches PLAN.md.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

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
  'interiors/manifest.json',
  'interiors/generate.mjs',
  'interiors/book.html',
  'gtm/ICP.md',
  'gtm/OUTREACH_DRAFTS.md',
  'gtm/COVER_BRIEF.md',
  'gtm/KEYWORDS.md',
  'HOP-B.md',
  'pages/index.html',
  'pages/listing.html',
  'pages/icp.html',
  'pages/outreach.html',
  'scripts/verify.mjs',
];

for (const rel of required) {
  check(existsSync(path.join(root, rel)), `missing ${rel}`);
}

const cfg = require(path.join(root, 'config.js'));
check(cfg.sku === 'kdp-color', `sku is ${cfg.sku}`);
check(cfg.paymentUrl === '', `paymentUrl must be "" (got ${JSON.stringify(cfg.paymentUrl)})`);
check(cfg.checkout == null, 'checkout must be null / absent');
check(cfg.asin === '', 'asin must stay empty until a real upload');
check(cfg.isbn === '', 'isbn must stay empty until assigned');
check(cfg.status === 'unpublished-draft', 'status must stay unpublished-draft');

const platesDir = path.join(root, 'interiors/plates');
const plates = existsSync(platesDir)
  ? readdirSync(platesDir).filter((f) => f.endsWith('.svg')).sort()
  : [];
check(plates.length === 12, `expected 12 plates, found ${plates.length}`);
const hashes = new Set();
for (const f of plates) {
  const body = readFileSync(path.join(platesDir, f), 'utf8');
  check(body.includes('<svg'), `${f} is not svg`);
  check(!hashes.has(body), `${f} duplicates another plate`);
  hashes.add(body);
}

const book = read('interiors/book.html');
const pageMarks = book.match(/data-page="/g) || [];
check(pageMarks.length === 24, `book.html pages: ${pageMarks.length} (want 24)`);
const plateSrc = [...book.matchAll(/plates\/(plate-\d+\.svg)/g)].map((m) => m[1]);
check(new Set(plateSrc).size === 12, `book embeds ${new Set(plateSrc).size} unique plate srcs`);

const manifest = JSON.parse(read('interiors/manifest.json'));
check(manifest.pageCount === 24, 'manifest pageCount');
check(manifest.uniquePlates === 12, 'manifest uniquePlates');
check(manifest.assembly.length === 24, 'manifest assembly length');
const plateIds = manifest.assembly.filter((p) => p.kind === 'plate').map((p) => p.id);
check(new Set(plateIds).size === 12, 'manifest plate ids must be unique');

// PLAN.md is the refuse list — it must name the banned phrases. Scan product copy only.
const corpus = [
  'README.md',
  'listing.md',
  'export/NOTES.md',
  'gtm/ICP.md',
  'gtm/OUTREACH_DRAFTS.md',
  'gtm/COVER_BRIEF.md',
  'gtm/KEYWORDS.md',
  'pages/index.html',
  'pages/listing.html',
  'pages/icp.html',
  'pages/outreach.html',
  'interiors/book.html',
]
  .map(read)
  .join('\n');

const poison = [
  /bestseller/i,
  /rank\s*#\s*1\b/i,
  /["“]#1["”]/,
  /\b10,?000\s+(copies|sales|customers)/i,
  /passive income/i,
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
check(/DO NOT SEND/.test(read('gtm/OUTREACH_DRAFTS.md')), 'outreach must say DO NOT SEND');
const sendCount = (read('gtm/OUTREACH_DRAFTS.md').match(/DO NOT SEND/g) || []).length;
check(sendCount >= 4, `outreach needs the header plus 3 drafts marked DO NOT SEND (found ${sendCount})`);

check(!/paymentUrl\s*[:=]\s*["']https?:/.test(read('config.js')), 'config.js must not set a http paymentUrl');
check(!/ClearShot/.test(corpus), 'ClearShot stays parked — do not mention it in this pack');

const pages = ['pages/index.html', 'pages/listing.html', 'pages/icp.html', 'pages/outreach.html'].map(read).join('\n');
check(!/<button[^>]*>/i.test(pages), 'static pages must not ship a button (no buy control)');
check(!/type=["']submit["']/.test(pages), 'no submit controls');
check(!/mailto:/i.test(pages), 'no mailto: — drafts must not send');
check((read('pages/outreach.html').match(/DO NOT SEND/g) || []).length >= 4, 'outreach.html must mark header + 3 drafts');

if (failures.length) {
  console.error(`verify failed (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('Open Plate verify ok — 12 plates, 24 pages, paymentUrl "", unpublished, drafts unsent.');
