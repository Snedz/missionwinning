/**
 * D1 — athlete-facing copy is Alpha, not leftover Open beta.
 * Does not rename isFreeBeta(). Gate invite copy is out of scope.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function walk(dir: string, keep: (p: string) => boolean, out: string[] = []): string[] {
  for (const name of readdirSync(path.join(root, dir))) {
    const rel = `${dir}/${name}`;
    if (statSync(path.join(root, rel)).isDirectory()) walk(rel, keep, out);
    else if (keep(rel)) out.push(rel);
  }
  return out;
}

function defaultValues(src: string): string[] {
  const out: string[] = [];
  const re = /defaultValue\s*:\s*(`(?:[^`\\]|\\.)*`|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) out.push(m[1].slice(1, -1));
  return out;
}

test('in-app defaultValues do not say open beta', () => {
  const files = [
    ...walk('src/page-components', (p) => p.endsWith('.tsx')),
    ...walk('src/components', (p) => p.endsWith('.tsx')),
  ];
  const hits: string[] = [];
  for (const file of files) {
    for (const dv of defaultValues(read(file))) {
      if (/open\s+beta/i.test(dv)) hits.push(`${file} → ${dv.slice(0, 80)}`);
    }
  }
  assert.deepEqual(hits, [], `Open beta leftover:\n  ${hits.join('\n  ')}`);
});

test('English locale values do not say open beta', () => {
  const files = walk('src/i18n', (p) => p.endsWith('Locales.ts') || p.endsWith('gateEn.ts'));
  const hits: string[] = [];
  for (const file of files) {
    const src = read(file);
    for (const line of src.split('\n')) {
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
      if (/open\s+beta/i.test(line) && /['"`]/.test(line)) {
        hits.push(`${file}: ${line.trim().slice(0, 100)}`);
      }
    }
  }
  assert.deepEqual(hits, [], `Open beta leftover:\n  ${hits.join('\n  ')}`);
});

test('isFreeBeta stays the mute-pay flag', () => {
  const src = read('src/lib/freeBeta.ts');
  assert.match(src, /export function isFreeBeta/);
  assert.match(src, /NEXT_PUBLIC_FREE_BETA/);
});
