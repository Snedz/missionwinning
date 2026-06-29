'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

type AppLegalFooterProps = {
  className?: string;
  showBuild?: boolean;
  buildLabel?: string;
};

export function AppLegalFooter({ className = '', showBuild = false, buildLabel }: AppLegalFooterProps) {
  const { t } = useTranslation();

  return (
    <footer
      className={`text-center text-[11px] text-muted-foreground/80 space-y-2 py-4 ${className}`}
    >
      <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <Link href="/terms" className="hover:text-emerald-400 transition-colors">
          {t('termsOfService', { defaultValue: 'Terms of Service' })}
        </Link>
        <span aria-hidden className="text-border">
          ·
        </span>
        <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
          {t('privacyPolicy', { defaultValue: 'Privacy Policy' })}
        </Link>
        <span aria-hidden className="text-border">
          ·
        </span>
        <Link href="/about" className="hover:text-emerald-400 transition-colors">
          {t('about', { defaultValue: 'About' })}
        </Link>
      </nav>
      <p className="text-[10px] text-muted-foreground/60 max-w-md mx-auto leading-relaxed">
        {t('legalFooterNote', {
          defaultValue: 'Civilian health app — not affiliated with DoD or any government agency.',
        })}
      </p>
      {showBuild && buildLabel && (
        <p className="text-[10px] text-muted-foreground/50">Build {buildLabel}</p>
      )}
    </footer>
  );
}
