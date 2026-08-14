import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { HELP_FAQ } from './helpFaq.ts';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('in-app FAQ says the logger is free and no wearable is required', () => {
  const blob = HELP_FAQ.map((i) => `${i.q} ${i.a}`).join('\n');
  assert.match(blob, /logger is never gated/i);
  assert.match(blob, /No wearable required/i);
  assert.doesNotMatch(blob, /Presidential|teacher PIN|PFT/i);
});

test('Help is a real route and is linked from the legal footer', () => {
  assert.match(read('app/(app)/help/page.tsx'), /HelpPage/);
  assert.match(read('src/components/layout/AppLegalFooter.tsx'), /href="\/help"/);
  assert.match(read('src/page-components/HelpPage.tsx'), /HELP_FAQ/);
});
