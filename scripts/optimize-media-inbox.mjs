#!/usr/bin/env node
/**
 * Optimize Google Flow / Imagine exports from media/inbox → public/learn|social.
 *
 * Naming:
 *   learn-{id}-frame.png|jpg|webp  → public/learn/{id}-hero.webp
 *   social-{id}-frame.png|…        → public/social/{id}.webp
 *   mascot-scout-{pose}-frame.png  → public/brand/mascot/scout-{pose}.webp
 *
 * Usage: npm run media:optimize-inbox
 * See docs/MEDIA_SYSTEM.md · media/FLOW_PROMPTS.md · docs/MASCOT.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const inbox = path.join(root, 'media', 'inbox');

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.tif', '.tiff']);

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

async function toWebp(src, dest, { width, maxBytes }) {
  let quality = 72;
  let buf;
  for (;;) {
    buf = await sharp(src)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
    if (buf.length <= maxBytes || quality <= 40) break;
    quality -= 8;
  }
  fs.writeFileSync(dest, buf);
  return { bytes: buf.length, quality };
}

function resolveTarget(fileName) {
  const base = path.basename(fileName, path.extname(fileName));
  // learn-human-performance-frame → human-performance-hero
  // learn-human-performance-hero → human-performance-hero
  // social-invite-frame → invite
  // social-invite → invite
  if (base.startsWith('learn-')) {
    let id = base.slice('learn-'.length).replace(/-frame$/, '').replace(/-raw$/, '');
    if (!id.endsWith('-hero')) id = `${id}-hero`;
    return {
      kind: 'learn',
      out: path.join(root, 'public', 'learn', `${id}.webp`),
      width: 1280,
      maxBytes: 120_000,
      publicPath: `/learn/${id}.webp`,
    };
  }
  if (base.startsWith('social-')) {
    let id = base.slice('social-'.length).replace(/-frame$/, '').replace(/-raw$/, '');
    return {
      kind: 'social',
      out: path.join(root, 'public', 'social', `${id}.webp`),
      width: 1080,
      maxBytes: 180_000,
      publicPath: `/social/${id}.webp`,
    };
  }
  // mascot-scout-idle-frame → scout-idle
  if (base.startsWith('mascot-')) {
    let id = base.slice('mascot-'.length).replace(/-frame$/, '').replace(/-raw$/, '');
    // Allow mascot-scout-idle or mascot-idle → scout-idle
    if (!id.startsWith('scout-') && !id.startsWith('scout')) {
      id = id.startsWith('scout') ? id : `scout-${id}`;
    }
    if (id === 'scout') id = 'scout-idle';
    return {
      kind: 'mascot',
      out: path.join(root, 'public', 'brand', 'mascot', `${id}.webp`),
      width: 1024,
      maxBytes: 120_000,
      publicPath: `/brand/mascot/${id}.webp`,
    };
  }
  return null;
}

async function main() {
  if (!fs.existsSync(inbox)) {
    console.error('Missing media/inbox — create it and drop Flow exports there.');
    process.exit(1);
  }

  const files = fs
    .readdirSync(inbox)
    .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()))
    .filter((f) => !f.startsWith('.'));

  if (files.length === 0) {
    console.log('No images in media/inbox/. Drop PNG/JPG frames from Google Flow, then re-run.');
    console.log('Tips: learn-*-frame.png · social-*-frame.png · mascot-scout-{idle|invite|celebrate}-frame.png');
    process.exit(0);
  }

  ensureDir(path.join(root, 'public', 'learn'));
  ensureDir(path.join(root, 'public', 'social'));
  ensureDir(path.join(root, 'public', 'brand', 'mascot'));

  const results = [];
  for (const file of files) {
    const target = resolveTarget(file);
    if (!target) {
      console.warn(`Skip (name must start with learn-, social-, or mascot-): ${file}`);
      continue;
    }
    const src = path.join(inbox, file);
    const { bytes, quality } = await toWebp(src, target.out, target);
    results.push({ file, ...target, kb: Math.round(bytes / 1024), quality });
    console.log(
      `✓ ${file} → ${path.relative(root, target.out)} (${Math.round(bytes / 1024)}KB q=${quality})`
    );
  }

  if (results.length === 0) {
    console.log('Nothing optimized.');
    process.exit(0);
  }

  console.log('\nNext: visual QA, update media/manifest.json, commit public/ only.');
  console.log('Paths:', results.map((r) => r.publicPath).join(', '));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
