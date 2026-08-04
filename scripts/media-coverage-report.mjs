#!/usr/bin/env node
/**
 * Media coverage report — exercises × text guide × form SVG.
 *
 * Usage: node scripts/media-coverage-report.mjs
 * Optional: --write writes media/COVERAGE.md
 *
 * See docs/MEDIA_SYSTEM.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const writeMd = process.argv.includes('--write');

function read(p) {
  return fs.readFileSync(path.join(root, p), 'utf8');
}

function exerciseIds() {
  const ids = new Set();
  for (const rel of [
    'src/data/exercises.ts',
    'src/data/exercisesExtended.ts',
    'src/data/exercisesVolume2.ts',
  ]) {
    const t = read(rel);
    for (const m of t.matchAll(/\{\s*id:\s*['"]([^'"]+)['"]/g)) ids.add(m[1]);
  }
  return [...ids].sort();
}

function formMediaIds() {
  const t = read('src/lib/formGuides.ts');
  const block = t.match(/FORM_MEDIA_IDS = new Set\(\[([\s\S]*?)\]\)/);
  if (!block) return [];
  return [...block[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]);
}

function structuredGuideIds() {
  const ids = new Set();
  const core = read('src/lib/formGuides.ts');
  // GUIDES object keys only (before MILITARY)
  const guidesBlock = core.match(/const GUIDES:[\s\S]*?= \{([\s\S]*?)\n\};/);
  if (guidesBlock) {
    for (const m of guidesBlock[1].matchAll(/^\s+['"]?([a-z][a-z0-9-]*)['"]?\s*:\s*\{/gm)) {
      ids.add(m[1]);
    }
  }
  const ext = read('src/lib/formGuidesExtended.ts');
  for (const m of ext.matchAll(/^\s+['"]([a-z0-9-]+)['"]\s*:\s*g\(/gm)) {
    ids.add(m[1]);
  }
  return [...ids].sort();
}

function svgIds() {
  const dir = path.join(root, 'public', 'form-guides');
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.svg'))
    .map((f) => f.replace(/\.svg$/, ''))
    .sort();
}

function guidebookFigures() {
  const ch = read('src/data/guidebook/chapters.ts');
  const heroes = [...ch.matchAll(/heroImage:\s*\{[\s\S]*?src:\s*['"]([^'"]+)['"]/g)].map(
    (m) => m[1]
  );
  const figures = [...ch.matchAll(/figure:\s*\{[\s\S]*?src:\s*['"]([^'"]+)['"]/g)].map(
    (m) => m[1]
  );
  return { heroes, figures };
}

const exercises = exerciseIds();
const media = new Set(formMediaIds());
const guides = new Set(structuredGuideIds());
const svgs = new Set(svgIds());
const { heroes, figures } = guidebookFigures();

const guideNoSvg = [...guides].filter((id) => !svgs.has(id));
// pattern-* SVGs are shared long-tail art — not FORM_MEDIA_IDS entries
const svgNoMediaWire = [...svgs].filter((id) => !media.has(id) && !id.startsWith('pattern-'));
const patternSvgs = [...svgs].filter((id) => id.startsWith('pattern-'));
const mediaMissingFile = [...media].filter((id) => !svgs.has(id));
const mediaNoGuide = [...media].filter((id) => !guides.has(id));

const lines = [];
const log = (s = '') => lines.push(s);

log('# Media coverage report');
log('');
log(`Generated: ${new Date().toISOString().slice(0, 10)}`);
log('');
log('## Summary');
log('');
log(`| Metric | Count |`);
log(`|--------|------:|`);
log(`| Exercises (catalog) | ${exercises.length} |`);
log(`| Structured text guides | ${guides.size} |`);
log(`| Form SVGs on disk | ${svgs.size} |`);
log(`| · of which pattern packs | ${patternSvgs.length} |`);
log(`| FORM_MEDIA_IDS wired | ${media.size} |`);
log(`| Guides without SVG | ${guideNoSvg.length} |`);
log(`| Orphan SVGs (not media, not pattern) | ${svgNoMediaWire.length} |`);
log(`| FORM_MEDIA missing file | ${mediaMissingFile.length} |`);
log(`| Guidebook chapter heroes | ${heroes.length} |`);
log(`| Guidebook section figures | ${figures.length} |`);
log('');
log('## Guides without form SVG (T1 backlog)');
log('');
if (guideNoSvg.length === 0) log('_None — every structured guide has a diagram file._');
else guideNoSvg.forEach((id) => log(`- \`${id}\``));
log('');
log('## Wiring issues');
log('');
if (mediaMissingFile.length) {
  log('**FORM_MEDIA_IDS without file:**');
  mediaMissingFile.forEach((id) => log(`- \`${id}\``));
} else log('- No missing files for FORM_MEDIA_IDS.');
if (svgNoMediaWire.length) {
  log('');
  log('**Orphan SVGs (not FORM_MEDIA, not pattern-*):**');
  svgNoMediaWire.forEach((id) => log(`- \`${id}\``));
} else {
  log('- No orphan SVGs (patterns are intentional shared art).');
}
if (patternSvgs.length) {
  log('');
  log(`**Pattern packs (${patternSvgs.length}):** ${patternSvgs.map((id) => `\`${id}\``).join(', ')}`);
}
if (mediaNoGuide.length) {
  log('');
  log('**Media wired but no structured guide key** (may still attach via military/cues path):');
  mediaNoGuide.forEach((id) => log(`- \`${id}\``));
}
log('');
log('## Guidebook figures');
log('');
log('Heroes:');
heroes.forEach((h) => log(`- ${h}`));
log('');
log('Section figures:');
figures.forEach((f) => log(`- ${f}`));
log('');
log('## Next craft tiers');
log('');
log('1. **T1** — SVGs for guides without media (list above).');
log('2. **T2** — next coach/library frequency lifts.');
log('3. **T3** — pattern packs for long-tail cues-only exercises.');
log('4. **Learn** — unique section diagrams beyond form-guide reuse.');
log('');
log('_Playbook: [docs/MEDIA_SYSTEM.md](../docs/MEDIA_SYSTEM.md)_');

const report = lines.join('\n') + '\n';
process.stdout.write(report);

if (writeMd) {
  const out = path.join(root, 'media', 'COVERAGE.md');
  fs.writeFileSync(out, report);
  console.error('Wrote', path.relative(root, out));
}

// Non-zero exit if hard wiring broken (missing files)
if (mediaMissingFile.length) process.exitCode = 1;
