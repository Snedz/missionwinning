#!/usr/bin/env node
/**
 * Rebuild the six Beyond the Basics chapter heroes as paper/ink/one-red diagrams.
 *
 * `.258` measured the previous raster set at 84–97% near-black with ~0% brand
 * red — the pre-`.131` palette, on paper-ground chapter pages. CDN re-ink was
 * blocked; `.268` ships these SVG→webp diagrams instead (same system as
 * form-guides). Re-run this script after art direction changes, then
 * `node scripts/check-guidebook-heroes.mjs`.
 *
 * Palette tokens (must match `src/index.css` / form-guides):
 *   paper #f3f2f2 · ink #201e1d · muted #6f6b69 · red #ec3013
 */
import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const PAPER = '#f3f2f2';
const INK = '#201e1d';
const MUTED = '#6f6b69';
const RED = '#ec3013';
const W = 1280;
const H = 853;

function frame(title, subtitle, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" role="img">
  <rect width="${W}" height="${H}" fill="${PAPER}"/>
  <rect x="64" y="64" width="${W - 128}" height="2" fill="${INK}"/>
  <text x="64" y="112" fill="${RED}" font-family="Archivo, system-ui, sans-serif" font-size="18" font-weight="600" letter-spacing="0.12em">BEYOND THE BASICS</text>
  <text x="64" y="168" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="48" font-weight="700">${title}</text>
  <text x="64" y="210" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="22">${subtitle}</text>
  <rect x="64" y="${H - 64}" width="${W - 128}" height="2" fill="${INK}"/>
  ${body}
</svg>`;
}

const heroes = {
  'human-performance-hero': frame(
    'Human Performance',
    'Adaptation follows the demand you repeat',
    `
    <line x1="160" y1="720" x2="1120" y2="720" stroke="${INK}" stroke-width="3"/>
    <line x1="160" y1="720" x2="160" y2="280" stroke="${INK}" stroke-width="3"/>
    <text x="160" y="760" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="16">stress</text>
    <text x="120" y="300" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="16" transform="rotate(-90 120 300)">capacity</text>
    <path d="M200 640 L320 640 L320 560 L480 560 L480 480 L640 480 L640 400 L800 400 L800 340 L960 340 L960 300 L1080 300"
          stroke="${INK}" stroke-width="4" stroke-linejoin="round" fill="none"/>
    <circle cx="320" cy="640" r="8" fill="${RED}"/>
    <circle cx="480" cy="560" r="8" fill="${RED}"/>
    <circle cx="640" cy="480" r="8" fill="${RED}"/>
    <circle cx="800" cy="400" r="8" fill="${RED}"/>
    <circle cx="960" cy="340" r="8" fill="${RED}"/>
    <text x="340" y="630" fill="${RED}" font-family="Archivo, system-ui, sans-serif" font-size="14">SAID</text>
    <text x="1000" y="290" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="18" font-weight="600">adapt</text>
    `
  ),

  'movement-mechanics-hero': frame(
    'Movement Mechanics',
    'Levers and patterns — not lore',
    `
    <text x="280" y="280" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="18">SQUAT</text>
    <text x="640" y="280" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="18">HINGE</text>
    <text x="1000" y="280" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="18">PUSH</text>
    <line x1="160" y1="700" x2="400" y2="700" stroke="${INK}" stroke-width="3"/>
    <line x1="520" y1="700" x2="760" y2="700" stroke="${INK}" stroke-width="3"/>
    <line x1="880" y1="700" x2="1120" y2="700" stroke="${INK}" stroke-width="3"/>
    <g stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <circle cx="280" cy="380" r="22"/>
      <line x1="280" y1="402" x2="280" y2="520"/>
      <line x1="280" y1="460" x2="220" y2="500"/>
      <line x1="280" y1="460" x2="340" y2="500"/>
      <line x1="280" y1="520" x2="230" y2="690"/>
      <line x1="280" y1="520" x2="330" y2="690"/>
    </g>
    <circle cx="280" cy="520" r="10" fill="${RED}"/>
    <text x="300" y="530" fill="${RED}" font-family="Archivo, system-ui, sans-serif" font-size="14">hips</text>
    <g stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <circle cx="640" cy="420" r="22"/>
      <line x1="640" y1="442" x2="580" y2="560"/>
      <line x1="580" y1="520" x2="520" y2="500"/>
      <line x1="580" y1="520" x2="560" y2="580"/>
      <line x1="580" y1="560" x2="560" y2="690"/>
      <line x1="580" y1="560" x2="640" y2="690"/>
      <line x1="520" y1="580" x2="700" y2="580"/>
    </g>
    <circle cx="580" cy="560" r="10" fill="${RED}"/>
    <g stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <circle cx="1000" cy="360" r="22"/>
      <line x1="1000" y1="382" x2="1000" y2="540"/>
      <line x1="1000" y1="420" x2="920" y2="400"/>
      <line x1="1000" y1="420" x2="1080" y2="400"/>
      <line x1="1000" y1="540" x2="960" y2="690"/>
      <line x1="1000" y1="540" x2="1040" y2="690"/>
    </g>
    <path d="M1080 380 L1080 340" stroke="${RED}" stroke-width="4" stroke-linecap="round"/>
    <polygon points="1072,340 1080,328 1088,340" fill="${RED}"/>
    `
  ),

  'programming-tuning-hero': frame(
    'Programming &amp; Tuning',
    'Volume, intensity, and when to deload',
    `
    <line x1="160" y1="680" x2="1120" y2="680" stroke="${INK}" stroke-width="3"/>
    <line x1="160" y1="680" x2="160" y2="280" stroke="${INK}" stroke-width="3"/>
    <text x="160" y="720" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="16">weeks</text>
    <text x="100" y="300" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="16" transform="rotate(-90 100 300)">load</text>
    <rect x="200" y="480" width="180" height="200" fill="none" stroke="${INK}" stroke-width="3"/>
    <rect x="200" y="520" width="180" height="160" fill="${INK}" opacity="0.08"/>
    <text x="290" y="460" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="16">base</text>
    <rect x="420" y="400" width="180" height="280" fill="none" stroke="${INK}" stroke-width="3"/>
    <rect x="420" y="440" width="180" height="240" fill="${INK}" opacity="0.12"/>
    <text x="510" y="380" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="16">build</text>
    <rect x="640" y="340" width="180" height="340" fill="none" stroke="${INK}" stroke-width="3"/>
    <rect x="640" y="380" width="180" height="300" fill="${INK}" opacity="0.16"/>
    <text x="730" y="320" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="16">peak</text>
    <rect x="860" y="560" width="180" height="120" fill="none" stroke="${RED}" stroke-width="4"/>
    <rect x="860" y="560" width="180" height="120" fill="${RED}" opacity="0.12"/>
    <text x="950" y="540" text-anchor="middle" fill="${RED}" font-family="Archivo, system-ui, sans-serif" font-size="18" font-weight="600">deload</text>
    <text x="200" y="300" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="20" font-weight="600">RPE · auto-regulate</text>
    `
  ),

  'getting-started-mw-hero': frame(
    'Getting Started',
    'I-Day · six pillars · Win Score',
    `
    ${[
      ['01', 'TRAIN', 200, 300],
      ['02', 'FUEL', 480, 300],
      ['03', 'MOVE', 760, 300],
      ['04', 'MIND', 200, 520],
      ['05', 'TRACK', 480, 520],
      ['06', 'LEARN', 760, 520],
    ]
      .map(
        ([n, label, x, y], i) => `
      <rect x="${x}" y="${y}" width="220" height="180" fill="none" stroke="${i === 0 ? RED : INK}" stroke-width="${i === 0 ? 4 : 3}"/>
      <text x="${x + 24}" y="${y + 48}" fill="${i === 0 ? RED : MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="20" font-weight="600">${n}</text>
      <text x="${x + 24}" y="${y + 110}" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="28" font-weight="700">${label}</text>
    `
      )
      .join('')}
    <rect x="1040" y="400" width="120" height="120" fill="${INK}"/>
    <text x="1100" y="470" text-anchor="middle" fill="${PAPER}" font-family="Archivo, system-ui, sans-serif" font-size="36" font-weight="700">W</text>
    <text x="1100" y="560" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">SCORE</text>
    `
  ),

  'nutrition-recovery-hero': frame(
    'Nutrition &amp; Recovery',
    'Fuel and sleep — the other half of adaptation',
    `
    <circle cx="380" cy="480" r="180" fill="none" stroke="${INK}" stroke-width="4"/>
    <path d="M380 480 L380 300 A180 180 0 0 1 536 570 Z" fill="${RED}" opacity="0.15" stroke="${RED}" stroke-width="3"/>
    <text x="460" y="420" fill="${RED}" font-family="Archivo, system-ui, sans-serif" font-size="18" font-weight="600">protein</text>
    <path d="M380 480 L536 570 A180 180 0 0 1 224 570 Z" fill="none" stroke="${INK}" stroke-width="3"/>
    <text x="360" y="600" text-anchor="middle" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="16">carbs</text>
    <path d="M380 480 L224 570 A180 180 0 0 1 380 300 Z" fill="none" stroke="${INK}" stroke-width="3"/>
    <text x="260" y="440" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="16">fats</text>
    <text x="380" y="280" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="18">PLATE</text>
    <text x="780" y="300" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="18">SLEEP BLOCKS</text>
    ${[7, 8, 6.5, 8.5, 7.5, 9, 8]
      .map((h, i) => {
        const bh = h * 28;
        const x = 780 + i * 56;
        const y = 680 - bh;
        const isBest = h >= 8.5;
        return `<rect x="${x}" y="${y}" width="40" height="${bh}" fill="none" stroke="${isBest ? RED : INK}" stroke-width="${isBest ? 4 : 3}"/>`;
      })
      .join('')}
    <text x="780" y="720" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">M  T  W  T  F  S  S</text>
    `
  ),

  'assessments-progress-hero': frame(
    'Assessments &amp; Progress',
    'Screen safely · benchmark honestly · adjust',
    `
    <text x="160" y="300" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="18">SCREEN</text>
    ${[
      [true, 'PAR-Q complete'],
      [true, 'Movement screen'],
      [false, 'Baseline lift'],
      [false, 'Conditioning test'],
    ]
      .map(([done, label], i) => {
        const y = 340 + i * 70;
        return `
        <rect x="160" y="${y}" width="40" height="40" fill="none" stroke="${done ? RED : INK}" stroke-width="3"/>
        ${done ? `<path d="M168 ${y + 20} L176 ${y + 28} L192 ${y + 12}" stroke="${RED}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` : ''}
        <text x="220" y="${y + 28}" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="22">${label}</text>
      `;
      })
      .join('')}
    <line x1="700" y1="680" x2="1160" y2="680" stroke="${INK}" stroke-width="3"/>
    <line x1="700" y1="680" x2="700" y2="300" stroke="${INK}" stroke-width="3"/>
    <text x="700" y="720" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="16">sessions</text>
    <path d="M740 600 L820 560 L900 580 L980 480 L1060 420 L1140 360"
          stroke="${INK}" stroke-width="4" fill="none" stroke-linejoin="round"/>
    <circle cx="740" cy="600" r="8" fill="${INK}"/>
    <circle cx="820" cy="560" r="8" fill="${INK}"/>
    <circle cx="900" cy="580" r="8" fill="${INK}"/>
    <circle cx="980" cy="480" r="8" fill="${RED}"/>
    <circle cx="1060" cy="420" r="8" fill="${RED}"/>
    <circle cx="1140" cy="360" r="8" fill="${RED}"/>
    <text x="900" y="300" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="18" font-weight="600">honest trend</text>
    `
  ),
};

async function main() {
  const outDir = path.join(root, 'public/learn');
  const svgDir = path.join(root, 'media/inbox/guide-heroes');
  mkdirSync(svgDir, { recursive: true });

  for (const [name, svg] of Object.entries(heroes)) {
    writeFileSync(path.join(svgDir, `${name}.svg`), svg);
    const webpPath = path.join(outDir, `${name}.webp`);
    await sharp(Buffer.from(svg)).resize(W, H, { fit: 'fill' }).webp({ quality: 90 }).toFile(webpPath);
    console.log(`  wrote ${name}.webp`);
  }

  const { check } = await import('./check-guidebook-heroes.mjs');
  const { problems, rows } = await check();
  for (const r of rows) {
    console.log(
      `  ${r.rel.padEnd(44)} ink ${String(r.ink).padStart(3)}%   brand ${String(r.brand).padStart(3)}%`
    );
  }
  if (problems.length) {
    console.error(`\n✗ post-generate palette check failed:\n  - ${problems.join('\n  - ')}`);
    process.exit(1);
  }
  console.log(`\n✓ ${rows.length} chapter heroes regenerated in paper/ink/one-red`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
