/**
 * Compliance status reporter (Vanta-lite).
 * Usage:
 *   npm run compliance:status
 *   npm run compliance:status -- --ci
 *   npm run compliance:status -- --write-md
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildComplianceReport,
  formatComplianceConsole,
  upsertComplianceSnapshotMd,
} from '../src/lib/compliance/index.ts';

const ROOT = join(import.meta.dirname, '..');
const args = new Set(process.argv.slice(2));
const ci = args.has('--ci');
const writeMd = args.has('--write-md');

const report = buildComplianceReport(ROOT);
console.log(formatComplianceConsole(report));

if (ci) {
  const out = join(ROOT, 'compliance-status.json');
  writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(`\nWrote ${out}`);
}

if (writeMd) {
  const mdPath = join(ROOT, 'docs/COMPLIANCE.md');
  if (!existsSync(mdPath)) {
    console.error('docs/COMPLIANCE.md missing — create hub doc first');
    process.exit(1);
  }
  const next = upsertComplianceSnapshotMd(readFileSync(mdPath, 'utf8'), report);
  writeFileSync(mdPath, next);
  console.log('Updated docs/COMPLIANCE.md snapshot');
}

// known_open defects evaluate as `partial`. Any real fail is a regression.
if (report.totals.fail > 0) {
  process.exitCode = 1;
}
