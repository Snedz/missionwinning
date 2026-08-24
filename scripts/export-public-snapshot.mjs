#!/usr/bin/env node
/**
 * Copy tracked product files into a sibling snapshot for Mission-Winning/missionwinning.
 *
 * Progress report only. Does not change origin, does not push, does not delete
 * local caches. Working copy stays this tree + Snedz/missionwinning.
 *
 *   node scripts/export-public-snapshot.mjs
 *   node scripts/export-public-snapshot.mjs --out ../missionwinning-public-snapshot --git --force
 */
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDenied, selectSnapshotPaths } from './public-snapshot/deny.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_OUT = join(root, '..', 'missionwinning-public-snapshot');
const README_TEMPLATE = join(root, 'scripts/public-snapshot/README.snapshot.md');

function die(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const opts = { out: DEFAULT_OUT, force: false, git: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--force') opts.force = true;
    else if (a === '--git') opts.git = true;
    else if (a === '--no-git') opts.git = false;
    else if (a === '--out') {
      const v = argv[++i];
      if (!v) die('--out needs a path');
      opts.out = v;
    } else if (a === '--help' || a === '-h') {
      console.log(
        'Usage: node scripts/export-public-snapshot.mjs [--out DIR] [--force] [--git]\n' +
          '  Default out: ../missionwinning-public-snapshot\n' +
          '  --git  init an orphan commit (does not add a remote, does not push)'
      );
      process.exit(0);
    } else {
      die(`unknown arg ${a}`);
    }
  }
  return opts;
}

function gitLines(...args) {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  if (r.status !== 0) die(r.stderr || `git ${args.join(' ')} failed`);
  return r.stdout.split('\0').filter(Boolean);
}

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8' });
  if (r.status !== 0) die((r.stderr || r.stdout || `${cmd} failed`).trim());
  return r.stdout;
}

function destIsSafe(outAbs) {
  const rootAbs = resolve(root);
  if (outAbs === rootAbs) return 'refusing to write onto the working tree';
  if (outAbs.startsWith(rootAbs + '/')) return 'refusing to write inside the working tree';
  return null;
}

/** Fetch remotes that already point at the org snapshot. Never Snedz. */
function captureSnapshotRemotes(dir) {
  if (!existsSync(join(dir, '.git'))) return [];
  const r = spawnSync('git', ['remote', '-v'], { cwd: dir, encoding: 'utf8' });
  if (r.status !== 0) return [];
  const seen = new Map();
  for (const line of r.stdout.split('\n')) {
    const m = /^(\S+)\s+(\S+)\s+\(fetch\)$/.exec(line.trim());
    if (!m) continue;
    const [, name, url] = m;
    if (!url.includes('Mission-Winning/missionwinning')) continue;
    seen.set(name, url);
  }
  return [...seen.entries()].map(([name, url]) => ({ name, url }));
}

function restoreSnapshotRemotes(dir, remotes) {
  for (const { name, url } of remotes) {
    run('git', ['remote', 'add', name, url], dir);
  }
}

function proveAbsences(outAbs, copied) {
  const forbidden = [
    'PLAN.md',
    'IMPROVEMENT_LOG.md',
    'ops',
    '.hermes',
    '.env.local',
    'docs/overnight',
    'docs/places',
    'docs/plans',
  ];
  for (const rel of forbidden) {
    if (existsSync(join(outAbs, rel))) die(`snapshot still contains ${rel}`);
  }
  const leaked = copied.filter(isDenied);
  if (leaked.length) die(`deny list leaked:\n  ${leaked.slice(0, 20).join('\n  ')}`);
  if (copied.some((p) => p.startsWith('docs/gauntlet/') && p.toLowerCase().endsWith('.png'))) {
    die('gauntlet PNG stills leaked');
  }
  if (!copied.includes('src/lib/coach/planEngine.ts') && !copied.some((p) => p.startsWith('src/'))) {
    die('snapshot has no src/ — copy failed');
  }
  if (!copied.some((p) => p.endsWith('.test.ts') || p.endsWith('.spec.ts'))) {
    die('snapshot has no tests');
  }
  if (!copied.includes('scripts/export-public-snapshot.mjs')) {
    die('snapshot missing exporter');
  }
}

const opts = parseArgs(process.argv.slice(2));
const outAbs = resolve(isAbsolute(opts.out) ? opts.out : join(process.cwd(), opts.out));
const unsafe = destIsSafe(outAbs);
if (unsafe) die(unsafe);

const savedRemotes = existsSync(outAbs) ? captureSnapshotRemotes(outAbs) : [];

if (existsSync(outAbs)) {
  if (!opts.force) die(`${outAbs} exists (pass --force to replace)`);
  if (!statSync(outAbs).isDirectory()) die(`${outAbs} is not a directory`);
  rmSync(outAbs, { recursive: true, force: true });
}
mkdirSync(outAbs, { recursive: true });

const tracked = gitLines('ls-files', '-z');
const selected = selectSnapshotPaths(tracked);
if (selected.length < 1000) die(`too few files selected (${selected.length}) — deny list too hungry?`);

let copied = 0;
for (const rel of selected) {
  const from = join(root, rel);
  const to = join(outAbs, rel);
  if (!existsSync(from)) continue;
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
  copied++;
}

if (!existsSync(README_TEMPLATE)) die(`missing ${relative(root, README_TEMPLATE)}`);
writeFileSync(join(outAbs, 'README.md'), readFileSync(README_TEMPLATE, 'utf8'));

const head = spawnSync('git', ['rev-parse', '--short', 'HEAD'], {
  cwd: root,
  encoding: 'utf8',
}).stdout.trim();
writeFileSync(
  join(outAbs, 'PUBLIC_SNAPSHOT.md'),
  [
    '# Public Alpha snapshot',
    '',
    'Progress report of Mission Winning Alpha 0.1.0. Not the working origin.',
    '',
    `- Source commit: \`${head}\``,
    `- Exported: ${new Date().toISOString().slice(0, 10)}`,
    `- Files: ${copied}`,
    `- Working tree / daily git: unchanged`,
    '',
    'Refresh: `npm run snapshot:public` from the working copy. Do not push unless asked.',
    '',
  ].join('\n')
);

proveAbsences(outAbs, selected);

if (opts.git) {
  run('git', ['init', '-b', 'main'], outAbs);
  run('git', ['add', '-A'], outAbs);
  run(
    'git',
    [
      '-c',
      'user.email=snapshot@missionwinning.com',
      '-c',
      'user.name=Mission Winning Snapshot',
      'commit',
      '-m',
      'Alpha 0.1.0 public progress snapshot',
    ],
    outAbs
  );
  restoreSnapshotRemotes(outAbs, savedRemotes);
}

const remoteNote = savedRemotes.length
  ? ` (orphan git, ${savedRemotes.length} remote restored, no push)`
  : opts.git
    ? ' (orphan git, no remote)'
    : '';
console.log(`✓ snapshot ${copied} files → ${outAbs}${remoteNote}`);
console.log('  origin on this working tree is unchanged. Did not push.');
