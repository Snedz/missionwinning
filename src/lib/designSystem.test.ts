/**
 * A design system that checks itself.
 *
 * `.221` — the Modernist rebrand (`.130`–`.138`) decided paper/ink, one red,
 * radius 0, one typeface. Those rules lived in three prose documents and were
 * enforced by **nothing**.
 *
 * `check-token-sync.mjs` reads `src/index.css` and two Android Kotlin files and
 * never opens a `.tsx` — structurally the same blind spot `.202` found in
 * `i18n-parity`. Token *values* were pinned; component drift was invisible by
 * construction. Which is how `Benchmarks1RMChart` kept drawing Tailwind
 * blue-500 and green-500 through a full-app rebrand, on a live nav surface,
 * while the grid, axes and tooltip in that same file were correctly re-inked.
 *
 * The guards below split three ways: the **rules** (tested against fixtures, so
 * the scanner's own logic is checked rather than assumed), the **allowlist**
 * hygiene, and the one cross-check the scanner surfaced — a public artifact
 * holding a hand-copy of the palette.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { ALLOWLIST, scan } from '../../scripts/check-design-system.mjs';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

/** Every component source under `src/`, so the guards below discover rather than enumerate. */
function walkSrc(dir = 'src', out: string[] = []): string[] {
  for (const entry of readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walkSrc(rel, out);
    else if (/\.tsx$/.test(entry.name) && !/\.test\.tsx$/.test(entry.name)) out.push(rel);
  }
  return out;
}

/** Run the scanner over an in-memory fixture rather than the repo. */
function scanText(file: string, text: string) {
  return scan([file], () => text);
}

/* ── The rules, checked against fixtures ─────────────────────────────────── */

test('an off-palette colour is caught, in either hex length', () => {
  assert.equal(scanText('src/x.tsx', 'stroke="#3b82f6"').length, 1, 'six-digit');
  assert.equal(scanText('src/x.tsx', 'color: #111;').length, 1, 'three-digit shorthand');
  assert.equal(scanText('src/x.tsx', 'stroke="hsl(var(--accent-poster))"').length, 0);
});

test('a colour is caught in its functional forms too, not only hex', () => {
  /*
   * `.224` — the rule matched hex **only**, so every `rgb()`/`hsl()` literal in
   * the repo was invisible to the guard written to catch exactly this survival.
   * Two live cases sat behind it: `TrackPaceChart` drawing
   * `rgba(255,255,255,…)` grid lines and axis labels — the pre-rebrand dark
   * theme, still painting white onto a paper ground — and a sixth
   * `hsl(0 0% 100%)` leftover in the guidebook block `.221` had already been
   * through, under a token whose comment reads *"never pure white"*.
   *
   * The discriminator is the first character inside the paren: a token spells
   * `hsl(var(--…))`, a literal spells a digit.
   */
  assert.equal(scanText('src/x.tsx', "stroke='rgba(255,255,255,0.06)'").length, 1, 'rgba');
  assert.equal(scanText('src/x.tsx', "fill: 'rgb(12, 12, 12)'").length, 1, 'rgb');
  assert.equal(scanText('src/x.css', 'background: hsl(0 0% 100%);').length, 1, 'bare hsl');
  assert.equal(scanText('src/x.css', 'color: hsla(0, 0%, 100%, 0.4);').length, 1, 'hsla');
  // …and the correct spelling stays correct.
  assert.equal(scanText('src/x.css', 'background: hsl(var(--card));').length, 0);
  assert.equal(scanText('src/x.tsx', "stroke='hsl(var(--accent-poster))'").length, 0);
});

test('a chart tooltip with no styling at all is caught', () => {
  /*
   * The hole no colour scan can cover: styling that is **absent**. Every other
   * rule asks "is this value wrong?" — a missing prop has no value to be wrong,
   * and `BodyMetricsCard` rendered recharts' stock white/`#ccc`/rounded box for
   * the whole life of the rebrand with nothing in the file to match on.
   */
  const chart = (body: string) => `import { Tooltip } from 'recharts';\n${body}`;
  assert.equal(scanText('src/x.tsx', chart('<Tooltip />')).length, 1, 'bare');
  assert.equal(scanText('src/x.tsx', chart('<Tooltip {...CHART_TOOLTIP} />')).length, 0);
});

