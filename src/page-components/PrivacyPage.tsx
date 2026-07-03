'use client';

import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';
import { InfoPageShell, InfoSection } from '@/components/layout/InfoPageShell';

const PRIVACY_SECTIONS = [
  { id: 'overview', key: 'infoPrivacyOverview' },
  { id: 'collect', key: 'infoPrivacyCollect' },
  { id: 'use', key: 'infoPrivacyUse' },
  { id: 'third-parties', key: 'infoPrivacyThirdParties' },
  { id: 'choices', key: 'infoPrivacyChoices' },
  { id: 'not-medical', key: 'infoPrivacyNotMedical' },
] as const;

export function PrivacyPage() {
  const { t } = useTranslation();

  const jumpLinks = PRIVACY_SECTIONS.map((s) => ({
    id: s.id,
    label: t(s.key, { defaultValue: s.key }),
  }));

  return (
    <InfoPageShell
      icon={Shield}
      title={t('infoPrivacyTitle', { defaultValue: 'Privacy Policy' })}
      lastUpdated={t('infoLastUpdated', { defaultValue: 'Last updated: June 2026' })}
      showLegalFooter
      jumpLinks={jumpLinks}
    >
      <InfoSection id="overview" title={t('infoPrivacyOverview', { defaultValue: 'Overview' })}>
        <p className="text-muted-foreground">
          Mission Winning (&quot;we&quot;, &quot;us&quot;) operates the Mission Winning app at missionwinning.com.
          This policy explains what we collect, why, and your choices.
        </p>
      </InfoSection>

      <InfoSection id="collect" title={t('infoPrivacyCollect', { defaultValue: 'What we collect' })}>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Account:</strong> email address when you sign in (Apple, Google, or magic link).
          </li>
          <li>
            <strong className="text-foreground">Health &amp; fitness data you enter:</strong> workouts, nutrition
            logs, assessments, journey progress, preferences (units, language, goals).
          </li>
          <li>
            <strong className="text-foreground">Device / usage:</strong> basic analytics events (e.g. journey
            milestones) to improve the product.
          </li>
          <li>
            <strong className="text-foreground">Local storage:</strong> much of the free core works offline; data
            may stay on your device until you sign in to sync.
          </li>
        </ul>
      </InfoSection>

      <InfoSection id="use" title={t('infoPrivacyUse', { defaultValue: 'How we use data' })}>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          <li>Provide and personalize your training journey (Today hub, recommendations).</li>
          <li>Sync across devices when signed in (Supabase cloud database).</li>
          <li>Process premium enrollments and support requests.</li>
          <li>Improve the app during private beta (aggregate funnel metrics).</li>
        </ul>
      </InfoSection>

      <InfoSection id="third-parties" title={t('infoPrivacyThirdParties', { defaultValue: 'Third parties' })}>
        <p className="text-muted-foreground">
          We use Supabase (hosting/auth/database), Vercel (app hosting), and optionally Resend (transactional
          email), Stripe/PayPal (payments when enabled). Each has its own privacy terms.
        </p>
      </InfoSection>

      <InfoSection id="choices" title={t('infoPrivacyChoices', { defaultValue: 'Your choices' })}>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          <li>Use the free core without an account (local-only).</li>
          <li>Request export from Profile → Data Export.</li>
          <li>Contact us to delete your account and cloud data: support@missionwinning.com</li>
        </ul>
      </InfoSection>

      <InfoSection id="not-medical" title={t('infoPrivacyNotMedical', { defaultValue: 'Not medical advice' })}>
        <p className="text-muted-foreground">
          Mission Winning provides educational fitness tools only. Consult a qualified professional before
          starting new exercise or nutrition programs.
        </p>
      </InfoSection>

      <p className="text-xs text-muted-foreground pt-2">Questions: support@missionwinning.com</p>
    </InfoPageShell>
  );
}
