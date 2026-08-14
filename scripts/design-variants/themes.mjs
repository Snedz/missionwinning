/**
 * Eight art directions for the marketing surface, as theme modules.
 *
 * Every one renders the SAME DOM and the SAME copy — `build-design-variants`
 * asserts the rendered text of all eight is identical — so the only variable a
 * reader is judging is art direction. A theme therefore declares appearance and
 * nothing else: tokens, type, rule weight, photographic treatment, and a small
 * set of composition switches the shared skeleton already supports.
 *
 * ── A note on typefaces, because it shapes every theme below ──────────────
 *
 * This environment cannot fetch a font. Egress is blocked to every font host,
 * as it is to every image host. The one variable face on disk is Archivo — and
 * the copy embedded in `docs/design/www-spec-sheet.html` carries **both** axes
 * (`wght 100–900`, `wdth 62–125%`), unlike the repo's weight-only subset. That
 * single file therefore yields condensed, normal and expanded cuts.
 *
 * So Archivo does the display work in all eight, at widths and weights far
 * enough apart to read as different type. Monospace appears in C1 and C2 as a
 * deliberate texture, from a system stack, and those two variants say so on the
 * page. Substituting a system-ui stack for a *display* face would have been
 * worse than reusing Archivo: it renders as Liberation Sans on the Linux box
 * that screenshots these, which would make the board a comparison of font
 * fallbacks rather than of designs.
 *
 * If you want a real face in the running — a stencil for C1, a grotesk for C3 —
 * drop woff2 files in and it becomes a two-line edit here.
 */

/** System monospace, used as texture in C1/C2 rather than as a display face. */
const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

