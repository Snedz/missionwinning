# src/components/marketing/

> Shared chrome and elevation helpers for public marketing surfaces (`/`, `/bundle`, landing sections).

## Components

| File | Purpose |
|------|---------|
| `MarketingNav.tsx` | Sticky glass nav — `full` (path/pillars/bundle) or `compact` |
| `MarketingFooter.tsx` | Grouped footer columns + disclaimer |
| `Reveal.tsx` | Scroll-reveal wrapper (`.reveal`) |
| `StatBand.tsx` | Mono telemetry strip / ticker |
| `BundleTeaserCard.tsx` | Landing Super Bundle teaser (price from `BUNDLE_PLANS`) |
| `EmailCaptureBand.tsx` | Quiet waitlist capture (outline CTA) |

## Related

| Layer | Path |
|-------|------|
| Tokens | `src/index.css` (hero-field, card-elevated, textures) |
| Hook | `src/hooks/useScrollReveal.ts` |
| SEO chrome | `src/components/public/PublicSeoHeader\|Footer` |
| Landing sections | `src/components/landing/*` |
