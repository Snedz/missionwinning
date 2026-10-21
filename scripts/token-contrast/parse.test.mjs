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

const SHADCN_FIXTURE = `
/* shadcn-style names, HSL triplets, light + dark scopes */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --broken: not-a-color;
  --broken-foreground: var(--broken);
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
}
`;

test('parseTokens reads shadcn token names and HSL triplets across scopes', () => {
  const { light, dark } = parseTokens(SHADCN_FIXTURE);

  assert.equal(light['--background'], '0 0% 100%');
  assert.equal(light['--foreground'], '222.2 84% 4.9%');
  assert.equal(dark['--background'], '222.2 84% 4.9%');
  assert.equal(dark['--foreground'], '210 40% 98%');
  assert.equal(dark['--card'], '0 0% 100%', 'dark inherits unspecified values');
});

test('resolveColor converts shadcn HSL triplets to hex', () => {
  const { light, dark } = parseTokens(SHADCN_FIXTURE);

  assert.equal(resolveColor('--background', light), '#ffffff');
  assert.equal(resolveColor('--foreground', light), '#020817');
  assert.equal(resolveColor('--primary', light), '#0f172a');
  assert.equal(resolveColor('--primary-foreground', light), '#f8fafc');
  assert.equal(resolveColor('--foreground', dark), '#f8fafc');
  assert.equal(resolveColor('--background', dark), '#020817');
});

test('pairTokens pairs shadcn --X-foreground with --X plus foreground/background', () => {
  const tokens = parseTokens(SHADCN_FIXTURE);
  const pairs = pairTokens(tokens);
  const hasPair = (text, bg) =>
    pairs.some((pair) => pair.text === text && pair.bg === bg);

  assert.ok(hasPair('--foreground', '--background'));
  assert.ok(hasPair('--card-foreground', '--card'));
  assert.ok(hasPair('--primary-foreground', '--primary'));
  assert.ok(hasPair('--muted-foreground', '--muted'));
});

test('checkContrast counts unparseable shadcn values as unsupported', () => {
  const results = checkContrast(SHADCN_FIXTURE, { min: 4.5 });
  const broken = results.find((entry) => entry.text === '--broken-foreground');

  assert.ok(results.length > 0);
  assert.ok(broken);
  assert.equal(broken.ratio, null);
  assert.equal(broken.status, 'unsupported');
  assert.equal(broken.pass, false);
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
