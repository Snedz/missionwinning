#!/usr/bin/env node
/**
 * Skill provenance guard — the SOUL.md vector, closed.
 *
 * A `SKILL.md` is auto-loaded into an agent's system prompt. It is therefore
 * instruction-bearing text that runs before anyone reads it, exactly the shape
 * arXiv:2608.10218 describes: content that propagates because it is *present*,
 * not because anyone chose it. `skills-lock.json` records a `computedHash` per
 * skill — and until 2026-09-15 **nothing in the repo verified it**. A lock that
 * nobody checks is a trusted-provenance label on unverified instructions.
 *
 * Algorithm (derived by brute force against the lock, 2026-09-15):
 *   sha256( for each file, sorted case-insensitively by relative path:
 *             relativePathBytes ++ fileBytes )
 * Confirmed 10/10 against the entries in skills-lock.json.
 *
 * Three ways to fail, in order of severity:
 *   1. DRIFT  — a locked skill's bytes no longer match its recorded hash.
 *   2. UNLOCKED — an auto-loaded skill has no lock entry at all. This is the
 *       default-deny case: a skill nobody named still gets loaded, so it must
 *       not be able to arrive silently.
 *   3. MISSING — the lock names a skill whose file is gone.
 *
 * Report, don't gate, is the wrong instinct here — this one gates. It is fast,
 * local and has no network or mount dependency, so it can run on every commit.
 *
 * Usage: node scripts/check-skill-hashes.mjs [--strict] [--quiet] [--write-baseline]
 *   --strict          exit 1 on UNLOCKED as well (default: UNLOCKED warns)
 *   --quiet           only print problems
 *   --write-baseline  record hashes for skills the vendor lock does not cover
 * Exit: 0 clean · 1 drift or (strict) unlocked · 2 tree or lock unreadable
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const LOCK = join(ROOT, 'skills-lock.json');
/**
 * Skills installed outside the vendor tool have no `skills-lock.json` entry, so
 * the vendor lock cannot speak for them — but they still auto-load. Rather than
 * invent a `source` for them in a file the installer owns, we keep our own
 * baseline with `sourceType: "local"`. Generate it with `--write-baseline`.
 */
const BASELINE = join(ROOT, 'scripts', 'skills-baseline.json');

/** Where auto-loaded skills live. Add a root here if the loader gains one. */
const SKILL_ROOTS = ['.claude/skills', '.agents/skills'];

const STRICT = process.argv.includes('--strict');
const QUIET = process.argv.includes('--quiet');

/** Every file in a dir, as forward-slash relative paths, case-insensitive sort. */
function listFiles(dir) {
  const out = [];
  const walk = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const abs = join(d, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        walk(abs);
      } else if (entry.isFile()) {
        out.push(relative(dir, abs).split(sep).join('/'));
      }
    }
  };
  walk(dir);
  out.sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : a.toLowerCase() > b.toLowerCase() ? 1 : 0));
  return out;
}

/** The vendor algorithm: sha256 over (relativePath ++ bytes), case-insensitive path order. */
export function computeSkillHash(skillDir) {
  const h = createHash('sha256');
  for (const rel of listFiles(skillDir)) {
    h.update(Buffer.from(rel, 'utf8'));
    h.update(readFileSync(join(skillDir, rel)));
  }
  return h.digest('hex');
}

function readLock() {
  if (!existsSync(LOCK)) return { error: 'lock missing' };
  try {
    const j = JSON.parse(readFileSync(LOCK, 'utf8'));
    return { skills: j?.skills ?? {} };
  } catch (e) {
    return { error: `lock unparseable: ${e.message}` };
  }
}

function findSkills() {
  const found = [];
  for (const root of SKILL_ROOTS) {
    const abs = join(ROOT, root);
    if (!existsSync(abs)) continue;
    if (root.includes('worktrees')) continue;
    for (const name of readdirSync(abs, { withFileTypes: true })) {
      if (!name.isDirectory()) continue;
      const dir = join(abs, name.name);
      if (!existsSync(join(dir, 'SKILL.md'))) continue;
      found.push({ name: name.name, dir, root });
    }
  }
  return found.sort((a, b) => (a.name < b.name ? -1 : 1));
}

const lock = readLock();
if (lock.error) {
  console.error(`check-skill-hashes: ${lock.error} — cannot verify provenance`);
  process.exit(2);
}

