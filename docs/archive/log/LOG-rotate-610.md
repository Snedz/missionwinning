# Rotated for .610

## 2026-08-07 — About/Vision editorial + JoinClass shell (`.595`)

`footerLinks.ts` puts **About** and **Vision** in the footer of the landing page and all ~250 public SEO pages, and `LandingPage` links to them directly — its poster close says *"Read the full vision."* Both routes lived under `app/(app)/`, so every one of those links dropped a marketing visitor into the signed-in shell, nav rail and all, on the two least-designed pages in the repo: About was one `content-card` of `text-lg` headings, Vision had `list-disc` bullets and an untreated italic pull-quote.

Both now render inside `PublicPageShell` — the same chrome behind the SEO tail — with editorial bodies built from idioms the system already ships and the landing already uses: `section-index` numerals, `card-section` rules instead of boxes, display-face headings, ruled rows, a `border-s-2` pull-quote. **The copy is unchanged**: every string is the key it already was, carried forward from master's current wording (including the `VISION_CORE_DEFAULTS` map added since this was first drafted). A presentation recut, not new claims. URLs are unchanged — route groups do not affect paths, and both were already in `JOURNEY_BYPASS_PATHS` + `PRIVATE_GATE_PUBLIC_PATHS`.

**JoinClass** — a link teachers write on whiteboards — rendered one unstyled line of muted text and, on a code that did not parse, silently redirected to the America home. It gets a branded joining state (`aria-busy`, so the a11y settle rule can see it) and an `ErrorState` that says the code failed, gives the hint that helps, and notes nothing was saved. The success path is untouched; only the failure target changed, which *shrinks* the America surface rather than growing it.

`app/INDEX.md`'s "do not open" note said all page routes live under `app/(app)/`. That is now false by design, so it says so — with the reason.

Mutants: none new — this slice is composition. Its regressions are caught by the existing `@gate` reachability sweep (every sitemap URL resolves, which is what a bad route-group move breaks) plus axe on `/about`.