test('the spread is found even when an arrow function precedes it', () => {
  /*
   * The draft that would have made this rule worse than nothing. It was
   * `<Tooltip(?![^>]*\{\.\.\.CHART_TOOLTIP\})`, and `[^>]` stops at the `>` in
   * `=>` — which every one of these tooltips has in its `formatter`. So the
   * verdict depended on whether the spread happened to sit before or after the
   * first arrow, and correct code with it second would have been reported.
   * `.221` hit this backtracking shape on `border-radius: 0`; `.212` wrote the
   * rule that a guard keyed to one spelling has only tested that spelling.
   */
  const src = `import { Tooltip } from 'recharts';
    <Tooltip
      formatter={(v: number) => [v, '']}
      {...CHART_TOOLTIP}
    />`;
  assert.equal(scanText('src/x.tsx', src).length, 0, 'spread after an arrow is still a spread');
});

test('the Radix tooltip is not a chart tooltip', () => {
  /*
   * `Tooltip` names two different components in this repo. Running the first
   * version of the rule turned up eight hits in files with no chart in them —
   * `SetLogRow`, `TodayDashboardHeader`, `PillarScoreBreakdown` — all using the
   * shadcn `<Tooltip><TooltipTrigger>`, which takes no `contentStyle` at all.
   * A `.178` collision in the tag name, and a guard keyed to the word would
   * have demanded a chart prop on a hover hint. It keys on the import instead.
   */
  const radix = `import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip';
    <Tooltip><TooltipTrigger asChild><button /></TooltipTrigger></Tooltip>`;
  assert.equal(scanText('src/x.tsx', radix).length, 0);
});

test('a raw border-radius is caught, and zero is not', () => {
  /*
   * The rule that nearly made this guard useless. Its first draft excluded zero
   * with a lookahead — `\s*(?!0\b|…)` — and flagged `border-radius: 0`, which is
   * the thing it exists to ask for. `\s*` backtracks to zero width and the
   * lookahead is then evaluated against a space. A guard that cries wolf on
   * correct code is one nobody keeps, so the value is captured and tested in
   * code instead.
   */
  assert.equal(scanText('src/x.css', 'border-radius: 0;').length, 0);
  assert.equal(scanText('src/x.tsx', 'borderRadius: 0,').length, 0);
  assert.equal(scanText('src/x.css', 'border-radius: 9999px;').length, 0, 'pills stay circular');
  assert.equal(scanText('src/x.css', 'border-radius: var(--radius);').length, 0);
  assert.equal(scanText('src/x.css', 'border-radius: 8px;').length, 1);
  assert.equal(scanText('src/x.css', 'border-radius: 0 0.5rem 0.5rem 0;').length, 1);
});

test('an arbitrary shadow is caught; a token-mapped one is not', () => {
  // `shadow-md` maps to `--shadow-md`, and PlanSessionCard documents its single
  // deliberate elevation. Only arbitrary values reintroduce the retired glow.
  assert.equal(scanText('src/x.tsx', "className='shadow-md'").length, 0);
  assert.equal(
    scanText('src/x.tsx', "className='shadow-[0_0_28px_-4px_hsl(var(--primary)/0.45)]'").length,
    1,
    'the 28px glow `.131` retired'
  );
  assert.equal(scanText('src/x.tsx', "className='backdrop-blur-sm'").length, 1);
});

test('a second typeface is caught; the aliases are not', () => {
  assert.equal(scanText('src/x.css', 'font-family: var(--font-mono), ui-monospace;').length, 0);
  assert.equal(scanText('src/x.css', "font-family: Inter, sans-serif;").length, 1);
});

/* ── Comments are not code, and that is load-bearing ─────────────────────── */

