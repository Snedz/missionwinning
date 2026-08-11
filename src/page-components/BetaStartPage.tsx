'use client';
/**
 * Page: /beta — beta onboarding (mission briefing, not card wizard)
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { isOfflineInstallable } from '@/lib/offlineCapability';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Rocket } from 'lucide-react';
import { InfoPageFooter } from '@/components/layout/InfoPageFooter';
import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { BETA_EN, BETA_STEP_DEFS } from '@/i18n/betaLocales';
import { firstPaintString } from '@/lib/i18n/firstPaintString';

function betaLine(key: string, t: (k: string, o?: Record<string, unknown>) => string): string {
  return firstPaintString(key, BETA_EN[key] ?? key, t);
}

export function BetaStartPage() {
  const { t } = useTranslation();
  const primary = BETA_STEP_DEFS[0];

  return (
    <InfoPageShell
      icon={Rocket}
      title={t('infoBetaTitle', { defaultValue: 'Start here' })}
      subtitle={t('infoBetaSubtitleBrief', {
        defaultValue: 'I-Day → first workout → Mission Coach. Start with the primary path.',
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
      {/* Field manual: primary path owns the fold; checklist + secondary steps fold. */}
      <div className="space-y-8 page-enter">
        {primary ? (
          <div className="space-y-3">
            <p className="eyebrow">
              {betaLine(primary.titleKey, t)}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {betaLine(primary.bodyKey, t)}
            </p>
            <Link
              href={primary.href}
              className="primary-action inline-flex max-w-sm min-h-[52px] tap-target"
            >
              {betaLine(primary.ctaKey, t)}
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        ) : null}

        <details className="group border-2 border-border bg-card">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center px-4 py-3 text-sm font-semibold text-muted-foreground [&::-webkit-details-marker]:hidden">
            {t('infoBetaMoreSteps', { defaultValue: 'What we need & more steps' })}
          </summary>
          <div className="space-y-6 border-t-2 border-border p-4">
            <div className="space-y-3">
              <p className="eyebrow">
                {t('infoBetaNeedTitle', { defaultValue: 'What we need from you' })}
              </p>
              <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                <li>
                  {t('betaNeedLi1', {
                    defaultValue: 'Finish I-Day and at least one workout this week',
                  })}
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

            <ol className="space-y-4 border-t-2 border-border pt-4">
              {BETA_STEP_DEFS.slice(1).map((step) => (
                <li key={step.n} className="flex gap-3">
                  <span className="eyebrow shrink-0 pt-0.5 tabular-nums text-muted-foreground">
                    {String(step.n).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <h2 className="text-sm font-semibold text-foreground">
                  {betaLine(step.titleKey, t)}
                    </h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {betaLine(step.bodyKey, t)}
                    </p>
                    <Link
                      href={step.href}
                      className="inline-flex min-h-[44px] items-center text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                    >
                      {betaLine(step.ctaKey, t)}
                      <ChevronRight className="ms-0.5 h-3.5 w-3.5" />
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </details>

        <p className="border-t-2 border-border pt-6 text-xs leading-relaxed text-muted-foreground">
          {/*
            The first screen an invited tester sees. "log from Today offline" is
            a promise this build cannot keep while the service worker is gated,
            and it is the one claim they are most likely to go and test.
          */}
          {isOfflineInstallable()
            ? betaLine('betaFootWedge', t)
            : betaLine('betaFootWedgeNoSw', t)}
        </p>
      </div>
    </InfoPageShell>
  );
}
