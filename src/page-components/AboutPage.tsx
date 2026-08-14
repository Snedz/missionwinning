'use client';
/**
 * Page: /about — editorial body; chrome comes from PublicPageShell in
 * app/about/page.tsx.
 * See: app/INDEX.md, src/page-components/INDEX.md
 *
 * Recut from one `content-card` of `text-lg` headings — a legal appendix
 * wearing the brand's most-linked company page — onto the landing's own
 * idioms: numbered `card-section` rules, display-face headings, no box. Every
 * string is the key it already was: this is a presentation change, not new
 * claims. The old "More" link list is gone because `PublicSiteFooter` carries
 * those links on this shell.
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { CouncilLeadershipBlock } from '@/components/america/CouncilLeadershipBlock';
import { APP_PUBLIC_PRODUCT_VERSION, APP_PUBLIC_VERSION } from '@/lib/buildInfo';
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
      <h2 className="display-section max-w-[22ch] text-balance text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export function AboutPage() {
  const { t } = useTranslation();
  const freeBeta = isFreeBeta();
  const america = isAmericaTrackEnabled();

  return (
    <div className="space-y-10">
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
        data-mw-public-version={APP_PUBLIC_VERSION}
      >
        {APP_PUBLIC_PRODUCT_VERSION}
      </p>
      <EditorialSection index="01" title={t('infoAboutMission', { defaultValue: 'Our mission' })}>
        <p className="text-base leading-relaxed text-foreground">
          {t('infoAboutMissionNorthStar', {
            defaultValue:
              'The mission is advancement of civilization and propagation of consciousness to the stars.',
          })}
        </p>
        <p className="text-base leading-relaxed text-muted-foreground">
          {t('infoAboutMissionNested', {
            defaultValue:
              'That is the north star. Today we serve it through L1 Health: Train plus Mission Coach.',
          })}
        </p>
        <p className="text-base leading-relaxed text-muted-foreground">
          {freeBeta
            ? t('infoAboutMissionP1OpenBeta', {
                defaultValue:
                  'Mission Winning is a free offline workout logger with adaptive Mission Coach plans from your logs — no wearable required. Logging stays free forever.',
              })
            : t('infoAboutMissionP1', {
                defaultValue:
                  'Mission Winning is a free offline workout logger with adaptive Mission Coach plans from your logs — no wearable required. Super Bundle unlocks Coach depth and specialist education; logging stays free forever.',
              })}
        </p>
        <p className="text-base leading-relaxed text-muted-foreground">
          {t('infoAboutMissionP2', {
            defaultValue:
              'Train anywhere with bodyweight or minimal gear first. Mission Coach builds the week from what you actually logged — not from a wearable. Educational tools only, not medical care.',
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
              'Evidence supports structured exercise for mood and energy in research settings — but most advice stays “just go work out.” We turn that into a weekly plan you can follow on any phone. We do not diagnose or treat depression; this is educational fitness, not clinical care.',
          })}
        </p>
      </EditorialSection>

      {america && (
        <EditorialSection
          index="03"
          title={t('infoAboutNational', { defaultValue: 'National fitness (U.S.)' })}
        >
          <CouncilLeadershipBlock />
          <p className="text-base leading-relaxed">
            <Link href="/america" className="text-muted-foreground hover:underline">
              {t('infoAboutAmericaLink', {
                defaultValue: 'Presidential Fitness Test & youth movement',
              })}
            </Link>
          </p>
        </EditorialSection>
      )}

      <EditorialSection
        index={america ? '04' : '03'}
        title={t('infoAboutBusiness', { defaultValue: 'Business structure' })}
      >
        <p className="text-base leading-relaxed text-muted-foreground">
          {freeBeta
            ? t('infoAboutBusinessBodyOpenBeta', {
                defaultValue:
                  'Operated by Mission Winning LLC (Texas). Beta 0.1 — full tools free while we grow with you. The logger stays free forever.',
              })
            : t('infoAboutBusinessBody', {
                defaultValue:
                  'Operated by Mission Winning LLC (Texas) for the app, programs, and coaching. Free core stays free; paid Super Bundle funds deeper Coach and pillar tools when you want them.',
              })}
        </p>
      </EditorialSection>

      <EditorialSection
        index={america ? '05' : '04'}
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
        index={america ? '06' : '05'}
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
            defaultValue: '© Mission Winning. Global by design. Your training stays on your device.',
          })}
        </p>
      </EditorialSection>
    </div>
  );
}
