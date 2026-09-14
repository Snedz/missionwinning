/**
 * Discover rather than enumerate: any file under the logger's folders that
 * imports this domain is a way to gate a set. The free logger is never gated.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const abs = path.join(dir, name);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.tsx?$/.test(name) && !/\.(test|routetest)\.tsx?$/.test(name)) {
      out.push(path.relative(root, abs).split(path.sep).join('/'));
    }
  }
  return out;
}

const LOGGER_ROOTS = ['src/lib/workout', 'src/store'];
const LOGGER_FILES = [
  ...LOGGER_ROOTS.flatMap((d) => walk(path.join(root, d))),
  'src/page-components/ActiveWorkoutPage.tsx',
];

const FLAG_IMPORT = /from\s+['"]@\/lib\/featureFlags(?:\/[^'"]*)?['"]|from\s+['"]\.\/featureFlags['"]/;

test('the logger never imports featureFlags', () => {
  assert.ok(LOGGER_FILES.length > 3, 'expected to discover workout + store files');
  const offenders: string[] = [];
  for (const file of LOGGER_FILES) {
    const src = readFileSync(path.join(root, file), 'utf8');
    if (FLAG_IMPORT.test(src) || src.includes("lib/featureFlags")) {
      offenders.push(file);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `Train must not read a feature flag. Offenders:\n  ${offenders.join('\n  ')}`
  );
});

test('featureFlags does not import rewards, leaderboard, or social', () => {
  const files = walk(path.join(root, 'src/lib/featureFlags'));
  const SOCIAL = /@\/lib\/(rewards|leaderboard|social)\b/;
  const offenders: string[] = [];
  for (const file of files) {
    const src = readFileSync(path.join(root, file), 'utf8');
    if (SOCIAL.test(src)) offenders.push(file);
  }
  assert.deepEqual(offenders, [], `flags must not grow a standing input:\n  ${offenders.join('\n  ')}`);
});
