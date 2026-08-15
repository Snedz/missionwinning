/**
 * AG1 — old @/lib/rewards/plannedRest path still resolves after the move.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const shim = path.join(root, 'src/lib/rewards/plannedRest.ts');

test('rewards/plannedRest shim re-exports the moved module', () => {
  assert.equal(existsSync(shim), true);
  const src = readFileSync(shim, 'utf8');
  assert.match(src, /from '@\/lib\/plannedRest'/);
});

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name === 'node_modules' || name.name === '.next') continue;
      walk(p, out);
    } else if (/\.(ts|tsx)$/.test(name.name)) {
      out.push(p);
    }
  }
  return out;
}

test('no other source file imports @/lib/rewards/plannedRest', () => {
  const files = walk(path.join(root, 'src')).concat(walk(path.join(root, 'app')));
  for (const f of files) {
    if (path.resolve(f) === path.resolve(shim)) continue;
    if (f.endsWith('plannedRestShimHonesty.test.ts')) continue;
    const t = readFileSync(f, 'utf8');
    assert.doesNotMatch(
      t,
      /from ['"]@\/lib\/rewards\/plannedRest['"]/,
      `${path.relative(root, f)} still imports the old path`,
    );
  }
});
