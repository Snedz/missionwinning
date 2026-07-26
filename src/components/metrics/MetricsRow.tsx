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
  /**
   * Logged sessions so far. Drives whether a figure is shown at all — omit it
   * to keep the old always-show-a-number behaviour (demos, computed previews).
   */
  sessions?: number;
  demo?: boolean;
  embedded?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function MetricsRow({
  scores,
  missionScore,
  sessions,
  demo,
  embedded,
  size = 'md',
}: MetricsRowProps) {
  const { t } = useTranslation();
  // A band never gets the 56px treatment — that is for a single hero figure.
  const numeralSize = size === 'lg' ? 'lg' : 'md';

  /*
   * An em-dash, and the condition that fills it.
   *
   * `ScoreNumeral` has always rendered `value={null}` as an em-dash, with a
   * comment explaining why — "a 0 reads as failure on day one when the real
   * state is not measured yet". But `BodyScores` are plain numbers, never null,
   * so nothing ever passed one: on day zero this band showed a Readiness of 42
   * computed from no history at all. A number nobody measured is a worse lie
   * than a zero, because it looks true.
   *
   * `sessions` undefined keeps the old behaviour for callers that are showing a
   * demo or a computed figure on purpose.
   */
  const measured = sessions === undefined || sessions > 0;
  // computeBodyScores needs more history than one session can give; a recovery
  // figure before then is arithmetic on nothing.
  const recoveryMeasured = sessions === undefined || sessions >= 3;

  const cells = [
    ...(missionScore === undefined
      ? []
      : [
          {
            key: 'mission',
            label: t('todayMissionScore', { defaultValue: 'Mission Score' }),
            value: measured ? missionScore : null,
            caption: measured
              ? t('todayMissionScoreFromLogs', { defaultValue: 'From your logs' })
              : t('todayScoreAfterFirstLog', { defaultValue: 'After your first log' }),
            emphasis: true,
          },
        ]),
    {
      key: 'readiness',
      label: t('todayMetricReadiness', { defaultValue: 'Readiness' }),
      value: measured ? scores.readiness : null,
      caption: measured
        ? t(scores.readinessLabelKey, { defaultValue: scores.readinessLabelKey })
        : t('todayScoreNotMeasured', { defaultValue: 'Not measured' }),
      emphasis: false,
    },
    {
      key: 'strain',
      label: t('todayMetricStrain', { defaultValue: 'Strain' }),
      value: measured ? scores.strain : null,
      caption: measured
        ? t(scores.strainLabelKey, { defaultValue: scores.strainLabelKey })
        : t('todayScoreAfterFirstLog', { defaultValue: 'After your first log' }),
      emphasis: false,
    },
    {
      key: 'recovery',
      label: t('todayMetricRecovery', { defaultValue: 'Recovery' }),
      value: recoveryMeasured ? scores.recovery : null,
      caption: recoveryMeasured
        ? t(scores.recoveryLabelKey, { defaultValue: scores.recoveryLabelKey })
        : t('todayScoreNeedsSessions', { defaultValue: 'Needs 3 sessions' }),
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
