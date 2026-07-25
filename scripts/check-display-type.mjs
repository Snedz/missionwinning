#!/usr/bin/env node
/**
 * Guard: a Tailwind size utility must never sit on the same element as a display class.
 * Run: npm run check-display-type — exit 0 = OK, 1 = violation.
 *
 * `.display-hero` / `.display-section` / `.display-mega` set their size with `clamp()`
 * in `@layer components`. Tailwind utilities live in `@layer utilities`, which comes
 * later, so `className="display-section text-2xl"` silently throws the clamp away — same
 * specificity, later wins. Verified in built CSS: `.display-section` sat at byte ~10.6k
 * and `.text-2xl` at ~46k.
 *
 * Ten call sites had done exactly that, which is why `.display-section`'s real size
 * rendered on precisely one page while every other page looked like it was on the
 * design system. Nothing caught it: it is not a type error, not a lint error, and the
 * markup reads as correct.
 *
 * A script rather than an ESLint rule because the check is a regex over `className`
 * string contents, which `no-restricted-syntax` handles badly. Same shape as
 * `check-token-sync.mjs`.
 *
 * If you need the display face at a custom size, use `font-display` directly — that is
 * the face without the scale, and it is what the display classes are built on.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOTS = ['src', 'app'];
const DISPLAY = /\b(display-hero|display-section|display-mega)\b/;
/** Tailwind font-size utilities, including responsive variants and arbitrary values. */
const SIZE = /(?:^|\s)(?:[a-z]+:)*text-(?:xs|sm|base|lg|[2-9]?xl|\[[^\]]*\])(?=\s|$)/;

/** Every className="..." / className={`...`} literal in a file. */
function classStrings(source) {
  const out = [];
  const re = /className=(?:"([^"]*)"|\{`([^`]*)`\})/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    out.push({ value: m[1] ?? m[2], index: m.index });
  }
  return out;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.tsx$/.test(entry.name)) files.push(full);
  }
  return files;
}

const violations = [];
for (const r of ROOTS) {
  const dir = path.join(root, r);
  if (!fs.existsSync(dir)) continue;
  for (const file of walk(dir)) {
    const source = fs.readFileSync(file, 'utf8');
    if (!DISPLAY.test(source)) continue;
    for (const { value, index } of classStrings(source)) {
      if (!DISPLAY.test(value) || !SIZE.test(value)) continue;
      violations.push({
        file: path.relative(root, file),
        line: source.slice(0, index).split('\n').length,
        value: value.replace(/\s+/g, ' ').trim(),
      });
    }
  }
}

if (violations.length === 0) {
  console.log('display type OK — no size utility overrides a display class.');
  process.exit(0);
}

console.error(
  `\n${violations.length} display class(es) nullified by a size utility:\n`
);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}`);
  console.error(`    ${v.value}\n`);
}
console.error(
  'A `text-*` utility beats the display class and discards its clamp(). Drop the size,\n' +
    'or use `font-display` if you want the face at a custom size.\n'
);
process.exit(1);
