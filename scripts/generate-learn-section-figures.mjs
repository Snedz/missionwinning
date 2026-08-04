#!/usr/bin/env node
/**
 * Beyond the Basics — section teaching figures (paper/ink/one-red diagrams).
 * Same pipeline as chapter heroes; smaller canvas for in-reader density.
 *
 * Run: node scripts/generate-learn-section-figures.mjs
 * Wire paths in src/data/guidebook/chapters.ts
 */
import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'learn');
const svgDir = path.join(root, 'media', 'inbox', 'learn-sections');
mkdirSync(svgDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

const PAPER = '#f3f2f2';
const INK = '#201e1d';
const MUTED = '#6f6b69';
const RED = '#ec3013';
const W = 960;
const H = 540;

function frame(kicker, title, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" role="img">
  <rect width="${W}" height="${H}" fill="${PAPER}"/>
  <rect x="40" y="40" width="${W - 80}" height="2" fill="${INK}"/>
  <text x="40" y="72" fill="${RED}" font-family="Archivo, system-ui, sans-serif" font-size="14" font-weight="600" letter-spacing="0.1em">${kicker}</text>
  <text x="40" y="110" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="32" font-weight="700">${title}</text>
  <rect x="40" y="${H - 40}" width="${W - 80}" height="2" fill="${INK}"/>
  ${body}
</svg>`;
}

const figures = {
  'said-principle': frame(
    'CH 1 · ADAPTATION',
    'SAID — adapt to the demand you repeat',
    `
    <line x1="80" y1="420" x2="880" y2="420" stroke="${INK}" stroke-width="2"/>
    <line x1="80" y1="420" x2="80" y2="160" stroke="${INK}" stroke-width="2"/>
    <text x="80" y="450" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">sessions</text>
    <text x="50" y="200" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14" transform="rotate(-90 50 200)">capacity</text>
    <path d="M120 380 L220 380 L220 340 L340 340 L340 290 L460 290 L460 240 L600 240 L600 200 L740 200 L740 170 L860 170"
          stroke="${INK}" stroke-width="3" fill="none" stroke-linejoin="round"/>
    <circle cx="220" cy="380" r="7" fill="${RED}"/>
    <circle cx="340" cy="340" r="7" fill="${RED}"/>
    <circle cx="460" cy="290" r="7" fill="${RED}"/>
    <circle cx="600" cy="240" r="7" fill="${RED}"/>
    <circle cx="740" cy="200" r="7" fill="${RED}"/>
    <text x="250" y="370" fill="${RED}" font-family="Archivo, system-ui, sans-serif" font-size="13">same pattern</text>
    <text x="780" y="160" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="16" font-weight="600">adapt</text>
    `
  ),

  'energy-systems': frame(
    'CH 1 · ENERGY',
    'Three buckets — match intent to the system',
    `
    <rect x="80" y="180" width="240" height="260" fill="none" stroke="${INK}" stroke-width="2"/>
    <rect x="80" y="180" width="240" height="48" fill="${RED}" opacity="0.15"/>
    <text x="200" y="212" text-anchor="middle" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="18" font-weight="600">ATP-PC</text>
    <text x="200" y="280" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="15">Seconds</text>
    <text x="200" y="320" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">Max power</text>
    <text x="200" y="360" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">Full rest</text>
    <circle cx="200" cy="400" r="8" fill="${RED}"/>

    <rect x="360" y="180" width="240" height="260" fill="none" stroke="${INK}" stroke-width="2"/>
    <rect x="360" y="180" width="240" height="48" fill="${INK}" opacity="0.08"/>
    <text x="480" y="212" text-anchor="middle" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="18" font-weight="600">Glycolytic</text>
    <text x="480" y="280" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="15">30s–2 min</text>
    <text x="480" y="320" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">Hard burn</text>
    <text x="480" y="360" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">Partial rest</text>
    <circle cx="480" cy="400" r="8" fill="${RED}"/>

    <rect x="640" y="180" width="240" height="260" fill="none" stroke="${INK}" stroke-width="2"/>
    <rect x="640" y="180" width="240" height="48" fill="${INK}" opacity="0.05"/>
    <text x="760" y="212" text-anchor="middle" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="18" font-weight="600">Oxidative</text>
    <text x="760" y="280" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="15">Minutes+</text>
    <text x="760" y="320" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">Sustainable</text>
    <text x="760" y="360" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">Steady pace</text>
    <circle cx="760" cy="400" r="8" fill="${RED}"/>
    `
  ),

  'recovery-stimulus': frame(
    'CH 1 · RECOVERY',
    'Stimulus then adaptation window',
    `
    <rect x="100" y="220" width="200" height="160" fill="none" stroke="${INK}" stroke-width="3"/>
    <text x="200" y="300" text-anchor="middle" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="20" font-weight="600">Session</text>
    <text x="200" y="340" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">stimulus</text>
    <path d="M320 300 L420 300" stroke="${RED}" stroke-width="3" stroke-linecap="round"/>
    <polygon points="420,292 432,300 420,308" fill="${RED}"/>
    <rect x="440" y="200" width="380" height="200" fill="none" stroke="${INK}" stroke-width="3"/>
    <text x="630" y="260" text-anchor="middle" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="20" font-weight="600">Recovery window</text>
    <text x="630" y="310" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="15">sleep · protein · easy movement</text>
    <text x="630" y="350" text-anchor="middle" fill="${RED}" font-family="Archivo, system-ui, sans-serif" font-size="16" font-weight="600">adaptation lands here</text>
    `
  ),

  'progressive-overload': frame(
    'CH 3 · PROGRAMMING',
    'Progress one variable at a time',
    `
    <text x="160" y="200" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">LOAD</text>
    <text x="360" y="200" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">REPS</text>
    <text x="560" y="200" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">SETS</text>
    <text x="760" y="200" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">QUALITY</text>
    <rect x="100" y="230" width="120" height="80" fill="none" stroke="${INK}" stroke-width="2"/>
    <rect x="100" y="250" width="120" height="60" fill="${RED}" opacity="0.2"/>
    <rect x="300" y="250" width="120" height="160" fill="none" stroke="${INK}" stroke-width="2"/>
    <rect x="500" y="280" width="120" height="130" fill="none" stroke="${INK}" stroke-width="2"/>
    <rect x="700" y="220" width="120" height="190" fill="none" stroke="${INK}" stroke-width="2"/>
    <rect x="700" y="220" width="120" height="40" fill="${RED}" opacity="0.15"/>
    <path d="M160 340 L160 400" stroke="${RED}" stroke-width="3"/>
    <polygon points="152,400 160,412 168,400" fill="${RED}"/>
    <text x="480" y="460" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="15">Pick one lever · keep the others honest</text>
    `
  ),

  'protein-briefing': frame(
    'CH 5 · FUEL',
    'Protein as a briefing — one idea, one action',
    `
    <circle cx="220" cy="300" r="90" fill="none" stroke="${INK}" stroke-width="3"/>
    <text x="220" y="290" text-anchor="middle" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="18" font-weight="600">Protein</text>
    <text x="220" y="320" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">most meals</text>
    <path d="M320 300 L420 300" stroke="${RED}" stroke-width="3"/>
    <polygon points="420,292 432,300 420,308" fill="${RED}"/>
    <rect x="450" y="220" width="400" height="160" fill="none" stroke="${INK}" stroke-width="2"/>
    <text x="650" y="280" text-anchor="middle" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="18" font-weight="600">Repair · satiety · consistency</text>
    <text x="650" y="330" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="15">Not a macro religion — a daily habit</text>
    `
  ),

  'retest-cadence': frame(
    'CH 6 · ASSESSMENTS',
    'Retest benchmarks every 3–4 weeks',
    `
    <line x1="100" y1="380" x2="860" y2="380" stroke="${INK}" stroke-width="2"/>
    <circle cx="180" cy="380" r="12" fill="${INK}"/>
    <circle cx="400" cy="380" r="12" fill="none" stroke="${INK}" stroke-width="3"/>
    <circle cx="620" cy="380" r="12" fill="${RED}"/>
    <circle cx="800" cy="380" r="12" fill="none" stroke="${INK}" stroke-width="3"/>
    <text x="180" y="320" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">baseline</text>
    <text x="400" y="320" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">train</text>
    <text x="620" y="320" text-anchor="middle" fill="${RED}" font-family="Archivo, system-ui, sans-serif" font-size="14" font-weight="600">retest</text>
    <text x="800" y="320" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">train</text>
    <path d="M180 360 L400 280 L620 240 L800 260" stroke="${INK}" stroke-width="3" fill="none"/>
    <circle cx="620" cy="240" r="8" fill="${RED}"/>
    <text x="480" y="200" text-anchor="middle" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="16" font-weight="600">Honest score · same conditions</text>
    `
  ),

  'first-session': frame(
    'CH 4 · START',
    'First session — gear-matched, loggable',
    `
    <rect x="120" y="200" width="200" height="200" fill="none" stroke="${INK}" stroke-width="2"/>
    <text x="220" y="280" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">1</text>
    <text x="220" y="320" text-anchor="middle" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="18" font-weight="600">Gear</text>
    <rect x="380" y="200" width="200" height="200" fill="none" stroke="${INK}" stroke-width="2"/>
    <text x="480" y="280" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">2</text>
    <text x="480" y="320" text-anchor="middle" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="18" font-weight="600">Session</text>
    <rect x="640" y="200" width="200" height="200" fill="none" stroke="${INK}" stroke-width="2"/>
    <rect x="640" y="200" width="200" height="200" fill="${RED}" opacity="0.08"/>
    <text x="740" y="280" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">3</text>
    <text x="740" y="320" text-anchor="middle" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="18" font-weight="600">Log set</text>
    <path d="M320 300 L380 300" stroke="${RED}" stroke-width="2"/>
    <path d="M580 300 L640 300" stroke="${RED}" stroke-width="2"/>
    `
  ),

  'deload-signal': frame(
    'CH 3 · DELOAD',
    'Back off when readiness rings trend down',
    `
    <line x1="100" y1="400" x2="860" y2="400" stroke="${INK}" stroke-width="2"/>
    <path d="M120 360 L200 300 L280 280 L360 250 L440 270 L520 220 L600 240 L680 320 L760 340 L840 360"
          stroke="${INK}" stroke-width="3" fill="none"/>
    <path d="M600 240 L680 320" stroke="${RED}" stroke-width="4"/>
    <circle cx="600" cy="240" r="10" fill="${RED}"/>
    <text x="620" y="210" fill="${RED}" font-family="Archivo, system-ui, sans-serif" font-size="14" font-weight="600">deload</text>
    <text x="480" y="460" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="15">Not failure — programming input</text>
    `
  ),

  'six-pillars': frame(
    'CH 4 · PILLARS',
    'Six pillars — one mission',
    `
    <g font-family="Archivo, system-ui, sans-serif" font-size="15" font-weight="600" fill="${INK}">
      <rect x="80" y="180" width="240" height="70" fill="none" stroke="${INK}" stroke-width="2"/>
      <text x="200" y="222" text-anchor="middle">Train</text>
      <rect x="360" y="180" width="240" height="70" fill="none" stroke="${INK}" stroke-width="2"/>
      <text x="480" y="222" text-anchor="middle">Fuel</text>
      <rect x="640" y="180" width="240" height="70" fill="none" stroke="${INK}" stroke-width="2"/>
      <text x="760" y="222" text-anchor="middle">Move</text>
      <rect x="80" y="300" width="240" height="70" fill="none" stroke="${INK}" stroke-width="2"/>
      <text x="200" y="342" text-anchor="middle">Mind</text>
      <rect x="360" y="300" width="240" height="70" fill="none" stroke="${INK}" stroke-width="2"/>
      <text x="480" y="342" text-anchor="middle">Track</text>
      <rect x="640" y="300" width="240" height="70" fill="none" stroke="${INK}" stroke-width="2"/>
      <rect x="640" y="300" width="240" height="70" fill="${RED}" opacity="0.08"/>
      <text x="760" y="342" text-anchor="middle">Learn</text>
    </g>
    <text x="480" y="440" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="15">One win per pillar beats a siloed grind</text>
    `
  ),

  'win-score-offline': frame(
    'CH 4 · SCORE',
    'Win Score rewards consistency — offline first',
    `
    <circle cx="280" cy="300" r="100" fill="none" stroke="${INK}" stroke-width="3"/>
    <circle cx="280" cy="300" r="70" fill="none" stroke="${RED}" stroke-width="4"/>
    <text x="280" y="295" text-anchor="middle" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="22" font-weight="700">Win</text>
    <text x="280" y="325" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">Score</text>
    <path d="M400 300 L500 300" stroke="${RED}" stroke-width="3"/>
    <polygon points="500,292 512,300 500,308" fill="${RED}"/>
    <rect x="530" y="220" width="320" height="160" fill="none" stroke="${INK}" stroke-width="2"/>
    <text x="690" y="280" text-anchor="middle" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="18" font-weight="600">Install · log offline</text>
    <text x="690" y="320" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="15">Sync when signed in</text>
    <text x="690" y="355" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">Park · garage · travel</text>
    `
  ),

  'meal-timing': frame(
    'CH 5 · TIMING',
    'Consistency beats perfect timing',
    `
    <line x1="100" y1="380" x2="860" y2="380" stroke="${INK}" stroke-width="2"/>
    <circle cx="200" cy="380" r="14" fill="${INK}"/>
    <circle cx="400" cy="380" r="14" fill="${RED}"/>
    <circle cx="600" cy="380" r="14" fill="${INK}"/>
    <circle cx="780" cy="380" r="14" fill="none" stroke="${INK}" stroke-width="3"/>
    <text x="200" y="320" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">breakfast</text>
    <text x="400" y="320" text-anchor="middle" fill="${RED}" font-family="Archivo, system-ui, sans-serif" font-size="14" font-weight="600">train</text>
    <text x="600" y="320" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">protein</text>
    <text x="780" y="320" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">evening</text>
    <text x="480" y="220" text-anchor="middle" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="18" font-weight="600">Same meals most days &gt; heroic timing once</text>
    <text x="480" y="460" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="15">Fuel hard work; do not obsess the clock</text>
    `
  ),

  'parq-screen': frame(
    'CH 6 · SCREEN',
    'Screen before you load intensity',
    `
    <rect x="120" y="180" width="280" height="240" fill="none" stroke="${INK}" stroke-width="3"/>
    <text x="260" y="240" text-anchor="middle" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="20" font-weight="600">PAR-Q</text>
    <text x="260" y="290" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="15">Honest answers</text>
    <text x="260" y="340" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="15">Not medical advice</text>
    <path d="M420 300 L520 300" stroke="${RED}" stroke-width="3"/>
    <polygon points="520,292 532,300 520,308" fill="${RED}"/>
    <rect x="550" y="200" width="300" height="200" fill="none" stroke="${INK}" stroke-width="2"/>
    <text x="700" y="270" text-anchor="middle" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="18" font-weight="600">Yes → get clearance</text>
    <text x="700" y="320" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="15">Not “never train”</text>
    <text x="700" y="360" text-anchor="middle" fill="${RED}" font-family="Archivo, system-ui, sans-serif" font-size="15" font-weight="600">Then load intensity</text>
    `
  ),

  'adjust-plan': frame(
    'CH 6 · ADJUST',
    'Stall · pain · stress — different fixes',
    `
    <rect x="80" y="190" width="240" height="200" fill="none" stroke="${INK}" stroke-width="2"/>
    <text x="200" y="250" text-anchor="middle" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="18" font-weight="600">Stall</text>
    <text x="200" y="300" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">Progress one lift</text>
    <text x="200" y="335" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">or deload</text>
    <rect x="360" y="190" width="240" height="200" fill="none" stroke="${INK}" stroke-width="2"/>
    <rect x="360" y="190" width="240" height="48" fill="${RED}" opacity="0.12"/>
    <text x="480" y="250" text-anchor="middle" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="18" font-weight="600">Pain</text>
    <text x="480" y="300" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">Stop aggravator</text>
    <text x="480" y="335" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">Refer out if sharp</text>
    <rect x="640" y="190" width="240" height="200" fill="none" stroke="${INK}" stroke-width="2"/>
    <text x="760" y="250" text-anchor="middle" fill="${INK}" font-family="Archivo, system-ui, sans-serif" font-size="18" font-weight="600">Stress</text>
    <text x="760" y="300" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">Keep the habit</text>
    <text x="760" y="335" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="14">Lower RPE</text>
    <text x="480" y="440" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="15">Do not treat every bad week as a cue to push harder</text>
    `
  ),
};

async function main() {
  for (const [id, svg] of Object.entries(figures)) {
    const svgPath = path.join(svgDir, `${id}.svg`);
    writeFileSync(svgPath, svg);
    const webpPath = path.join(outDir, `${id}.webp`);
    let quality = 72;
    let buf;
    for (;;) {
      buf = await sharp(Buffer.from(svg)).webp({ quality }).toBuffer();
      if (buf.length <= 100_000 || quality <= 40) break;
      quality -= 8;
    }
    writeFileSync(webpPath, buf);
    console.log(id, `${buf.length} B @ q${quality}`);
  }
  console.log('Wrote', Object.keys(figures).length, 'section figures to public/learn/');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
