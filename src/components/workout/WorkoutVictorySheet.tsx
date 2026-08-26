'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
import { formatWorkoutVolumeDisplay } from '@/lib/workout/volumeDisplay';
import {
  formatProgressionInsight,
  progressionInsightKey,
  shouldShowVictoryBackTodaySecondary,
} from '@/lib/workout/workoutVictory';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import { useHonorSavedRoutine } from '@/hooks/useHonorSavedRoutine';
import { SaveHonoredRoutineDoor } from '@/components/workout/SaveHonoredRoutineDoor';
import { useWorkoutStore } from '@/store/workoutStore';
import { templateFromCompletedLog } from '@/lib/workout/historyRetrain';
import { decideStartAgain } from '@/lib/workout/startAgain';
import { toast } from '@/hooks/use-toast';
import { track } from '@/lib/analytics';
import { upsertTodayPartial } from '@/lib/mindCheckIns';
import { getCachedReferralCode } from '@/lib/referral';
import { SessionDebriefCard } from '@/components/workout/SessionDebriefCard';
import { VictoryFeelStrip } from '@/components/workout/VictoryFeelStrip';
import { VictoryBodyDeltaStrip } from '@/components/workout/VictoryBodyDeltaStrip';
import { VictoryStatsStrip } from '@/components/workout/VictoryStatsStrip';
import { VictoryReceiptStrip } from '@/components/workout/VictoryReceiptStrip';
import { SessionJotField } from '@/components/workout/SessionJotField';
import { HistorySessionName } from '@/components/history/HistorySessionName';
import { historySessionLabel } from '@/lib/workout/nameFinishedSession';
import { VictoryNextActionStrip } from '@/components/workout/VictoryNextActionStrip';
import { FieldTestReceiptStrip } from '@/components/workout/FieldTestReceiptStrip';
import { VictorySecondaryLinks } from '@/components/workout/VictorySecondaryLinks';
import { VictoryRewardsLine } from '@/components/rewards/VictoryRewardsLine';
import { buildVictorySecondaryLinks } from '@/lib/workout/victorySecondaryLinks';
import { isSurfaceEnabled } from '@/lib/surface';
import { parseNutritionLog } from '@/lib/nutritionQuickLog';
import { readRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { localDateKey } from '@/lib/time/localDate';
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
import {
  buildCloseReceiptDownload,
  triggerCloseReceiptDownload,
} from '@/lib/workout/victoryReceipt';

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
  /** Field test only — starts the same five-event template. */
  onRunFieldTestAgain?: () => void;
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
  onRunFieldTestAgain,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const fmt = useLocaleFormat();
  const units = useUnits();
  const unitLabel = weightUnitLabel(units);
  const honor = useHonorSavedRoutine();
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const setHistorySessionNote = useWorkoutStore((s) => s.setHistorySessionNote);
  const nameFinishedHistoryLog = useWorkoutStore((s) => s.nameFinishedHistoryLog);
  const finishedLog = workoutId
    ? workoutHistory.find((row) => row.id === workoutId)
    : undefined;
  const startAgain = decideStartAgain({ log: finishedLog, active: activeWorkout });
  const [feelSaved, setFeelSaved] = useState(false);
  /** Share ladder full fail only — never cancel. Design review 2A. */
  const [shareFailHint, setShareFailHint] = useState(false);

  const secondaryLinks = useMemo(() => {
    if (!summary?.nextAction) return [];
    let proteinLoggedToday = false;
    try {
      const today = localDateKey();
      const rows = parseNutritionLog(readRaw(STORAGE_KEYS.nutritionLog));
      proteinLoggedToday = rows.some(
        (r) => r.date === today && (Number(r.protein) || 0) > 0
      );
    } catch {
      proteinLoggedToday = false;
    }
    return buildVictorySecondaryLinks({
      primaryHref: summary.nextAction.href,
      proteinLoggedToday,
      strainDelta: summary.bodyDelta?.strain,
      workingMuscleGroups: summary.workingMuscleGroups,
      moveSurfaceEnabled: isSurfaceEnabled('move'),
    });
  }, [summary]);

  if (!summary) return null;

  const volume = formatWorkoutVolumeDisplay(
    summary.totalVolume,
    summary.workingReps,
    unitLabel,
    (n) => fmt.num(n)
  );
  const shareText = t('victoryShareText', {
    name: summary.workoutName,
    volume: volume.value,
    unit: volume.unit,
    sets: summary.setCount,
    streak: summary.streak,
    defaultValue: `Session done: ${summary.workoutName} — ${volume.value} ${volume.unit}, ${summary.setCount} sets${summary.streak > 0 ? `, ${summary.streak}-day streak` : ''}.`,
  });

  /**
   * One Share control: prefer the on-device card when the platform can share
   * files; otherwise text/clipboard. Dual Share · Share card competed with the
   * primary Coach/train exit (`.422`). Cancel stops — no silent PNG download.
   * Fallthrough ladder: `victoryShare` helpers (.452).
   */
  const handleShare = async () => {
    setShareFailHint(false);
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
      try {
        await navigator.clipboard.writeText(fullText);
        track('workout_shared', { method: 'copied' });
        return;
      } catch {
        // Clipboard denied — fall through to fail recovery.
      }
    }
    track('workout_shared', { method: 'failed' });
    setShareFailHint(true);
  };

  const historyLog = workoutId
    ? workoutHistory.find((row) => row.id === workoutId)
    : undefined;
  const sessionNote = historyLog?.sessionNote ?? '';

  const handleSaveReceipt = () => {
    if (!summary.receipt) return;
    const built = buildCloseReceiptDownload({
      workoutName: summary.workoutName,
      durationSeconds: summary.durationSeconds,
      setCount: summary.setCount,
      volumeLabel: `${volume.value} ${volume.unit}`,
      receipt: summary.receipt,
      dateKey: localDateKey(),
      sessionNote,
    });
    if (!built.ok) return;
    triggerCloseReceiptDownload(built);
  };

  const showBackTodaySecondary = shouldShowVictoryBackTodaySecondary(
    summary.nextAction?.href
  );

  const detailsBlock = (
    <>
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
            defaultValue: `${summary.streak}-day streak`,
          })}
        </p>
      )}
    </>
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
        if (!next) {
          setFeelSaved(false);
          setShareFailHint(false);
        }
        onOpenChange(next);
      }}
    >
      {/* The dialog primitive sets no max height, so this grew past the viewport
          once (hero e2e click timeout on an unreachable footer). dvh, not vh.
          The one red Next must not live in the scroll — first-session rewards +
          feel + stats already push it below 390×844. Dock it. */}
      <DialogContent className="victory-lock sm:max-w-md md:max-w-lg xl:max-w-xl flex flex-col border-2 border-border bg-card max-h-[90dvh] overflow-hidden p-0">
        <div data-testid="victory-scroll" className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
        <DialogHeader className="text-center space-y-3 victory-reveal">
          <div className="mx-auto relative h-16 w-16 overflow-hidden border-2 border-border bg-card">
            <Image
              src="/brand/mascot/kalligator-celebrate.webp"
              alt=""
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
            <span className="sr-only">
              {t('victoryMascotCue', { defaultValue: 'Session saved.' })}
            </span>
          </div>
          <DialogTitle className="font-display text-2xl font-extrabold tracking-[-0.015em]">
            {t('victoryTitle', { defaultValue: 'Session locked' })}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {finishedLog
              ? historySessionLabel(finishedLog, fmt.longDate(finishedLog.completedAt))
              : summary.workoutName}
          </DialogDescription>
        </DialogHeader>

        <VictoryStatsStrip
          totalVolume={summary.totalVolume}
          workingReps={summary.workingReps}
          setCount={summary.setCount}
          durationSeconds={summary.durationSeconds}
          unitLabel={unitLabel}
          formatVolume={(n) => fmt.num(n)}
          vsLast={summary.receipt?.vsLast ?? null}
        />

        {summary.receipt ? (
          <VictoryReceiptStrip
            receipt={summary.receipt}
            unitLabel={unitLabel}
            onSaveReceipt={handleSaveReceipt}
          />
        ) : null}

        {summary.receipt && workoutId && finishedLog && !finishedLog.deletedAt ? (
          <HistorySessionName
            key={finishedLog.id + (finishedLog.sessionTitle ?? '')}
            sessionId={finishedLog.id}
            history={workoutHistory}
            live={activeWorkout}
            dateText={fmt.longDate(finishedLog.completedAt)}
            onSave={(sessionId, title) => {
              nameFinishedHistoryLog(sessionId, title);
            }}
          />
        ) : null}

        {summary.receipt ? (
          <SessionJotField
            value={sessionNote}
            onChange={(note) => {
              if (workoutId) setHistorySessionNote(workoutId, note);
            }}
          />
        ) : null}

        {workoutId ? (
          <Button
            type="button"
            variant="outline"
            className="w-full min-h-[44px] tap-target"
            data-testid="victory-save-routine"
            onClick={() => {
              const log = workoutHistory.find((row) => row.id === workoutId);
              const template = log ? templateFromCompletedLog(log) : null;
              const opened = honor.requestSave({
                name: template?.name ?? summary.workoutName,
                exercises: template?.exercises,
              });
              if (opened.kind === 'empty') {
                toast({
                  title: t('honorSaveEmpty', { defaultValue: 'Nothing to save' }),
                  description: t('honorSaveEmptyDesc', {
                    defaultValue: 'A routine needs a name and at least one lift.',
                  }),
                  variant: 'destructive',
                });
              }
            }}
          >
            {t('honorSaveAsRoutine', { defaultValue: 'Save as routine' })}
          </Button>
        ) : null}

        {startAgain.kind !== 'empty' ? (
          <Button
            type="button"
            variant="outline"
            className="w-full min-h-[44px] tap-target"
            data-testid="victory-start-again"
            onClick={() => {
              const next = decideStartAgain({
                log: finishedLog,
                active: useWorkoutStore.getState().activeWorkout,
              });
              if (next.kind === 'empty') return;
              onOpenChange(false);
              if (next.kind === 'start') {
                startWorkout(next.name, next.exercises);
                track('history_train_again', {
                  exerciseCount: next.exercises.length,
                  from: 'receipt',
                });
              }
              router.push('/active');
            }}
          >
            {t('historyTrainAgain', { defaultValue: 'Start this again' })}
          </Button>
        ) : null}

        <details className="group border-2 border-border bg-card">
          <summary
            className="flex min-h-[44px] cursor-pointer list-none items-center justify-center px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden"
            data-testid="victory-show-all"
          >
            {t('todayShowAll', { defaultValue: 'Show all' })}
          </summary>
          <div className="space-y-4 border-t-2 border-border p-4">

        {summary.fieldTest ? (
          <FieldTestReceiptStrip
            receipt={summary.fieldTest}
            units={units}
            onRunAgain={
              onRunFieldTestAgain
                ? () => {
                    onOpenChange(false);
                    onRunFieldTestAgain();
                  }
                : undefined
            }
          />
        ) : null}

        <VictoryRewardsLine active={open} />

        <VictoryFeelStrip feelSaved={feelSaved} onSaveFeel={saveFeel} />

        <VictorySecondaryLinks
          links={secondaryLinks}
          onNavigate={() => onOpenChange(false)}
        />

        {detailsBlock}

        <DialogFooter className="flex-col sm:flex-col gap-2 pt-1">
          {showBackTodaySecondary && (
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline min-h-[44px] inline-flex items-center tap-target"
              onClick={onViewToday}
            >
              {t('victoryBackToday', { defaultValue: 'Back to Today' })}
            </button>
          )}
          <div className="flex flex-col items-center gap-1">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              <button
                type="button"
                className="hover:text-foreground underline-offset-2 hover:underline min-h-[44px] inline-flex items-center tap-target"
                onClick={onViewHistory}
              >
                {t('victoryViewHistory', { defaultValue: 'History' })}
              </button>
              <span aria-hidden>·</span>
              <button
                type="button"
                className="inline-flex items-center gap-1 hover:text-foreground underline-offset-2 hover:underline min-h-[44px] tap-target"
                onClick={handleShare}
              >
                <Share2 className="h-3 w-3" />
                {t('victoryShare', { defaultValue: 'Share' })}
              </button>
            </div>
            {shareFailHint ? (
              <p
                role="status"
                className="max-w-xs text-center text-[11px] leading-relaxed text-muted-foreground"
                data-testid="victory-share-fail"
              >
                {t('victoryShareFailed', {
                  defaultValue: 'Couldn’t share from this browser. Tap Share again, or copy from History later.',
                })}
              </p>
            ) : null}
          </div>
        </DialogFooter>
          </div>
        </details>
        </div>

        <div
          data-testid="victory-next-dock"
          className="shrink-0 border-t-2 border-border bg-card px-6 pb-6 pt-3"
        >
          {summary.nextAction ? (
            <VictoryNextActionStrip
              nextAction={summary.nextAction}
              onNavigate={() => onOpenChange(false)}
            />
          ) : (
            <Button variant="outline" className="w-full min-h-[44px] tap-target" onClick={onViewToday}>
              {t('victoryBackToday', { defaultValue: 'Back to Today' })}
            </Button>
          )}
        </div>
        <SaveHonoredRoutineDoor
          open={!!honor.door}
          name={honor.door?.draft.name ?? summary.workoutName}
          onNameChange={honor.setName}
          replaceExisting={!!honor.door?.replaceExisting}
          onCancel={honor.cancelSave}
          onConfirm={() => {
            const result = honor.confirmSave();
            if (result.kind === 'added' || result.kind === 'replaced') {
              toast({
                title: t('builderWorkoutSaved', { defaultValue: 'Workout saved' }),
                description: t('builderWorkoutSavedDesc', {
                  name: result.name,
                  defaultValue: `"${result.name}" is ready to use.`,
                }),
              });
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
