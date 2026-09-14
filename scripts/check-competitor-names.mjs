#!/usr/bin/env node
/**
 * Fail if a denied consumer-fitness product name is in tracked product files.
 *
 * The plaintext list lives in ops/intel/NAME_DENYLIST.md (INTERNAL).
 * Public CI has no ops mount — this script exits 0 in that case.
 *
 * WHY THIS DELEGATES TO `git grep` INSTEAD OF READING FILES IN JS
 * ---------------------------------------------------------------
 * The original implementation read every tracked file with readFileSync and tested
 * each line. Measured on the founder's Mac (2026-09-14), that took 152 s — long
 * enough that the run was killed twice, and long enough that a pre-push hook would
 * have been bypassed with --no-verify (worse than no hook at all).
 *
 * The cost was NOT the algorithm. Timing showed os.stat() at 0.002 ms but
 * os.open()/readFileSync at ~47 ms per call, on every path (/etc/hosts, /tmp, and
 * repo files alike, sandboxed or not), while a bare `dd` reads the same file in
 * 8 us and process spawn costs 1.8 ms. Something on that machine charges ~47 ms per
 * file open. Reading 3,145 files therefore cost ~150 s of pure open() latency;
 * the regex work was 1.5 s.
 *
 * `git grep` does the same scan inside one C process and never pays that tax:
 * 0.13 s for the whole tree. This script keeps the JS regexes as the source of
 * truth for *which* pattern matched (attribution still runs in JS, on the handful
 * of candidate lines git grep returns).
 *
 * docs/CLASSIFICATION.md · docs/OPS_LOCAL.md
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
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

/** Frozen history. Tip of product source is what we keep nameless. */
function skipPath(rel) {
  if (rel.startsWith('docs/archive/')) return true;
  if (rel.startsWith('ops/')) return true;
  if (rel.startsWith('.claude/skills/')) return true;
  // Generated / vendored bulk. No hand-written copy lives here.
  if (rel.startsWith('public/locales/')) return true;
  if (rel.startsWith('sites/www/')) return true;
  if (rel.startsWith('.next/') || rel.startsWith('dist/') || rel.startsWith('coverage/')) return true;
  if (rel === 'package-lock.json') return true;
  if (/\.(png|jpg|jpeg|webp|gif|svg|woff2?|ttf|ico|mp4|pdf|bin)$/i.test(rel)) return true;
  return false;
}

/**
 * Skip very large files. A guard is not a proof: a >256 KB generated bundle is not
 * where a competitor name gets hand-typed. The skipped count is printed so this
 * stays visible rather than silent. stat() is free here, so filtering on size
 * costs nothing.
 */
const MAX_BYTES = 256 * 1024;
const MAX_BUFFER = 256 * 1024 * 1024;

function gitLsFiles() {
  const out = execFileSync('git', ['ls-files', '-z'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  return out.split('\0').filter(Boolean);
}

/** The set of files we are willing to scan, mirroring skipPath + the size cap. */
const candidates = new Set();
let skippedLarge = 0;
for (const rel of gitLsFiles()) {
  if (skipPath(rel)) continue;
  let size;
  try {
    size = statSync(path.join(root, rel)).size;
  } catch {
    continue;
  }
  if (size > MAX_BYTES) {
    skippedLarge += 1;
    continue;
  }
  candidates.add(rel);
}

/** Candidate lines: one `git grep` pass, patterns fed straight from the denylist. */
const patternFile = path.join(tmpdir(), `mw-names-${process.pid}.txt`);
writeFileSync(patternFile, `${patterns.map((p) => p.source).join('\n')}\n`);

let raw = '';
try {
  raw = execFileSync('git', ['grep', '-n', '-P', '-I', '-f', patternFile, '--', '.'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER,
  });
} catch (err) {
  // git grep exits 1 when nothing matched. That is a clean run, not a failure.
  if (err.status === 1) {
    raw = '';
  } else {
    console.error(
      `names:check — git grep failed (status ${err.status}). ` +
        'Patterns are validated as JS regexes above, so this usually means the ' +
        'git build lacks PCRE support (-P).'
    );
    console.error(String(err.stderr || err.message).slice(0, 400));
    try {
      unlinkSync(patternFile);
    } catch {
      /* best effort */
    }
    process.exit(2);
  }
}
try {
  unlinkSync(patternFile);
} catch {
  /* best effort */
}

const hits = [];
for (const line of raw.split('\n')) {
  if (!line) continue;
  const parsed = /^([^:]+):(\d+):(.*)$/.exec(line);
  if (!parsed) continue;
  const [, rel, lineno, text] = parsed;
  if (!candidates.has(rel)) continue;
  for (const { source, re } of patterns) {
    if (re.test(text)) {
      hits.push(`${rel}:${lineno}: /${source}/  ${text.trim().slice(0, 160)}`);
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

console.log(
  `names:check — clean (${patterns.length} patterns, ${candidates.size} files, ` +
    `${skippedLarge} skipped >${MAX_BYTES / 1024} KB, ops mounted)`
);
