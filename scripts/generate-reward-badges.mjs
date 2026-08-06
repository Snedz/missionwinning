/**
 * Generate Mission Rewards badge SVGs — modernist paper/ink/one-red medallions.
 * Run: node scripts/generate-reward-badges.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'rewards', 'badges');
mkdirSync(outDir, { recursive: true });

const PAPER = '#f3f2f2';
const INK = '#201e1d';
const RED = '#ec3013';
const MUTED = '#6f6b69';

/** Unique glyph per badge — geometric, no text. */
const GLYPHS = {
  first_blood: `<circle cx="32" cy="32" r="10" fill="none" stroke="${RED}" stroke-width="3"/>
    <circle cx="32" cy="32" r="3" fill="${RED}"/>`,
  week_one: `<path d="M20 38 L32 20 L44 38 Z" fill="none" stroke="${INK}" stroke-width="2.5"/>
    <path d="M26 38 L32 28 L38 38" fill="none" stroke="${RED}" stroke-width="2"/>`,
  consistent: `<rect x="18" y="28" width="6" height="16" fill="${INK}"/>
    <rect x="29" y="22" width="6" height="22" fill="${INK}"/>
    <rect x="40" y="16" width="6" height="28" fill="${RED}"/>`,
  iron_25: `<text x="32" y="38" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" font-weight="800" fill="${INK}">25</text>`,
  iron_100: `<text x="32" y="38" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="800" fill="${RED}">100</text>`,
  fuel_steady: `<circle cx="32" cy="34" r="12" fill="none" stroke="${INK}" stroke-width="2.5"/>
    <path d="M32 24 V34 L40 38" fill="none" stroke="${RED}" stroke-width="2.5" stroke-linecap="square"/>`,
  mobility_kept: `<path d="M18 40 Q32 12 46 40" fill="none" stroke="${INK}" stroke-width="2.5"/>
    <circle cx="32" cy="28" r="3" fill="${RED}"/>`,
  still_mind: `<circle cx="32" cy="32" r="14" fill="none" stroke="${INK}" stroke-width="2"/>
    <circle cx="32" cy="32" r="6" fill="none" stroke="${MUTED}" stroke-width="1.5"/>
    <circle cx="32" cy="32" r="2" fill="${RED}"/>`,
  student: `<path d="M16 28 L32 20 L48 28 L32 36 Z" fill="none" stroke="${INK}" stroke-width="2"/>
    <path d="M20 30 V40 L32 46 L44 40 V30" fill="none" stroke="${INK}" stroke-width="2"/>
    <rect x="30" y="36" width="4" height="8" fill="${RED}"/>`,
  challenge_cleared: `<path d="M32 14 L36 26 L48 26 L38 34 L42 46 L32 38 L22 46 L26 34 L16 26 L28 26 Z" fill="${RED}"/>`,
  full_spectrum: `<rect x="16" y="30" width="6" height="12" fill="${INK}"/>
    <rect x="24" y="26" width="6" height="16" fill="${MUTED}"/>
    <rect x="32" y="22" width="6" height="20" fill="${INK}"/>
    <rect x="40" y="18" width="6" height="24" fill="${RED}"/>`,
  comeback: `<path d="M22 22 A12 12 0 1 0 42 42" fill="none" stroke="${INK}" stroke-width="2.5"/>
    <path d="M40 18 L44 28 L34 26" fill="none" stroke="${RED}" stroke-width="2.5"/>`,
  commissioned: `<rect x="20" y="18" width="24" height="28" fill="none" stroke="${INK}" stroke-width="2.5"/>
    <path d="M20 26 H44" stroke="${INK}" stroke-width="2"/>
    <circle cx="32" cy="38" r="4" fill="${RED}"/>`,
};

function medal(id, honor, glyph) {
  const ring = honor
    ? `<rect x="4" y="4" width="56" height="56" fill="none" stroke="${RED}" stroke-width="3"/>`
    : `<rect x="6" y="6" width="52" height="52" fill="none" stroke="${INK}" stroke-width="2"/>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="${id}">
  <rect width="64" height="64" fill="${PAPER}"/>
  ${ring}
  <rect x="12" y="12" width="40" height="40" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>
  ${glyph}
</svg>
`;
}

const rarity = {
  first_blood: true,
  week_one: false,
  consistent: true,
  iron_25: false,
  iron_100: true,
  fuel_steady: false,
  mobility_kept: false,
  still_mind: false,
  student: false,
  challenge_cleared: false,
  full_spectrum: true,
  comeback: true,
  commissioned: true,
};

let n = 0;
for (const [id, glyph] of Object.entries(GLYPHS)) {
  const svg = medal(id, rarity[id], glyph);
  writeFileSync(join(outDir, `${id}.svg`), svg);
  n++;
}
console.log('wrote', n, 'badges to', outDir);
