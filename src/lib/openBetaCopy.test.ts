/**
 * Open-beta copy: the Preview the founder phones must not say invite-only.
 * Logger-free-forever / no-trial language already lives on the landing.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const abs = path.join(dir, name);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name)) {
      out.push(path.relative(root, abs));
    }
  }
  return out;
}

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

const COPY_ROOTS = ['src/i18n', 'src/components', 'src/page-components'];

describe('open-beta copy', () => {
  it('user-visible source does not say invite-only', () => {
    const hits: string[] = [];
    for (const dir of COPY_ROOTS) {
      for (const file of walk(path.join(root, dir))) {
        const body = stripComments(read(file));
        if (/invite-only/i.test(body)) hits.push(file);
      }
    }
    assert.deepEqual(
      hits,
      [],
      `invite-only still in user-facing copy:\n  ${hits.join('\n  ')}`
    );
  });
});
