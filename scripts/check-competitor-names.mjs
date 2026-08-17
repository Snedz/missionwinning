#!/usr/bin/env node
/**
 * Fail if a denied consumer-fitness product name is in tracked product files.
 *
 * The plaintext list lives in ops/intel/NAME_DENYLIST.md (INTERNAL).
 * Public CI has no ops mount — this script exits 0 in that case.
 *
 * docs/CLASSIFICATION.md · docs/OPS_LOCAL.md
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const denylistPath = path.join(root, 'ops/intel/NAME_DENYLIST.md');

if (!existsSync(denylistPath)) {
  console.log('names:check — ops denylist not mounted; skip');
  process.exit(0);
}

const patterns = readFileSync(denylistPath, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
  .map((source) => {
    try {
      return { source, re: new RegExp(source) };
    } catch {
      console.error(`names:check — bad regex in denylist: ${source}`);
      process.exit(2);
    }
  });

function gitLsFiles() {
  const out = execFileSync('git', ['ls-files', '-z'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  return out.split('\0').filter(Boolean);
}

/** Frozen history. Tip of product source is what we keep nameless. */
function skipPath(rel) {
  if (rel.startsWith('docs/archive/')) return true;
  if (rel.startsWith('ops/')) return true;
  if (rel.startsWith('.claude/skills/')) return true;
  if (/\.(png|jpg|jpeg|webp|gif|svg|woff2?|ttf|ico|mp4|pdf|bin)$/i.test(rel)) return true;
  return false;
}

const hits = [];
for (const rel of gitLsFiles()) {
  if (skipPath(rel)) continue;
  let body;
  try {
    body = readFileSync(path.join(root, rel), 'utf8');
  } catch {
    continue;
  }
  const lines = body.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    for (const { source, re } of patterns) {
      if (re.test(lines[i])) {
        hits.push(`${rel}:${i + 1}: /${source}/  ${lines[i].trim().slice(0, 160)}`);
      }
    }
  }
}

if (hits.length > 0) {
  console.error(
    `names:check — ${hits.length} hit(s). Consumer fitness product names stay in ops/intel/.\n` +
      hits.slice(0, 80).map((h) => `  ${h}`).join('\n') +
      (hits.length > 80 ? `\n  … ${hits.length - 80} more` : '')
  );
  process.exit(1);
}

console.log(`names:check — clean (${patterns.length} patterns, ops mounted)`);
