import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contrastRatio, POLISH_CONTRAST_PAIRS } from './polishContrast.ts';

const AA = 4.5;

test('Design Polish token pairs clear WCAG AA for body text', () => {
  for (const pair of POLISH_CONTRAST_PAIRS) {
    const ratio = contrastRatio(pair.fg, pair.bg);
    assert.ok(
      ratio >= AA,
      `${pair.name} ${pair.fg} on ${pair.bg} is ${ratio.toFixed(2)}:1, under ${AA}:1`
    );
  }
});

test('a dimmer grey than muted fails on the ground', () => {
  const faint = contrastRatio('#5f6b75', '#0a0c0f');
  assert.ok(faint < AA, `expected #5f6b75 to fail AA, got ${faint.toFixed(2)}`);
});
