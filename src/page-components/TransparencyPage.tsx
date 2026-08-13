'use client';
/**
 * Page: /account/transparency — Why this report (downloadable).
 * See: docs/TRANSPARENCY_PLAN.md, src/lib/transparency/INDEX.md
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';
import { APP_BUILD_LABEL } from '@/lib/buildInfo';
import { isClientPrivateGateEnabled } from '@/lib/privateGateNavigate';
import { isFreeBeta } from '@/lib/freeBeta';
import { getStripeCheckoutUrl, isCheckoutSessionsEnabled } from '@/lib/payments';
import { fetchTerritoryAccess, type TerritoryAccessClient } from '@/lib/legal/territoryAccessClient';
import { loadPlan } from '@/lib/coach/storage';
import { buildWeekRationale } from '@/lib/coach/weekRationale';
import { useWorkoutStore } from '@/store/workoutStore';
import { buildTransparencyReport } from '@/lib/transparency/report';
import { formatTransparencyJson, formatTransparencyText } from '@/lib/transparency/download';
import type { TransparencyStatus } from '@/lib/transparency/types';

function downloadText(filename: string, body: string, type: string) {
  const blob = new Blob([body], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function statusLabel(
  status: TransparencyStatus,
  t: (key: string, opts: { defaultValue: string }) => string
): string {
  if (status === 'open') return t('transparencyStatusOpen', { defaultValue: 'Open' });
  if (status === 'gated') return t('transparencyStatusGated', { defaultValue: 'Gated' });
  if (status === 'hidden') return t('transparencyStatusHidden', { defaultValue: 'Hidden' });
  if (status === 'limited') return t('transparencyStatusLimited', { defaultValue: 'Limited' });
  return t('transparencyStatusInfo', { defaultValue: 'Explained' });
}

export function TransparencyPage() {
  const { t } = useTranslation();
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const [territory, setTerritory] = useState<TerritoryAccessClient | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchTerritoryAccess().then((next) => {
      if (!cancelled) setTerritory(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const report = useMemo(() => {
    const plan = loadPlan();
    const rationale = plan
      ? buildWeekRationale(plan, { loggedWorkoutCount: workoutHistory.length })
      : null;
    return buildTransparencyReport({
      buildLabel: APP_BUILD_LABEL,
      privateGateEnabled: isClientPrivateGateEnabled(),
      freeBeta: isFreeBeta(),
      stripeCheckoutEnabled: isCheckoutSessionsEnabled() || Boolean(getStripeCheckoutUrl()),
      territory: {
        blocked: Boolean(territory?.blocked),
        reason: territory?.reason ?? null,
        message: territory?.message ?? null,
        country: territory?.country ?? null,
      },
      coach: {
        hasPlan: Boolean(plan),
        rationaleCompact: rationale?.compactDefault ?? null,
        rationaleInput: rationale?.inputDefault ?? null,
        rationaleRule: rationale?.ruleDefault ?? null,
        rationaleEffect: rationale?.effectDefault ?? null,
      },
    });
  }, [territory, workoutHistory.length]);

  return (
    <PillarPageShell
      icon={FileText}
      eyebrow={t('transparencyEyebrow', { defaultValue: 'Account' })}
      title={t('transparencyTitle', { defaultValue: 'Why this' })}
      subtitle={t('transparencySubtitle', {
        defaultValue:
          'Plain reasons for gates and hidden numbers. Download the same report as JSON or text.',
      })}
      footer={<AppLegalFooter showBuild buildLabel={APP_BUILD_LABEL} />}
    >
      <p>
        <Link href="/account" className="text-sm text-primary underline underline-offset-2">
          {t('transparencyBackAccount', { defaultValue: 'Back to Account' })}
        </Link>
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="min-h-[44px] tap-target"
          onClick={() =>
            downloadText(
              `mission-winning-why-this-${APP_BUILD_LABEL}.json`,
              formatTransparencyJson(report),
              'application/json'
            )
          }
        >
          {t('transparencyDownloadJson', { defaultValue: 'Download JSON' })}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-[44px] tap-target"
          onClick={() =>
            downloadText(
              `mission-winning-why-this-${APP_BUILD_LABEL}.txt`,
              formatTransparencyText(report),
              'text/plain'
            )
          }
        >
          {t('transparencyDownloadText', { defaultValue: 'Download text' })}
        </Button>
      </div>

      {report.rows.map((row) => (
        <Card key={row.id} className="border-2 border-border bg-card">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-baseline justify-between gap-2 text-base">
              <span>{row.title}</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                {statusLabel(row.status, t)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-foreground">{row.reason}</p>
            {row.details?.length ? (
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {row.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>
      ))}

      <Card className="border-2 border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">
            {t('transparencyEarnTitle', { defaultValue: 'Earn table (live local XP)' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="overflow-x-auto"
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- axe scrollable-region-focusable
            tabIndex={0}
            role="region"
            aria-label={t('transparencyEarnTitle', { defaultValue: 'Earn table (live local XP)' })}
          >
            <table className="w-full min-w-[480px] text-left text-xs">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="py-2 pr-3 font-semibold">
                    {t('transparencyEarnEvent', { defaultValue: 'Event' })}
                  </th>
                  <th className="py-2 pr-3 font-semibold">
                    {t('transparencyEarnPoints', { defaultValue: 'Points' })}
                  </th>
                  <th className="py-2 font-semibold">
                    {t('transparencyEarnCap', { defaultValue: 'Cap' })}
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.earnTable.map((e) => (
                  <tr key={e.actionId} className="border-b border-border">
                    <td className="py-2 pr-3">{e.event}</td>
                    <td className="py-2 pr-3">{e.points}</td>
                    <td className="py-2">{e.cap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PillarPageShell>
  );
}
