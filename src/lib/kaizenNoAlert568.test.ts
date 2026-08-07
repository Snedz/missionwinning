import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('Today founder tools use toast not alert', () => {
  const src = readFileSync(
    join(root, 'src/components/today/TodayProgressSection.tsx'),
    'utf8'
  );
  assert.doesNotMatch(src, /\balert\s*\(/);
  assert.match(src, /toast\(/);
  assert.match(src, /todayFounderWinLogged|Win logged/);
});

test('Profile owner tools use toast not alert', () => {
  const src = readFileSync(
    join(root, 'src/components/profile/ProfileOwnerTools.tsx'),
    'utf8'
  );
  assert.doesNotMatch(src, /\balert\s*\(/);
  assert.match(src, /toast\(/);
});

test('no athlete-facing alert() left in components/page-components', () => {
  function walk(dir: string): string[] {
    const out: string[] = [];
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) out.push(...walk(p));
      else if (name.endsWith('.tsx')) out.push(p);
    }
    return out;
  }
  const files = [
    ...walk(join(root, 'src/components')),
    ...walk(join(root, 'src/page-components')),
  ].filter((f) => !f.includes('/ui/') && !f.includes('beta/BetaAdmin'));
  const hits: string[] = [];
  for (const f of files) {
    const t = readFileSync(f, 'utf8');
    if (/\balert\s*\(/.test(t)) hits.push(f.replace(root + '/', ''));
  }
  assert.deepEqual(hits, [], `alert() still in: ${hits.join(', ')}`);
});
