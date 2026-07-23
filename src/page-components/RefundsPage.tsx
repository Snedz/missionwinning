'use client';
/**
 * Page: /refunds — refund & cancellation policy
 * See: docs/PAY_READY_LEGAL.md, docs/LEGAL_SAFETY.md
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Receipt } from 'lucide-react';
import { InfoPageShell, InfoSection } from '@/components/layout/InfoPageShell';
import { isFreeBeta } from '@/lib/freeBeta';

export function RefundsPage() {
  const { t } = useTranslation();
  const freeBeta = isFreeBeta();

  const jumpLinks = [
    { id: 'subscriptions', label: t('infoRefundsSubs', { defaultValue: 'Subscriptions' }) },
    { id: 'lifetime', label: t('infoRefundsLifetime', { defaultValue: 'Lifetime / USDC' }) },
    { id: 'how', label: t('infoRefundsHow', { defaultValue: 'How to request' }) },
    { id: 'abuse', label: t('infoRefundsAbuse', { defaultValue: 'Abuse & chargebacks' }) },
  ];

  return (
    <InfoPageShell
      icon={Receipt}
      title={t('infoRefundsTitle', { defaultValue: 'Refunds & cancellation' })}
      lastUpdated={t('infoLastUpdated', { defaultValue: 'Last updated: July 2026' })}
      showLegalFooter
      jumpLinks={jumpLinks}
    >
      <p className="text-muted-foreground">
        {t('infoRefundsIntro', {
          defaultValue:
            'This policy applies to paid Mission Winning purchases (Super Bundle and related premium). Free core use needs no refund. Educational fitness software only — not a medical device.',
        })}
      </p>

      <InfoSection
        id="subscriptions"
        title={t('infoRefundsSubs', { defaultValue: 'Subscriptions' })}
      >
        <p className="text-muted-foreground">
          {t('infoRefundsSubsBody', {
            defaultValue:
              'Monthly and 12-month Super Bundle: request a full refund within 14 days of your first paid charge by emailing support@missionwinning.com. After that window, we do not offer mid-cycle prorated refunds. Cancel anytime in Profile → Manage billing (Stripe Customer Portal) to stop future charges; access continues through the paid period already billed.',
          })}
        </p>
      </InfoSection>

      <InfoSection
        id="lifetime"
        title={t('infoRefundsLifetime', { defaultValue: 'Lifetime / USDC' })}
      >
        <p className="text-muted-foreground">
          {t('infoRefundsLifetimeBody', {
            defaultValue:
              'Lifetime (card or Phantom USDC): request a refund within 14 days of purchase if you have not meaningfully used premium features, by emailing support@missionwinning.com. After 14 days, lifetime purchases are non-refundable. Phantom/USDC refunds are processed manually by support — there is no automated on-chain reverse transfer yet.',
          })}
        </p>
      </InfoSection>

      <InfoSection id="how" title={t('infoRefundsHow', { defaultValue: 'How to request' })}>
        <p className="text-muted-foreground">
          {t('infoRefundsHowBody', {
            defaultValue:
              'Email support@missionwinning.com with the subject “Refund request”, the email used at checkout, plan type (monthly / 12-mo / lifetime), approximate purchase date, and payment method (Stripe or Phantom). We aim to respond within a few business days.',
          })}
        </p>
      </InfoSection>

      <InfoSection
        id="abuse"
        title={t('infoRefundsAbuse', { defaultValue: 'Abuse & chargebacks' })}
      >
        <p className="text-muted-foreground">
          {t('infoRefundsAbuseBody', {
            defaultValue:
              'We may refuse repeat refund requests that appear abusive. Opening a chargeback without contacting support first may delay resolution. Fraudulent payments may result in account termination.',
          })}
        </p>
      </InfoSection>

      <p className="text-xs text-muted-foreground pt-2">
        {t('infoRefundsFoot', {
          defaultValue: 'See also',
        })}{' '}
        <Link href="/terms" className="text-primary hover:underline">
          {t('termsOfService', { defaultValue: 'Terms of Service' })}
        </Link>
        {' · '}
        <Link href="/privacy" className="text-primary hover:underline">
          {t('privacyPolicy', { defaultValue: 'Privacy Policy' })}
        </Link>
        {!freeBeta && (
          <>
            {' · '}
            <Link href="/bundle" className="text-primary hover:underline">
              {t('footerProductBundle', { defaultValue: 'Super Bundle' })}
            </Link>
          </>
        )}
      </p>
    </InfoPageShell>
  );
}
