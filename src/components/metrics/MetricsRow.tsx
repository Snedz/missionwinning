'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { ScoreNumeral } from '@/components/ui/ScoreNumeral';
import { cn } from '@/lib/utils';
import type { BodyScores } from '@/lib/score';

interface MetricsRowProps {
  scores: BodyScores;
  /**
   * Mission Score. When present it leads the band in red — the handoff's Today
   * is one row of four, not a hero score sitting beside a row of three.
   */
  missionScore?: number;
  demo?: boolean;
  embedded?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function MetricsRow({
  scores,
  missionScore,
  demo,
  embedded,
  size = 'md',
}: MetricsRowProps) {
  const { t } = useTranslation();
  // A band never gets the 56px treatment — that is for a single hero figure.
  const numeralSize = size === 'lg' ? 'lg' : 'md';

  const cells = [
    ...(missionScore === undefined
      ? []
      : [
          {
            key: 'mission',
            label: t('todayMissionScore', { defaultValue: 'Mission Score' }),
            value: missionScore,
            caption: t('todayMissionScoreFromLogs', { defaultValue: 'From your logs' }),
            emphasis: true,
          },
        ]),
    {
      key: 'readiness',
      label: t('todayMetricReadiness', { defaultValue: 'Readiness' }),
      value: scores.readiness,
      caption: t(scores.readinessLabelKey, { defaultValue: scores.readinessLabelKey }),
      emphasis: false,
    },
    {
      key: 'strain',
      label: t('todayMetricStrain', { defaultValue: 'Strain' }),
      value: scores.strain,
      caption: t(scores.strainLabelKey, { defaultValue: scores.strainLabelKey }),
      emphasis: false,
    },
    {
      key: 'recovery',
      label: t('todayMetricRecovery', { defaultValue: 'Recovery' }),
      value: scores.recovery,
      caption: t(scores.recoveryLabelKey, { defaultValue: scores.recoveryLabelKey }),
      emphasis: false,
    },
  ];

  const grid = (
    <>
      {demo && (
        <p className="eyebrow mb-4">
          {t('todayMetricsDemoNote', { defaultValue: 'Preview — your scores update as you train' })}
        </p>
      )}
      {/* The score band: numerals divided by rules, not rings. The emerald /
          warn / info tones are gone — hue was carrying meaning the labels
          already carry, and this system has one colour, which the Mission Score
          spends. Dividers are 1px because they are internal; the 2px rule below
          is what closes the band.

          Two columns on a phone. Four 40px numerals across 375px leaves ~90px a
          cell and the captions shred. Borders are set per index rather than with
          `divide-x`, which follows DOM order and would draw a left border on the
          cell that starts the second row. */}
      <div
        className={cn(
          'grid grid-cols-2 border-b-2 border-border',
          cells.length === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'
        )}
      >
        {cells.map((cell, i) => (
          <ScoreNumeral
            key={cell.key}
            className={cn(
              'py-5 pe-5 sm:border-t-0',
              i % 2 === 1 && 'ps-5 border-s border-border',
              i >= 2 && 'border-t border-border',
              i > 0 && 'sm:ps-5 sm:border-s sm:border-border'
            )}
            label={cell.label}
            value={cell.value}
            caption={cell.caption}
            emphasis={cell.emphasis}
            size={numeralSize}
          />
        ))}
      </div>
    </>
  );

  if (embedded) {
    return <div className="pt-1">{grid}</div>;
  }

  return (
    <Card className="bg-card">
      <CardContent className="pt-6">{grid}</CardContent>
    </Card>
  );
}