test('documented reasoning is never reported as a violation', () => {
  /*
   * A naive scan of this repo reports ~35 hex colours and 6 shadows. **Almost
   * all are comments** — `MobileNav` explaining a 3.84:1 contrast choice,
   * `PressPage`'s brand guidance *"Don't: Round, stretch, rotate, or shadow the
   * mark"*. Explaining a colour decision at the call site is exactly the habit
   * this codebase should keep. A guard that punishes it gets switched off inside
   * a week, and a check nobody runs is `.200`'s defect — which this repo has now
   * paid for three times.
   */
  assert.equal(scanText('src/x.tsx', '/* #ec3013 on paper is 3.78:1 */').length, 0, 'block');
  assert.equal(scanText('src/x.tsx', '// neutral-600 is #7d7979 here').length, 0, 'line');
  assert.equal(scanText('src/x.tsx', '{/* was #0a0c10 before the re-ink */}').length, 0, 'JSX');
  assert.equal(
    scanText('src/x.tsx', "    ? 'a'\n    : // muted-foreground, not #7d7979\n      'b'").length,
    0,
    'inline after a ternary — the MobileNav shape the first draft missed'
  );
  // …but a URL is not a comment.
  assert.equal(scanText('src/x.tsx', "const u = 'https://x.dev'; const c = '#abcdef';").length, 1);
});

test('line numbers point at the real file', () => {
  // The first draft deleted comments outright, so every number it printed was
  // off by however many comment lines preceded the hit.
  const src = '/* a\n b\n c */\nconst x = "#123456";';
  const [finding] = scanText('src/x.tsx', src);
  assert.equal(finding.line, 4, 'blanking must preserve newlines');
});

/* ── Allowlist hygiene ───────────────────────────────────────────────────── */

test('every allowlist entry states why, and what would change it', () => {
  assert.ok(ALLOWLIST.length > 0);
  for (const entry of ALLOWLIST) {
    assert.ok(entry.why.trim().length > 40, `${entry.file}: "${entry.why}" is not a reason`);
    assert.ok(entry.fixWhen.trim().length > 15, `${entry.file} must say what would clear it`);
    assert.ok(Array.isArray(entry.rules) && entry.rules.length > 0, `${entry.file} needs rules`);
  }
});

test('exemptions are per rule, not per file', () => {
  /*
   * PressPage may hold raw swatches — they are its content — but it may not grow
   * a glow. A blanket file exemption would have quietly covered every rule,
   * which is how an allowlist becomes a mute button.
   */
  const press = ALLOWLIST.find((e) => e.file === 'src/page-components/PressPage.tsx');
  assert.ok(press, 'the press kit entry moved — re-read this guard');
  assert.deepEqual(press.rules, ['off-palette-colour']);
});

test('no allowlist entry is stale', () => {
  /*
   * `.220`'s correction, applied on arrival: an entry naming a file that no
   * longer needs it makes the list look more considered than it is. That
   * direction caught one of my own the same day it was written.
   *
   * Scanned with exemptions **off**, so the question asked is "would this file
   * fail without its entry?" — which is the only thing that justifies keeping it.
   */
  const stale = ALLOWLIST.filter((entry) => {
    const raw = scan([entry.file], (f: string) => read(f), true) as { rule: string }[];
    return !raw.some((f) => entry.rules.includes(f.rule));
  }).map((e) => `${e.file} (${e.rules.join(', ')})`);

  assert.deepEqual(stale, [], 'these no longer need their exemption — remove them from ALLOWLIST');
});

/* ── The cross-check the scanner surfaced ────────────────────────────────── */

