'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { isFreeBeta } from '@/lib/freeBeta';

type FooterLink = { href: string; labelKey: string; defaultValue: string };

const PRODUCT: FooterLink[] = [
  { href: '/#coach', labelKey: 'footerProductCoach', defaultValue: 'Coach' },
  { href: '/bundle', labelKey: 'footerProductBundle', defaultValue: 'Super Bundle' },
  { href: '/compare', labelKey: 'footerProductCompare', defaultValue: 'Compare' },
];

const LEARN: FooterLink[] = [
  { href: '/guide', labelKey: 'footerLearnGuide', defaultValue: 'Guide' },
  { href: '/exercises', labelKey: 'footerLearnExercises', defaultValue: 'Exercises' },
  { href: '/paths', labelKey: 'footerLearnPaths', defaultValue: 'Paths' },
  { href: '/beta', labelKey: 'footerLearnBeta', defaultValue: 'Beta guide' },
];

const COMPANY: FooterLink[] = [
  { href: '/about', labelKey: 'footerCompanyAbout', defaultValue: 'About' },
  { href: '/press', labelKey: 'footerCompanyPress', defaultValue: 'Press / Brand' },
  { href: '/vision', labelKey: 'footerCompanyVision', defaultValue: 'Vision' },
  { href: '/feedback', labelKey: 'footerCompanyFeedback', defaultValue: 'Feedback' },
];

const LEGAL: FooterLink[] = [
  { href: '/privacy', labelKey: 'footerLegalPrivacy', defaultValue: 'Privacy' },
  { href: '/terms', labelKey: 'footerLegalTerms', defaultValue: 'Terms' },
  { href: '/dmca', labelKey: 'footerLegalDmca', defaultValue: 'DMCA' },
  { href: '/refunds', labelKey: 'footerLegalRefunds', defaultValue: 'Refunds' },
];

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
      <p className="section-index mb-3">{title}</p>
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
  const productLinks = isFreeBeta()
    ? PRODUCT.filter((l) => l.href !== '/bundle')
    : PRODUCT;

  return (
    <footer className={cn('section-seam-glow', className)}>
      <div className="mx-auto max-w-6xl px-5 py-12 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">
                MW
              </span>
              <span className="font-display text-lg font-semibold uppercase tracking-wide">
                Mission Winning
              </span>
            </Link>
            <p className="mt-3 max-w-xs font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {t('footerTagline', {
                defaultValue: 'Train anywhere. Win daily.',
              })}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              © {year} Mission Winning
            </p>
          </div>

          <FooterColumn
            title={t('footerGroupProduct', { defaultValue: 'Product' })}
            links={productLinks}
            t={t}
          />
          <FooterColumn
            title={t('footerGroupLearn', { defaultValue: 'Learn' })}
            links={LEARN}
            t={t}
          />
          <FooterColumn
            title={t('footerGroupCompany', { defaultValue: 'Company' })}
            links={COMPANY}
            t={t}
          />
          <FooterColumn
            title={t('footerGroupLegal', { defaultValue: 'Legal' })}
            links={LEGAL}
            t={t}
          />
        </div>
      </div>
      <div className="border-t border-border/40 px-5 py-4 text-center text-[11px] leading-relaxed text-muted-foreground/70">
        {t('footerDisclaimer', {
          defaultValue:
            'Educational fitness tools — not medical advice. Consult a physician before starting any training program.',
        })}
      </div>
    </footer>
  );
}
