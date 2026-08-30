'use client';
/**
 * Page: /account/transparency — Visibility report (downloadable).
 * See: docs/TRANSPARENCY_PLAN.md, src/lib/transparency/INDEX.md
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';
import { TransparencyDownloads } from '@/components/transparency/TransparencyDownloads';
import { APP_BUILD_LABEL } from '@/lib/buildInfo';
import { useTransparencyReport } from '@/hooks/useTransparencyReport';
import type { TransparencyStatus } from '@/lib/transparency/types';

function statusKey(status: TransparencyStatus): string {
  if (status === 'open') return 'transparencyStatusOpen';
  if (status === 'gated') return 'transparencyStatusGated';
  if (status === 'hidden') return 'transparencyStatusHidden';
  if (status === 'limited') return 'transparencyStatusLimited';
  if (status === 'skipped') return 'transparencyStatusSkipped';
  return 'transparencyStatusInfo';
}

const STATUS_DEFAULTS: Record<string, string> = {
  transparencyStatusOpen: 'Not limited',
  transparencyStatusGated: 'Limited',
  transparencyStatusHidden: 'Hidden',
  transparencyStatusLimited: 'Limited',
  transparencyStatusSkipped: 'Skipped',
  transparencyStatusInfo: 'Explained',
};

export function TransparencyPage() {
  const { t } = useTranslation();
  const report = useTransparencyReport();
  const summary =
    report.limitsApply === 0
      ? t('transparencyNoLimits', { defaultValue: 'No limits apply' })
      : t('transparencyLimitsApply', {
          count: report.limitsApply,
          defaultValue: '{{count}} limits apply',
        });

  return (
    <PillarPageShell
      icon={FileText}
      eyebrow={t('transparencyEyebrow', { defaultValue: 'Account' })}
      title={t('transparencyTitle', { defaultValue: 'Visibility' })}
      subtitle={t('transparencySubtitle', {
        defaultValue:
          'See if anything is limited, the exact reason, and download the full report (JSON + text).',
      })}
      footer={<AppLegalFooter showBuild buildLabel={APP_BUILD_LABEL} />}
    >
      <p>
        <Link href="/account" className="text-sm text-primary underline underline-offset-2">
          {t('transparencyBackAccount', { defaultValue: 'Back to Account' })}
        </Link>
        {' · '}
        <Link
          href="/account/under-the-hood"
          className="text-sm text-primary underline underline-offset-2"
        >
          {t('hoodPageTitle', { defaultValue: 'Under the Hood' })}
        </Link>
      </p>

      <p className="text-base font-semibold text-foreground">{summary}</p>

      <TransparencyDownloads report={report} />

      {report.rows.map((row) => (
        <div key={row.id} className="house-card space-y-3" data-testid="visibility-report-row">
          <h3 className="flex flex-wrap items-baseline justify-between gap-2 text-base font-semibold">
            <span>{row.title}</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              {t(statusKey(row.status), {
                defaultValue: STATUS_DEFAULTS[statusKey(row.status)],
              })}
            </span>
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-foreground">{row.reason}</p>
            {row.details?.length ? (
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {row.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ))}
    </PillarPageShell>
  );
}
