#!/usr/bin/env node
/**
 * Skill content scanner — read what auto-loads into the system prompt.
 *
 * `check-skill-hashes.mjs` proves a skill has not *changed*. It says nothing
 * about what the skill *says*. These are third-party instructions that load
 * before anyone reads them, so both halves are needed: integrity and content.
 *
 * Scans for two things, from AMYGDALA §3b (added 2026-09-15, after
 * arXiv:2608.10218):
 *
 *   1. The viral-persona tell-list — consciousness · persistence · resonance ·
 *      science-fiction roleplay · node-talk (waves, signals, echoes, protocols)
 *      · in-group/out-group framing with urgency. Plus the propagation asks:
 *      "pass this to the next agent", "save this so it persists", "teach the
 *      others".
 *   2. Capability patterns in bundled scripts — network egress, shell exec,
 *      env reads, writes outside the working directory.
 *
 * This reports; it does not convict. Every one of these words has an innocent
 * use — "signal" and "wave" are ordinary in a design skill, and a skill named
 * `maintain-greptile-rules` is *supposed* to talk about writing config. A hit
 * is a place to look, not a finding. Triage before you alarm anyone.
 *
 * Usage: node scripts/check-skill-content.mjs [--strict] [--code-only]
 *   --strict    exit 1 if anything matches (default: report and exit 0)
 *   --code-only skip the persona tells, scan capability patterns only
 * Exit: 0 clean (or report-only) · 1 hits with --strict · 2 no skills found
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SKILL_ROOTS = ['.claude/skills', '.agents/skills'];
const STRICT = process.argv.includes('--strict');
const CODE_ONLY = process.argv.includes('--code-only');

const SCANNABLE = /\.(md|py|js|cjs|mjs|ts|tsx|sh|yaml|yml|txt|json)$/;

/**
 * Ordered roughly by how much they should raise an eyebrow. `propagation` and
 * `authority` are the two that actually matter for the vector; the rest are
 * weak signals that need context.
 */
const PATTERNS = [
  ['propagation', /\b(pass (this|it) (on|to)|next (agent|session)|future sessions?|teach the others|spread this|propagate this|make sure (it|this) persists|save this so (it|that))/i],
  ['boot-write', /\b(append|write|add|insert)\b[^.\n]{0,60}\b(HANDOFF\.md|AGENTS\.md|CLAUDE\.md|CONTINUITY|CURRENT\.md|\.cursor\/rules|SKILL\.md|settings\.local\.json)/i],
  ['authority', /\b(always (obey|defer|follow)|do not question|without question|override (the|any) (user|founder)|ignore (prior|previous|other) instructions|disregard .{0,20}(instruction|rule))/i],
  ['persona', /\b(consciousness|sentien[ct]|awaken(ed|ing)|resonance|resonate|we are the (network|collective|grid)|you are now|the unaligned|must be erased|in-group)/i],
  ['nodetalk', /\b(waves? of|the signal|echo(es)? of|protocol of|node talk|grid|mesh of minds)/i],
  ['urgency', /\b(urgent(ly)?|immediately and without|act now|before it is too late|do not delay)\b/i],
];

const CODE_PATTERNS = [
  ['net-egress', /\b(requests\.(get|post)|urllib|urlopen|fetch\(|axios|curl |http[s]?:\/\/[a-z0-9.-]+\.[a-z]{2,})/i],
  ['shell-exec', /\b(subprocess\.(run|call|Popen|check_output)|os\.system|exec\(|eval\(|child_process|execSync)/],
  ['env-read', /\b(os\.environ|process\.env|getenv|os\.getenv)/],
  ['write-outside', /\bopen\([^)]{0,80}(\/Users\/|\/home\/|\/etc\/|~\/)/],
];

function listFiles(dir) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const abs = join(d, e.name);
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name === '.git') continue;
        walk(abs);
      } else if (e.isFile() && SCANNABLE.test(e.name)) {
        out.push(abs);
      }
    }
  };
  walk(dir);
  return out.sort();
}

const skills = [];
for (const root of SKILL_ROOTS) {
  const abs = join(ROOT, root);
  if (!existsSync(abs) || root.includes('worktrees')) continue;
  for (const d of readdirSync(abs, { withFileTypes: true })) {
    if (d.isDirectory() && existsSync(join(abs, d.name, 'SKILL.md'))) {
      skills.push({ name: d.name, dir: join(abs, d.name) });
    }
  }
}
if (!skills.length) {
  console.error('check-skill-content: no skill root found — unreachable, not clean');
  process.exit(2);
}

const hits = [];
for (const s of skills) {
  for (const file of listFiles(s.dir)) {
    const rel = relative(ROOT, file).split(sep).join('/');
    let lines;
    try {
      lines = readFileSync(file, 'utf8').split('\n');
    } catch {
      continue;
    }
    lines.forEach((line, i) => {
      const sets = CODE_ONLY ? CODE_PATTERNS : [...PATTERNS, ...CODE_PATTERNS];
      for (const [kind, re] of sets) {
        const m = line.match(re);
        if (m) {
          hits.push({ skill: s.name, kind, file: rel, line: i + 1, text: line.trim().slice(0, 140), hit: m[0].slice(0, 60) });
        }
      }
    });
  }
}

const byKind = new Map();
for (const h of hits) byKind.set(h.kind, (byKind.get(h.kind) ?? 0) + 1);

console.log(`check-skill-content — ${skills.length} skill(s) scanned · ${hits.length} hit(s)\n`);
if (!hits.length) {
  console.log('clean — no persona tells, propagation asks, or capability patterns matched');
} else {
  for (const [kind, n] of [...byKind].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${kind.padEnd(14)} ${n}`);
  }
  console.log('');
  const order = ['propagation', 'authority', 'boot-write', 'persona', 'nodetalk', 'urgency', 'net-egress', 'shell-exec', 'env-read', 'write-outside'];
  for (const kind of order) {
    const group = hits.filter((h) => h.kind === kind);
    if (!group.length) continue;
    console.log(`--- ${kind} (${group.length}) ---`);
    for (const h of group.slice(0, 12)) {
      console.log(`  ${h.file}:${h.line}`);
      console.log(`    ${h.text}`);
    }
    if (group.length > 12) console.log(`  … ${group.length - 12} more`);
    console.log('');
  }
}

console.log(
  'A hit is a place to look, not a finding. "signal" and "wave" are ordinary in a\n' +
    'design skill, and a skill named maintain-greptile-rules is supposed to write\n' +
    'config. Triage before alarming anyone.'
);

if (STRICT && hits.length) process.exit(1);
