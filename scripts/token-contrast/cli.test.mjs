import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', '..');
const cli = path.join(__dirname, '..', 'token-contrast.mjs');

const FIXTURE = `
:root {
  --color-foreground: #111111;
  --color-background: #ffffff;
  --color-muted-fg: #999999;
  --color-muted-bg: #ffffff;
}
`;

function run(args, fixture) {
  const result = spawnSync('npx', ['--no-install', 'tsx', cli, '--file', fixture, ...args], {
    cwd: root,
    encoding: 'utf8',
  });
  return result;
}

test('token contrast CLI reports failures and only fails under --strict', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'token-contrast-'));
  const fixture = path.join(dir, 'tokens.css');

  try {
    writeFileSync(fixture, FIXTURE, 'utf8');

    const reportOnly = run([], fixture);
    assert.equal(reportOnly.status, 0, reportOnly.stderr);
    assert.match(reportOnly.stdout, /token contrast/i);
    assert.match(reportOnly.stdout, /light/);
    assert.match(reportOnly.stdout, /dark/);
    assert.match(reportOnly.stdout, /fail/);
    assert.match(reportOnly.stdout, /suggest/);

    const strict = run(['--strict'], fixture);
    assert.equal(strict.status, 1, strict.stderr);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
