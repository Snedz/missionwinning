#!/usr/bin/env node
/**
 * Every `@/` import from this surface must resolve to a file that still exists.
 *
 * `.668` deleted `src/data/compareStories.ts` and the Next `/compare` hub.
 * `sites/www` kept importing it. `astro build` failed only in CI (www job),
 * after Playwright chromium had already been installed. A missing module is
 * a source fact — catch it here, before the build.
 *
 * Discover, do not enumerate: walk `src/` and resolve each `@/` specifier.
 * A new import of a deleted file fails without an allowlist edit.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const wwwSrc = path.join(here, '..', 'src');
const appSrc = path.join(here, '..', '..', '..', 'src');

const IMPORT_RE = /from\s+['"]@\/([^'"]+)['"]/g;
const EXTS = ['', '.ts', '.tsx', '.js', '.mjs', '.astro', '/index.ts', '/index.tsx'];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx|js|mjs|astro)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function resolves(spec) {
  const base = path.join(appSrc, spec);
  return EXTS.some((ext) => {
    const candidate = base + ext;
    return fs.existsSync(candidate) && fs.statSync(candidate).isFile();
  });
}

const files = walk(wwwSrc);
if (files.length === 0) {
  console.error('www alias-imports: no source files under sites/www/src');
  process.exit(1);
}

const missing = [];
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  for (const match of src.matchAll(IMPORT_RE)) {
    const spec = match[1];
    if (!resolves(spec)) {
      missing.push(`${path.relative(wwwSrc, file)} → @/${spec}`);
    }
  }
}

if (missing.length) {
  console.error(
    '\n✗ www `@/` import does not resolve (deleted or never existed):\n  ' +
      missing.join('\n  ') +
      '\n',
  );
  process.exit(1);
}

console.log(`  www alias-imports — ${files.length} files, all @/ imports resolve`);
