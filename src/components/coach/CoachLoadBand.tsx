'use client';
/**
 * Training load, from logs alone — the second beat of the wedge, made visible.
 *
 * `.608` — `coach/load.ts` has computed Foster session-RPE and an EWMA
 * acute:chronic workload ratio since it was written, and **no screen ever showed
 * it.** It reached planning (`loadGuard`, cap-only), the LLM context, and one
 * post-session debrief line, but an athlete could not go and look at it. That is
 * the capability [docs/THESIS.md](../../../docs/THESIS.md) promotes into the pitch —
 * readiness without a strap — so it has to exist on a screen before the sentence is
 * honest.
 *
 * Wiring only. The decision — and specifically the refusal to show a number inside
 * the evidence window — lives in `resolveLoadBandView`, where it is unit-tested
 * (`.598`'s pattern: a JSX branch is not testable here, and "says nothing yet" is
 * the branch a Playwright pass is least likely to seed).
 *
 * Framing is deliberate and constrained by `docs/REDTEAM.md` A8: this is a
 * **descriptive load** signal, never physiology and never a prediction. `load.ts`'s
 * own header records that ACWR is descriptive and was never validated for
 * recreational lifters, so the copy says what the ratio *is* rather than what it
 * forecasts.
 */

import { useTranslation } from 'react-i18next';
import { Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWorkoutStore } from '@/store/workoutStore';
import { resolveLoadBandView } from '@/lib/coach/loadBandView';
import { historyForWeek } from '@/lib/workout/startHistoryFrom';

const ZONE_COPY: Record<'light' | 'steady' | 'high', { key: string; fallback: string }> = {
  light: { key: 'coachLoadZoneLight', fallback: 'Lighter than your recent normal' },
  steady: { key: 'coachLoadZoneSteady', fallback: 'In line with your recent normal' },
  high: { key: 'coachLoadZoneHigh', fallback: 'Above your recent normal' },
};

export function CoachLoadBand() {
  const { t } = useTranslation();
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const view = resolveLoadBandView(historyForWeek(workoutHistory));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" aria-hidden="true" />
          {t('coachLoadTitle', { defaultValue: 'Training load' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {view.state === 'unmeasured' ? (
          <>
            <p className="text-[15px] font-semibold text-foreground">
              {t('coachLoadUnmeasured', { defaultValue: 'Not enough history yet' })}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('coachLoadUnmeasuredBody', {
                days: view.daysRemaining,
                defaultValue: `Keep logging — about ${view.daysRemaining} more days of training and this compares your last week against your own baseline.`,
              })}
            </p>
          </>
        ) : (
          <>
            <p className="text-[15px] font-semibold text-foreground">
              {t(ZONE_COPY[view.zone].key, { defaultValue: ZONE_COPY[view.zone].fallback })}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('coachLoadBody', {
                ratio: view.ratio.toFixed(2),
                defaultValue: `Last week against your 4-week baseline: ${view.ratio.toFixed(2)}×. Built from your logged sets — no wearable involved.`,
              })}
            </p>
          </>
        )}
        <p className="text-xs text-muted-foreground">
          {t('coachLoadDisclaimer', {
            defaultValue: 'A description of your recent workload, not a medical or recovery reading.',
          })}
        </p>
      </CardContent>
    </Card>
  );
}
