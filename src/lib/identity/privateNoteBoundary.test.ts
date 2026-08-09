/**
 * C5 — the private note storage key must never appear on share / projection paths.
 *
 * Discovers rather than trusts: if athletePageShare or publicProjection start
 * reading `mw_athlete_private_note`, this fails before a PNG can leak it.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

const FORBIDDEN_IN = [
  'packages/mw-core/src/identity/publicProjection.ts',
  'src/lib/identity/athletePageShare.ts',
  'src/lib/identity/athleteCard.ts',
];

describe('private note boundary (C5)', () => {
  it('projection and share modules never mention the private-note storage key', () => {
    for (const file of FORBIDDEN_IN) {
      const src = read(file);
      assert.ok(
        !src.includes('mw_athlete_private_note') && !src.includes('athletePrivateNote'),
        `${file} must not reference the private note — that would put free text on a public path`
      );
      assert.ok(
        !src.includes("from './privateNote'") &&
          !src.includes('from "@/lib/identity/privateNote"') &&
          !src.includes("from '@/lib/identity/privateNote'"),
        `${file} must not import the private-note module`
      );
    }
  });

  it('privateNote module documents the cap and uses the storage key', () => {
    const src = read('src/lib/identity/privateNote.ts');
    assert.match(src, /PRIVATE_NOTE_MAX\s*=\s*280/);
    assert.match(src, /athletePrivateNote/);
  });
});
