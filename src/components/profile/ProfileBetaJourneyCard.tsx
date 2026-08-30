'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { BetaFunnelMetrics } from '@/lib/journeyAnalytics';

type ProfileBetaJourneyCardProps = {
  funnel: BetaFunnelMetrics;
  email: string | null;
  isCommissioned: boolean;
  nudgeLoading: boolean;
  nudgeSent: boolean;
  onEmailNudge: () => void;
};

export function ProfileBetaJourneyCard({
  funnel,
  email,
  isCommissioned,
  nudgeLoading,
  nudgeSent,
  onEmailNudge,
}: ProfileBetaJourneyCardProps) {
  const { t } = useTranslation();

  return (
    <div className="house-card space-y-3 text-sm" data-testid="account-beta-journey-card">
      <h3 className="text-2xl font-semibold leading-none tracking-tight">
        {t('betaJourneyProgress', { defaultValue: 'Beta journey progress' })}
      </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="border-2 border-border p-3">
            <div className="text-xs text-muted-foreground">Phase</div>
            <div className="font-semibold capitalize">{funnel.phase.replace('-', ' ')}</div>
          </div>
          <div className="border-2 border-border p-3">
            <div className="text-xs text-muted-foreground">Events</div>
            <div className="font-semibold">{funnel.eventCount}</div>
          </div>
          <div className="border-2 border-border p-3">
            <div className="text-xs text-muted-foreground">I-Day</div>
            <div className="font-semibold">{funnel.iDayComplete ? '✓ Done' : '—'}</div>
          </div>
          <div className="border-2 border-border p-3">
            <div className="text-xs text-muted-foreground">Basic Training</div>
            <div className="font-semibold">
              {funnel.basicDone}/{funnel.basicTotal}
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Beta targets: I-Day ≥80%, commissioned ≥25% in 14 days. Phase transitions log as{' '}
          <code className="text-[10px]">journey_phase_complete</code>.
        </p>
        {email && !isCommissioned && (
          <Button
            variant="outline"
            className="w-full min-h-[44px]"
            disabled={nudgeLoading}
            onClick={onEmailNudge}
          >
            {nudgeLoading
              ? 'Sending…'
              : t('emailNextStep', { defaultValue: 'Email my next step' })}
          </Button>
        )}
        {nudgeSent && (
          <p className="text-xs text-primary">
            {t('emailNextStepSent', { defaultValue: 'Check your inbox for your next step.' })}
          </p>
        )}
    </div>
  );
}
