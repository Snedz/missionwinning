import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { findForbiddenPhrases, TRANSPARENCY_FORBIDDEN_PHRASES } from '@/lib/transparency/copyGuard';
import { formatTransparencyJson, formatTransparencyText } from '@/lib/transparency/download';
import { buildTransparencyReport } from '@/lib/transparency/report';
import type { TransparencyInput } from '@/lib/transparency/types';

const root = path.join(import.meta.dirname, '..', '..', '..');

const SKIP_NAMES = new Set(['copyGuard.ts', 'copyGuard.test.ts']);

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx)$/.test(name) && !SKIP_NAMES.has(name)) acc.push(full);
  }
  return acc;
}

test('forbidden list is closed and each entry has a reason', () => {
  assert.ok(TRANSPARENCY_FORBIDDEN_PHRASES.length >= 6);
  for (const e of TRANSPARENCY_FORBIDDEN_PHRASES) {
    assert.ok(e.phrase.trim());
    assert.ok(e.why.trim());
  }
});

test('transparency sources do not use refused visibility language', () => {
  const files = [
    ...walk(path.join(root, 'src/lib/transparency')),
    path.join(root, 'src/page-components/TransparencyPage.tsx'),
    path.join(root, 'src/components/profile/ProfileTransparencyCard.tsx'),
  ];
  const hits: string[] = [];
  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    const found = findForbiddenPhrases(src);
    if (found.length) hits.push(`${path.relative(root, file)}: ${found.join(', ')}`);
  }
  assert.deepEqual(hits, [], hits.join('\n'));
});

test('report output never uses refused visibility language', () => {
  const input: TransparencyInput = {
    generatedAt: '2026-08-13T12:00:00.000Z',
    buildLabel: '2026.07-unified.729',
    privateGateEnabled: true,
    freeBeta: true,
    stripeCheckoutEnabled: false,
    territory: {
      blocked: true,
      reason: 'canada',
      message: 'Mission Winning’s hosted service is not available in Canada.',
      country: 'CA',
    },
    coach: {
      hasPlan: true,
      rationaleCompact: 'Logs showed recovery need → deload rule → lighter load.',
      rationaleInput: 'Recent sets in your logs called for recovery.',
      rationaleRule: 'Deload progression — lighter load, same movement patterns.',
      rationaleEffect: 'Working sets stay patterned but lighter.',
    },
  };
  const report = buildTransparencyReport(input);
  const blob = `${formatTransparencyJson(report)}\n${formatTransparencyText(report)}`;
  assert.deepEqual(findForbiddenPhrases(blob), []);
});
