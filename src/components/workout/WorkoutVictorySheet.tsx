'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ImageIcon, Share2 } from 'lucide-react';
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
import { formatDuration } from '@/lib/utils';
import type { WorkoutVictorySummary } from '@/lib/workout/workoutVictory';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import { track } from '@/lib/analytics';
import { upsertTodayPartial } from '@/lib/mindCheckIns';
import { getCachedReferralCode } from '@/lib/referral';
import { SessionDebriefCard } from '@/components/workout/SessionDebriefCard';
import type { Debrief } from '@/lib/coach/debrief';
import {
  buildVictoryCardData,
  renderShareCard,
  shareCardImage,
} from '@/lib/share/shareCard';

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

  const handleShare = async () => {
    const refCode = getCachedReferralCode();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.missionwinning.com';
    const shareUrl = refCode
      ? `${origin}/?ref=${encodeURIComponent(refCode)}`
      : `${origin}/?utm_source=share&utm_medium=victory`;
    const fullText = `${shareText} ${shareUrl}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: t('victoryTitle', { defaultValue: 'Session locked' }),
          text: fullText,
          url: shareUrl,
        });
        track('workout_shared', { method: 'shared' });
        return;
      } catch {
        // user cancelled or failed
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(fullText);
      track('workout_shared', { method: 'copied' });
    } else {
      track('workout_shared', { method: 'failed' });
    }
  };

  // The image variant of share: rendered on this device, sent only by choice.
  const handleShareCard = async () => {
    const refCode = getCachedReferralCode();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.missionwinning.com';
    const shareUrl = refCode
      ? `${origin}/?ref=${encodeURIComponent(refCode)}`
      : `${origin}/?utm_source=share&utm_medium=victory-card`;
    const card = buildVictoryCardData(summary, debrief?.records ?? [], unitLabel);
    const blob = await renderShareCard(card);
    if (!blob) {
      track('share_card_generated', { surface: 'victory', method: 'failed' });
      return;
    }
    const method = await shareCardImage(blob, shareText, shareUrl);
    track('share_card_generated', { surface: 'victory', method });
  };

  const hasCoachNext = summary.nextAction?.href?.includes('/coach');

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

        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="border-2 border-border bg-background p-3 text-center">
            <p className="text-xs font-medium text-muted-foreground">
              {t('victoryVolume', { defaultValue: 'Volume' })}
            </p>
            <p className="text-xl font-semibold tabular-nums text-foreground">
              {fmt.num(summary.totalVolume)}
            </p>
            <p className="text-xs text-muted-foreground">{unitLabel}</p>
          </div>
          <div className="border-2 border-border bg-background p-3 text-center">
            <p className="text-xs font-medium text-muted-foreground">
              {t('victorySets', { defaultValue: 'Sets' })}
            </p>
            <p className="text-xl font-semibold tabular-nums">{summary.setCount}</p>
            <p className="text-xs text-muted-foreground">
              {formatDuration(summary.durationSeconds)}
            </p>
          </div>
        </div>

        {/*
          Feel scale: one 2px-ruled strip, five full-height cells — same treatment
          as session check-in (`.155`). Soft `bg-muted` on `bg-card` was invisible
          at rest; selected/hover uses primary fill only.
        */}
        <div className="border-2 border-border bg-background px-3 py-3 space-y-2">
          <p className="text-center text-xs text-muted-foreground">
            {feelSaved
              ? t('victoryFeelSaved', { defaultValue: 'Logged — feeds readiness on Today.' })
              : t('victoryFeelPrompt', {
                  defaultValue: 'How do you feel after this session?',
                })}
          </p>
          {!feelSaved && (
            <>
              <div
                className="flex border-2 border-border"
                role="group"
                aria-label={t('victoryFeelPrompt', {
                  defaultValue: 'How do you feel after this session?',
                })}
              >
                {[1, 2, 3, 4, 5].map((n, i) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => saveFeel(n)}
                    className={`flex-1 min-h-[52px] tap-target text-sm font-semibold text-foreground bg-card hover:bg-primary-fill hover:text-primary-foreground transition-colors ${
                      i > 0 ? 'border-s-2 border-border' : ''
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
                <span>{t('victoryFeelLow', { defaultValue: 'Drained' })}</span>
                <span>{t('victoryFeelHigh', { defaultValue: 'Energized' })}</span>
              </div>
            </>
          )}
        </div>

        {summary.bodyDelta && (
          <div className="flex flex-wrap items-center justify-center gap-2 border-2 border-border bg-background px-3 py-2 text-xs tabular-nums">
            <span className="text-muted-foreground me-1">
              {t('victoryBodyDeltaLabel', { defaultValue: 'What changed' })}
            </span>
            <span className="text-status-warn">
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
            <span className="text-status-danger">
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
            <span className="text-primary">
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

        {debrief && <SessionDebriefCard debrief={debrief} fragments={fragments} />}

        {summary.progressionInsight && (
          <p className="text-center text-sm text-muted-foreground px-2 leading-relaxed">
            {summary.progressionInsight}
          </p>
        )}

        {summary.streak > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            {t('victoryStreak', {
              count: summary.streak,
              defaultValue: `${summary.streak}-day streak — nice consistency`,
            })}
          </p>
        )}

        {summary.nextAction && (
          <div className="border-2 border-primary bg-tint p-3 space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              {t('victoryNextLabel', { defaultValue: 'Next' })}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
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

        <DialogFooter className="flex-col sm:flex-col gap-2 pt-1">
          {!summary.nextAction && (
            <Button variant="outline" className="w-full" onClick={onViewToday}>
              {t('victoryBackToday', { defaultValue: 'Back to Today' })}
            </Button>
          )}
          {hasCoachNext && (
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
            <span aria-hidden>·</span>
            <button
              type="button"
              className="inline-flex items-center gap-1 hover:text-foreground underline-offset-2 hover:underline"
              onClick={handleShareCard}
            >
              <ImageIcon className="h-3 w-3" />
              {t('victoryShareCard', { defaultValue: 'Share card' })}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
