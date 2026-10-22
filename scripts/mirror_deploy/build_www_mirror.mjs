#!/usr/bin/env node
/**
 * Build the static www mirror into an uploadable Cloudflare Pages artifact.
 *
 * The in-repo link contract remains the source of truth for route and
 * fragment validation; this script invokes it instead of duplicating it.
 */
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const WWW_DIR = path.join(REPO_ROOT, 'sites', 'www');
const WWW_DIST = path.join(WWW_DIR, 'dist');
const LINK_CONTRACT = path.join(REPO_ROOT, 'scripts', 'www-link-contract.mjs');
const ARCHIVE_NAME = 'www-mirror.tgz';
const NPM_COMMAND = process.platform === 'win32' ? 'npm.cmd' : 'npm';

export const CLOUDFLARE_PAGES_HEADERS = `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
`;

export const CLOUDFLARE_PAGES_REDIRECTS = `/index.html / 301
`;

function assertDirectory(directory) {
  if (!existsSync(directory)) {
    throw new Error(`www mirror: directory not found: ${directory}`);
  }
  if (!statSync(directory).isDirectory()) {
    throw new Error(`www mirror: not a directory: ${directory}`);
  }
}

function runCommand(command, args, { cwd, stdio = 'inherit' } = {}) {
  const result = spawnSync(command, args, { cwd, stdio });

  if (result.error) {
    throw new Error(`Unable to run ${command}: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const status = result.status === null ? `signal ${result.signal}` : `exit ${result.status}`;
    throw new Error(`${command} failed (${status})`);
  }

  return result;
}

/** Write the special files Cloudflare Pages reads at the artifact root. */
export function writeCloudflareConfig(distDir) {
  assertDirectory(distDir);
  writeFileSync(path.join(distDir, '_headers'), CLOUDFLARE_PAGES_HEADERS, 'utf8');
  writeFileSync(path.join(distDir, '_redirects'), CLOUDFLARE_PAGES_REDIRECTS, 'utf8');
}

/**
 * Create dist/www-mirror.tgz without adding a dependency.
 *
 * tar supplies the archive format and Node's zlib supplies gzip compression.
 * The existing archive is removed before tar runs so it can never contain
 * itself.
 */
export function createWwwMirrorTarball(distDir) {
  assertDirectory(distDir);

  const outputPath = path.join(distDir, ARCHIVE_NAME);
  const tempDir = mkdtempSync(path.join(tmpdir(), 'mission-winning-www-mirror-'));
  const tarPath = path.join(tempDir, 'www-mirror.tar');

  try {
    rmSync(outputPath, { force: true });

    const result = spawnSync('tar', ['-cf', tarPath, '-C', distDir, '.'], {
      encoding: 'utf8',
    });

    if (result.error) {
      throw new Error(`Unable to run tar: ${result.error.message}`);
    }
    if (result.status !== 0) {
      const detail = (result.stderr || result.stdout || '').trim();
      throw new Error(`tar failed${detail ? `: ${detail}` : ''}`);
    }

    const compressed = gzipSync(readFileSync(tarPath), { level: 9 });
    const pendingPath = path.join(
      distDir,
      `.${ARCHIVE_NAME}.${process.pid}.${Date.now()}.tmp`,
    );

    try {
      writeFileSync(pendingPath, compressed);
      renameSync(pendingPath, outputPath);
    } finally {
      rmSync(pendingPath, { force: true });
    }

    return outputPath;
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

export function buildWwwMirror() {
  runCommand(NPM_COMMAND, ['--prefix', WWW_DIR, 'run', 'build'], {
    cwd: REPO_ROOT,
  });

  // The contract owns link discovery and fragment validation.
  runCommand(process.execPath, [LINK_CONTRACT], { cwd: REPO_ROOT });

  writeCloudflareConfig(WWW_DIST);
  const archive = createWwwMirrorTarball(WWW_DIST);

  console.log(`\n✓ www mirror ready: ${path.relative(REPO_ROOT, archive)}\n`);
  return archive;
}

function isDirectInvocation() {
  if (!process.argv[1]) return false;
  return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isDirectInvocation()) {
  try {
    buildWwwMirror();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
