'use client';
/**
 * Page: /refunds — leftover refund & cancellation policy.
 * Quiet Account / legal door. Never a rail.
 * See: docs/PAY_READY_LEGAL.md, docs/LEGAL_SAFETY.md
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Receipt } from 'lucide-react';
import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { infoEnFloor } from '@/i18n/infoEnFloor';
import { isFreeBeta } from '@/lib/freeBeta';

const REFUND_SECTIONS = [
  { id: 'subscriptions', key: 'infoRefundsSubs', bodyKey: 'infoRefundsSubsBody' },
  { id: 'lifetime', key: 'infoRefundsLifetime', bodyKey: 'infoRefundsLifetimeBody' },
  { id: 'how', key: 'infoRefundsHow', bodyKey: 'infoRefundsHowBody' },
  { id: 'abuse', key: 'infoRefundsAbuse', bodyKey: 'infoRefundsAbuseBody' },
] as const;

export function RefundsPage() {
  const { t } = useTranslation();
  const freeBeta = isFreeBeta();

  return (
    <InfoPageShell
      className="house-refunds"
      icon={Receipt}
      eyebrow={t('infoLegalEyebrow', { defaultValue: 'Legal' })}
      title={t('infoRefundsTitle', { defaultValue: infoEnFloor('infoRefundsTitle') })}
      lastUpdated={t('infoLastUpdated', { defaultValue: 'Last updated: 13 August 2026' })}
      variant="sections"
    >
      {/* Quiet leftover: intro + jump chips + sections. Legal copy unchanged. */}
      <section className="house-card space-y-3">
        <p className="text-sm text-muted-foreground">
          {freeBeta
            ? t('infoRefundsIntroOpenBeta', { defaultValue: infoEnFloor('infoRefundsIntroOpenBeta') })
            : t('infoRefundsIntro', { defaultValue: infoEnFloor('infoRefundsIntro') })}
        </p>
      </section>

      <nav className="house-refunds-jump" aria-label={t('infoRefundsTitle', { defaultValue: infoEnFloor('infoRefundsTitle') })}>
        {REFUND_SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="house-state">
            {t(s.key, { defaultValue: infoEnFloor(s.key) })}
          </a>
        ))}
      </nav>

      {REFUND_SECTIONS.map((section) => (
        <section key={section.id} id={section.id} className="house-card space-y-3">
          <h2 className="font-semibold">{t(section.key, { defaultValue: infoEnFloor(section.key) })}</h2>
          <p className="text-sm text-muted-foreground">
            {t(section.bodyKey, { defaultValue: infoEnFloor(section.bodyKey) })}
          </p>
        </section>
      ))}

      <p className="text-xs text-muted-foreground pt-2">
        {t('infoRefundsFoot', { defaultValue: infoEnFloor('infoRefundsFoot') })}{' '}
        <Link href="/terms" className="underline underline-offset-2">
          {t('termsOfService', { defaultValue: 'Terms of Service' })}
        </Link>
        {' · '}
        <Link href="/privacy" className="underline underline-offset-2">
          {t('privacyPolicy', { defaultValue: 'Privacy Policy' })}
        </Link>
        {!freeBeta && (
          <>
            {' · '}
            <Link href="/bundle" className="underline underline-offset-2">
              {t('footerProductBundle', { defaultValue: 'Super Bundle' })}
            </Link>
          </>
        )}
      </p>
    </InfoPageShell>
  );
}
