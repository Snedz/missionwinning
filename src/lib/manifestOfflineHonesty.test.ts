import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Web-manifest description must not claim offline installability while
 * Serwist is gated (PRIVATE_MODE). Companion to offlineHonesty.test.ts.
 */
const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function stripComments(src: string): string {
  let out = '';
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (c === '"' || c === "'" || c === '`') {
      const q = c;
      out += c;
      i += 1;
      while (i < src.length) {
        if (src[i] === '\\' && i + 1 < src.length) {
          out += src[i] + src[i + 1];
          i += 2;
          continue;
        }
        out += src[i];
        if (src[i] === q) {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }
    if (c === '/' && n === '/') {
      i += 2;
      while (i < src.length && src[i] !== '\n') i += 1;
      continue;
    }
    if (c === '/' && n === '*') {
      i += 2;
      while (i + 1 < src.length && !(src[i] === '*' && src[i + 1] === '/')) i += 1;
      i += 2;
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
}

describe('web app manifest description', () => {
  it('gates the offline capability claim on isOfflineInstallable', () => {
    const src = stripComments(read('app/manifest.ts'));
    assert.match(
      src,
      /isOfflineInstallable\(\)/,
      'app/manifest.ts must not hard-code an offline/installable claim while Serwist is gated'
    );
    assert.match(
      src,
      /manifestDescription/,
      'keep the claim in a named helper so the gate stays greppable'
    );
    assert.doesNotMatch(
      src,
      /description:\s*'[^']*works offline anywhere[^']*'/
    );
  });
});
