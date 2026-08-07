#!/usr/bin/env node
/**
 * The Modernist rules, checked instead of merely stated.
 *
 * `.221` — the rebrand (`.130`–`.138`) decided paper/ink, **one red**, radius 0,
 * 2px rules, one typeface. Those rules live in three prose documents and were
 * enforced by nothing.
 *
 * `check-token-sync.mjs` reads `src/index.css` and two Android Kotlin files. **It
 * never opens a `.tsx`.** That is structurally the same blind spot `.202` found
 * in `i18n-parity` — a checker that compares definitions to each other and
 * cannot see what components actually do. Token *values* were pinned; component
 * drift was invisible by construction.
 *
 * Which is how `Benchmarks1RMChart` kept drawing Tailwind **blue-500 and
 * green-500** through a full-app rebrand, on a live nav surface, while every
 * other part of that same file — grid, axes, tooltip, `borderRadius: 0` — was
 * correctly re-inked.
 *
 * ## Comments are stripped first, and that is load-bearing
 *
 * A naive scan of this repo reports ~35 hardcoded hex colours and 6 shadows.
 * **Almost all are comments** — `MobileNav` explaining a 3.84:1 contrast choice,
 * `PressPage`'s brand guidance *"Don't: Round, stretch, rotate, or shadow the
 * mark"*. Documenting the reasoning at the call site is exactly the practice
 * this codebase should keep, so a guard that punishes it would be turned off
 * within a week — and a check nobody runs is `.200`'s defect, which this repo
 * has now paid for three times.
 */

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Files allowed to carry raw colour, each with the reason and what would change
 * it. **A reason is mandatory** and asserted by `designSystem.test.ts`: a list of
 * bare paths is a mute button, while one that has to state its case is a
 * decision the next reader can disagree with.
 */
export const ALLOWLIST = [
  {
    file: 'src/components/auth/SignInPanel.tsx',
    rules: ['off-palette-colour'],
    why: 'Google, Microsoft and Facebook brand marks inside the OAuth button SVGs. These are other companies’ trademarks — re-inking them to our palette would misrepresent the provider and break their brand terms.',
    fixWhen: 'Never, while those sign-in options exist. If a provider is dropped, drop its colours with it.',
  },
  {
    file: 'app/opengraph-image.tsx',
    rules: ['off-palette-colour'],
    why: 'Rendered by Satori/ImageResponse, which resolves no CSS custom properties — a var() here produces a transparent pixel, not a colour.',
    fixWhen: 'Satori gains CSS-variable support. Until then these literals must be kept in step with the tokens by hand.',
  },
  {
    file: 'app/manifest.ts',
    rules: ['off-palette-colour'],
    why: 'The PWA manifest is JSON consumed by the OS installer. There is no stylesheet in scope.',
    fixWhen: 'Never — the format has no variables.',
  },
  {
    file: 'app/layout.tsx',
    rules: ['off-palette-colour'],
    why: '`themeColor` meta, read by the browser chrome before any stylesheet is parsed.',
    fixWhen: 'Never — it is evaluated outside CSS.',
  },
  {
    file: 'app/global-error.tsx',
    rules: ['off-palette-colour', 'second-typeface'],
    why: 'Next replaces the entire root layout on a global error, stylesheet included. Inline literals are the only thing that can render — and this screen exists precisely for when things are broken.',
    fixWhen: 'Never. `.201` is the standing note on why this boundary must not depend on anything.',
  },
  {
    file: 'app/api/nudges/unsubscribe/route.ts',
    rules: ['off-palette-colour', 'second-typeface'],
    why: 'Returns a standalone HTML document from an API route, served without the app bundle.',
    fixWhen: 'The unsubscribe flow becomes a real route inside the app shell.',
  },
  {
    file: 'src/lib/ogImageTemplate.tsx',
    rules: ['off-palette-colour'],
    why: 'The shared Satori template behind app/opengraph-image.tsx. Satori resolves no CSS custom properties — a var() here renders a transparent pixel, not a colour.',
    fixWhen: 'Satori gains CSS-variable support. Until then these literals must be kept in step with the tokens by hand.',
  },
  {
    file: 'src/lib/schoolClassReportHtml.ts',
    rules: ['off-palette-colour', 'second-typeface'],
    why: 'Builds a standalone printable HTML report for teachers, served and printed without the app bundle. Nothing defines the tokens in that document.',
    fixWhen: 'The report becomes a route inside the app shell rather than a generated document.',
  },
  {
    file: 'src/lib/share/shareCard.ts',
    rules: ['off-palette-colour'],
    why: 'Draws the share card to a canvas, where CSS variables do not exist. Its five constants are a deliberate hand-copy of BRAND_HEX and are cross-checked against it by designSystem.test.ts — a public artifact must not keep last season’s brand.',
    fixWhen: 'Never, while the card is canvas-rendered. The cross-check is what keeps the copy honest.',
  },
  {
    file: 'src/page-components/PressPage.tsx',
    rules: ['off-palette-colour'],
    why: 'The press kit’s `COLORS` table. The literals *are* the content — a press page that showed its swatches via var() would document nothing.',
    fixWhen: 'Never, though the values must be checked against `index.css` whenever the palette moves.',
  },
];

