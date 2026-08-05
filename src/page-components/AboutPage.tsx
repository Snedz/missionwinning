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
import { isFreeBeta } from '@/lib/freeBeta';

export function AboutPage() {
  const { t } = useTranslation();
  const freeBeta = isFreeBeta();

  return (
    <InfoPageShell
      icon={Info}
      eyebrow={t('aboutEyebrow', { defaultValue: 'About' })}
      title={t('infoAboutTitle', { defaultValue: 'About Mission Winning' })}
      subtitle={t('infoAboutSubtitle', {
        defaultValue: freeBeta
          ? 'Free offline logger + Mission Coach from your logs — free core forever. No account required.'
          : 'Free offline logger + Mission Coach from your logs — free core forever; Super Bundle adds depth when you are ready.',
      })}
      variant="sections"
      showLegalFooter
    >
      <Card className="content-card">
        <CardContent className="pt-6 space-y-6 text-sm leading-relaxed">
          <InfoSection title={t('infoAboutMission', { defaultValue: 'Our mission' })}>
            <p className="text-muted-foreground">
              {t('infoAboutMissionP1', {
                defaultValue: freeBeta
                  ? 'Mission Winning is a free offline workout logger with adaptive Mission Coach plans from your logs — no wearable required. Logging stays free forever.'
                  : 'Mission Winning is a free offline workout logger with adaptive Mission Coach plans from your logs — no wearable required. Super Bundle unlocks Coach depth and specialist education; logging stays free forever.',
              })}
            </p>
            <p className="text-muted-foreground">
              {t('infoAboutMissionP2', {
                defaultValue:
                  'Train anywhere with bodyweight or minimal gear first. Mission Coach builds the week from what you actually logged — not from a wearable. Educational tools only, not medical care.',
              })}
            </p>
          </InfoSection>

          <InfoSection title={t('infoAboutEvidence', { defaultValue: 'Exercise as medicine' })}>
            <p className="text-muted-foreground">
              {t('infoAboutEvidenceBody', {
                defaultValue:
                  'Evidence supports structured exercise for mood and energy in research settings — but most advice stays “just go work out.” We turn that into a weekly plan you can follow on any phone. We do not diagnose or treat depression; this is educational fitness, not clinical care.',
              })}
            </p>
          </InfoSection>

          {isAmericaTrackEnabled() && (
            <InfoSection title={t('infoAboutNational', { defaultValue: 'National fitness (U.S.)' })}>
              <CouncilLeadershipBlock />
              <p className="text-muted-foreground">
                <Link href="/america" className="text-muted-foreground hover:underline">
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
                  'Operated by Mission Winning LLC for the app, programs, and coaching. Free core stays free; paid Super Bundle funds deeper Coach and pillar tools when you want them.',
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
              <Link href="/dmca" className="text-primary hover:underline">
                {t('infoDmcaTitle', { defaultValue: 'DMCA / Copyright' })}
              </Link>
              {' · '}
              <Link href="/refunds" className="text-primary hover:underline">
                {t('infoRefundsTitle', { defaultValue: 'Refunds' })}
              </Link>
              {' · '}
              <Link href="/beta" className="text-primary hover:underline">
                {t('navBetaGuide', { defaultValue: 'Beta guide' })}
              </Link>
              {' · '}
              <Link href="/press" className="text-primary hover:underline">
                {t('navPressBrand', { defaultValue: 'Press / Brand' })}
              </Link>
              {isAmericaTrackEnabled() && (
                <>
                  {' · '}
                  <Link href="/america" className="text-muted-foreground hover:underline">
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
