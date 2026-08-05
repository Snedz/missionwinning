'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { WorkoutVictorySummary } from '@/lib/workout/workoutVictory';
import {
  formatProgressionInsight,
  progressionInsightKey,
  shouldShowVictoryBackTodaySecondary,
} from '@/lib/workout/workoutVictory';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import { track } from '@/lib/analytics';
import { upsertTodayPartial } from '@/lib/mindCheckIns';
import { getCachedReferralCode } from '@/lib/referral';
import { SessionDebriefCard } from '@/components/workout/SessionDebriefCard';
import { VictoryFeelStrip } from '@/components/workout/VictoryFeelStrip';
import { VictoryBodyDeltaStrip } from '@/components/workout/VictoryBodyDeltaStrip';
import { VictoryStatsStrip } from '@/components/workout/VictoryStatsStrip';
import { VictoryNextActionStrip } from '@/components/workout/VictoryNextActionStrip';
import { VictoryRewardsLine } from '@/components/rewards/VictoryRewardsLine';
import type { Debrief } from '@/lib/coach/debrief';
import {
  buildVictoryCardData,
  renderShareCard,
} from '@/lib/share/shareCard';
import {
  buildVictorySharePayload,
  nextVictoryShareAfterFile,
  nextVictoryShareAfterText,
} from '@/lib/share/victoryShare';

type Props = {
  open: boolean;
  summary: WorkoutVictorySummary | null;
  onOpenChange: (open: boolean) => void;
  onViewToday: () => void;
  onViewHistory: () => void;
  /** Composed by the caller, which owns history — see buildDebrief. */
  debrief?: Debrief | null;
  /** The athlete's own journal fragments — rendered before the debrief lines. */
  fragments?: string[];
  /**
   * `CompletedWorkoutLog.id` of the session this sheet is celebrating, so a feel
   * tap lands on that session's journal entry. Without it `setJournalFeel` had no
   * caller and the "Feel N/5" badge in History could never be populated — the
   * `.184` write-only defect, live again.
   */
  workoutId?: string;
};

