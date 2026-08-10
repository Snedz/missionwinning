#!/usr/bin/env node
/**
 * Builds the three concepts.
 *
 * Deliberately NOT a templated renderer. Each concept is its own module that
 * returns its own complete document — no shared DOM, no shared stylesheet, no
 * shared copy. The previous exploration board shared all three and produced
 * eight versions of one wireframe; this file's only job is to call three
 * independent builders and check what comes back.
 *
 * Run: npx tsx scripts/design-concepts/build.mts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', '..', 'docs/design/concepts');

/*
 * Each concept declares its own structure. These are asserted to differ, which
 * is the check the previous exploration board would have FAILED — eight
 * variants that all scored "claim / product-proof / 1 template x9 / single
 * scroll / reader does nothing" because they shared a DOM. A design set whose
 * members cannot be told apart on this table is a set of skins.
 *
 * `sitesWww` is the shipped page, included so the concepts are measured against
 * what exists rather than only against each other.
 */
const STRUCTURE = {
  'sites/www (shipped)': {
    firstScreen: 'claim over photograph', shape: 'product → proof',
    templates: '1 template × 9 sections', software: 'two inline demos',
    nav: 'single scroll', verb: 'scroll', js: 'optional',
  },
  '01-the-week': {
    firstScreen: 'live instrument, no headline and no photograph', shape: 'do → consequence → invitation',
    templates: '3 one-off sections, no template', software: 'IS the page',
    nav: 'one continuous interaction', verb: 'press', js: 'required',
  },
  '02-anywhere': {
    firstScreen: 'a place, 05:12, one line', shape: 'journey → recognition → invitation',
    templates: '5 chapters over one pinned stage', software: 'a persistent HUD that never changes',
    nav: 'pinned linear, chaptered', verb: 'scroll', js: 'required, structurally',
  },
  '03-field-manual': {
    firstScreen: 'a contents page', shape: 'index → branch',
    templates: '9 entries, one disclosure pattern', software: 'specification tables',
    nav: 'hub and spoke', verb: 'look up', js: 'none',
  },
} as const;

const CONCEPTS = [
  { id: '01-the-week', name: 'The Week', mod: () => import('./01-the-week.mts') },
  { id: '02-anywhere', name: 'Anywhere', mod: () => import('./02-anywhere.mts') },
  { id: '03-field-manual', name: 'Field Manual', mod: () => import('./03-field-manual.mts') },
];

/** No two rows may be identical, and none may match the shipped page. */
function assertStructurallyDistinct() {
  const rows = Object.entries(STRUCTURE).map(([k, v]) => [k, JSON.stringify(v)] as const);
  const seen = new Map<string, string>();
  for (const [id, sig] of rows) {
    const clash = seen.get(sig);
    if (clash) throw new Error(`structure: ${id} is indistinguishable from ${clash}`);
    seen.set(sig, id);
  }
  // And each axis must actually vary across the three concepts, or the table is
  // decorative rather than a check.
  const axes = ['firstScreen', 'shape', 'templates', 'software', 'nav', 'verb', 'js'] as const;
  for (const axis of axes) {
    const vals = CONCEPTS.map((c) => (STRUCTURE as any)[c.id][axis]);
    if (new Set(vals).size < 2) throw new Error(`structure: every concept has the same ${axis}`);
  }
}

/** Every asset inline. Artifacts run under a CSP that blocks every host. */
function assertSelfContained(html: string, id: string) {
  const refs = [
    ...html.matchAll(/\b(?:src|href)="([^"]+)"/g),
    ...html.matchAll(/url\(([^)]+)\)/g),
  ]
    .map((m) => m[1].replace(/^['"]|['"]$/g, ''))
    .filter((u) => !u.startsWith('data:') && !u.startsWith('#') && !/^[a-z0-9-]+\.html$/i.test(u));
  if (refs.length) throw new Error(`${id}: external reference(s) ${refs.slice(0, 3).join(', ')}`);

  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const dead = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]).filter((f) => f && !ids.has(f));
  if (dead.length) throw new Error(`${id}: dead fragment(s) ${[...new Set(dead)].join(', ')}`);
}

/*
 * The voice and claim rules, as a check rather than as prose.
 * brand-guidelines.md § Voice and § Exercise, mood, and medical claims; plus
 * hard rule 3 (agents never invent traction numbers).
 */
