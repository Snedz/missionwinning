import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  parseTokens,
  resolveColor,
  pairTokens,
  checkContrast,
} from './parse.mjs';
import { contrastRatio } from '../../src/lib/polishContrast.ts';

const FIXTURE = `
/* Light palette */
:root {
  --color-foreground: #111111;
  --color-background: #ffffff;

  --color-muted-fg: #999999;
  --color-muted-bg: #ffffff;

  --color-brand-text: var(--color-brand-tone);
  --color-brand-tone: var(--color-brand-ink);
  --color-brand-ink: #1a1a1a;
  --color-brand-bg: #ffffff;

  --color-accent-fg: oklch(0.72 0.15 250);
  --color-accent-bg: rgb(255, 255, 255);

  --color-hsl-fg: hsl(0 0% 0%);
  --color-hsl-bg: hsl(0, 0%, 100%);
}

/* Dark palette overrides only what it changes */
[data-theme="dark"] {
  --color-background: #000000;
  --color-foreground: #f5f5f5;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-muted-bg: #111111;
  }
}
`;

test('parseTokens splits light from dark and inherits light values', () => {
  const { light, dark } = parseTokens(FIXTURE);

  assert.equal(light['--color-background'], '#ffffff');
  assert.equal(light['--color-foreground'], '#111111');
  assert.equal(dark['--color-background'], '#000000');
  assert.equal(dark['--color-foreground'], '#f5f5f5');

  assert.equal(dark['--color-muted-fg'], '#999999', 'dark inherits unspecified values');
  assert.equal(dark['--color-muted-bg'], '#111111', 'media dark block overrides light');
  assert.equal(light['--color-muted-bg'], '#ffffff');
});

test('resolveColor follows var() chains and converts supported literals', () => {
  const { light } = parseTokens(FIXTURE);

  assert.equal(resolveColor('--color-brand-text', light), '#1a1a1a');
  assert.equal(resolveColor('--color-brand-text', { light, dark: light }), '#1a1a1a');
  assert.equal(resolveColor('--color-hsl-fg', light), '#000000');
  assert.equal(resolveColor('--color-hsl-bg', light), '#ffffff');
  assert.equal(resolveColor('--color-accent-bg', light), '#ffffff');
});

test('resolveColor guards cycles and rejects oklch', () => {
  const { light } = parseTokens(FIXTURE);
  const cycle = parseTokens(`
    :root {
      --color-a: var(--color-b);
      --color-b: var(--color-a);
    }
  `);

  assert.equal(resolveColor('--color-accent-fg', light), 'unsupported');
  assert.equal(resolveColor('--color-a', cycle.light), 'unsupported');
  assert.equal(resolveColor('--color-missing', light), 'unsupported');
});

test('pairTokens pairs foreground/text names with background names', () => {
  const { light } = parseTokens(FIXTURE);
  const pairs = pairTokens({ light, dark: light });
  const hasPair = (text, bg) =>
    pairs.some((pair) => pair.text === text && pair.bg === bg);

  assert.ok(hasPair('--color-foreground', '--color-background'));
  assert.ok(hasPair('--color-muted-fg', '--color-muted-bg'));
  assert.ok(hasPair('--color-brand-text', '--color-brand-bg'));
  assert.ok(hasPair('--color-accent-fg', '--color-accent-bg'));
});

test('checkContrast reports pass, fail, and unsupported pairs', () => {
  const results = checkContrast(FIXTURE, { min: 4.5 });
  const result = (mode, text) =>
    results.find((entry) => entry.mode === mode && entry.text === text);

  const foreground = result('light', '--color-foreground');
  assert.ok(foreground);
  assert.equal(foreground.pass, true);
  assert.equal(foreground.ratio, contrastRatio('#111111', '#ffffff'));

  const muted = result('light', '--color-muted-fg');
  assert.ok(muted);
  assert.equal(muted.pass, false);
  assert.ok(muted.ratio < 4.5, `expected < 4.5, got ${muted.ratio}`);

  const accent = result('light', '--color-accent-fg');
  assert.ok(accent);
  assert.equal(accent.ratio, null);
  assert.equal(accent.status, 'unsupported');
  assert.equal(accent.pass, false);

  const darkForeground = result('dark', '--color-foreground');
  assert.ok(darkForeground);
  assert.equal(darkForeground.pass, true);
  assert.equal(darkForeground.ratio, contrastRatio('#f5f5f5', '#000000'));
  assert.notEqual(darkForeground.ratio, foreground.ratio);
});