/** D2 Victory ritual — lock scale + volume + one next action (paper/ink). */
export function WorkoutVictorySheet({
  open,
  summary,
  onOpenChange,
  onViewToday,
  onViewHistory,
  debrief,
  fragments,
  workoutId,
}: Props) {
  const { t } = useTranslation();
  const fmt = useLocaleFormat();
  const units = useUnits();
  const unitLabel = weightUnitLabel(units);
  const [feelSaved, setFeelSaved] = useState(false);

  if (!summary) return null;

  const shareText = t('victoryShareText', {
    name: summary.workoutName,
    volume: fmt.num(summary.totalVolume),
    unit: unitLabel,
    sets: summary.setCount,
    streak: summary.streak,
    defaultValue: `Session done: ${summary.workoutName} — ${fmt.num(summary.totalVolume)} ${unitLabel}, ${summary.setCount} sets${summary.streak > 0 ? `, ${summary.streak}-day streak` : ''}.`,
  });

  /**
   * One Share control: prefer the on-device card when the platform can share
   * files; otherwise text/clipboard. Dual Share · Share card competed with the
   * primary Coach/train exit (`.422`). Cancel stops — no silent PNG download.
   * Fallthrough ladder: `victoryShare` helpers (.452).
   */
  const handleShare = async () => {
    const refCode = getCachedReferralCode();
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://www.missionwinning.com';
    const { shareUrl, fullText } = buildVictorySharePayload({
      origin,
      refCode,
      shareText,
    });

    const card = buildVictoryCardData(summary, debrief?.records ?? [], unitLabel);
    const blob = await renderShareCard(card);
    let fileResult: 'shared' | 'cancelled' | 'unavailable' = 'unavailable';
    if (blob && typeof navigator !== 'undefined' && navigator.share) {
      const file = new File([blob], 'mission-winning.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text: fullText });
          track('share_card_generated', { surface: 'victory', method: 'shared' });
          fileResult = 'shared';
        } catch {
          fileResult = 'cancelled';
        }
      }
    }
    if (nextVictoryShareAfterFile(fileResult) === 'done') return;

    let textResult: 'shared' | 'cancelled' | 'unavailable' = 'unavailable';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: t('victoryTitle', { defaultValue: 'Session locked' }),
          text: fullText,
          url: shareUrl,
        });
        track('workout_shared', { method: 'shared' });
        textResult = 'shared';
      } catch {
        textResult = 'cancelled';
      }
    }
    const canClipboard = Boolean(
      typeof navigator !== 'undefined' && navigator.clipboard?.writeText
    );
    const next = nextVictoryShareAfterText(textResult, canClipboard);
    if (next === 'shared') return;
    if (next === 'clipboard') {
      await navigator.clipboard.writeText(fullText);
      track('workout_shared', { method: 'copied' });
      return;
    }
    track('workout_shared', { method: 'failed' });
  };

  const showBackTodaySecondary = shouldShowVictoryBackTodaySecondary(
    summary.nextAction?.href
  );

  const saveFeel = (energy: number) => {
    upsertTodayPartial({ energy, mood: energy });
    // The journal entry for THIS session, not just today's check-in. Both are
    // wanted: the check-in steers the next plan, the feel annotates the entry.
    if (workoutId) {
      void import('@/lib/journal/journalStore').then((m) => m.setJournalFeel(workoutId, energy));
    }
    setFeelSaved(true);
    track('readiness_checkin_completed', { adjusted: true, source: 'victory' });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setFeelSaved(false);
        onOpenChange(next);
      }}
    >
      {/* The dialog primitive sets no max height, so this grew past the viewport once
          the debrief was added and the "Back to Today" footer became visible but
          unreachable — the hero e2e caught it as a click timeout, not a render error.
          dvh, not vh, so mobile browser chrome does not eat the footer. */}
      <DialogContent className="victory-lock sm:max-w-md md:max-w-lg xl:max-w-xl border-2 border-border bg-card max-h-[90dvh] overflow-y-auto">
        <DialogHeader className="text-center space-y-3 victory-reveal">
          <div className="mx-auto relative h-16 w-16 overflow-hidden border-2 border-border bg-card">
            <Image
              src="/brand/mascot/scout-celebrate.webp"
              alt=""
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
            <span className="sr-only">
              {t('victoryScoutCue', { defaultValue: 'Session saved.' })}
            </span>
          </div>
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            {t('victoryTitle', { defaultValue: 'Session locked' })}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground leading-relaxed">
            {summary.workoutName}
          </DialogDescription>
        </DialogHeader>

        <VictoryStatsStrip
          totalVolume={summary.totalVolume}
          setCount={summary.setCount}
          durationSeconds={summary.durationSeconds}
          unitLabel={unitLabel}
          formatVolume={(n) => fmt.num(n)}
        />

        <VictoryRewardsLine active={open} />

        <VictoryFeelStrip feelSaved={feelSaved} onSaveFeel={saveFeel} />

        {summary.bodyDelta ? <VictoryBodyDeltaStrip bodyDelta={summary.bodyDelta} /> : null}

        {debrief && <SessionDebriefCard debrief={debrief} fragments={fragments} />}

        {summary.progressionInsight ? (
          <p className="text-center text-sm text-muted-foreground px-2 leading-relaxed">
            {t(progressionInsightKey(summary.progressionInsight), {
              step: summary.progressionInsight.step,
              unit: summary.progressionInsight.unit,
              name: summary.progressionInsight.exerciseName,
              reps: summary.progressionInsight.reps,
              weight: summary.progressionInsight.weight,
              defaultValue: formatProgressionInsight(summary.progressionInsight),
            })}
          </p>
        ) : null}

        {summary.streak > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            {t('victoryStreak', {
              count: summary.streak,
              defaultValue: `${summary.streak}-day streak — nice consistency`,
            })}
          </p>
        )}

        {summary.nextAction ? (
          <VictoryNextActionStrip
            nextAction={summary.nextAction}
            onNavigate={() => onOpenChange(false)}
          />
        ) : null}

        <DialogFooter className="flex-col sm:flex-col gap-2 pt-1">
          {!summary.nextAction && (
            <Button variant="outline" className="w-full" onClick={onViewToday}>
              {t('victoryBackToday', { defaultValue: 'Back to Today' })}
            </Button>
          )}
          {showBackTodaySecondary && (
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
              onClick={onViewToday}
            >
              {t('victoryBackToday', { defaultValue: 'Back to Today' })}
            </button>
          )}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <button
              type="button"
              className="hover:text-foreground underline-offset-2 hover:underline"
              onClick={onViewHistory}
            >
              {t('victoryViewHistory', { defaultValue: 'History' })}
            </button>
            <span aria-hidden>·</span>
            <button
              type="button"
              className="inline-flex items-center gap-1 hover:text-foreground underline-offset-2 hover:underline"
              onClick={handleShare}
            >
              <Share2 className="h-3 w-3" />
              {t('victoryShare', { defaultValue: 'Share' })}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
