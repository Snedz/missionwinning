'use client';

import Link from 'next/link';
import { Share2, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDuration } from '@/lib/utils';
import type { WorkoutVictorySummary } from '@/lib/workoutVictory';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';

type Props = {
  open: boolean;
  summary: WorkoutVictorySummary | null;
  onOpenChange: (open: boolean) => void;
  onViewToday: () => void;
  onViewHistory: () => void;
};

export function WorkoutVictorySheet({
  open,
  summary,
  onOpenChange,
  onViewToday,
  onViewHistory,
}: Props) {
  const { t } = useTranslation();
  const units = useUnits();
  const unitLabel = weightUnitLabel(units);

  if (!summary) return null;

  const shareText = t('victoryShareText', {
    name: summary.workoutName,
    volume: summary.totalVolume.toLocaleString(),
    unit: unitLabel,
    sets: summary.setCount,
    streak: summary.streak,
    defaultValue: `Mission complete: ${summary.workoutName} — ${summary.totalVolume.toLocaleString()} ${unitLabel}, ${summary.setCount} sets${summary.streak > 0 ? `, ${summary.streak}-day streak` : ''}. #MissionWinning`,
  });

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: t('victoryTitle', { defaultValue: 'Mission complete' }),
          text: shareText,
          url: typeof window !== 'undefined' ? window.location.origin : undefined,
        });
        return;
      } catch {
        // user cancelled or failed
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareText);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-primary/30 bg-gradient-to-b from-card to-primary/5">
        <DialogHeader className="text-center space-y-3 victory-reveal">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brass/20 border border-brass/40 victory-reveal">
            <Trophy className="h-8 w-8 text-brass" />
          </div>
          <DialogTitle className="text-2xl">
            {t('victoryTitle', { defaultValue: 'Mission complete' })}
          </DialogTitle>
          <DialogDescription className="text-base text-foreground/80">
            {summary.workoutName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {t('victoryVolume', { defaultValue: 'Volume' })}
            </p>
            <p className="text-xl font-bold tabular-nums text-primary">
              {summary.totalVolume.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">{unitLabel}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {t('victorySets', { defaultValue: 'Sets' })}
            </p>
            <p className="text-xl font-bold tabular-nums">{summary.setCount}</p>
            <p className="text-[10px] text-muted-foreground">
              {formatDuration(summary.durationSeconds)}
            </p>
          </div>
        </div>

        {summary.bodyDelta && (
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-border/40 bg-muted/15 px-3 py-2 text-[11px] tabular-nums">
            <span className="text-muted-foreground uppercase tracking-wide me-1">
              {t('victoryBodyDeltaLabel', { defaultValue: 'What changed' })}
            </span>
            <span className="text-status-warn/90">
              {t('victoryReadinessDelta', {
                delta:
                  summary.bodyDelta.readiness > 0
                    ? `+${summary.bodyDelta.readiness}`
                    : `${summary.bodyDelta.readiness}`,
                defaultValue: `Readiness ${
                  summary.bodyDelta.readiness > 0
                    ? `+${summary.bodyDelta.readiness}`
                    : summary.bodyDelta.readiness
                }`,
              })}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-status-danger/90">
              {t('victoryStrainDelta', {
                delta:
                  summary.bodyDelta.strain > 0
                    ? `+${summary.bodyDelta.strain}`
                    : `${summary.bodyDelta.strain}`,
                defaultValue: `Strain ${
                  summary.bodyDelta.strain > 0
                    ? `+${summary.bodyDelta.strain}`
                    : summary.bodyDelta.strain
                }`,
              })}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-primary/90">
              {t('victoryRecoveryDelta', {
                delta:
                  summary.bodyDelta.recovery > 0
                    ? `+${summary.bodyDelta.recovery}`
                    : `${summary.bodyDelta.recovery}`,
                defaultValue: `Recovery ${
                  summary.bodyDelta.recovery > 0
                    ? `+${summary.bodyDelta.recovery}`
                    : summary.bodyDelta.recovery
                }`,
              })}
            </span>
          </div>
        )}

        {summary.progressionInsight && (
          <p className="text-center text-sm text-primary/90 px-2 leading-relaxed">
            {summary.progressionInsight}
          </p>
        )}

        {summary.streak > 0 && (
          <p className="text-center text-sm text-primary/90">
            {t('victoryStreak', {
              count: summary.streak,
              defaultValue: `${summary.streak}-day training streak — keep the path alive`,
            })}
          </p>
        )}

        {summary.nextAction && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2 text-center">
            <p className="text-[10px] uppercase tracking-widest text-primary font-medium">
              {t('victoryNextLabel', { defaultValue: 'One next step' })}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t(summary.nextAction.reasonKey, {
                defaultValue: summary.nextAction.defaultReason,
              })}
            </p>
            <Button asChild className="w-full primary-action">
              <Link href={summary.nextAction.href} onClick={() => onOpenChange(false)}>
                {t(summary.nextAction.labelKey, {
                  defaultValue: summary.nextAction.defaultLabel,
                })}
              </Link>
            </Button>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button variant="outline" className="w-full" onClick={onViewToday}>
            {t('victoryBackToday', { defaultValue: 'Back to Today' })}
          </Button>
          <Button variant="ghost" className="w-full" onClick={onViewHistory}>
            {t('victoryViewHistory', { defaultValue: 'View history & charts' })}
          </Button>
          <Button variant="ghost" className="w-full gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            {t('victoryShare', { defaultValue: 'Share win' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
