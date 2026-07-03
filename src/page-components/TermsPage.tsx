'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Scale } from 'lucide-react';
import { InfoPageShell, InfoSection } from '@/components/layout/InfoPageShell';

const TERM_SECTIONS = [
  { id: 'agreement', key: 'infoTermsAgreement' },
  { id: 'service', key: 'infoTermsService' },
  { id: 'educational', key: 'infoTermsEducational' },
  { id: 'accounts', key: 'infoTermsAccounts' },
  { id: 'premium', key: 'infoTermsPremium' },
  { id: 'liability', key: 'infoTermsLiability' },
  { id: 'changes', key: 'infoTermsChanges' },
] as const;

export function TermsPage() {
  const { t } = useTranslation();

  const jumpLinks = TERM_SECTIONS.map((s) => ({
    id: s.id,
    label: t(s.key, { defaultValue: s.key }),
  }));

  return (
    <InfoPageShell
      icon={Scale}
      title={t('infoTermsTitle', { defaultValue: 'Terms of Use' })}
      lastUpdated={t('infoLastUpdated', { defaultValue: 'Last updated: June 2026' })}
      showLegalFooter
      jumpLinks={jumpLinks}
    >
      <InfoSection id="agreement" title={t('infoTermsAgreement', { defaultValue: 'Agreement' })}>
        <p className="text-muted-foreground">
          By using Mission Winning, you agree to these terms. If you do not agree, do not use the app.
        </p>
      </InfoSection>

      <InfoSection id="service" title={t('infoTermsService', { defaultValue: 'Service' })}>
        <p className="text-muted-foreground">
          Mission Winning provides workout tracking, nutrition logging, education content, and optional premium
          programs. The free core is offered at our discretion; premium features may require purchase.
        </p>
      </InfoSection>

      <InfoSection
        id="educational"
        title={t('infoTermsEducational', { defaultValue: 'Educational only — not medical advice' })}
      >
        <p className="text-muted-foreground">
          Content is for general educational purposes. We are not a medical provider or accredited certifying
          agency. Certificates indicate educational achievement only, not professional licensure. You assume
          risk for physical activity; consult a physician before starting new programs.
        </p>
      </InfoSection>

      <InfoSection id="accounts" title={t('infoTermsAccounts', { defaultValue: 'Accounts & acceptable use' })}>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          <li>Provide accurate information; keep your email access secure.</li>
          <li>Do not abuse the service, attempt unauthorized access, or scrape premium content.</li>
          <li>Do not use the app for unlawful purposes.</li>
        </ul>
      </InfoSection>

      <InfoSection id="premium" title={t('infoTermsPremium', { defaultValue: 'Premium & refunds' })}>
        <p className="text-muted-foreground">
          Premium purchases (Super Bundle, specialist programs) are subject to the terms shown at checkout.
          Refund policies will be stated on the sales page; contact support@missionwinning.com for billing
          issues.
        </p>
      </InfoSection>

      <InfoSection id="liability" title={t('infoTermsLiability', { defaultValue: 'Limitation of liability' })}>
        <p className="text-muted-foreground">
          To the fullest extent permitted by law, Mission Winning LLC is not liable for injuries, health
          outcomes, or indirect damages arising from use of the app. The service is provided &quot;as is.&quot;
        </p>
      </InfoSection>

      <InfoSection id="changes" title={t('infoTermsChanges', { defaultValue: 'Changes' })}>
        <p className="text-muted-foreground">
          We may update these terms. Continued use after changes constitutes acceptance. Material changes will
          be noted in the app or via email where appropriate.
        </p>
      </InfoSection>

      <p className="text-xs text-muted-foreground pt-2">
        Mission Winning LLC · support@missionwinning.com · See also{' '}
        <Link href="/privacy" className="text-emerald-400 hover:underline">
          {t('privacyPolicy', { defaultValue: 'Privacy Policy' })}
        </Link>
      </p>
    </InfoPageShell>
  );
}
