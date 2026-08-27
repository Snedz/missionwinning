import Link from 'next/link';
import { BrandMonogram } from '@/components/brand/BrandMonogram';
import { PublicNavMenu } from '@/components/public/PublicNavMenu';
import { PublicStatusBar } from '@/components/public/PublicStatusBar';
import { PublicSiteFooter } from '@/components/public/PublicSiteFooter';
import { footerGroups, primaryNavLinks } from '@/components/marketing/footerLinks';
import { isPrivateModeEnabled } from '@/lib/privateModeFlag';

/**
 * The chrome for every public SEO surface — exercises, hubs, compare, paths.
 *
 * Replaces `PublicSeoHeader` + `PublicSeoFooter`, which between them shipped three
 * defects across ~250 URLs:
 *
 * 1. The `h1` was `text-2xl … sm:text-3xl md:text-4xl` with no `font-display`, so it
 *    rendered in Inter. That is precisely the bug `.126` fixed on the landing page and
 *    left everywhere else — one URL fixed, 250 not.
 * 2. The header hardcoded `max-w-4xl` while six of eight bodies were `max-w-3xl`, so the
 *    headline sat outdented from the text beneath it. `maxWidth` here is applied to the
 *    header *and* passed back for the body, so the two cannot drift again.
 * 3. The footer was five dot-separated links: no legal, no `©`, and no medical
 *    disclaimer — missing on exactly the pages that give exercise instructions
 *    (docs/LEGAL_SAFETY.md §"educational only · not medical advice").
 *
 * **This is a Server Component on purpose.** `ExercisePublicPage`,
 * `ExercisesPublicIndexPage` and both exercise hubs have no `'use client'`, and they are
 * ~235 of the ~250 URLs. Note the reason is *not* "otherwise react-i18next loads" —
 * `app/layout.tsx` wraps every route in `I18nPwaProvider`, so the i18n runtime is
 * already on these pages. The saving is the chrome's own markup and JS, which would
 * otherwise ship twice: once in the RSC payload and once as a client bundle. So chrome
 * strings arrive as props with English defaults and only `PublicNavMenu` hydrates.
 *
 * English chrome on this surface is forced, not chosen: every SEO route is
 * `force-static` and `app/layout.tsx` hardcodes `lang="en"`, so there is exactly one
 * build-time language. Real translation here means `/es/exercises/[id]` + hreflang,
 * which is Horizon 3 i18n depth. See docs/DESIGN_SYSTEM.md § Shell rules.
 */

/** Container measure. Shared by the header and the page body so they stay registered. */
export type ShellWidth = '3xl' | '4xl';

const WIDTH_CLASS: Record<ShellWidth, string> = {
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
};

export type PublicPageShellProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** Primary conversion CTA — defaults to Start free → /welcome. */
  ctaHref?: string;
  ctaLabel?: string;
  /** Body measure; the header matches it. Default `3xl`, index pages use `4xl`. */
  maxWidth?: ShellWidth;
  /** Breadcrumb / back links, rendered in a labelled nav under the hero. */
  breadcrumb?: React.ReactNode;
  children: React.ReactNode;
};

export function PublicPageShell({
  eyebrow,
  title,
  subtitle,
  ctaHref = '/welcome',
  ctaLabel = 'Start free',
  maxWidth = '3xl',
  breadcrumb,
  children,
}: PublicPageShellProps) {
  const width = WIDTH_CLASS[maxWidth];
  const gateOn = isPrivateModeEnabled();
  const navLinks = primaryNavLinks({ gated: gateOn });
  const legalLinks =
    footerGroups().find((g) => g.titleKey === 'footerGroupLegal')?.links ?? [];
  const chromeCtaHref = gateOn ? '/private' : ctaHref;
  const chromeCtaLabel = gateOn ? 'Enter with code' : ctaLabel;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-xl focus:bg-primary-fill focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      {/* Modernist: solid paper bar under a 2px rule — no blur, no translucency. */}
      <nav
        aria-label="Site"
        className="sticky top-0 z-50 border-b-2 border-border bg-background"
      >
        <PublicStatusBar />
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5">
          <Link href="/" className="flex shrink-0 min-w-0 items-center gap-2.5">
            <BrandMonogram className="h-8 w-8 text-sm" />
            <span className="truncate font-display text-[15px] font-extrabold tracking-[-0.01em]">
              Mission Winning
            </span>
          </Link>

          <ul className="hidden flex-1 items-center justify-center gap-7 text-sm md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-[44px] items-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.defaultValue}
                </Link>
              </li>
            ))}
          </ul>
          <div className="ml-auto flex items-center gap-4">
            <Link
              href={chromeCtaHref}
              className="hidden min-h-[44px] items-center text-sm font-semibold text-foreground transition-colors hover:text-primary md:inline-flex"
            >
              {chromeCtaLabel}
            </Link>
            <PublicNavMenu
              links={navLinks}
              legalLinks={legalLinks}
              ctaHref={chromeCtaHref}
              ctaLabel={chromeCtaLabel}
            />
          </div>
        </div>
      </nav>

      <header className="section-seam">
        <div className={`mx-auto ${width} px-5 pb-12 pt-12 lg:pb-16 lg:pt-16`}>
          <p className="eyebrow mb-5">{eyebrow}</p>
          {/* `.display-section`, not `.display-hero`. These are template pages titled
              with an exercise name, and `.display-hero`'s floor is 2.75rem — at 390px
              "Close-Grip Bench Press" wraps to three lines of 44px type and pushes the
              answer below the fold on 250 URLs. `.display-hero` stays unique to `/`;
              `GuideApexShell` already sets its template H1 at this tier. */}
          <h1 className="display-section mb-6 max-w-[24ch] text-balance text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">{subtitle}</p>
          )}
          {/* One emerald action in the first viewport. The chrome CTA above is a quiet
              text link by design (`.104`), which left these pages with nothing to press
              above the fold — on a free product. Each page's own closing CTA is the
              second, which is the two-per-page ceiling first-90.spec.ts asserts for `/`. */}
          <Link href={ctaHref} className="primary-action min-h-[52px] tap-target mt-8 max-w-sm sm:w-auto sm:px-10">
            {ctaLabel}
          </Link>
          {breadcrumb && (
            <nav aria-label="Breadcrumb" className="mt-6 text-sm">
              {breadcrumb}
            </nav>
          )}
        </div>
      </header>

      {/* Less top padding than bottom: the header already contributes `pb-12` and the
          `.section-seam` hairline does the separating, so matching `py-16` on both sides
          left ~110px of dead space above the first section on a 390px screen. */}
      <main id="main" className={`mx-auto ${width} space-y-10 px-5 pb-16 pt-10 lg:pb-20 lg:pt-12`}>
        {children}
      </main>

      <PublicSiteFooter />
    </div>
  );
}
