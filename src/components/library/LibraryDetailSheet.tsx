'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { Badge } from '@/components/ui/badge';
import { getExerciseById } from '@/data/exercises';
import type { Exercise } from '@/types';
import { PROGRAM_TAG_LABELS } from '@/data/exerciseEnrichment';
import { countExerciseHistory } from '@/lib/libraryFilters';
import { getFormGuideOrCues } from '@/lib/formGuides';
import {
  formGuideStillUrl,
  resolveFormGuideMediaMode,
} from '@/lib/formGuideMedia';
import { FormGuideSheet } from '@/components/form/FormGuideSheet';
import { Sparkline } from '@/components/today/Sparkline';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useWorkoutStore } from '@/store/workoutStore';
import { countsTowardVolume } from '@/lib/workout/setKind';
import { inferFormPattern } from '@/lib/formPatterns';
import { PATTERN_FILTER_LABELS } from '@/lib/libraryFilters';

type Props = {
  exercise: Exercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Open another exercise in this sheet (e.g. alternatives). */
  onSelectExercise?: (exerciseId: string) => void;
  /**
   * Filtered list order for prev/next (GrokFilm sheet-nav). When omitted,
   * only alternatives / external select still work.
   */
  neighborIds?: string[];
};

export function LibraryDetailSheet({
  exercise,
  open,
  onOpenChange,
  onSelectExercise,
  neighborIds,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const prefersReducedMotion = usePrefersReducedMotion();
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const addExerciseToActive = useWorkoutStore((s) => s.addExerciseToActive);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const [formGuideOpen, setFormGuideOpen] = useState(false);

  const sessionCount = useMemo(
    () => (exercise ? countExerciseHistory(workoutHistory, exercise.id) : 0),
    [exercise, workoutHistory]
  );

  const volumeSpark = useMemo(() => {
    if (!exercise) return [] as number[];
    const vols: number[] = [];
    for (const log of [...workoutHistory].reverse()) {
      const block = log.exercises.find((e) => e.exerciseId === exercise.id);
      if (!block) continue;
      const vol = block.sets.reduce(
        (s, set) => (countsTowardVolume(set.kind) ? s + set.reps * set.weight : s),
        0
      );
      vols.push(vol);
      if (vols.length >= 12) break;
    }
    return vols;
  }, [exercise, workoutHistory]);

  const guide = exercise ? getFormGuideOrCues(exercise.id, { exercise }) : null;
  const guideMediaType = guide?.mediaType ?? 'image';
  const guideMediaMode =
    guide?.mediaUrl != null
      ? resolveFormGuideMediaMode({
          mediaType: guideMediaType,
          prefersReducedMotion,
        })
      : null;
  const guideStillSrc =
    guide?.mediaUrl != null
      ? formGuideStillUrl({
          mediaType: guideMediaType,
          url: guide.mediaUrl,
          poster: guide.mediaPosterUrl,
        })
      : null;
  const pattern = exercise ? inferFormPattern(exercise.id, exercise) : null;

  const neighborNav = useMemo(() => {
    if (!exercise || !neighborIds?.length) return null;
    const i = neighborIds.indexOf(exercise.id);
    if (i < 0) return null;
    return {
      prevId: i > 0 ? neighborIds[i - 1]! : null,
      nextId: i < neighborIds.length - 1 ? neighborIds[i + 1]! : null,
      index: i + 1,
      total: neighborIds.length,
    };
  }, [exercise, neighborIds]);

  const addToSession = () => {
    if (!exercise) return;
    if (activeWorkout) {
      addExerciseToActive(exercise.id, exercise.muscleGroups);
      router.push('/active');
      onOpenChange(false);
      return;
    }
    startWorkout(exercise.name, [{ exerciseId: exercise.id, sets: [{ reps: 8, weight: 0 }] }]);
    router.push('/active');
    onOpenChange(false);
  };

  return (
    <>
      {/*
        On AdaptiveOverlay — the last of the three overlay mechanisms this app
        had. A Radix Dialog here meant a third focus trap, a third scroll lock
        and a third z-index opinion, and it was the reason a form guide opened
        from *inside* this sheet had to fight it for the top layer.
      */}
      <AdaptiveOverlay
        open={open && !!exercise}
        onClose={() => onOpenChange(false)}
        size="sm"
        className="min-h-[44px] tap-target"
        eyebrow={
          exercise
            ? [
                pattern ? PATTERN_FILTER_LABELS[pattern] : null,
                exercise.muscleGroups.join(' · '),
                exercise.equipment || 'Various',
              ]
                .filter(Boolean)
                .join(' · ')
            : undefined
        }
        title={exercise?.name}
        bodyClassName="p-5"
        footer={
          exercise ? (
            <Button variant="default" className="w-full min-h-[52px] tap-target" onClick={addToSession}>
              <Plus className="h-4 w-4 mr-2" />
              {activeWorkout
                ? t('libraryAddToActive', { defaultValue: 'Add to session' })
                : t('libraryTrainThis', { defaultValue: 'Train this' })}
            </Button>
          ) : undefined
        }
      >
          {exercise && (
              <div className="space-y-4">
                {neighborNav && onSelectExercise && (
                  <div className="flex items-center justify-between gap-2 border-b-2 border-border pb-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="min-h-[44px] min-w-[44px] border-2 px-2"
                      disabled={!neighborNav.prevId}
                      aria-label={t('libraryPrevExercise', { defaultValue: 'Previous exercise' })}
                      onClick={() => neighborNav.prevId && onSelectExercise(neighborNav.prevId)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-mono text-[10px] tracking-wider text-muted-foreground tabular-nums">
                      {String(neighborNav.index).padStart(3, '0')} / {String(neighborNav.total).padStart(3, '0')}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="min-h-[44px] min-w-[44px] border-2 px-2"
                      disabled={!neighborNav.nextId}
                      aria-label={t('libraryNextExercise', { defaultValue: 'Next exercise' })}
                      onClick={() => neighborNav.nextId && onSelectExercise(neighborNav.nextId)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {/* Craft-index detail order: media → coach language → history → alts */}
                {guide?.mediaUrl && guideMediaMode && guideStillSrc && (
                  <button
                    type="button"
                    className="block w-full overflow-hidden border-2 border-border bg-card text-left"
                    onClick={() => setFormGuideOpen(true)}
                    aria-label={t('libraryViewFormGuide', { defaultValue: 'View form guide' })}
                  >
                    {guideMediaMode === 'video-autoplay' ? (
                      <video
                        className="w-full max-h-56 object-contain bg-background"
                        src={guide.mediaUrl}
                        poster={guide.mediaPosterUrl}
                        muted
                        playsInline
                        loop
                        autoPlay
                        preload="metadata"
                      />
                    ) : (
                      // Form Index poster / reduced-motion still / legacy SVG — plain img intentional.
                      <img
                        src={guideStillSrc}
                        alt=""
                        className="w-full max-h-56 object-contain bg-background"
                      />
                    )}
                    {guide.mediaCaption ? (
                      <p className="border-t-2 border-border px-2 py-1.5 text-[10px] text-muted-foreground">
                        {guide.mediaCaption}
                      </p>
                    ) : null}
                  </button>
                )}

                <div className="flex flex-wrap gap-1">
                  {(exercise.tags ?? []).map((tagId) => (
                    <Badge key={tagId} variant="outline" className="text-[10px]">
                      {PROGRAM_TAG_LABELS[tagId]}
                    </Badge>
                  ))}
                  {exercise.level && (
                    <Badge variant="secondary" className="text-[10px] capitalize">
                      {exercise.level}
                    </Badge>
                  )}
                </div>

                {exercise.cues && (
                  <div className="text-sm">
                    <p className="font-medium mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t('libraryKeyCues', { defaultValue: 'Coach language' })}
                    </p>
                    <p className="text-muted-foreground">{exercise.cues}</p>
                  </div>
                )}

                {guide && (guide.setup.length > 0 || guide.execute.length > 0) && (
                  <div className="text-sm space-y-2">
                    {guide.setup.length > 0 && (
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                          {t('libraryFormSetup', { defaultValue: 'Setup' })}
                        </p>
                        <ul className="list-disc ps-4 text-muted-foreground space-y-0.5">
                          {guide.setup.slice(0, 3).map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {guide.execute.length > 0 && (
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                          {t('libraryFormExecute', { defaultValue: 'Execute' })}
                        </p>
                        <ul className="list-disc ps-4 text-muted-foreground space-y-0.5">
                          {guide.execute.slice(0, 3).map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {sessionCount > 0 && (
                  <div className="content-card  p-3 text-sm space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">
                        {t('libraryYourHistory', {
                          count: sessionCount,
                          defaultValue: `Logged in ${sessionCount} session${sessionCount === 1 ? '' : 's'}`,
                        })}
                      </p>
                      {volumeSpark.length > 0 && (
                        <Sparkline values={volumeSpark} width={96} height={28} />
                      )}
                    </div>
                    {volumeSpark.length > 0 && (
                      <p className="text-[10px] text-muted-foreground">
                        {t('libraryVolumeSpark', {
                          defaultValue: 'Volume across recent sessions (oldest → newest)',
                        })}
                      </p>
                    )}
                  </div>
                )}

                {exercise.alternatives && exercise.alternatives.length > 0 && (
                  <div className="text-sm">
                    <p className="font-medium mb-2">
                      {t('libraryAlternatives', { defaultValue: 'Alternatives' })}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {exercise.alternatives.map((id) => {
                        const alt = getExerciseById(id);
                        if (!alt) return null;
                        return (
                          <button
                            key={id}
                            type="button"
                            className="text-xs px-2 py-1  border-2 border-border hover:bg-card"
                            onClick={() => onSelectExercise?.(id)}
                          >
                            {alt.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {guide && (
                  <Button
                    variant="outline"
                    className="min-h-[44px] border-2 w-full"
                    onClick={() => setFormGuideOpen(true)}
                  >
                    {t('libraryViewFormGuide', { defaultValue: 'Full form guide' })}
                  </Button>
                )}
              </div>
          )}
      </AdaptiveOverlay>

      {exercise && guide && formGuideOpen && (
        <FormGuideSheet
          exerciseName={exercise.name}
          guide={guide}
          open={formGuideOpen}
          onClose={() => setFormGuideOpen(false)}
        />
      )}
    </>
  );
}
