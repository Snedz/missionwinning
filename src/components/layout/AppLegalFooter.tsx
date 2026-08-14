'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { APP_PUBLIC_PRODUCT_VERSION } from '@/lib/buildInfo';

type AppLegalFooterProps = {
  className?: string;
  showBuild?: boolean;
  buildLabel?: string;
};

export function AppLegalFooter({ className = '', showBuild = false, buildLabel }: AppLegalFooterProps) {
  const { t } = useTranslation();

  return (
    <footer
      className={`text-center text-[11px] text-muted-foreground space-y-2 py-4 ${className}`}
    >
      <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <Link href="/terms" className="hover:text-primary transition-colors">
          {t('termsOfService', { defaultValue: 'Terms of Service' })}
        </Link>
        <span aria-hidden className="text-border">
          ·
        </span>
        <Link href="/privacy" className="hover:text-primary transition-colors">
          {t('privacyPolicy', { defaultValue: 'Privacy Policy' })}
        </Link>
        <span aria-hidden className="text-border">
          ·
        </span>
        <Link href="/usage" className="hover:text-primary transition-colors">
          {t('infoUsageTitle', { defaultValue: 'Usage' })}
        </Link>
        <span aria-hidden className="text-border">
          ·
        </span>
        <Link href="/regions" className="hover:text-primary transition-colors">
          {t('infoRegionsTitle', { defaultValue: 'Regions' })}
        </Link>
        <span aria-hidden className="text-border">
          ·
        </span>
        <Link href="/service-terms" className="hover:text-primary transition-colors">
          {t('infoServiceTermsTitle', { defaultValue: 'Service terms' })}
        </Link>
        <span aria-hidden className="text-border">
          ·
        </span>
        <Link href="/dmca" className="hover:text-primary transition-colors">
          {t('infoDmcaTitle', { defaultValue: 'DMCA / Copyright' })}
        </Link>
        <span aria-hidden className="text-border">
          ·
        </span>
        <Link href="/refunds" className="hover:text-primary transition-colors">
          {t('infoRefundsTitle', { defaultValue: 'Refunds' })}
        </Link>
        <span aria-hidden className="text-border">
          ·
        </span>
        <Link href="/help" className="hover:text-primary transition-colors">
          {t('infoHelpTitle', { defaultValue: 'Help' })}
        </Link>
        <span aria-hidden className="text-border">
          ·
        </span>
        <Link href="/about" className="hover:text-primary transition-colors">
          {t('about', { defaultValue: 'About' })}
        </Link>
        <span aria-hidden className="text-border">
          ·
        </span>
        <Link href="/changelog" className="hover:text-primary transition-colors">
          Changelog
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
