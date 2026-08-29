'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { getExerciseById } from '@/data/exercises';
import type { Exercise } from '@/types';
import { PROGRAM_TAG_LABELS } from '@/data/exerciseEnrichment';
import {
  PATTERN_FILTER_LABELS,
  countExerciseHistory,
  libraryExerciseVolumeSpark,
} from '@/lib/libraryFilters';
import { getFormGuideOrCues } from '@/lib/formGuides';
import {
  formGuideStillUrl,
  resolveFormGuideMediaMode,
} from '@/lib/formGuideMedia';
import { FormGuideSheet } from '@/components/form/FormGuideSheet';
import { Sparkline } from '@/components/today/Sparkline';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useWorkoutStore } from '@/store/workoutStore';
import { inferFormPattern } from '@/lib/formPatterns';
import { hideExerciseNow } from '@/lib/workout/hideExercise';

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
  /** After hide — parent refreshes the visible catalog. */
  onHidden?: () => void;
};

export function LibraryDetailSheet({
  exercise,
  open,
  onOpenChange,
  onSelectExercise,
  neighborIds,
  onHidden,
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
    return libraryExerciseVolumeSpark(workoutHistory, exercise.id);
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

  const hideFromLibrary = () => {
    if (!exercise) return;
    if (!hideExerciseNow(exercise.id)) return;
    onHidden?.();
    onOpenChange(false);
  };

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
        className="mw-house house-library-detail"
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
            <button
              type="button"
              className="house-btn house-btn-primary min-h-[52px] w-full tap-target"
              onClick={addToSession}
            >
              <Plus className="h-4 w-4 me-2" />
              {activeWorkout
                ? t('libraryAddToActive', { defaultValue: "Add to today's session" })
                : t('libraryTrainThis', { defaultValue: 'Train this' })}
            </button>
          ) : undefined
        }
      >
          {exercise && (
              <div className="space-y-4">
                {neighborNav && onSelectExercise && (
                  <div className="house-library-detail-nav">
                    <button
                      type="button"
                      className="house-btn house-btn-ghost min-h-[44px] min-w-[44px] tap-target"
                      disabled={!neighborNav.prevId}
                      aria-label={t('libraryPrevExercise', { defaultValue: 'Previous exercise' })}
                      onClick={() => neighborNav.prevId && onSelectExercise(neighborNav.prevId)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="house-kicker">
                      {String(neighborNav.index).padStart(3, '0')} / {String(neighborNav.total).padStart(3, '0')}
                    </span>
                    <button
                      type="button"
                      className="house-btn house-btn-ghost min-h-[44px] min-w-[44px] tap-target"
                      disabled={!neighborNav.nextId}
                      aria-label={t('libraryNextExercise', { defaultValue: 'Next exercise' })}
                      onClick={() => neighborNav.nextId && onSelectExercise(neighborNav.nextId)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {/* Craft-index detail order: media → coach language → history → alts */}
                {guide?.mediaUrl && guideMediaMode && guideStillSrc && (
                  <button
                    type="button"
                    className="house-card house-library-detail-media"
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
                      <p className="house-kicker px-2 py-1.5">
                        {guide.mediaCaption}
                      </p>
                    ) : null}
                  </button>
                )}

                <div className="flex flex-wrap gap-1">
                  {(exercise.tags ?? []).map((tagId) => (
                    <span key={tagId} className="house-set-kicker">
                      {PROGRAM_TAG_LABELS[tagId]}
                    </span>
                  ))}
                  {exercise.level ? (
                    <span className="house-set-kicker">{exercise.level}</span>
                  ) : null}
                </div>

                {exercise.cues && (
                  <div className="text-sm">
                    <p className="house-kicker">
                      {t('libraryKeyCues', { defaultValue: 'Coach language' })}
                    </p>
                    <p className="text-muted-foreground">{exercise.cues}</p>
                  </div>
                )}

                {guide && (guide.setup.length > 0 || guide.execute.length > 0) && (
                  <div className="text-sm space-y-2">
                    {guide.setup.length > 0 && (
                      <div>
                        <p className="house-kicker">
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
                        <p className="house-kicker">
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
                  <div className="house-card p-3 text-sm space-y-2">
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
                    <p className="house-kicker">
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
                            className="house-state tap-target"
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
                  <button
                    type="button"
                    className="house-btn house-btn-ghost min-h-[44px] w-full tap-target"
                    onClick={() => setFormGuideOpen(true)}
                  >
                    {t('libraryViewFormGuide', { defaultValue: 'Full form guide' })}
                  </button>
                )}
                <button
                  type="button"
                  className="house-btn house-btn-ghost min-h-[44px] w-full tap-target"
                  data-testid="library-hide"
                  onClick={hideFromLibrary}
                >
                  {t('libraryHide', { defaultValue: 'Hide this exercise' })}
                </button>
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