test('the share card carries the current brand, not last season’s', () => {
  /*
   * `shareCard.ts` draws to a canvas, where CSS variables do not exist, so its
   * five colours are a hand-copy of `BRAND_HEX` in `check-token-sync.mjs`. Its
   * own comment says so. That makes it a **second definition of the palette**
   * (`.178`) on the app's most public artifact — and a hand-copy that nothing
   * compares is a copy that drifts.
   *
   * If the palette moves and this does not, every share card posted afterwards
   * carries the old brand, and nothing in the repo would say so.
   */
  const tokenSync = read('scripts/check-token-sync.mjs');
  const card = read('src/lib/share/shareCard.ts');

  const brand = Object.fromEntries(
    [...tokenSync.matchAll(/(paper|ink|red700|red600|poster):\s*'(#[0-9a-fA-F]{6})'/g)].map(
      (m) => [m[1], m[2]]
    )
  );
  assert.ok(brand.paper && brand.ink && brand.poster, 'BRAND_HEX moved — re-read this guard');

  const cardConst = (name: string) =>
    card.match(new RegExp(`const ${name} = '(#[0-9a-fA-F]{6})'`))?.[1];

  assert.equal(cardConst('PAPER'), brand.paper, 'share card paper drifted from BRAND_HEX');
  assert.equal(cardConst('INK'), brand.ink, 'share card ink drifted from BRAND_HEX');
  assert.equal(cardConst('POSTER'), brand.poster, 'share card poster red drifted from BRAND_HEX');
  assert.equal(cardConst('RED_700'), brand.red700, 'share card red-700 drifted from BRAND_HEX');
});

/* ── One accent, one meaning ─────────────────────────────────────────────── */

test('every chart draws “actual” and “estimated” the same way', () => {
  /*
   * `.224` — `History1RMChart` and `Benchmarks1RMChart` plot the **same two
   * series** and had assigned them opposite colours: red was *estimated* on
   * History and *actual* on Benchmarks. `.221` re-inked the second file (it was
   * still drawing Tailwind blue-500/green-500) and nothing pointed at the first,
   * so the fix landed on one screen and the drift stayed on the other.
   *
   * A palette with one hue cannot separate two series by colour, so the split is
   * by **dash** — which WCAG 1.4.1 asks for anyway — and the meaning rides with
   * it: solid accent for what the athlete lifted, dashed and quiet for what the
   * app inferred.
   *
   * **Discovered, not enumerated** (`.220`): naming the two files I had already
   * looked at is the twelfth-vacuous-guard shape, and the whole defect here is
   * that a third chart can be written tomorrow and pick the assignment afresh.
   */
  const files = walkSrc().filter((f) => read(f).includes('CHART_SERIES.'));
  assert.ok(files.length >= 2, 'expected at least the two 1RM charts — did they move?');

  const wrong: string[] = [];
  for (const file of files) {
    const src = read(file);
    for (const m of src.matchAll(/dataKey="(estimated|actual)"([\s\S]{0,300})/g)) {
      const [, key, after] = m;
      const block = after.split(/\/>/)[0];
      const want = key === 'actual' ? 'measured' : 'derived';
      if (!block.includes(`CHART_SERIES.${want}`)) {
        wrong.push(`${file}: "${key}" must use CHART_SERIES.${want}`);
      }
    }
  }
  assert.deepEqual(wrong, [], 'the one accent must not change meaning between screens');
});

test('the shared chart chrome is the only definition of it', () => {
  /*
   * Four recharts files each re-declared grid, axes and tooltip. That is the
   * duplication the drift above grew in — so the guard closes it rather than
   * trusting the next author to notice `chartTheme.ts` exists.
   */
  const charts = walkSrc().filter((f) => read(f).includes("from 'recharts'"));
  assert.ok(charts.length >= 4, 'chart files moved — re-read this guard');

  const rogue = charts.filter((f) => {
    const src = read(f);
    // A chart that renders a grid or an axis must take them from the shared module.
    const draws = /<(CartesianGrid|XAxis|YAxis)\b/.test(src);
    return draws && !src.includes('@/components/charts/chartTheme');
  });
  assert.deepEqual(rogue, [], 'these charts re-declare chrome instead of importing chartTheme');
});

/* ── The check has to actually run ───────────────────────────────────────── */

test('the check is a gate step, not a workflow-only ornament', () => {
  /*
   * `.200`, `.213` and `.219` all turned on the same fact: every workflow in
   * this repo is billing-blocked, so a check whose only home is one has never
   * executed. This is the single regression that would make the whole PR
   * ceremonial.
   */
  assert.match(read('scripts/gate.mjs'), /'check-design-system'/);
  const pkg = JSON.parse(read('package.json')) as { scripts: Record<string, string> };
  assert.equal(pkg.scripts['check-design-system'], 'node scripts/check-design-system.mjs');
});
