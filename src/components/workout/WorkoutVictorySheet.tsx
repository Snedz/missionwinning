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
      <DialogContent className="sm:max-w-md border-emerald-500/30 bg-gradient-to-b from-card to-emerald-950/20">
        <DialogHeader className="text-center space-y-3 victory-reveal">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 victory-reveal">
            <Trophy className="h-8 w-8 text-amber-400" />
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
            <p className="text-xl font-bold tabular-nums text-emerald-400">
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
            <span className="text-amber-300/90">
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
            <span className="text-rose-300/90">
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
            <span className="text-emerald-300/90">
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

        {summary.streak > 0 && (
          <p className="text-center text-sm text-emerald-400/90">
            {t('victoryStreak', {
              count: summary.streak,
              defaultValue: `${summary.streak}-day training streak — keep the path alive`,
            })}
          </p>
        )}

        <p className="text-center text-xs text-muted-foreground leading-relaxed px-2">
          {t('victorySynergyHint', {
            defaultValue: 'Log Fuel, Move, Mind, or Learn today to boost Mission Score synergy.',
          })}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/nutrition" onClick={() => onOpenChange(false)}>
              {t('coachActionLogNutrition', { defaultValue: 'Log Fuel' })}
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/mind" onClick={() => onOpenChange(false)}>
              {t('coachActionOpenMind', { defaultValue: 'Open Mind' })}
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/move" onClick={() => onOpenChange(false)}>
              {t('coachActionOpenMove', { defaultValue: 'Open Move' })}
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/learn" onClick={() => onOpenChange(false)}>
              {t('coachActionOpenLearn', { defaultValue: 'Open Learn' })}
            </Link>
          </Button>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button className="w-full primary-action" onClick={onViewToday}>
            {t('victoryBackToday', { defaultValue: 'Back to Today' })}
          </Button>
          <Button variant="outline" className="w-full" onClick={onViewHistory}>
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
