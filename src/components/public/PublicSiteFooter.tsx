import Link from 'next/link';
import { BrandMonogram } from '@/components/brand/BrandMonogram';
import {
  FOOTER_DISCLAIMER_DEFAULT,
  FOOTER_TAGLINE_DEFAULT,
  footerGroups,
} from '@/components/marketing/footerLinks';

/**
 * The site footer for public surfaces that cannot use the translated
 * `MarketingFooter` — i.e. the Server Component SEO pages.
 *
 * Carries the four columns, the copyright, and the medical disclaimer. The footer these
 * pages used to have was five dot-separated links with no legal routes and no
 * disclaimer, which meant the ~250 pages that actually give exercise instructions were
 * the ones missing "not medical advice" (docs/LEGAL_SAFETY.md).
 *
 * English only, by design: a Server Component cannot call `useTranslation` without
 * hydrating the page, and the whole point of these pages is that they stay static.
 * `MarketingFooter` is the translated twin and reads the same tables from
 * `footerLinks.ts`.
 */
export function PublicSiteFooter() {
  const groups = footerGroups();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40">
      <div className="mx-auto max-w-6xl px-5 py-12 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <BrandMonogram />
              <span className="text-base font-semibold tracking-tight">Mission Winning</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {FOOTER_TAGLINE_DEFAULT}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">© {year} Mission Winning</p>
          </div>

          {groups.map((group) => (
            <div key={group.titleKey}>
              <p className="eyebrow mb-3">{group.titleDefault}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition-colors hover:text-foreground">
                      {link.defaultValue}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border/40 px-5 py-4 text-center text-xs leading-relaxed text-muted-foreground/80">
        {FOOTER_DISCLAIMER_DEFAULT}
      </div>
    </footer>
  );
}
