import Link from 'next/link';
import { BrandMonogram } from '@/components/brand/BrandMonogram';
import { PublicNavMenu } from '@/components/public/PublicNavMenu';
import { PublicStatusBar } from '@/components/public/PublicStatusBar';
import { PublicSiteFooter } from '@/components/public/PublicSiteFooter';
import { footerGroups, primaryNavLinks } from '@/components/marketing/footerLinks';

/**
 * The chrome for every public SEO surface — exercises, hubs, compare, paths.
 *
 * Server Component on purpose. Header and body share `maxWidth` so they
 * cannot drift. Chrome strings arrive as props with English defaults;
 * only `PublicNavMenu` hydrates.
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
  const navLinks = primaryNavLinks();
  const legalLinks =
    footerGroups().find((g) => g.titleKey === 'footerGroupLegal')?.links ?? [];

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
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:h-16">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <BrandMonogram className="h-8 w-8 text-sm sm:h-9 sm:w-9" />
            <span className="truncate font-display text-lg font-extrabold tracking-[-0.01em] sm:text-xl">
              Mission Winning
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {/* Real navigation from md up — the old chrome had none at any width. */}
            <ul className="hidden items-center gap-6 text-sm md:flex">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.defaultValue}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={ctaHref}
              className="hidden text-sm font-semibold text-foreground transition-colors hover:text-primary md:inline"
            >
              {ctaLabel}
            </Link>
            <PublicNavMenu
              links={navLinks}
              legalLinks={legalLinks}
              ctaHref={ctaHref}
              ctaLabel={ctaLabel}
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
