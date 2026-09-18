#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const check = (ok, msg) => {
  if (!ok) failures.push(msg);
};

for (const rel of ['PLAN.md', 'README.md', 'config.js', 'listing.md', 'gtm/ICP.md', 'pages/index.html']) {
  check(existsSync(path.join(root, rel)), `missing ${rel}`);
}

const cfg = require(path.join(root, 'config.js'));
check(cfg.sku === 'mission-galaxy', 'sku');
check(cfg.paymentUrl === '', `paymentUrl must be "" (got ${JSON.stringify(cfg.paymentUrl)})`);
check(cfg.checkout == null, 'checkout');
check(cfg.status === 'unpublished-stub', 'status');

const hub = readFileSync(path.join(root, 'pages/index.html'), 'utf8');
check(/paymentUrl/.test(hub), 'hub names paymentUrl');
check(!/<button/i.test(hub), 'no buy button');
check(!/https?:\/\/\S*checkout/i.test(hub), 'no checkout url');

if (failures.length) {
  console.error(`mission-galaxy verify failed:\n${failures.map((f) => `  - ${f}`).join('\n')}`);
  process.exit(1);
}
console.log('Mission Galaxy stub verify ok — paymentUrl "", unpublished, no interiors claimed.');