export const THEMES = [
  /* ─────────────────────────────────────────────────────────────────────
     A1 — the system that is already shipped, re-rendered here so the
     comparison is like-for-like rather than "the live site vs some mockups".
     ───────────────────────────────────────────────────────────────────── */
  {
    id: 'a1-modernist',
    name: 'A1 · Modernist poster',
    family: 'A — the app’s system, recomposed',
    argues:
      'Ink on paper is the differentiated register in a category where every competitor is near-black. Swiss, clinical, unhyped: the design makes the same claim the product does.',
    fonts: 'Archivo 800, normal width. The shipped face.',
    cost: 'Zero — this is what is live at .641.',
    photo: 'base',
    photoFilter: 'grayscale(1) contrast(1.25) brightness(0.42)',
    photoFilterLight: 'grayscale(1) contrast(1.08)',
    css: `
      --paper:#f3f2f2; --ink:#201e1d; --quiet:#6b6764; --rule:#d6d3d0;
      --accent:#ec3013; --accent-deep:#ae1800; --accent-tint:#faeae7;
      --ground:var(--paper); --on-ground:var(--ink);
      --field:var(--ink); --on-field:var(--paper);
      --close:var(--accent-deep); --on-close:var(--paper);
      --radius:0px; --rule-w:2px;
      --display-w:100; --display-weight:800; --display-track:-0.03em;
      --eyebrow-track:.08em; --eyebrow-transform:uppercase;
      --card:#eae8e6;
      --veil:color-mix(in srgb,#201e1d 26%,transparent);
    `,
  },

  /* ─────────────────────────────────────────────────────────────────────
     B — the marketing site gets its own identity. Three leashes, loosest
     to tightest, so the board answers "how far is far enough?"
     ───────────────────────────────────────────────────────────────────── */
  {
    id: 'b1-sport',
    name: 'B1 · Sport editorial',
    family: 'B — its own identity',
    leash: 'The three reds pinned. Type, grounds and grade free.',
    argues:
      'Keeps the red as the only thread back to the app, then spends everything else on heat. Condensed display at poster scale, red-black duotone photography: a race programme, not a software site.',
    fonts: 'Archivo Condensed 800 (wdth 68%) display · Archivo 500 body.',
    cost:
      'src/index.css :root, BRAND_HEX in check-token-sync.mjs:46, a TOKENS row per new name, and the nine hand-copies of the palette the ALLOWLIST tracks.',
    photo: 'duotone_red',
    photoFilter: 'brightness(0.9) contrast(1.08)',
    photoFilterLight: 'contrast(1.05)',
    css: `
      --paper:#f5f0e8; --ink:#17161a; --quiet:#7b7770; --rule:#d5cec1;
      --accent:#ec3013; --accent-deep:#ae1800; --accent-tint:#f6e2dc;
      --ground:var(--paper); --on-ground:var(--ink);
      --field:#17161a; --on-field:#f5f0e8;
      --close:var(--accent); --on-close:#17161a;
      --radius:0px; --rule-w:3px;
      --display-w:68; --display-weight:800; --display-track:-0.005em;
      --eyebrow-track:.22em; --eyebrow-transform:uppercase;
      --card:#ece5d9;
      --veil:color-mix(in srgb,#17161a 34%,transparent);
      --display-transform:uppercase; --display-lh:0.88;
    `,
  },

  {
    id: 'b2-archivo-ground',
    name: 'B2 · Archivo, new ground',
    family: 'B — its own identity',
    leash: 'Reds and Archivo pinned. Only grounds and grade move.',
    argues:
      'The conservative end: same face, same reds, warmer paper, hairline rules, softer photographic grade. Tests whether atmosphere alone separates the marketing site from the app — and if it lands too near A1, that is the finding.',
    fonts: 'Archivo 700, normal width. Unchanged from the app.',
    cost: 'src/index.css :root and BRAND_HEX. The cheapest divergence on the board.',
    photo: 'base',
    photoFilter: 'grayscale(1) sepia(0.55) contrast(1.05) brightness(0.56) saturate(1.3)',
    photoFilterLight: 'grayscale(1) sepia(0.18) contrast(1.02)',
    css: `
      --paper:#efe9dd; --ink:#14130f; --quiet:#6f6a5e; --rule:#cdc5b4;
      --accent:#ec3013; --accent-deep:#ae1800; --accent-tint:#f3e6dd;
      --ground:var(--paper); --on-ground:var(--ink);
      --field:#14130f; --on-field:#efe9dd;
      --close:var(--accent-deep); --on-close:#efe9dd;
      --radius:0px; --rule-w:1px;
      --display-w:100; --display-weight:700; --display-track:-0.028em;
      --eyebrow-track:.1em; --eyebrow-transform:uppercase;
      --card:#e7e0d1;
      --veil:color-mix(in srgb,#14130f 24%,transparent);
      --section-pad:9rem;
    `,
  },

  {
    id: 'b3-free',
    name: 'B3 · Free identity',
    family: 'B — its own identity',
    leash: 'Nothing pinned.',
    argues:
      'The control: no red anywhere. Ink-blue ground, one amber signal, expanded display. If the page still feels like Mission Winning without the red, the red is a preference rather than an asset.',
    fonts: 'Archivo Expanded 800 (wdth 118%) display · Archivo 400 body.',
    cost:
      'Everything B1 costs, and it retires the one visual asset the brand currently has. The most expensive option that is not a system rebuild.',
    photo: 'duotone_blue',
    photoFilter: 'brightness(0.86) contrast(1.06)',
    photoFilterLight: 'contrast(1.04)',
    css: `
      --paper:#f4f6fa; --ink:#0e1730; --quiet:#5d6b85; --rule:#c8d1e0;
      --accent:#f2b03e; --accent-deep:#c98314; --accent-tint:#fdf1dc;
      --ground:var(--paper); --on-ground:var(--ink);
      --field:#0e1730; --on-field:#f4f6fa;
      --close:#0e1730; --on-close:#f2b03e;
      --radius:0px; --rule-w:2px;
      --display-w:118; --display-weight:800; --display-track:-0.02em;
      --eyebrow-track:.14em; --eyebrow-transform:uppercase;
      --card:#e9eef6;
      --veil:color-mix(in srgb,#0e1730 34%,transparent);
    `,
  },

  /* ─────────────────────────────────────────────────────────────────────
     C — from scratch. Four directions, none of which inherits anything.
     ───────────────────────────────────────────────────────────────────── */
  {
    id: 'c1-dossier',
    name: 'C1 · Mission dossier',
    family: 'C — from scratch',
    argues:
      'Built from the product’s own vocabulary rather than the category’s — Mission Coach, I-Day, briefing, call sign. Sand stock, olive ink, stamped marks, grid paper, section numbers set like a form. No competitor looks like this because no competitor talks like this.',
    fonts: 'Archivo 800 headings · system monospace for labels, numerals and stamps.',
    cost:
      'A full palette and type change, and it will collide with the WWW_ONLY bans — the grid ground is a repeating gradient, which is on the founder ban list. Adopting it is a decision to revisit that list.',
    photo: 'duotone_olive',
    photoFilter: 'brightness(0.78) contrast(1.1)',
    photoFilterLight: 'contrast(1.06)',
    mono: MONO,
    css: `
      --paper:#d6c9a8; --ink:#16180f; --quiet:#5c5c46; --rule:#a89a78;
      --accent:#a8321f; --accent-deep:#7d2416; --accent-tint:#c9ba95;
      --ground:var(--paper); --on-ground:var(--ink);
      --field:#2b2f1e; --on-field:#d6c9a8;
      --close:#a8321f; --on-close:#e8dfc6;
      --radius:0px; --rule-w:2px;
      --display-w:88; --display-weight:800; --display-track:-0.02em;
      --eyebrow-track:.24em; --eyebrow-transform:uppercase;
      --card:#cabc98;
      --veil:color-mix(in srgb,#16180f 40%,transparent);
      --grid-ink:rgba(22,24,15,.10);
    `,
    extraCss: `
      /* Grid paper. A repeating gradient is the only way to draw ruled stock
         without shipping a texture image, and docs/ is outside the surface where
         gradients are banned — which is exactly why exploration lives here. */
      body{
        background-image:
          repeating-linear-gradient(to right, var(--grid-ink) 0 1px, transparent 1px 24px),
          repeating-linear-gradient(to bottom, var(--grid-ink) 0 1px, transparent 1px 24px);
      }
      .eyebrow, .stat-fig, .day, .faq-q::after, .demo-row, .panel-cap .kicker,
      .lede, .reassure, .demo-head, .demo-foot{ font-family:var(--mono); }
      /* The ruled stock carries over the photograph too, so the first screen
         reads as a document rather than as a green photograph. Without this the
         only dossier signal above the fold was a 13px label. */
      .stage::before{
        content:""; position:absolute; inset:0; z-index:0; pointer-events:none;
        background-image:
          repeating-linear-gradient(to right, rgba(214,201,168,.16) 0 1px, transparent 1px 24px),
          repeating-linear-gradient(to bottom, rgba(214,201,168,.16) 0 1px, transparent 1px 24px);
      }
      .stage>.wrap,.stage>.nav{ position:relative; z-index:1; }
      .hero .eyebrow::after{
        content:" — BRIEFING"; letter-spacing:.24em;
      }
      /* Section numbers, set like a form field. */
      .s > .wrap > .eyebrow::before{
        content:attr(data-n) " / ";
        color:var(--accent);
      }
      /* Stamped mark on the close. Rotated, overprinted, deliberately imperfect. */
      .close .wrap{ position:relative; }
      .close .wrap::after{
        content:"CLEARED";
        position:absolute; top:-1.5rem; right:0;
        font-family:var(--mono); font-size:13px; letter-spacing:.3em;
        border:2px solid currentColor; padding:.35rem .6rem;
        transform:rotate(-6deg); opacity:.5;
      }
      .stat{ border-left:3px solid var(--accent); }
      .statement .wrap p{ background:var(--field); color:var(--on-field); display:inline; box-decoration-break:clone; padding:.1em .3em; }
    `,
  },

  {
    id: 'c2-instrument',
    name: 'C2 · Instrument',
    family: 'C — from scratch',
    argues:
      'Takes the product’s own principle — clinical metrics, not gamification — literally. Near-black, hairline grid, monospace tabular numerals, one amber signal. The adaptive engine reads as instrumentation rather than encouragement.',
    fonts: 'Archivo 600 headings · system monospace for every number and label.',
    cost: 'Full palette change. The type is mostly system mono, so no font licence — but no distinctive face either.',
    photo: 'base',
    photoFilter: 'grayscale(1) contrast(1.5) brightness(0.34)',
    photoFilterLight: 'grayscale(1) contrast(1.3) brightness(0.8)',
    mono: MONO,
    css: `
      --paper:#0a0c0f; --ink:#e6ebef; --quiet:#7d8a95; --rule:#1e252c;
      --accent:#ffb000; --accent-deep:#c98a00; --accent-tint:#1a1607;
      --ground:var(--paper); --on-ground:var(--ink);
      --field:#12161b; --on-field:#e6ebef;
      --close:#ffb000; --on-close:#0a0c0f;
      --radius:0px; --rule-w:1px;
      --display-w:96; --display-weight:600; --display-track:-0.02em;
      --eyebrow-track:.2em; --eyebrow-transform:uppercase;
      --card:#0f1319;
      --veil:color-mix(in srgb,#0a0c0f 40%,transparent);
    `,
    extraCss: `
      body{
        background-image:
          repeating-linear-gradient(to right, rgba(120,140,160,.07) 0 1px, transparent 1px 40px),
          repeating-linear-gradient(to bottom, rgba(120,140,160,.07) 0 1px, transparent 1px 40px);
      }
      .eyebrow,.stat-fig,.stat-label,.day,.demo-row,.demo-note,.reassure,.meta{ font-family:var(--mono); }
      .stat-fig{ font-variant-numeric:tabular-nums; color:var(--accent); }
      /* Readout framing: every panel gets corner ticks rather than a full box. */
      .stat, .card, .demo{ position:relative; }
      .stat::before,.card::before,.demo::before{
        content:""; position:absolute; inset:0; pointer-events:none;
        background:
          linear-gradient(var(--accent),var(--accent)) 0 0/10px 1px no-repeat,
          linear-gradient(var(--accent),var(--accent)) 0 0/1px 10px no-repeat,
          linear-gradient(var(--accent),var(--accent)) 100% 100%/10px 1px no-repeat,
          linear-gradient(var(--accent),var(--accent)) 100% 100%/1px 10px no-repeat;
        opacity:.55;
      }
      .h1{ text-transform:none; }
      .cta{ border:1px solid var(--accent); }
    `,
  },

  {
    id: 'c3-cinematic',
    name: 'C3 · Cinematic',
    family: 'C — from scratch',
    argues:
      'What Freeletics, Call of Duty and TrainHeroic actually do: near-black, imagery to the edges, warm highlight, weight over picture. It is here so the differentiation argument is made against something real rather than a straw man — this is the look the category has converged on, and it converged for reasons.',
    fonts: 'Archivo 900, normal width, very large.',
    cost: 'Full palette change, and it buys the least differentiation of the eight.',
    photo: 'base',
    photoFilter: 'grayscale(0.15) sepia(0.3) contrast(1.3) brightness(0.44) saturate(1.4)',
    photoFilterLight: 'sepia(0.2) contrast(1.1)',
    css: `
      --paper:#0b0b0c; --ink:#f2ede4; --quiet:#9a938a; --rule:#26241f;
      --accent:#e8a33d; --accent-deep:#b87a1e; --accent-tint:#1c1710;
      --ground:var(--paper); --on-ground:var(--ink);
      --field:#141313; --on-field:#f2ede4;
      --close:#e8a33d; --on-close:#0b0b0c;
      --radius:0px; --rule-w:1px;
      --display-w:100; --display-weight:900; --display-track:-0.035em;
      --eyebrow-track:.18em; --eyebrow-transform:uppercase;
      --card:#131313;
      --veil:color-mix(in srgb,#0b0b0c 30%,transparent);
      --display-scale:1.14;
    `,
    extraCss: `
      /* Every section that carries a photograph runs it full height. This is the
         one direction where imagery is the layout rather than an element in it. */
      .hero, .statement, .panels .panel{ min-height:96vh; }
      .h1{ text-shadow:0 2px 40px rgba(0,0,0,.6); }
    `,
  },

  {
    id: 'c4-zine',
    name: 'C4 · Zine',
    family: 'C — from scratch',
    argues:
      'The opposite pole from A1. Photocopied halftone, newsprint stock, tape, deliberate misregistration, type set too big for its box. Anti-corporate and hand-made — the register of the gym rather than the software.',
    fonts: 'Archivo 900 Condensed (wdth 62%), set oversized and tight.',
    cost:
      'Full palette change, and the hardest to hold: hand-made is a house style someone has to keep making. It also collides with the ban list — the halftone is a bitmap texture and the misregistration is a deliberate offset.',
    photo: 'halftone',
    photoExt: 'png',
    photoFilter: 'contrast(1) opacity(0.85)',
    photoFilterLight: 'none',
    css: `
      --paper:#e8e4d9; --ink:#111110; --quiet:#4a4842; --rule:#111110;
      --accent:#e03127; --accent-deep:#b0231b; --accent-tint:#f0d9d6;
      --ground:var(--paper); --on-ground:var(--ink);
      --field:#111110; --on-field:#e8e4d9;
      --close:#e03127; --on-close:#e8e4d9;
      --radius:0px; --rule-w:3px;
      --display-w:62; --display-weight:900; --display-track:-0.04em;
      --eyebrow-track:.16em; --eyebrow-transform:uppercase;
      --card:#ded9cc;
      --veil:color-mix(in srgb,#111110 66%,transparent);
      --display-scale:1.3; --display-lh:0.82;
      --display-transform:uppercase;
    `,
    extraCss: `
      /* Misregistration: a red plate printed a hair off the black one. Done with
         a shadow rather than a duplicated element so the copy stays single. */
      .h1{ text-shadow:3px -3px 0 var(--accent); }
      .h2{ text-shadow:2px -2px 0 var(--accent); }
      /* Tape. Two strips per photographic panel, rotated off-square. */
      .panel{ position:relative; }
      .panel::before,.panel::after{
        content:""; position:absolute; z-index:2;
        width:96px; height:26px; background:rgba(226,220,196,.72);
        border-left:1px solid rgba(0,0,0,.12); border-right:1px solid rgba(0,0,0,.12);
      }
      .panel::before{ top:-10px; left:6%; transform:rotate(-4deg); }
      .panel::after{ bottom:-10px; right:8%; transform:rotate(3deg); }
      .stat{ transform:rotate(-.4deg); }
      .stat:nth-child(2n){ transform:rotate(.5deg); }
      .card{ transform:rotate(-.3deg); }
      .card:nth-child(3n){ transform:rotate(.4deg); }
      .eyebrow{ background:var(--ink); color:var(--paper); display:inline-block; padding:.2em .5em; }
      /* Body copy on a 1-bit halftone needs a ground, not a stronger colour.
         A hard-edged slab is the zine answer anyway — this is how a photocopied
         page gets readable type over an image. */
      .on-field .lede{ background:var(--ink); color:var(--paper); padding:.6rem .8rem; box-decoration-break:clone; }
      .statement .wrap p{ text-shadow:4px -4px 0 var(--accent); }
    `,
  },
];
