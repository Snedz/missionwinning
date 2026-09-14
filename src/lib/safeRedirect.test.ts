import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { DEAD_ALIAS_PATHS, sanitizeNextPath } from './safeRedirect.ts';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

describe('sanitizeNextPath', () => {
  it('allows listed paths', () => {
    assert.equal(sanitizeNextPath('/log'), '/log');
    assert.equal(sanitizeNextPath('/coach'), '/coach');
  });

  it('maps dead route aliases to canonical paths', () => {
    for (const [alias, canonical] of Object.entries(DEAD_ALIAS_PATHS)) {
      assert.equal(sanitizeNextPath(alias), canonical, `${alias} → ${canonical}`);
    }
  });

  it('maps alias paths before open-redirect checks', () => {
    assert.equal(sanitizeNextPath('/today?invite=1'), '/log');
    assert.equal(sanitizeNextPath('/train#sets'), '/active');
  });

  it('blocks open redirects', () => {
    assert.equal(sanitizeNextPath('//example.test'), '/log');
    assert.equal(sanitizeNextPath('/\\example.test'), '/log');
    assert.equal(sanitizeNextPath('https://example.test'), '/log');
    assert.equal(sanitizeNextPath('/school/class/../welcome'), '/log');
    assert.equal(sanitizeNextPath('/join/class/not a code'), '/log');
  });

  it('allows school class paths', () => {
    assert.equal(sanitizeNextPath('/school/class/MWAB12'), '/school/class/MWAB12');
    assert.equal(sanitizeNextPath('/join/class/MWAB12'), '/join/class/MWAB12');
  });

  it('error pages keep Go to Today on /log', () => {
    assert.match(read('app/not-found.tsx'), /href="\/log"/);
    assert.match(read('app/error.tsx'), /href="\/log"/);
  });

  it('next.config.js dead-alias redirects match DEAD_ALIAS_PATHS', () => {
    const cfg = read('next.config.js');
    /**
     * Pair each `source` with the `destination` **in the same object literal**.
     *
     * The previous assertion was a single lazy span,
     * `source:'/today'[\s\S]*?destination:'/log'`. `[\s\S]*?` crosses entry
     * boundaries, so repointing `/today` at `/log2` still matched: the later
     * `/dashboard` → `/log` entry satisfied it. The test was green over exactly
     * the drift it was written to catch. Parse the pairs instead of spanning.
     */
    const pairs = new Map<string, string>();
    for (const m of cfg.matchAll(/\{\s*source:\s*'([^']+)',\s*destination:\s*'([^']+)'/g)) {
      pairs.set(m[1], m[2]);
    }
    assert.ok(
      pairs.size > 0,
      'no redirect pairs parsed out of next.config.js — the parse is broken, not the config'
    );

    for (const [alias, canonical] of Object.entries(DEAD_ALIAS_PATHS)) {
      assert.equal(
        pairs.get(alias),
        canonical,
        `${alias} must redirect to ${canonical} in next.config.js (found ${
          pairs.get(alias) ?? 'no entry'
        })`
      );
    }
  });
});