/** `file → Set(rule ids)`. Per-rule, not per-file: PressPage may hold raw swatches, but it may not grow a glow. */
const exemptions = new Map(ALLOWLIST.map((a) => [a.file, new Set(a.rules)]));

function isExempt(file, ruleId) {
  return exemptions.get(file)?.has(ruleId) ?? false;
}

/**
 * Blank out comments **without losing lines**.
 *
 * Newlines are preserved so reported line numbers still point at the real file.
 * The first draft of this deleted comments outright and every number it printed
 * was wrong — a guard that sends you to the wrong line costs more attention than
 * it saves.
 */
function stripComments(src) {
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  return src
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, blank)
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    /*
     * Inline `//` too, not just line-start: the comment explaining MobileNav's
     * 3.84:1 contrast choice sits after a ternary (`: // muted-foreground …`)
     * and was being read as code. The `[^:]` guard keeps `https://` intact —
     * a URL is the one place `//` is not a comment.
     */
    .replace(/(^|[^:])\/\/.*$/gm, (m, before) => before + blank(m.slice(before.length)));
}

function walk(dir, out = []) {
  for (const entry of readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      walk(rel, out);
    } else if (
      /*
       * `.css` joined the walk after `src/components/experience/experience.css`
       * carried emerald hex, `oklch()` swatches, retired `--brass` semantics
       * and 12 non-zero radii through a full rebrand cycle — invisible because
       * this walked `.tsx`/`.ts` plus one hand-named stylesheet. A palette rule
       * that skips the language palettes are written in checks spellings, not
       * design. (`.202`/`.221`, one layer out.)
       */
      /\.(tsx?|css)$/.test(entry.name) &&
      !/\.(test|routetest)\.tsx?$/.test(entry.name)
    ) {
      out.push(rel);
    }
  }
  return out;
}

/**
 * The rules, as a data table so each one carries its own explanation into the
 * failure message. A guard that says only "violation" teaches nobody why.
 */