const onDisk = findSkills();
if (onDisk.length === 0) {
  // "unreachable", never 0. A tree with no skills is not a verified tree.
  console.error('check-skill-hashes: no skill root found — unreachable, not verified');
  process.exit(2);
}

const locked = lock.skills;
const baseline = existsSync(BASELINE)
  ? JSON.parse(readFileSync(BASELINE, 'utf8'))?.skills ?? {}
  : {};

if (process.argv.includes('--write-baseline')) {
  const base = {};
  for (const s of onDisk) {
    if (locked[s.name]) continue; // the vendor lock owns these; do not duplicate
    base[s.name] = {
      source: 'local',
      sourceType: 'local',
      skillPath: relative(ROOT, s.dir).split(sep).join('/'),
      computedHash: computeSkillHash(s.dir),
    };
  }
  writeFileSync(
    BASELINE,
    JSON.stringify(
      {
        version: 1,
        // A recorded hash means "detect change from here", NOT "this content was
        // reviewed and is safe". None of these skills has been audited.
        note:
          'Hashes record the state at capture time so future change is detected. ' +
          'They are NOT an audit: no skill here has been reviewed for safety.',
        skills: base,
      },
      null,
      2
    ) + '\n'
  );
  console.log(`wrote ${Object.keys(base).length} local skill entr(ies) → scripts/skills-baseline.json`);
  process.exit(0);
}

const rows = [];
for (const s of onDisk) {
  const vendored = locked[s.name];
  const local = baseline[s.name];
  const entry = vendored ?? local;
  rows.push({
    name: s.name,
    root: s.root,
    provenance: vendored ? 'lock' : local ? 'local' : 'none',
    locked: Boolean(entry),
    expected: entry?.computedHash ?? null,
    actual: computeSkillHash(s.dir),
  });
}
for (const r of rows) r.drift = r.locked && r.expected !== r.actual;

const missing = Object.keys(locked).filter(
  (n) => !onDisk.some((s) => s.name === n)
);

const drifted = rows.filter((r) => r.drift);
const unlocked = rows.filter((r) => !r.locked);
const verified = rows.filter((r) => r.locked && !r.drift);

if (!QUIET) {
  console.log(
    `check-skill-hashes — ${rows.length} auto-loaded skill(s) · ` +
      `${verified.length} verified · ${drifted.length} drifted · ` +
      `${unlocked.length} unlocked · ${missing.length} missing\n`
  );
  for (const r of rows) {
    const tag = r.drift ? 'DRIFT  ' : r.locked ? 'ok     ' : 'UNLOCKED';
    const src = r.provenance === 'local' ? '  [local baseline]' : r.provenance === 'lock' ? '' : '  (no provenance)';
    if (QUIET && tag === 'ok     ') continue;
    console.log(`  ${tag} ${r.name.padEnd(26)} ${r.actual.slice(0, 12)}${src}`);
  }
  for (const n of missing) console.log(`  MISSING ${n.padEnd(25)} named in lock, absent on disk`);
  console.log('');
}

let bad = drifted.length + missing.length;
if (STRICT) bad += unlocked.length;

if (drifted.length) {
  console.error(
    `FAIL: ${drifted.length} skill(s) no longer match skills-lock.json.\n` +
      `  A SKILL.md is loaded into the system prompt before anyone reads it.\n` +
      `  Treat unexplained drift as a compromised instruction, not a typo:\n` +
      `  diff the file, and if you did not change it, do not "fix the lock" — escalate.\n` +
      `  If you DID change it deliberately, re-lock and say why in the commit.`
  );
}
if (missing.length) {
  console.error(`FAIL: ${missing.length} locked skill(s) missing from disk.`);
}
if (unlocked.length) {
  const msg =
    `NOTE: ${unlocked.length} auto-loaded skill(s) have no provenance record: ` +
    unlocked.map((r) => r.name).join(', ') +
    `.\n  They load whether or not anyone recorded them. Run --write-baseline to ` +
    `record them, or delete them.\n  Not gating by default (--strict to enforce).`;
  if (STRICT) console.error(`FAIL: ${msg}`);
  else console.warn(`warn: ${msg}`);
}

if (bad > 0) process.exit(1);
if (!QUIET) console.log('ok — every locked skill matches its recorded hash');
