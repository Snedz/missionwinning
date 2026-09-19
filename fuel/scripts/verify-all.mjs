#!/usr/bin/env node
/**
 * Parent + both SKU honesty checks. Exit 0 only if the leftover hop matches PLAN.md.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const fuelRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(path.join(fuelRoot, rel), 'utf8');
const failures = [];
const check = (ok, msg) => {
  if (!ok) failures.push(msg);
};

const parentFiles = ['PLAN.md', 'INDEX.md', 'LAWS.md', 'scripts/verify-all.mjs'];
for (const rel of parentFiles) {
  check(existsSync(path.join(fuelRoot, rel)), `missing parent ${rel}`);
}

check(!existsSync(path.join(fuelRoot, 'config.js')), 'do not add shared fuel/config.js');

const laws = read('LAWS.md');
check(/paymentUrl/.test(laws), 'LAWS.md must name paymentUrl');
check(/\$29 one-time/.test(laws), 'LAWS.md must pin resume $29 one-time');
check(/UNKNOWN/.test(laws), 'LAWS.md must keep UNKNOWN first-class');
check(/ClearShot PARKED/.test(laws), 'LAWS.md must keep ClearShot PARKED');
check(/Builder ≠ Judge|Builder != Judge/.test(laws), 'LAWS.md must keep Builder ≠ Judge');
check(/tip-promote/.test(laws), 'LAWS.md must ban tip-promote');
check(/poison restore/.test(laws), 'LAWS.md must ban poison restore');

const index = read('INDEX.md');
check(/resume-kit/.test(index) && /invoice-lite/.test(index), 'INDEX.md must map both SKUs');
check(!/buy now/i.test(index + laws), 'parent files must not tip-promote');

const resumeCfg = read('resume-kit/config.js');
const invoiceCfg = read('invoice-lite/config.js');
check(/priceLabel:\s*['"]\$29 one-time['"]/.test(resumeCfg), 'resume config must set priceLabel "$29 one-time"');
check(/paymentUrl:\s*['"]{2}/.test(resumeCfg), 'resume paymentUrl must be empty');
check(/paymentUrl:\s*['"]{2}/.test(invoiceCfg), 'invoice paymentUrl must be empty');
check(!/priceLabel/.test(invoiceCfg), 'invoice must not mint a priceLabel');
check(!/\$29/.test(invoiceCfg), 'invoice config must not copy $29');

for (const sku of ['resume-kit', 'invoice-lite']) {
  const script = path.join(fuelRoot, sku, 'scripts', 'verify.mjs');
  const run = spawnSync(process.execPath, [script], { encoding: 'utf8' });
  check(run.status === 0, `${sku} verify failed:\n${run.stdout}${run.stderr}`);
}

if (failures.length) {
  console.error(`fuel verify-all failed (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('fuel verify-all ok — both SKUs, empty paymentUrl, resume $29 one-time, invoice UNKNOWN, no shared config.');
