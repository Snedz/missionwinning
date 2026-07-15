'use client';
/**
 * Page: /about — about mission
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CouncilLeadershipBlock } from '@/components/america/CouncilLeadershipBlock';
import { InfoPageShell, InfoSection } from '@/components/layout/InfoPageShell';
import { isAmericaTrackEnabled } from '@/lib/americaConfig';

export function AboutPage() {
  const { t } = useTranslation();

  return (
    <InfoPageShell
      icon={Info}
      eyebrow={t('aboutEyebrow', { defaultValue: 'About' })}
      title={t('infoAboutTitle', { defaultValue: 'About Mission Winning' })}
      subtitle={t('infoAboutSubtitle', {
        defaultValue:
          "The all-in-one global health and workout app — free core forever, premium depth when you're ready.",
      })}
      variant="sections"
      showLegalFooter
    >
      <Card className="content-card">
        <CardContent className="pt-6 space-y-6 text-sm leading-relaxed">
          <InfoSection title={t('infoAboutMission', { defaultValue: 'Our mission' })}>
            <p className="text-muted-foreground">
              {t('infoAboutMissionP1', {
                defaultValue:
                  'Mission Winning is the all-in-one global health and workout app. Free powerful tracker + premium specialist education programs and coaching drawn from elite practical training curricula.',
              })}
            </p>
            <p className="text-muted-foreground">
              {t('infoAboutMissionP2', {
                defaultValue:
                  'Accessible, science-based training and nutrition tools for everyone, everywhere — from city gyms to rural areas with minimal equipment. Train smart. Win daily. No borders.',
              })}
            </p>
          </InfoSection>

          {isAmericaTrackEnabled() && (
            <InfoSection title={t('infoAboutNational', { defaultValue: 'National fitness (U.S.)' })}>
              <CouncilLeadershipBlock />
              <p className="text-muted-foreground">
                <Link href="/america" className="text-blue-400 hover:underline">
                  {t('infoAboutAmericaLink', {
                    defaultValue: 'Presidential Fitness Test & youth movement →',
                  })}
                </Link>
              </p>
            </InfoSection>
          )}

          <InfoSection title={t('infoAboutBusiness', { defaultValue: 'Business structure' })}>
            <p className="text-muted-foreground">
              {t('infoAboutBusinessBody', {
                defaultValue:
                  'Operated by Mission Winning LLC (for-profit) for the app, programs, and coaching. A separate nonprofit foundation is planned to support free access, scholarships for coaches in underserved regions, and mission-driven initiatives.',
              })}
            </p>
          </InfoSection>

          <InfoSection title={t('infoAboutDisclaimers', { defaultValue: 'Important disclaimers' })}>
            <p className="text-muted-foreground">
              {t('infoAboutDisclaimerEducational', {
                defaultValue:
                  'Educational only. Mission Winning provides practical training education and tools. We are not a federally recognized or accredited certifying agency. Completion grants a Mission Winning Certificate of Educational Achievement only.',
              })}
            </p>
            <p className="text-muted-foreground">
              {t('infoAboutDisclaimerGov', {
                defaultValue:
                  'Not a government site. Mission Winning is not operated by the U.S. government. Presidential Fitness Test scoring is an educational revival inspired by classic youth fitness programs — not an official federal test unless explicitly partnered and labeled as such.',
              })}
            </p>
            <p className="text-muted-foreground">
              {t('infoAboutDisclaimerMedical', {
                defaultValue:
                  'Always consult qualified medical professionals before starting new training or nutrition protocols. Results vary. This is not medical, legal, or licensing advice.',
              })}
            </p>
          </InfoSection>

          <InfoSection title={t('infoAboutMore', { defaultValue: 'More' })}>
            <p className="text-muted-foreground">
              <Link href="/privacy" className="text-primary hover:underline">
                {t('privacyPolicy', { defaultValue: 'Privacy Policy' })}
              </Link>
              {' · '}
              <Link href="/terms" className="text-primary hover:underline">
                {t('termsOfService', { defaultValue: 'Terms of Use' })}
              </Link>
              {' · '}
              <Link href="/beta" className="text-primary hover:underline">
                {t('navBetaGuide', { defaultValue: 'Beta guide' })}
              </Link>
              {isAmericaTrackEnabled() && (
                <>
                  {' · '}
                  <Link href="/america" className="text-blue-400 hover:underline">
                    {t('infoAboutNationalLink', { defaultValue: 'National fitness' })}
                  </Link>
                </>
              )}
            </p>
          </InfoSection>

          <InfoSection title={t('infoAboutContact', { defaultValue: 'Contact' })}>
            <p className="text-muted-foreground">
              {t('infoAboutContactBody', {
                defaultValue: 'support@missionwinning.com · hello@missionwinning.com for coaching inquiries.',
              })}
            </p>
          </InfoSection>

          <p className="text-xs text-muted-foreground">
            {t('infoAboutCopyright', {
              defaultValue: '© Mission Winning. Global by design. PWA — works offline anywhere.',
            })}
          </p>
        </CardContent>
      </Card>
    </InfoPageShell>
  );
}
