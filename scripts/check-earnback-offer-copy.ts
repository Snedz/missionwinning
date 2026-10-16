#!/usr/bin/env tsx
/**
 * Earn-back offer copy CI check — fail on free/win/prize in allowlisted plan copy.
 *
 * Imports the existing pure guard. Allowlist only (never broad src/data scans).
 * Run: npm run earnback-copy:check  (also a step of `npm run verify`)
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

import { findRiskyOfferWords, type CopyFinding } from '../src/lib/premium/earnbackOfferCopyGuard.ts';

const ALLOWLIST_PATHS = [
  'scripts/fixtures/earnback-offer-copy/clean-offer.json',
  'src/lib/premium/earnbackOfferCopy.md',
] as const;

function extractStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(extractStrings);
  if (value !== null && typeof value === 'object') {
    return Object.values(value).flatMap(extractStrings);
  }
  return [];
}

function scanFile(rel: string): CopyFinding[] {
  const full = resolve(process.cwd(), rel);
  if (!existsSync(full)) return [];
  try {
    const content = readFileSync(full, 'utf8');
    if (rel.endsWith('.json')) {
      const findings: CopyFinding[] = [];
      for (const str of extractStrings(JSON.parse(content) as unknown)) {
        findings.push(...findRiskyOfferWords(str));
      }
      return findings;
    }
    return findRiskyOfferWords(content);
  } catch (err) {
    console.error(`earnback-copy:check — warning: skip unreadable ${rel}: ${err}`);
    return [];
  }
}

function selfCheck(): boolean {
  if (findRiskyOfferWords("It's FREE now").length === 0) {
    console.error('earnback-copy:check — self-check FAILED: guard does not detect FREE');
    return false;
  }
  if (findRiskyOfferWords('Join Mission Winning today').length !== 0) {
    console.error('earnback-copy:check — self-check FAILED: brand Mission Winning was flagged');
    return false;
  }
  return true;
}

if (!selfCheck()) process.exit(2);

const existing = ALLOWLIST_PATHS.filter((rel) => existsSync(resolve(process.cwd(), rel)));
const hits: { path: string; finding: CopyFinding }[] = [];
for (const rel of existing) {
  for (const finding of scanFile(rel)) hits.push({ path: rel, finding });
}

if (hits.length > 0) {
  console.error(`earnback-copy:check — ${hits.length} hit(s)`);
  for (const { path, finding } of hits) {
    console.error(`  ${path}:${finding.index} word=${finding.word} match=${finding.match}`);
  }
  process.exit(1);
}

console.log(`earnback-copy:check — clean (${existing.length} file(s))`);
process.exit(0);