const RULES = [
  {
    id: 'off-palette-colour',
    /*
     * `#fff`/`#000` shorthand included: three- and six-digit both bypass tokens.
     *
     * `.244` — the functional forms were added after this rule proved **blind to
     * every one of them**. It matched hex only, so `rgba(255,255,255,0.06)` in
     * `TrackPaceChart` — the pre-rebrand dark theme drawing white grid lines and
     * white axis labels onto a paper ground, both invisible — passed the guard
     * written to catch exactly that survival. So did a sixth `hsl(0 0% 100%)`
     * leftover in the guidebook block `.221` had already been through, under a
     * token whose own comment reads *"the only ground, never pure white"*.
     *
     * `\(\s*[0-9.]` is what separates a literal from a token: `hsl(var(--card))`
     * starts with `v` and is the correct spelling, `hsl(0 0% 100%)` starts with a
     * digit and is not. Widened **before** any call site was touched — the run
     * returned five hits, three of them live drift and two already allowlisted
     * under this same rule id. That ordering is `.212`'s rule: a guard keyed to
     * one spelling of a defect has only ever tested that spelling.
     */
    /*
     * `oklch(` joined with the `.css` walk — the experience stylesheet wrote
     * its swatches in it, a functional form the `.244` widening never saw
     * because no `.tsx` used it. Same literal-vs-token discriminator: a digit
     * after the paren is hardcoded, `oklch(var(--…))` is the correct spelling.
     */
    pattern: /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b|\b(?:rgba?|hsla?|oklch)\(\s*[0-9.]/g,
    why: 'paper/ink/one-red comes from the tokens in src/index.css — use hsl(var(--…))',
  },
  {
    id: 'unstyled-chart-tooltip',
    /*
     * `.244` — the hole no colour scan can cover: styling that is **absent**.
     *
     * `BodyMetricsCard`'s `<Tooltip>` had no `contentStyle` at all, so recharts
     * drew its stock white box with a `#ccc` border and the library's own radius
     * — three rebrand rules broken at once, with nothing in the file for a
     * pattern to match. Every rule above asks "is this value wrong?"; a missing
     * prop has no value to be wrong.
     *
     * The stronger fix would make it unrepresentable, and recharts forbids it:
     * `findAllByType` matches chart children on `displayName || name` and reads
     * props off that element, so a `<ChartTooltip>` wrapper is either ignored or
     * matched with its defaults unread (`recharts/lib/util/ReactUtils.js:96,127`,
     * checked in the installed 2.15.4). So the guard carries it instead.
     */
    /*
     * Window-based rather than a lookahead, and that is not a style choice. The
     * first draft was `<Tooltip(?![^>]*\{\.\.\.CHART_TOOLTIP\})` — and `[^>]`
     * stops dead at the `>` in `=>`, which every one of these tooltips has in
     * its `formatter` arrow. So the rule's answer depended on whether the spread
     * happened to sit before or after the first arrow function: correct code
     * with the spread second would have been reported. The same backtracking
     * shape `.221` hit on `border-radius: 0` and `.212` wrote the rule for.
     *
     * Instead: take the text from the tag up to the next JSX element and ask
     * whether the spread is in it.
     *
     * ## `Tooltip` means two different components in this repo
     *
     * Running the first version turned up eight hits in files with no chart in
     * them — `SetLogRow`, `TodayDashboardHeader`, `PillarScoreBreakdown` — all
     * using the Radix/shadcn `<Tooltip><TooltipTrigger>` from
     * `@/components/ui/tooltip`, which has nothing to do with recharts and takes
     * no `contentStyle`. A `.178` collision in the *tag name*: same word, two
     * components, and a guard keyed to the word would have demanded a chart prop
     * on a hover hint. Keyed to the **import** instead, so the rule asks its
     * question only where the word means the chart one.
     */
    appliesTo: (src) => /from\s+'recharts'/.test(src),
    pattern: /<Tooltip\b([\s\S]{0,400})/g,
    ok: (v) => /\{\.\.\.CHART_TOOLTIP\}/.test(v.split(/<\/?[A-Z]/)[0]),
    why: 'chart tooltips spread {...CHART_TOOLTIP} — a bare one renders recharts’ stock white/#ccc/rounded box',
  },
  {
    id: 'raw-border-radius',
    /*
     * `--radius` is 0 and the Tailwind scale collapses to it, so a raw value is
     * the one way a rounded corner can still reach the screen.
     *
     * The value is captured and tested in code rather than excluded by a
     * lookahead. The first draft used `\s*(?!0\b|…)` and flagged
     * `border-radius: 0` — correct code — because `\s*` backtracks to zero
     * width and the lookahead is then evaluated against a space. A guard that
     * cries wolf on the thing it is asking for is one nobody keeps.
     */
    pattern: /border-?[Rr]adius:\s*([^;,}\n]+)/g,
    ok: (v) => /^(0|0px|0rem|9999px|var\(--radius\))$/.test(v.trim()),
    why: 'radius is 0 everywhere; the Tailwind scale collapses to --radius but raw CSS bypasses it',
  },
  {
    id: 'glow-or-elevation',
    // Arbitrary-value shadows only. `shadow-md` maps to --shadow-md, a real
    // token, and PlanSessionCard documents its single deliberate elevation.
    pattern: /shadow-\[[^\]]+\]|drop-shadow-\[[^\]]+\]|backdrop-blur/g,
    why: 'glows were retired in .131 — an arbitrary shadow is how the pre-rebrand idiom comes back',
  },
  {
    id: 'second-typeface',
    // Everything resolves through --font-archivo; a literal family name is the
    // only way a second typeface enters. Captured and tested for the same
    // backtracking reason as the radius rule above.
    pattern: /font-family:\s*([^;]+)/g,
    // `inherit` is not a second typeface — it is the explicit refusal to name
    // one (gate.css uses it to reset a button to the page face).
    ok: (v) => v.trim().startsWith('var(--font') || v.trim() === 'inherit',
    why: 'Archivo only — --font-inter/display/mono all alias --font-archivo',
  },
];

export function scan(files, readFile, ignoreExemptions = false) {
  const findings = [];
  for (const file of files) {
    const src = stripComments(readFile(file));
    for (const rule of RULES) {
      if (rule.appliesTo && !rule.appliesTo(src)) continue;
      for (const m of src.matchAll(rule.pattern)) {
        if (rule.ok && rule.ok(m[1] ?? m[0])) continue;
        if (!ignoreExemptions && isExempt(file, rule.id)) continue;
        const line = src.slice(0, m.index).split('\n').length;
        findings.push({ file, line, rule: rule.id, why: rule.why, text: m[0].slice(0, 60) });
      }
    }
  }
  return findings;
}

function main() {
  // `src/index.css` no longer needs naming by hand — the walk carries `.css`.
  const files = [...walk('src'), ...walk('app')];
  const findings = scan(files, (f) => readFileSync(path.join(root, f), 'utf8'));

  console.log(
    `design system — ${files.length} files scanned, ${ALLOWLIST.length} allowlisted`
  );

  if (findings.length) {
    console.error(`\n✗ ${findings.length} design-system violation(s):\n`);
    for (const f of findings) {
      console.error(`    ${f.file}:${f.line}  [${f.rule}]  ${f.text}`);
      console.error(`      ${f.why}`);
    }
    console.error(
      '\n  If a case is genuinely unavoidable, add the file to ALLOWLIST in\n' +
        '  scripts/check-design-system.mjs **with a reason and what would change it**.\n'
    );
    process.exit(1);
  }

  console.log('  ✓ no off-palette colour, raw radius, glow or second typeface');
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) main();
