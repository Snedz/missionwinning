'use client';
/**
 * Page: /about — about mission (editorial body; chrome comes from
 * PublicPageShell in app/about/page.tsx)
 * See: app/INDEX.md, src/page-components/INDEX.md
 *
 * `.462` recut: this was one content-card of text-lg headings — a legal
 * appendix wearing the brand's most-linked company page. Same copy, landing
 * idioms: numbered `card-section` rules, display-face headings, no box. The
 * old "More" link list is gone — PublicSiteFooter carries those links.
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { CouncilLeadershipBlock } from '@/components/america/CouncilLeadershipBlock';
import { isAmericaTrackEnabled } from '@/lib/americaConfig';
import { isFreeBeta } from '@/lib/freeBeta';

function EditorialSection({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-section space-y-4 pt-6">
      <p className="section-index">{index}</p>
      <h2 className="font-display text-2xl font-extrabold tracking-[-0.015em] text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function AboutPage() {
  const { t } = useTranslation();
  const freeBeta = isFreeBeta();

  return (
    <div className="space-y-10">
      <EditorialSection index="01" title={t('infoAboutMission', { defaultValue: 'Our mission' })}>
        <p className="text-base leading-relaxed text-muted-foreground">
          {t('infoAboutMissionP1', {
            defaultValue: freeBeta
              ? 'Mission Winning is a free offline workout logger with adaptive Mission Coach plans from your logs — no wearable required. Logging stays free forever.'
              : 'Mission Winning is a free offline workout logger with adaptive Mission Coach plans from your logs — no wearable required. Super Bundle unlocks Coach depth and specialist education; logging stays free forever.',
          })}
        </p>
        <p className="text-base leading-relaxed text-muted-foreground">
          {t('infoAboutMissionP2', {
            defaultValue:
              'Accessible, science-based training and nutrition tools for everyone, everywhere — from city gyms to rural areas with minimal equipment. Train smart. Win daily. No borders.',
          })}
        </p>
      </EditorialSection>

      <EditorialSection
        index="02"
        title={t('infoAboutEvidence', { defaultValue: 'Exercise as medicine' })}
      >
        <p className="text-base leading-relaxed text-muted-foreground">
          {t('infoAboutEvidenceBody', {
            defaultValue:
              'Hundreds of clinical trials support exercise for mild to moderate depressive symptoms — often comparable to medication in research settings. Yet most mental health professionals never received formal training in prescribing exercise, so advice stays “just go work out.” Mission Winning turns training into a clear, adaptive weekly plan you can follow on any phone. We do not diagnose or treat depression; this is educational fitness, not clinical care.',
          })}
        </p>
      </EditorialSection>

      {isAmericaTrackEnabled() && (
        <EditorialSection
          index="03"
          title={t('infoAboutNational', { defaultValue: 'National fitness (U.S.)' })}
        >
          <CouncilLeadershipBlock />
          <p className="text-base leading-relaxed">
            <Link href="/america" className="text-muted-foreground hover:underline">
              {t('infoAboutAmericaLink', {
                defaultValue: 'Presidential Fitness Test & youth movement →',
              })}
            </Link>
          </p>
        </EditorialSection>
      )}

      <EditorialSection
        index={isAmericaTrackEnabled() ? '04' : '03'}
        title={t('infoAboutBusiness', { defaultValue: 'Business structure' })}
      >
        <p className="text-base leading-relaxed text-muted-foreground">
          {t('infoAboutBusinessBody', {
            defaultValue:
              'Operated by Mission Winning LLC (for-profit) for the app, programs, and coaching. A separate nonprofit foundation is planned to support free access, scholarships for coaches in underserved regions, and mission-driven initiatives.',
          })}
        </p>
      </EditorialSection>

      <EditorialSection
        index={isAmericaTrackEnabled() ? '05' : '04'}
        title={t('infoAboutDisclaimers', { defaultValue: 'Important disclaimers' })}
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t('infoAboutDisclaimerEducational', {
            defaultValue:
              'Educational only. Mission Winning provides practical training education and tools. We are not a federally recognized or accredited certifying agency. Completion grants a Mission Winning Certificate of Educational Achievement only.',
          })}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t('infoAboutDisclaimerGov', {
            defaultValue:
              'Not a government site. Mission Winning is not operated by the U.S. government. Presidential Fitness Test scoring is an educational revival inspired by classic youth fitness programs — not an official federal test unless explicitly partnered and labeled as such.',
          })}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t('infoAboutDisclaimerMedical', {
            defaultValue:
              'Always consult qualified medical professionals before starting new training or nutrition protocols. Results vary. This is not medical, legal, or licensing advice.',
          })}
        </p>
      </EditorialSection>

      <EditorialSection
        index={isAmericaTrackEnabled() ? '06' : '05'}
        title={t('infoAboutContact', { defaultValue: 'Contact' })}
      >
        <p className="text-base leading-relaxed text-muted-foreground">
          {t('infoAboutContactBody', {
            defaultValue:
              'support@missionwinning.com · hello@missionwinning.com for coaching inquiries.',
          })}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('infoAboutCopyright', {
            defaultValue: '© Mission Winning. Global by design. PWA — works offline anywhere.',
          })}
        </p>
      </EditorialSection>
    </div>
  );
}
