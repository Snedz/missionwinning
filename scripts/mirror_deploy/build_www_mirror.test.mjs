import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import {
  createWwwMirrorTarball,
  writeCloudflareConfig,
} from './build_www_mirror.mjs';

const EXPECTED_HEADERS = `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
`;

const EXPECTED_REDIRECTS = `/index.html / 301
`;

function fixtureDist(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'mission-winning-www-mirror-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const dist = path.join(root, 'dist');
  mkdirSync(dist, { recursive: true });
  return dist;
}

test('writes Cloudflare Pages headers and redirects', (t) => {
  const dist = fixtureDist(t);

  writeCloudflareConfig(dist);

  assert.equal(readFileSync(path.join(dist, '_headers'), 'utf8'), EXPECTED_HEADERS);
  assert.equal(readFileSync(path.join(dist, '_redirects'), 'utf8'), EXPECTED_REDIRECTS);
});

test('creates a gzip tarball from a fixture dist without including the artifact', (t) => {
  const dist = fixtureDist(t);
  const assets = path.join(dist, 'assets');
  mkdirSync(assets, { recursive: true });

  writeFileSync(path.join(dist, 'index.html'), '<!doctype html><title>Mission Winning</title>');
  writeFileSync(path.join(assets, 'app.js'), 'console.log("www mirror");\n');
  writeCloudflareConfig(dist);

  const staleArchive = path.join(dist, 'www-mirror.tgz');
  writeFileSync(staleArchive, 'stale archive');

  const archive = createWwwMirrorTarball(dist);
  assert.equal(archive, staleArchive);

  const bytes = readFileSync(archive);
  assert.deepEqual([...bytes.subarray(0, 2)], [0x1f, 0x8b]);

  const listed = spawnSync('tar', ['-tzf', archive], { encoding: 'utf8' });
  assert.equal(listed.status, 0, listed.stderr || 'tar could not list the fixture archive');

  const names = new Set(
    listed.stdout
      .split(/\r?\n/)
      .filter(Boolean)
      .map((name) => name.replace(/^\.\//, '')),
  );

  assert.ok(names.has('index.html'));
  assert.ok(names.has('assets/app.js'));
  assert.ok(names.has('_headers'));
  assert.ok(names.has('_redirects'));
  assert.ok(!names.has('www-mirror.tgz'));

  const unpacked = path.join(path.dirname(dist), 'unpacked');
  mkdirSync(unpacked, { recursive: true });
  const extracted = spawnSync('tar', ['-xzf', archive, '-C', unpacked], {
    encoding: 'utf8',
  });
  assert.equal(extracted.status, 0, extracted.stderr || 'tar could not extract the fixture archive');

  assert.equal(
    readFileSync(path.join(unpacked, 'index.html'), 'utf8'),
    '<!doctype html><title>Mission Winning</title>',
  );
  assert.equal(
    readFileSync(path.join(unpacked, 'assets', 'app.js'), 'utf8'),
    'console.log("www mirror");\n',
  );
  assert.equal(readFileSync(path.join(unpacked, '_headers'), 'utf8'), EXPECTED_HEADERS);
  assert.equal(readFileSync(path.join(unpacked, '_redirects'), 'utf8'), EXPECTED_REDIRECTS);
});
