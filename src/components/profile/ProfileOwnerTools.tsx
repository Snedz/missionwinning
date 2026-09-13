'use client';

import { useTranslation } from 'react-i18next';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { Button } from '@/components/ui/button';
import { SUPER_BUNDLE_PRICE } from '@/lib/payments';
import { getJourneyEvents } from '@/lib/journeyAnalytics';
import { STORAGE_KEY_PREFIXES } from '@/lib/storage/keys';
import { keysWithPrefix, readRaw } from '@/lib/storage/safeStorage';
import { toast } from '@/hooks/use-toast';

export function ProfileOwnerTools() {
  const { t } = useTranslation();
  const fmt = useLocaleFormat();

  /*
   * `.203` — these were constants dressed as stored data.
   *
   * `mw_contributors` is **read here and written nowhere** — repo-wide grep
   * returns this line and the key's declaration, nothing else. So "Members:
   * 12,400" and the revenue derived from it were fixed numbers that looked like
   * state, on a card whose title says "(Demo)" while its figures did not.
   *
   * Founder-gated, so the blast radius is one person — but that person is the
   * one making decisions from it, which is worse than showing a stranger a wrong
   * number. Named as illustrative, and the fake read is gone.
   */
  const DEMO_MEMBERS = 12_400;
  const estRevenue = Math.round(DEMO_MEMBERS * 12 * 0.3);

  return (
    <>
      <div className="house-card space-y-2 text-sm" data-testid="account-owner-tools-card">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          {t('revenueSnapshot', { defaultValue: 'Super Bundle Snapshot (Demo)' })}
        </h3>
          <div className="flex justify-between">
            <span>{t('spotsClaimed', { defaultValue: 'Members' })}:</span>{' '}
            <span className="font-mono text-primary">{fmt.num(DEMO_MEMBERS)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('estRevenue', { defaultValue: 'Est. revenue from bundles' })}:</span>{' '}
            <span className="font-mono text-primary">${fmt.num(estRevenue)}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {t('avgTicket', { price: SUPER_BUNDLE_PRICE, defaultValue: `Avg bundle ~$${SUPER_BUNDLE_PRICE}/mo` })}
            {' — '}
            {t('ownerToolsBundleFoot', {
              defaultValue: 'Demo figures only. Free core stays free.',
            })}
          </div>
          <div className="text-[10px] mt-1 text-muted-foreground">
            {t('ownerToolsShareFoot', {
              defaultValue: 'Share wins and feedback when you ship.',
            })}
          </div>
      </div>

      <div className="house-card space-y-3 text-sm" data-testid="account-owner-tools-card">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          {t('demoAnalytics', { defaultValue: 'Demo Analytics (Events)' })}
        </h3>
          <Button
            variant="outline"
            className="min-h-[44px] tap-target"
            onClick={() => {
              const events = getJourneyEvents();
              const legacy = keysWithPrefix(STORAGE_KEY_PREFIXES.event).map((k) => ({
                key: k,
                val: readRaw(k),
              }));
              console.log('Mission Winning Journey Events:', events);
              console.log('Legacy mw_event_* keys:', legacy);
              toast({
                title: t('demoAnalyticsToast', { defaultValue: 'Events logged to console' }),
                description: t('demoAnalyticsToastDesc', {
                  count: events.length,
                  phases: events.filter((e) => e.name === 'journey_phase_complete').length,
                  defaultValue: `${events.length} journey events (${events.filter((e) => e.name === 'journey_phase_complete').length} phase completes).`,
                }),
              });
            }}
          >
            {t('viewEvents', { defaultValue: 'View Tracked Events (console)' })}
          </Button>
          <div className="text-xs mt-2 text-muted-foreground">
            {t('ownerToolsEventsFoot', {
              defaultValue: 'Journey events, milestones, and installs. Syncs when signed in.',
            })}
          </div>
      </div>
    </>
  );
}