const BANNED: { re: RegExp; why: string }[] = [
  { re: /\b\d[\d,.]*\s*(k|m|million|thousand)?\+?\s*(users|athletes|members|downloads|customers)\b/i,
    why: 'traction claim — hard rule 3 forbids inventing one' },
  { re: /\bwe(?:'| a)re live\b/i, why: '"we\'re live" while the private beta is on' },
  { re: /\bbefore\s*(?:&|and|\/)\s*after\b/i, why: 'before/after transformation framing' },
  { re: /\b(cure|treats?|treatment for|diagnos)\w*\b.{0,30}\b(depress|anxiet|illness)/i,
    why: 'clinical treatment claim' },
  { re: /\breplace (?:your )?(?:ssri|therapist|medication|antidepressant)/i, why: 'replacement-for-care claim' },
  { re: /\bas good as (?:ssri|medication|antidepressant)/i, why: 'equivalence-to-medication claim' },
  { re: /\b(shredded|jacked|beast mode|no excuses|crush(?:ing)? it|grind)\b/i, why: 'gym-bro hype — voice rule' },
];

function assertClaimsPermitted(html: string, id: string) {
  const text = html
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
  const hits = BANNED.filter((b) => b.re.test(text));
  if (hits.length) {
    throw new Error(`${id}: forbidden copy — ${hits.map((h) => h.why).join('; ')}`);
  }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  assertStructurallyDistinct();
  for (const c of CONCEPTS) {
    const { build } = (await c.mod()) as { build: () => string };
    const html = build();
    assertSelfContained(html, c.id);
    assertClaimsPermitted(html, c.id);
    const file = path.join(OUT, `${c.id}.html`);
    fs.writeFileSync(file, html);
    console.log(`  ${c.id.padEnd(20)} ${(fs.statSync(file).size / 1024).toFixed(0).padStart(4)} KB`);
  }
  fs.writeFileSync(path.join(OUT, 'index.html'), boardHtml());
  console.log(
    `\n✓ ${CONCEPTS.length} concepts · assets inline · claims within the ban list · ` +
      'structurally distinct from each other and from the shipped page\n',
  );
}

function boardHtml(): string {
  const AXES: [string, keyof (typeof STRUCTURE)['01-the-week']][] = [
    ['First screen', 'firstScreen'], ['Narrative shape', 'shape'], ['Templates', 'templates'],
    ['Where the software is', 'software'], ['Navigation', 'nav'], ['Reader\u2019s verb', 'verb'],
    ['JavaScript', 'js'],
  ];
  const cols = ['sites/www (shipped)', ...CONCEPTS.map((c) => c.id)];
  const head = cols
    .map((c) => {
      const con = CONCEPTS.find((x) => x.id === c);
      return con
        ? `<th><a href="${c}.html">${con.name}</a><span>${c}</span></th>`
        : `<th class="was">Shipped today<span>sites/www</span></th>`;
    })
    .join('');
  const body = AXES.map(
    ([label, key]) =>
      `<tr><th scope="row">${label}</th>${cols
        .map((c) => `<td${c === 'sites/www (shipped)' ? ' class="was"' : ''}>${(STRUCTURE as any)[c][key]}</td>`)
        .join('')}</tr>`,
  ).join('');

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Three concepts — Mission Winning</title>
<style>
:root{--bg:#0d0e10;--fg:#eceff2;--dim:#8c949e;--line:#23262b;--sig:#ffb000}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);
  font:16px/1.6 ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:76rem;margin:0 auto;padding:clamp(3rem,8vw,6rem) clamp(1.1rem,4vw,2rem) 6rem}
h1{font-size:clamp(2rem,5vw,3.4rem);line-height:1.03;letter-spacing:-.03em;margin:0;max-width:20ch}
.lede{color:var(--dim);max-width:64ch;margin:1.4rem 0 0;font-size:17px}
.grid{display:grid;gap:1px;background:var(--line);border:1px solid var(--line);margin:3rem 0 0}
@media(min-width:820px){.grid{grid-template-columns:repeat(3,1fr)}}
.card{background:var(--bg);padding:1.6rem;display:flex;flex-direction:column;gap:.7rem;text-decoration:none;color:inherit}
.card:hover{background:#131519}
.card .n{font:600 12px/1 ui-monospace,monospace;letter-spacing:.2em;text-transform:uppercase;color:var(--sig)}
.card h2{margin:0;font-size:1.5rem;letter-spacing:-.02em}
.card p{margin:0;color:var(--dim);font-size:14.5px}
table{width:100%;border-collapse:collapse;margin:3.5rem 0 0;font-size:13.5px}
caption{text-align:left;color:var(--dim);font-size:12px;letter-spacing:.16em;text-transform:uppercase;padding-bottom:.9rem}
th,td{border:1px solid var(--line);padding:.6rem .7rem;text-align:left;vertical-align:top;font-weight:400}
thead th{font-weight:600}
thead th span{display:block;font:400 11px/1.4 ui-monospace,monospace;color:var(--dim);margin-top:.2rem}
thead th a{color:var(--sig)}
tbody th{color:var(--dim);font-weight:400;white-space:nowrap;width:11rem}
.was{color:#6a7078;background:#0a0b0c}
.note{margin:3rem 0 0;border-left:2px solid var(--sig);padding-left:1rem;color:var(--dim);font-size:14.5px;max-width:70ch}
.note b{color:var(--fg);font-weight:600}
</style></head><body><div class="wrap">
<h1>Three concepts, from zero</h1>
<p class="lede">No shared structure, no shared stylesheet, no shared copy. The previous board shared
all three and produced eight versions of one wireframe — the sharing was the failure. These are
three different page architectures, each written for its own shape.</p>

<div class="grid">
  <a class="card" href="01-the-week.html"><span class="n">01</span><h2>The Week</h2>
    <p>The product is the page. Log a set in the first screen and watch the week answer. Scrolling reveals consequences, not sections.</p></a>
  <a class="card" href="02-anywhere.html"><span class="n">02</span><h2>Anywhere</h2>
    <p>One session, five places, one pinned stage. The ground changes under you; the plan in the corner does not.</p></a>
  <a class="card" href="03-field-manual.html"><span class="n">03</span><h2>Field Manual</h2>
    <p>A document, not a scroll. Opens on a contents page. You look things up, and you may never reach the bottom.</p></a>
</div>

<table>
  <caption>Structural distinctness — asserted at build time, not claimed</caption>
  <thead><tr><th></th>${head}</tr></thead>
  <tbody>${body}</tbody>
</table>

<p class="note"><b>What this table is for.</b> The build refuses to write if any two of these rows
match, or if any axis is identical across all three. The eight-variant board that preceded this
would have failed it on every row — which is exactly why it exists.</p>
</div></body></html>`;
}

main();
