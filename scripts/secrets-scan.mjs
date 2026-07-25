#!/usr/bin/env node
/**
 * Scan the working tree for secrets (docs/SECRETS.md).
 * Uses --no-git so only current files are checked; .env.local / .next are
 * path-allowlisted in .gitleaks.toml (gitignored — never commit them).
 * Prefers local `gitleaks`, then Docker.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const config = resolve(root, '.gitleaks.toml');

function run(cmd, args) {
  return spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    encoding: 'utf8',
  });
}

function hasGitleaks() {
  const r = spawnSync('gitleaks', ['version'], { encoding: 'utf8' });
  const out = `${r.stdout || ''}${r.stderr || ''}`.toLowerCase();
  return r.status === 0 || out.includes('gitleaks') || out.includes('version');
}

if (!existsSync(config)) {
  console.error('Missing .gitleaks.toml at repo root');
  process.exit(1);
}

const detectArgs = [
  'detect',
  '--no-git',
  '--source',
  '.',
  '-c',
  '.gitleaks.toml',
  '-v',
];

if (hasGitleaks()) {
  const r = run('gitleaks', detectArgs);
  process.exit(r.status ?? 1);
}

const docker = spawnSync('docker', ['info'], { encoding: 'utf8' });
if (docker.status === 0) {
  console.error('gitleaks binary not found — using Docker image zricethezav/gitleaks:latest');
  const r = run('docker', [
    'run',
    '--rm',
    '-v',
    `${root}:/repo`,
    '-w',
    '/repo',
    'zricethezav/gitleaks:latest',
    'detect',
    '--no-git',
    '--source',
    '.',
    '-c',
    '.gitleaks.toml',
    '-v',
  ]);
  process.exit(r.status ?? 1);
}

console.error(`
secrets:scan — gitleaks not available.

Install one of:
  brew install gitleaks
  # or enable Docker and re-run (uses zricethezav/gitleaks:latest)

Then: npm run secrets:scan
See docs/SECRETS.md
`);
process.exit(1);
