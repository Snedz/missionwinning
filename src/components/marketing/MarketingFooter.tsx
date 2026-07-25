'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { BrandMonogram } from '@/components/brand/BrandMonogram';
import {
  FOOTER_DISCLAIMER_DEFAULT,
  FOOTER_DISCLAIMER_KEY,
  FOOTER_TAGLINE_DEFAULT,
  FOOTER_TAGLINE_KEY,
  footerGroups,
  type FooterLink,
} from '@/components/marketing/footerLinks';

function FooterColumn({
  title,
  links,
  t,
}: {
  title: string;
  links: FooterLink[];
  t: (key: string, opts: { defaultValue: string }) => string;
}) {
  return (
    <div>
      {/* `.eyebrow` (mono, 0.22em) rather than the hand-rolled Inter `text-xs
          font-medium tracking-wide` this used to carry — that spelling appeared in 12
          files and put two different eyebrows on the landing page at once. */}
      <p className="eyebrow mb-3">{title}</p>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {links.map((link) => (
          <li key={link.href + link.labelKey}>
            <Link href={link.href} className="transition-colors hover:text-foreground">
              {t(link.labelKey, { defaultValue: link.defaultValue })}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

type MarketingFooterProps = {
  className?: string;
};

export function MarketingFooter({ className }: MarketingFooterProps) {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const groups = footerGroups();

  return (
    <footer className={cn('border-t border-border/40', className)}>
      <div className="mx-auto max-w-6xl px-5 py-12 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <BrandMonogram />
              <span className="text-base font-semibold tracking-tight">
                Mission Winning
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t(FOOTER_TAGLINE_KEY, { defaultValue: FOOTER_TAGLINE_DEFAULT })}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              © {year} Mission Winning
            </p>
          </div>

          {groups.map((group) => (
            <FooterColumn
              key={group.titleKey}
              title={t(group.titleKey, { defaultValue: group.titleDefault })}
              links={group.links}
              t={t}
            />
          ))}
        </div>
      </div>
      <div className="border-t border-border/40 px-5 py-4 text-center text-xs leading-relaxed text-muted-foreground/80">
        {t(FOOTER_DISCLAIMER_KEY, { defaultValue: FOOTER_DISCLAIMER_DEFAULT })}
      </div>
    </footer>
  );
}
