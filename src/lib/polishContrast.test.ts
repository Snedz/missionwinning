import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { contrastRatio } from './polishContrast.ts';

const AA = 4.5;
const css = readFileSync(
  path.join(import.meta.dirname, '../components/house/house.css'),
  'utf8',
);

function token(name: string): string {
  const hit = css.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`));
  assert.ok(hit, `${name} missing from house.css`);
  return hit[1].toLowerCase();
}

test('Design Polish token pairs clear WCAG AA for body text', () => {
  const ink = token('--house-ink');
  const ground = token('--house-paper');
  const card = token('--house-soft');
  const field = token('--house-chip');
  const muted = token('--house-muted');
  const signal = token('--house-press');
  const deep = token('--house-press-deep');
  const onSignal = token('--house-press-ink');
  const pairs = [
    ['ink on ground', ink, ground],
    ['ink on card', ink, card],
    ['ink on field', ink, field],
    ['muted on ground', muted, ground],
    ['muted on card', muted, card],
    ['muted on field', muted, field],
    ['ink on signal', onSignal, signal],
    ['ink on signal-deep', onSignal, deep],
  ] as const;
  for (const [name, fg, bg] of pairs) {
    const ratio = contrastRatio(fg, bg);
    assert.ok(ratio >= AA, `${name} ${fg} on ${bg} is ${ratio.toFixed(2)}:1, under ${AA}:1`);
  }
});

test('a dimmer grey than muted fails on the ground', () => {
  const faint = contrastRatio('#5f6b75', '#0a0c0f');
  assert.ok(faint < AA, `expected #5f6b75 to fail AA, got ${faint.toFixed(2)}`);
});
