'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { APP_PUBLIC_PRODUCT_VERSION } from '@/lib/buildInfo';

type AppLegalFooterProps = {
  className?: string;
  showBuild?: boolean;
  buildLabel?: string;
};

/**
 * `.768` — `prefetch={false}`, on all eight.
 *
 * This footer is on the private gate, on I-Day, and under every info and pillar
 * page, and each `<Link>` prefetches its route on load in production. Measured
 * at 390×844: `/welcome` fetched **26 chunks / 146.6 KB gzipped** that the
 * landing page did not, most of them small legal-page bundles nobody on that
 * screen asked for. Shard 4 (diaspora + RU, ops #15) reports a heavy, slow www
 * first paint, and these are regions where that is bandwidth, not vanity.
 *
 * Nobody arrives at I-Day to read the DMCA policy. The links still work; they
 * are just not downloaded before they are wanted.
 */
export function AppLegalFooter({ className = '', showBuild = false, buildLabel }: AppLegalFooterProps) {
  const { t } = useTranslation();

  return (
    <footer
      className={`text-center text-[11px] text-muted-foreground space-y-2 py-4 ${className}`}
    >
      <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <Link prefetch={false} href="/terms" className="hover:text-primary transition-colors">
          {t('termsOfService', { defaultValue: 'Terms of Service' })}
        </Link>
        <span aria-hidden className="text-border">
          ·
        </span>
        <Link prefetch={false} href="/privacy" className="hover:text-primary transition-colors">
          {t('privacyPolicy', { defaultValue: 'Privacy Policy' })}
        </Link>
        <span aria-hidden className="text-border">
          ·
        </span>
        <Link prefetch={false} href="/usage" className="hover:text-primary transition-colors">
          {t('infoUsageTitle', { defaultValue: 'Usage' })}
        </Link>
        <span aria-hidden className="text-border">
          ·
        </span>
        <Link prefetch={false} href="/regions" className="hover:text-primary transition-colors">
          {t('infoRegionsTitle', { defaultValue: 'Regions' })}
        </Link>
        <span aria-hidden className="text-border">
          ·
        </span>
        <Link prefetch={false} href="/service-terms" className="hover:text-primary transition-colors">
          {t('infoServiceTermsTitle', { defaultValue: 'Service terms' })}
        </Link>
        <span aria-hidden className="text-border">
          ·
        </span>
        <Link prefetch={false} href="/dmca" className="hover:text-primary transition-colors">
          {t('infoDmcaTitle', { defaultValue: 'DMCA / Copyright' })}
        </Link>
        <span aria-hidden className="text-border">
          ·
        </span>
        <Link prefetch={false} href="/refunds" className="hover:text-primary transition-colors">
          {t('infoRefundsTitle', { defaultValue: 'Refunds' })}
        </Link>
        <span aria-hidden className="text-border">
          ·
        </span>
        <Link prefetch={false} href="/about" className="hover:text-primary transition-colors">
          {t('about', { defaultValue: 'About' })}
        </Link>
        <span aria-hidden className="text-border">
          ·
        </span>
        <a
          href="https://github.com/Snedz/missionwinning"
          className="hover:text-primary transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('sourceCode', { defaultValue: 'Source' })}
        </a>
      </nav>
      {showBuild && (
        <>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {APP_PUBLIC_PRODUCT_VERSION}
          </p>
          {buildLabel && (
            <p className="text-[10px] text-muted-foreground">Build {buildLabel}</p>
          )}
        </>
      )}
    </footer>
  );
}
