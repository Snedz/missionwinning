'use client';

import { useTranslation } from 'react-i18next';
import { MetricsRow } from '@/components/metrics/MetricsRow';
import type { BodyScores } from '@/lib/score';

const DEMO_SCORES: BodyScores = {
  readiness: 82,
  strain: 45,
  recovery: 78,
  readinessLabelKey: 'todayBodyPrimePush',
  strainLabelKey: 'todayBodyModerateLoad',
  recoveryLabelKey: 'todayBodyRebuilding',
};

/** CSS phone-frame preview of Today hub for marketing hero. */
export function LandingHeroMockup() {
  const { t } = useTranslation();

  return (
    <div className="relative mx-auto w-full max-w-[320px] lg:max-w-none">
      <div
        className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-emerald-500/20 via-transparent to-teal-500/10 blur-2xl pointer-events-none"
        aria-hidden
      />
      <div className="relative rounded-[2rem] border border-border/80 bg-card/90 shadow-2xl shadow-emerald-950/30 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
          <span className="text-xs font-semibold tracking-wide text-emerald-400">
            {t('landingMockupToday', { defaultValue: 'Today' })}
          </span>
          <span className="text-[10px] text-muted-foreground tabular-nums">Mission Winning</span>
        </div>
        <div className="p-4 space-y-4">
          <MetricsRow scores={DEMO_SCORES} demo embedded />
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/20 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {t('landingMockupMissionScore', { defaultValue: 'Mission Score' })}
              </span>
              <span className="font-bold text-emerald-400 tabular-nums">78</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-emerald-600 to-teal-400" />
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground leading-relaxed">
            {t('landingMockupCoach', {
              defaultValue: 'Cross-pillar coach suggests your next pillar',
            })}
          </div>
          <div className="rounded-xl bg-emerald-600/90 text-center py-2.5 text-sm font-semibold text-white">
            {t('landingMockupPrimaryCta', { defaultValue: 'Start workout' })}
          </div>
        </div>
        <div className="h-1 w-28 mx-auto mb-2 rounded-full bg-border/80" aria-hidden />
      </div>
    </div>
  );
}
