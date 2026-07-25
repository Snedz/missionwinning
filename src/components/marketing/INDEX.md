# src/components/marketing/

> Shared chrome and elevation helpers for public marketing surfaces (`/`, `/bundle`, landing sections).

## Components

| File | Purpose |
|------|---------|
| `MarketingNav.tsx` | Sticky nav — `full` (site links) or `compact`. Links move into `PublicNavMenu` below `md` |
| `MarketingFooter.tsx` | Translated footer columns + disclaimer. Reads `footerLinks.ts` |
| `footerLinks.ts` | The footer/nav link tables — plain data, no `'use client'`, so Server Components can import them. One list for both footers |
| `Reveal.tsx` | Scroll-reveal wrapper (`.reveal`) |
| `ArtPicture.tsx` | AVIF + WebP `<picture>` for marketing art |

`StatBand.tsx`, `BundleTeaserCard.tsx` and `EmailCaptureBand.tsx` were deleted in `.129` —
zero call sites since the `.104` landing trim, while this file and `docs/DESIGN_SYSTEM.md`
still listed them as current.

## Related

| Layer | Path |
|-------|------|
| Tokens | `src/index.css` (hero-field, card-elevated, textures) |
| Hook | `src/hooks/useScrollReveal.ts` |
| SEO chrome | `src/components/public/PublicPageShell.tsx` (+ `PublicNavMenu`, `PublicSiteFooter`) |
| Landing sections | `src/components/landing/*` |
