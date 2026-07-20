'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type LegalNavProps = {
  className?: string;
  linkClassName?: string;
  includeBeta?: boolean;
  includeFeedback?: boolean;
};

export function LegalNav({
  className,
  linkClassName = 'hover:text-primary transition-colors',
  includeBeta = true,
  includeFeedback = true,
}: LegalNavProps) {
  const { t } = useTranslation();

  return (
    <nav className={cn('flex flex-wrap gap-x-3 gap-y-2 text-sm text-muted-foreground', className)}>
      <Link href="/about" className={linkClassName}>
        {t('about', { defaultValue: 'About' })}
      </Link>
      {includeBeta && (
        <Link href="/beta" className={linkClassName}>
          {t('navBetaGuide', { defaultValue: 'Beta guide' })}
        </Link>
      )}
      {includeFeedback && (
        <Link href="/feedback" className={linkClassName}>
          {t('feedback', { defaultValue: 'Feedback' })}
        </Link>
      )}
      <Link href="/terms" className={linkClassName}>
        {t('termsOfService', { defaultValue: 'Terms of Service' })}
      </Link>
      <Link href="/privacy" className={linkClassName}>
        {t('privacyPolicy', { defaultValue: 'Privacy Policy' })}
      </Link>
      <Link href="/dmca" className={linkClassName}>
        {t('infoDmcaTitle', { defaultValue: 'DMCA / Copyright' })}
      </Link>
      <Link href="/refunds" className={linkClassName}>
        {t('infoRefundsTitle', { defaultValue: 'Refunds & cancellation' })}
      </Link>
    </nav>
  );
}
