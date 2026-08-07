'use client';

import { useTranslation } from 'react-i18next';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SUPER_BUNDLE_PRICE } from '@/lib/payments';
import { getJourneyEvents } from '@/lib/journeyAnalytics';
import { STORAGE_KEY_PREFIXES } from '@/lib/storage/keys';
import { keysWithPrefix, readRaw } from '@/lib/storage/safeStorage';

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
      <Card className="content-card border-primary bg-muted">
        <CardHeader>
          <CardTitle>
            {t('revenueSnapshot', { defaultValue: 'Super Bundle Snapshot (Demo)' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{t('spotsClaimed', { defaultValue: 'Members' })}:</span>{' '}
            <span className="font-mono text-primary">{fmt.num(DEMO_MEMBERS)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('estRevenue', { defaultValue: 'Est. revenue from bundles' })}:</span>{' '}
            <span className="font-mono text-primary">${fmt.num(estRevenue)}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {t('avgTicket', { price: SUPER_BUNDLE_PRICE, defaultValue: `Avg bundle ~$${SUPER_BUNDLE_PRICE}/mo` })} — Super
            Bundle sustains the free core for the global mission. Track real via Supabase later.
          </div>
          <div className="text-[10px] mt-1">
            Members who join the bundle help make the free path available worldwide. Share wins
            /feedback.
          </div>
        </CardContent>
      </Card>

      <Card className="content-card">
        <CardHeader>
          <CardTitle>{t('demoAnalytics', { defaultValue: 'Demo Analytics (Events)' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => {
              const events = getJourneyEvents();
              const legacy = keysWithPrefix(STORAGE_KEY_PREFIXES.event).map((k) => ({
                key: k,
                val: readRaw(k),
              }));
              console.log('Mission Winning Journey Events:', events);
              console.log('Legacy mw_event_* keys:', legacy);
              alert(
                `${events.length} journey events (${events.filter((e) => e.name === 'journey_phase_complete').length} phase completes). See console for details.`
              );
            }}
          >
            {t('viewEvents', { defaultValue: 'View Tracked Events (console)' })}
          </Button>
          <div className="text-xs mt-2">
            Tracks journey phases, milestones, bundle CTAs, feedback, and installs. Syncs to
            Supabase when signed in.
          </div>
        </CardContent>
      </Card>
    </>
  );
}
