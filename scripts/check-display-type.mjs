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

/**
 * `.198` — the second rule this file enforces, for the same reason as the first.
 *
 * Today docks exactly one red action. `.194` added a second one by using a
 * default-variant `Button` (which renders `bg-primary-fill`, poster red) inside
 * a Today card. The one-primary-action e2e test stayed green because it counts
 * elements carrying `.primary-action`, and that button had the colour without
 * the class — a rule enforced against a class name rather than against the
 * design.
 *
 * The e2e appearance check (`tests/e2e/helpers/redActions.ts`) is the real
 * guard, since it reads computed colour. This one is the cheap version that runs
 * in a second and names the file, so the failure arrives at the moment the line
 * is written rather than at the end of a browser run.
 */
const TODAY_DIRS = ['src/components/today'];
/** Class-level red fills. `variant="default"` is checked separately below. */
const RED_FILL = /\b(primary-action|bg-primary-fill|bg-accent-poster)\b/;
/**
 * Deliberate exceptions, each with a reason. Empty is the goal; a row here is a
 * design decision on the record, not a way to quiet the check.
 */
const RED_ALLOWED = [
  {
    file: 'src/components/today/MuscleFreshnessStrip.tsx',
    match: 'transition-[width]',
    why: 'A progress-bar fill inside an aria-hidden span, not an action — nothing to press, so it cannot compete with the docked CTA.',
  },
];

function defaultVariantButtons(source) {
  const out = [];
  // `<Button ...>` with no `variant=` before the closing bracket. shadcn's
  // default variant is the poster-red fill, so omitting it is a choice to be red.
  const re = /<Button\b([^>]*)>/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    if (!/\bvariant\s*=/.test(m[1])) out.push({ index: m.index, value: m[0].replace(/\s+/g, ' ') });
  }
  return out;
}

const redViolations = [];
for (const dir of TODAY_DIRS) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) continue;
  for (const file of walk(full)) {
    const rel = path.relative(root, file);
    const source = fs.readFileSync(file, 'utf8');
    const allowed = RED_ALLOWED.filter((a) => a.file === rel);
    for (const { value, index } of classStrings(source)) {
      if (!RED_FILL.test(value)) continue;
      // Matched on the class string, not the whole file: an exemption for a
      // progress bar must not also excuse a button added later in the same file.
      if (allowed.some((a) => value.includes(a.match))) continue;
      redViolations.push({
        file: rel,
        line: source.slice(0, index).split('\n').length,
        value: value.replace(/\s+/g, ' ').trim(),
      });
    }
    for (const { index, value } of defaultVariantButtons(source)) {
      redViolations.push({
        file: rel,
        line: source.slice(0, index).split('\n').length,
        value: `${value} — default variant is bg-primary-fill (poster red)`,
      });
    }
  }
}

for (const a of RED_ALLOWED) {
  if (!a.why || !a.why.trim()) {
    console.error(`RED_ALLOWED entry for ${a.file} has no reason — an exception without one is a disabled check.`);
    process.exit(1);
  }
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

if (redViolations.length > 0) {
  console.error(`\n${redViolations.length} red action(s) in src/components/today — Today docks exactly one:\n`);
  for (const v of redViolations) {
    console.error(`  ${v.file}:${v.line}`);
    console.error(`    ${v.value}\n`);
  }
  console.error(
    'Use variant="outline" (or "ghost") for anything that is not the one docked action.\n' +
      'If a second red action is genuinely right, add a reasoned RED_ALLOWED row.\n'
  );
  process.exit(1);
}

if (violations.length === 0) {
  console.log('display type OK — no size utility overrides a display class, and Today docks one red action.');
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
