/**
 * Call sites must not pass wrong interpolation *names* for English templates.
 *
 * `.483`: LogConsole passed `n:` while `activeSetOf` expects `{{current}}` —
 * defaultValue only applies when the key is missing, so loaded packs showed the
 * literal `{{current}}`. Packs are guarded by `i18nPackPlaceholders.test.ts`;
 * this file guards the *caller* side for wedge surfaces.
 *
 * Strategy: strip defaultValue string payloads (they contain English prose like
 * "dose:" that is not an options key), then flag forbidden aliases that are not
 * in the English template.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');

/** Options keys that mean a different English template variable. */
const FORBIDDEN_ALIAS: Record<string, string> = {
  n: 'current',
  dose: 'count',
  num: 'count',
  idx: 'index',
};

const WEDGE_DIRS = [
  'src/components/workout',
  'src/components/today',
  'src/components/coach',
  'src/components/form',
  'src/page-components',
  'src/lib/workout',
  'src/lib/coach',
  'src/lib/today',
];

function walkTs(dir: string, out: string[] = []): string[] {
  const abs = path.join(root, dir);
  if (!statSync(abs, { throwIfNoEntry: false })?.isDirectory()) return out;
  for (const name of readdirSync(abs)) {
    const p = path.join(abs, name);
    const st = statSync(p);
    if (st.isDirectory()) walkTs(path.relative(root, p), out);
    else if (/\.(tsx|ts)$/.test(name) && !name.includes('.test.')) out.push(p);
  }
  return out;
}

function englishPlaceholders(): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  const localesDir = path.join(root, 'src/i18n');
  for (const file of readdirSync(localesDir)) {
    if (!file.endsWith('Locales.ts')) continue;
    const text = readFileSync(path.join(localesDir, file), 'utf8');
    for (const m of text.matchAll(/(\w+):\s*'([^']*)'/g)) {
      const vars = new Set([...m[2].matchAll(/\{\{(\w+)\}\}/g)].map((x) => x[1]));
      if (vars.size) map.set(m[1], vars);
    }
  }
  return map;
}

/** Pull t('key', { ... }) option bodies with brace matching. */
function* tCalls(src: string): Generator<{ key: string; body: string; line: number }> {
  for (const m of src.matchAll(/\bt\(\s*['"](\w+)['"]\s*,/g)) {
    const key = m[1];
    let i = m.index! + m[0].length;
    while (i < src.length && /\s/.test(src[i])) i++;
    if (src[i] !== '{') continue;
    let depth = 0;
    const start = i;
    let j = i;
    for (; j < src.length; j++) {
      if (src[j] === '{') depth++;
      else if (src[j] === '}') {
        depth--;
        if (depth === 0) {
          j++;
          break;
        }
      }
    }
    const body = src.slice(start, j);
    const line = src.slice(0, m.index!).split('\n').length;
    yield { key, body, line };
  }
}

/** Remove defaultValue payloads so prose colons do not look like option keys. */
function stripDefaultValue(body: string): string {
  return body
    .replace(/defaultValue\s*:\s*`[^`]*`/g, '')
    .replace(/defaultValue\s*:\s*'[^']*'/g, '')
    .replace(/defaultValue\s*:\s*"[^"]*"/g, '');
}

function optionKeys(body: string): Set<string> {
  const clean = stripDefaultValue(body);
  return new Set([...clean.matchAll(/(?:^|[,{\s])(\w+)\s*:/g)].map((m) => m[1]));
}

test('wedge call sites do not pass forbidden interpolation aliases', () => {
  const en = englishPlaceholders();
  assert.ok(en.has('activeSetOf'), 'activeSetOf must exist in locales');
  assert.ok(en.get('activeSetOf')?.has('current'), 'activeSetOf uses {{current}}');

  const hits: string[] = [];
  for (const dir of WEDGE_DIRS) {
    for (const file of walkTs(dir)) {
      const src = readFileSync(file, 'utf8');
      const rel = path.relative(root, file);
      for (const { key, body, line } of tCalls(src)) {
        const expected = en.get(key);
        if (!expected) continue;
        const keys = optionKeys(body);
        for (const [alias, canonical] of Object.entries(FORBIDDEN_ALIAS)) {
          if (!keys.has(alias)) continue;
          if (expected.has(alias)) continue; // template really wants that name
          if (!expected.has(canonical)) continue;
          hits.push(
            `${rel}:${line} t('${key}') passes ${alias}: but English wants {{${canonical}}}`
          );
        }
      }
    }
  }

  assert.deepEqual(
    hits,
    [],
    `wrong interpolation option names (class of .483):\n  ${hits.join('\n  ')}`
  );
});

test('activeSetOf still routes through activeSetOfParams in LogConsole', () => {
  const src = readFileSync(path.join(root, 'src/components/workout/LogConsole.tsx'), 'utf8');
  assert.match(src, /activeSetOfParams\(\s*setNumber\s*,\s*totalSets\s*\)/);
  assert.doesNotMatch(src, /activeSetOf[\s\S]{0,120}\bn\s*:\s*setNumber/);
});
