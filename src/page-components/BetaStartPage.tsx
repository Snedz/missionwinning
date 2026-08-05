'use client';
/**
 * Page: /beta — beta onboarding (mission briefing, not card wizard)
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Rocket } from 'lucide-react';
import { InfoPageFooter } from '@/components/layout/InfoPageFooter';
import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { BETA_STEP_DEFS } from '@/i18n/betaLocales';

export function BetaStartPage() {
  const { t } = useTranslation();
  const primary = BETA_STEP_DEFS[0];

  return (
    <InfoPageShell
      icon={Rocket}
      title={t('infoBetaTitle', { defaultValue: 'Start here' })}
      subtitle={t('infoBetaSubtitle', {
        defaultValue:
          'Private beta — I-Day → first workout → Mission Coach. Help us validate the path before public launch.',
      })}
      variant="sections"
      footer={
        <InfoPageFooter
          showLegal
          showToday
          todayLabel={t('infoSkipToday', { defaultValue: 'Skip to Today' })}
        />
      }
    >
      <div className="space-y-8 page-enter">
        <div className="space-y-3">
          <p className="eyebrow">
            {t('infoBetaNeedTitle', { defaultValue: 'What we need from you' })}
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <li>
              {t('betaNeedLi1', { defaultValue: 'Finish I-Day and at least one workout this week' })}
            </li>
            <li>
              {t('betaNeedLi2', {
                defaultValue:
                  'Try journey phases on Today — dashboard unlocks as you progress',
              })}
            </li>
            <li>
              {t('betaNeedLi3', {
                defaultValue:
                  'Report anything confusing via Profile → feedback or reply to your invite email',
              })}
            </li>
          </ul>
        </div>

        {primary ? (
          <div className="space-y-3">
            <p className="eyebrow">{t(primary.titleKey)}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{t(primary.bodyKey)}</p>
            <Link href={primary.href} className="primary-action inline-flex max-w-sm">
              {t(primary.ctaKey)}
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        ) : null}

        <ol className="space-y-4 border-t-2 border-border pt-6">
          {BETA_STEP_DEFS.slice(1).map((step) => (
            <li key={step.n} className="flex gap-3">
              <span className="eyebrow shrink-0 tabular-nums text-muted-foreground pt-0.5">
                {String(step.n).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <h2 className="text-sm font-semibold text-foreground">{t(step.titleKey)}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(step.bodyKey)}</p>
                <Link
                  href={step.href}
                  className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                >
                  {t(step.ctaKey)}
                  <ChevronRight className="h-3.5 w-3.5 ms-0.5" />
                </Link>
              </div>
            </li>
          ))}
        </ol>

        <p className="text-xs text-muted-foreground leading-relaxed border-t-2 border-border pt-6">
          {t('betaFootWedge', {
            defaultValue:
              'Train anywhere: log from Today offline — no account required. After your first log, open Mission Coach for a week that adapts from sessions alone.',
          })}
        </p>
      </div>
    </InfoPageShell>
  );
}
