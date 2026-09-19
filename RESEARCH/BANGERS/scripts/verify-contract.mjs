#!/usr/bin/env node
/**
 * Honesty + file checks for RESEARCH/BANGERS tracks 04–10.
 * Sibling 01–03 may be absent on this branch — index links are contract names.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(path.join(root, rel), 'utf8');
const failures = [];
const check = (ok, msg) => {
  if (!ok) failures.push(msg);
};

const CONTRACT = [
  'FRAMEWORK.md',
  'SELL_FIRST.md',
  'BUILD_LATER.md',
  'HOW_IT_GETS_DONE.md',
  'CURSOR_TODO.md',
  'SOURCES.md',
];

const TRACKS = [
  '04-receipt-ocr-shots',
  '05-tutor-repair-dualcam',
  '06-ai-edit-auditor',
  '07-center-stage-coach',
  '08-unlock-code-utils',
  '09-agent-job-bus',
  '10-screenshot-stack-pages',
];

const INDEX_SLUGS = [
  'dual-capture-plus',
  'clearshot-ios',
  'token-router-pipeline',
  'receipt-ocr-shots',
  'tutor-repair-dualcam',
  'ai-edit-auditor',
  'center-stage-coach',
  'unlock-code-utils',
  'agent-job-bus',
  'screenshot-stack-pages',
];

check(existsSync(path.join(root, 'README.md')), 'missing README.md');
check(existsSync(path.join(root, 'OVERNIGHT_GLM53.md')), 'missing OVERNIGHT_GLM53.md');

const readme = existsSync(path.join(root, 'README.md')) ? read('README.md') : '';
const overnight = existsSync(path.join(root, 'OVERNIGHT_GLM53.md'))
  ? read('OVERNIGHT_GLM53.md')
  : '';

for (const slug of INDEX_SLUGS) {
  check(readme.includes(slug), `README.md must index ${slug}`);
}
check(readme.includes('OVERNIGHT_GLM53.md'), 'README.md must link OVERNIGHT_GLM53.md');
check(
  readme.includes('Sell before build') || readme.includes('Sell the offer before'),
  'README.md must state sell-before-build',
);

for (const track of TRACKS) {
  for (const file of CONTRACT) {
    const rel = `${track}/${file}`;
    check(existsSync(path.join(root, rel)), `missing ${rel}`);
  }
}

const poison = [
  /https?:\/\/\S*gumroad\.com/i,
  /https?:\/\/\S*lemonsqueezy/i,
  /https?:\/\/\S*buy\.stripe\.com/i,
  /https?:\/\/\S*paypal\.me/i,
  /paymentUrl\s*[:=]\s*["']https?:/i,
];

const corpusRels = [
  'README.md',
  'OVERNIGHT_GLM53.md',
  ...TRACKS.flatMap((t) => CONTRACT.map((f) => `${t}/${f}`)),
];
const corpus = corpusRels
  .filter((rel) => existsSync(path.join(root, rel)))
  .map(read)
  .join('\n');

for (const re of poison) {
  check(!re.test(corpus), `poison payment URL matched ${re}`);
}

for (const track of TRACKS) {
  const sellRel = `${track}/SELL_FIRST.md`;
  if (!existsSync(path.join(root, sellRel))) continue;
  const sell = read(sellRel);
  check(/UNPUBLISHED DRAFT/.test(sell), `${sellRel} must say UNPUBLISHED DRAFT`);
  check(
    /paymentUrl/.test(sell) && /empty/i.test(sell),
    `${sellRel} must keep paymentUrl empty`,
  );
  check(/DO NOT SEND/.test(sell), `${sellRel} outreach must say DO NOT SEND`);
  check(
    !/^\s*Buy now\b/im.test(sell) && !/\[\s*Buy now/i.test(sell),
    `${sellRel} must not ship a Buy now CTA`,
  );
}

const depFiles = CONTRACT.map((f) => `05-tutor-repair-dualcam/${f}`);
for (const rel of depFiles) {
  if (!existsSync(path.join(root, rel))) continue;
  check(
    /dual-capture-plus/i.test(read(rel)),
    `${rel} must name dual-capture-plus dependency`,
  );
}

const auditor = ['FRAMEWORK.md', 'SELL_FIRST.md', 'BUILD_LATER.md'].map(
  (f) => `06-ai-edit-auditor/${f}`,
);
for (const rel of auditor) {
  if (!existsSync(path.join(root, rel))) continue;
  const text = read(rel);
  check(/IPTC/i.test(text), `${rel} must mention IPTC`);
  check(
    /Spatial Reframe/i.test(text) && /lock/i.test(text),
    `${rel} must state Spatial Reframe API locked`,
  );
}

check(
  /Screen Time/i.test(read('08-unlock-code-utils/FRAMEWORK.md')),
  '08 FRAMEWORK must refuse Screen Time bypass',
);
check(
  /UNKNOWN/.test(read('09-agent-job-bus/SELL_FIRST.md')),
  '09 SELL_FIRST must keep price UNKNOWN',
);
check(
  overnight.includes('04 receipt-ocr-shots') || overnight.includes('receipt-ocr-shots'),
  'OVERNIGHT_GLM53.md must name track 04',
);
check(/\[skip vercel\]/.test(overnight), 'overnight playbook must say [skip vercel]');

const unexpected = readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((name) => /^\d{2}-/.test(name) && !TRACKS.includes(name) && !/^0[123]-/.test(name));
check(
  unexpected.length === 0,
  `unexpected track folders (not 01–10): ${unexpected.join(', ')}`,
);

if (failures.length) {
  console.error(`BANGERS verify failed (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(
  'BANGERS verify ok — 04–10 six-file contract, README indexes 10 + overnight, no invented payment URLs, 05 depends on dual-capture-plus, 06 Spatial Reframe locked.',
);
