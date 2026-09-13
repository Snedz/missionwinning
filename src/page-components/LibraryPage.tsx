'use client';
/**
 * Page: /library — official exercise catalog (with /builder).
 * Not Explore. Not /programs. See docs/IA_SKELETON.md, app/INDEX.md.
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { Check, Dumbbell, Search, SlidersHorizontal, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { HistoryMergeExercises } from '@/components/history/HistoryMergeExercises';
import { decideMergeExercises, knownIdsForMerge } from '@/lib/workout/mergeExercises';
import {
  listHiddenExercises,
  loadHiddenExerciseIds,
  omitHiddenExercises,
  unhideExerciseNow,
} from '@/lib/workout/hideExercise';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { LibraryDetailSheet } from '@/components/library/LibraryDetailSheet';
import { EmptyState } from '@/components/ui/EmptyState';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { EXERCISES, ensureFullExerciseCatalog } from '@/data/exercises';
import { PROGRAM_TAG_LABELS } from '@/data/exerciseEnrichment';
import {
  DEFAULT_LIBRARY_FILTERS,
  filterExercises,
  PATTERN_FILTER_CHIPS,
  PATTERN_FILTER_LABELS,
  uniqueMuscleGroups,
  type LibraryFilterState,
} from '@/lib/libraryFilters';
import { inferFormPattern } from '@/lib/formPatterns';
import { formPackLibraryPosterUrl } from '@/lib/formMedia';
import { getFormGuideOrCues } from '@/lib/formGuides';
import { exerciseCraftBlurb } from '@/lib/exerciseCraftBlurb';
import {
  LIBRARY_PICK_MAX,
  sessionNameFromLibraryPick,
  templatesFromLibraryPick,
  toggleLibraryPick,
} from '@/lib/librarySessionPick';
import { useWorkoutStore } from '@/store/workoutStore';
import type { ProgramTag } from '@/types';
import { cn } from '@/lib/utils';

const EQUIP_CHIPS = ['', 'bodyweight', 'dumbbell', 'barbell', 'cable', 'band', 'kettlebell'] as const;
const LEVEL_CHIPS = ['', 'beginner', 'intermediate', 'advanced'] as const;
const TAG_CHIPS: (ProgramTag | '')[] = ['', 'strength', 'hypertrophy', 'conditioning', 'corrective'];

const EQUIP_LABELS: Record<string, string> = {
  '': 'libraryEquipAll',
  bodyweight: 'libraryEquipBodyweight',
  dumbbell: 'libraryEquipDumbbell',
  barbell: 'libraryEquipBarbell',
  cable: 'libraryEquipCable',
  band: 'libraryEquipBand',
  kettlebell: 'libraryEquipKettlebell',
};

const LEVEL_LABELS: Record<string, string> = {
  '': 'libraryLevelAll',
  beginner: 'libraryLevelBeginner',
  intermediate: 'libraryLevelIntermediate',
  advanced: 'libraryLevelAdvanced',
};

export function LibraryPage() {
  const { t } = useTranslation();
  const fmt = useLocaleFormat();
  const router = useRouter();
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const addExerciseToActive = useWorkoutStore((s) => s.addExerciseToActive);
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const savedWorkouts = useWorkoutStore((s) => s.savedWorkouts);
  const applyMergedExercises = useWorkoutStore((s) => s.applyMergedExercises);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [hideTick, setHideTick] = useState(0);
  const [filters, setFilters] = useState<LibraryFilterState>({ ...DEFAULT_LIBRARY_FILTERS });
  const [detailId, setDetailId] = useState<string | null>(null);
  const [catalogRevision, setCatalogRevision] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [muscleQuery, setMuscleQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);
  /** Craft-index studio: multi-select for freestyle session build. */
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const pickMode = pickedIds.length > 0;

  useEffect(() => {
    void ensureFullExerciseCatalog().then(() => setCatalogRevision((n) => n + 1));
  }, []);

  const allMuscles = useMemo(
    // `fmt.lang` is a real dependency: `.242` — a sorted list memoised without it
    // keeps the previous language's collation until something else invalidates the
    // memo, the staleness that made `benchmarks.dateLabel` worth deleting outright.
    () => uniqueMuscleGroups(EXERCISES, fmt.lang),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- in-place catalog extension
    [catalogRevision, fmt.lang]
  );
  const muscleOptions = useMemo(() => {
    const q = muscleQuery.trim().toLowerCase();
    if (!q) return allMuscles;
    return allMuscles.filter((m) => m.toLowerCase().includes(q));
  }, [allMuscles, muscleQuery]);

  const hiddenIds = useMemo(() => {
    void hideTick;
    return loadHiddenExerciseIds();
  }, [hideTick]);
  const visibleCatalog = useMemo(
    () => omitHiddenExercises(EXERCISES, hiddenIds),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- in-place catalog extension
    [hiddenIds, catalogRevision]
  );
  const hiddenRows = useMemo(
    () => listHiddenExercises({ hiddenIds }),
    [hiddenIds]
  );
  const filtered = useMemo(
    () => filterExercises(visibleCatalog, filters),
    [visibleCatalog, filters]
  );
  const detailExercise = detailId
    ? visibleCatalog.find((e) => e.id === detailId) ??
      EXERCISES.find((e) => e.id === detailId) ??
      null
    : null;
  const bumpHide = () => setHideTick((n) => n + 1);

  const setFilter = <K extends keyof LibraryFilterState>(key: K, value: LibraryFilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setVisibleCount(8);
  };

  const activeFilterCount = [
    filters.equipment,
    filters.tag,
    filters.level,
    filters.muscle,
    filters.pattern,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilters({ ...DEFAULT_LIBRARY_FILTERS, query: filters.query });
    setVisibleCount(8);
  };

  const visibleExercises = filtered.slice(0, visibleCount);

  const togglePick = (id: string) => {
    setPickedIds((prev) => toggleLibraryPick(prev, id));
  };

  const trainPicked = () => {
    if (pickedIds.length === 0) return;
    if (activeWorkout) {
      for (const id of pickedIds) {
        const ex = EXERCISES.find((e) => e.id === id);
        addExerciseToActive(id, ex?.muscleGroups);
      }
      setPickedIds([]);
      router.push('/active');
      return;
    }
    const templates = templatesFromLibraryPick(EXERCISES, pickedIds);
    if (templates.length === 0) return;
    const name = sessionNameFromLibraryPick(EXERCISES, pickedIds);
    startWorkout(name, templates);
    setPickedIds([]);
    router.push('/active');
  };

  return (
    <PillarPageShell
      icon={Dumbbell}
      eyebrow={t('libraryEyebrow', { defaultValue: 'Library' })}
      title={t('library', { defaultValue: 'Exercise Library' })}
      subtitle={t('librarySubtitleBrief', {
        defaultValue: 'Search movements. Filters when you need them.',
      })}
      className="house-catalog"
    >
      {hiddenRows.length > 0 ? (
        <div className="house-card house-library-hidden mb-3 space-y-2" data-testid="library-hidden">
          <p className="house-kicker">{t('libraryHidden', { defaultValue: 'Hidden' })}</p>
          <p className="house-lede">
            {t('libraryHiddenDesc', {
              defaultValue: 'Hidden names stay off Add and search. History stays.',
            })}
          </p>
          <ul className="space-y-1">
            {hiddenRows.map((row) => (
              <li
                key={row.id}
                className="house-item house-library-hidden-row flex items-center justify-between gap-2"
              >
                <span className="min-w-0 font-medium">{row.name}</span>
                <button
                  type="button"
                  className="house-btn house-btn-ghost min-h-[44px] shrink-0 tap-target"
                  data-testid="library-unhide"
                  onClick={() => {
                    if (unhideExerciseNow(row.id)) bumpHide();
                  }}
                >
                  {t('libraryUnhide', { defaultValue: 'Unhide' })}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="house-filter-bar space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              className="house-field house-library-search min-h-[44px]"
              placeholder={t('librarySearchPlaceholder', { defaultValue: 'Search name or muscle...' })}
              value={filters.query}
              onChange={(e) => setFilter('query', e.target.value)}
              data-testid="library-search"
            />
          </div>
          <button
            type="button"
            className="house-btn house-btn-ghost house-filter-btn shrink-0 gap-1.5 tap-target"
            data-testid="library-filters-open"
            onClick={() => setFiltersOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t('libraryFilters', { defaultValue: 'Filters' })}
            {activeFilterCount > 0 && (
              <span className="tabular-nums text-primary">({activeFilterCount})</span>
            )}
          </button>
        </div>

        <div className="house-catalog-states" data-testid="library-states">
          {allMuscles.slice(0, 8).map((m) => (
            <button
              key={m}
              type="button"
              className={`house-state${filters.muscle === m ? ' is-on' : ''}`}
              onClick={() => setFilter('muscle', filters.muscle === m ? '' : m)}
            >
              {m}
            </button>
          ))}
        </div>

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            {filters.muscle && (
              <button type="button" className="house-state is-on" onClick={() => setFilter('muscle', '')}>
                {filters.muscle} <X className="inline h-3 w-3 ms-0.5" />
              </button>
            )}
            {filters.equipment && (
              <button type="button" className="house-state is-on" onClick={() => setFilter('equipment', '')}>
                {t(EQUIP_LABELS[filters.equipment] ?? 'libraryEquipAll')}{' '}
                <X className="inline h-3 w-3 ms-0.5" />
              </button>
            )}
            {filters.level && (
              <button type="button" className="house-state is-on" onClick={() => setFilter('level', '')}>
                {t(LEVEL_LABELS[filters.level] ?? 'libraryLevelAll')}{' '}
                <X className="inline h-3 w-3 ms-0.5" />
              </button>
            )}
            {filters.tag && (
              <button type="button" className="house-state is-on" onClick={() => setFilter('tag', '')}>
                {PROGRAM_TAG_LABELS[filters.tag]} <X className="inline h-3 w-3 ms-0.5" />
              </button>
            )}
            {filters.pattern && (
              <button type="button" className="house-state is-on" onClick={() => setFilter('pattern', '')}>
                {PATTERN_FILTER_LABELS[filters.pattern]}{' '}
                <X className="inline h-3 w-3 ms-0.5" />
              </button>
            )}
            <button
              type="button"
              className="house-btn house-btn-ghost"
              onClick={clearFilters}
            >
              {t('libraryClearFilters', { defaultValue: 'Clear filters' })}
            </button>
          </div>
        )}

        <p className="house-lede house-library-showing">
          {t('libraryShowingCount', {
            shown: visibleExercises.length,
            total: filtered.length,
            defaultValue: `Showing ${visibleExercises.length} of ${filtered.length}`,
          })}
        </p>
      </div>

      <AdaptiveOverlay
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        size="sm"
        className="mw-house house-library-filters"
        title={t('libraryFilters', { defaultValue: 'Filters' })}
        bodyClassName="space-y-4 p-5"
        footer={
          <div className="flex gap-2">
            <button
              type="button"
              className="house-btn house-btn-ghost min-h-[44px] flex-1 tap-target"
              onClick={clearFilters}
            >
              {t('libraryClearFilters', { defaultValue: 'Clear filters' })}
            </button>
            <button
              type="button"
              className="house-btn min-h-[44px] flex-1 tap-target"
              onClick={() => setFiltersOpen(false)}
            >
              {t('libraryApplyFilters', { defaultValue: 'Done' })}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="house-kicker">{t('libraryFilterMuscle', { defaultValue: 'Muscle' })}</p>
            <input
              type="search"
              className="house-field"
              value={muscleQuery}
              onChange={(e) => setMuscleQuery(e.target.value)}
              placeholder={t('libraryMuscleSearch', { defaultValue: 'Search muscles…' })}
            />
            <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
              <button
                type="button"
                className={cn('house-state tap-target', !filters.muscle && 'is-on')}
                onClick={() => setFilter('muscle', '')}
              >
                {t('libraryEquipAll', { defaultValue: 'All' })}
              </button>
              {muscleOptions.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={cn('house-state tap-target', filters.muscle === m && 'is-on')}
                  onClick={() => setFilter('muscle', m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="house-kicker">{t('libraryFilterPattern', { defaultValue: 'Pattern' })}</p>
            <div className="flex flex-wrap gap-2">
              {PATTERN_FILTER_CHIPS.map((p) => (
                <button
                  key={p || 'all-pattern'}
                  type="button"
                  className={cn('house-state tap-target', filters.pattern === p && 'is-on')}
                  onClick={() => setFilter('pattern', p)}
                >
                  {p ? PATTERN_FILTER_LABELS[p] : t('libraryPatternAll', { defaultValue: 'All' })}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="house-kicker">{t('libraryFilterEquipment', { defaultValue: 'Equipment' })}</p>
            <div className="flex flex-wrap gap-2">
              {EQUIP_CHIPS.map((e) => (
                <button
                  key={e || 'all-equip'}
                  type="button"
                  className={cn('house-state tap-target', filters.equipment === e && 'is-on')}
                  onClick={() => setFilter('equipment', e)}
                >
                  {t(EQUIP_LABELS[e])}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="house-kicker">{t('libraryFilterLevel', { defaultValue: 'Level' })}</p>
            <div className="flex flex-wrap gap-2">
              {LEVEL_CHIPS.map((l) => (
                <button
                  key={l || 'all-level'}
                  type="button"
                  className={cn('house-state tap-target', filters.level === l && 'is-on')}
                  onClick={() => setFilter('level', l)}
                >
                  {t(LEVEL_LABELS[l])}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="house-kicker">{t('libraryFilterTag', { defaultValue: 'Goal' })}</p>
            <div className="flex flex-wrap gap-2">
              {TAG_CHIPS.map((tag) => (
                <button
                  key={tag || 'all-tag'}
                  type="button"
                  className={cn('house-state tap-target', filters.tag === tag && 'is-on')}
                  onClick={() => setFilter('tag', tag)}
                >
                  {tag ? PROGRAM_TAG_LABELS[tag] : t('libraryTagAll', { defaultValue: 'All' })}
                </button>
              ))}
            </div>
          </div>
        </div>
      </AdaptiveOverlay>

      <ul className="house-list" data-testid="library-exercise-list">
        {visibleExercises.map((ex) => {
          const isPicked = pickedIds.includes(ex.id);
          return (
            <li key={ex.id} className="house-item">
              <button
                type="button"
                className={`house-item-pick${isPicked ? ' is-on' : ''}`}
                aria-pressed={isPicked}
                aria-label={
                  isPicked
                    ? t('libraryUnpick', { name: ex.name, defaultValue: `Remove ${ex.name} from session` })
                    : t('libraryPick', { name: ex.name, defaultValue: `Add ${ex.name} to session` })
                }
                onClick={() => togglePick(ex.id)}
              >
                <Check className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                data-testid="library-exercise-row"
                className="house-item-body"
                onClick={() => setDetailId(ex.id)}
              >
                <strong>{ex.name}</strong>
                <span>
                  {ex.muscleGroups.join(' · ')}
                  {ex.equipment ? ` · ${ex.equipment}` : ''}
                </span>
              </button>
              <button
                type="button"
                className="house-btn house-btn-ghost"
                aria-label={t('libraryViewDetailsFor', {
                  name: ex.name,
                  defaultValue: `View details for ${ex.name}`,
                })}
                onClick={() => setDetailId(ex.id)}
              >
                {t('libraryViewDetails', { defaultValue: 'View details' })}
              </button>
            </li>
          );
        })}
      </ul>

      {filtered.length > visibleCount ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            className="house-btn"
            onClick={() => setVisibleCount((n) => n + 16)}
          >
            {t('libraryLoadMore', {
              remaining: filtered.length - visibleCount,
              defaultValue: `Load more (${filtered.length - visibleCount} left)`,
            })}
          </button>
        </div>
      ) : null}

      {filtered.length === 0 && (
        <EmptyState
          className="house-empty"
          icon={Dumbbell}
          title={t('libraryNoResultsTitle', { defaultValue: 'Nothing matches' })}
          description={t('libraryNoResults', {
            defaultValue: 'Clear equipment or muscle filters to see the full library again.',
          })}
          actionLabel={t('libraryClearFilters', { defaultValue: 'Clear filters' })}
          onAction={() => setFilters({ ...DEFAULT_LIBRARY_FILTERS })}
        />
      )}

      <details className="house-card group">
        <summary
          className="house-show-all-door flex min-h-[44px] cursor-pointer list-none items-center px-4 py-3 [&::-webkit-details-marker]:hidden"
          data-testid="library-show-all"
        >
          {t('todayShowAll', { defaultValue: 'Show all' })}
        </summary>
        <div className="house-show-all-body space-y-4 p-4">
          <Button
            type="button"
            variant="outline"
            className="w-full min-h-[44px] tap-target"
            data-testid="library-merge-open"
            onClick={() => setMergeOpen(true)}
          >
            {t('historyMerge', { defaultValue: 'Merge duplicate exercises' })}
          </Button>
          <p className="text-xs text-muted-foreground">
            <Link href="/log" className="underline underline-offset-2 hover:text-foreground">
              {t('libraryTodayHub', { defaultValue: 'Today' })}
            </Link>
            {' · '}
            <Link href="/builder" className="underline underline-offset-2 hover:text-foreground">
              {t('libraryProgramTemplates', { defaultValue: 'Program templates' })}
            </Link>
          </p>
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {t('libraryPickHint', {
              defaultValue: 'Tap ✓ to build a session · open card for form',
            })}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleExercises.slice(0, 12).map((ex, idx) => {
              const pattern = inferFormPattern(ex.id, ex);
              const guideMedia = getFormGuideOrCues(ex.id, { exercise: ex });
              const hasForm = !!guideMedia?.mediaUrl;
              const posterUrl = formPackLibraryPosterUrl(ex.id);
              const isPicked = pickedIds.includes(ex.id);
              return (
                <Card
                  key={ex.id}
                  className={cn(
                    'content-card cursor-pointer overflow-hidden',
                    isPicked && 'border-primary'
                  )}
                  onClick={() => setDetailId(ex.id)}
                >
                  {posterUrl ? (
                    <div className="border-b-2 border-border bg-background">
                      <img
                        src={posterUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="aspect-[4/3] w-full object-cover object-center"
                      />
                    </div>
                  ) : null}
                  <CardHeader className="pb-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-mono text-[10px] tracking-wider text-muted-foreground tabular-nums">
                        {String(idx + 1).padStart(3, '0')}
                      </span>
                      <span className="font-mono text-[10px] tracking-wider text-primary uppercase">
                        {hasForm ? (
                          <span className="me-1.5 inline-block h-1.5 w-1.5 bg-primary align-middle" aria-hidden />
                        ) : null}
                        {pattern
                          ? PATTERN_FILTER_LABELS[pattern]
                          : t('libraryPatternUnknown', { defaultValue: 'Move' })}
                      </span>
                    </div>
                    <CardTitle className="text-lg mt-2">{ex.name}</CardTitle>
                    <div className="text-xs text-muted-foreground">
                      {ex.muscleGroups.join(' • ')} · {ex.equipment || 'Various'}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(ex.tags ?? []).slice(0, 3).map((tagId) => (
                        <Badge key={tagId} variant="outline" className="text-[10px]">
                          {PROGRAM_TAG_LABELS[tagId]}
                        </Badge>
                      ))}
                      {ex.level && (
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {ex.level}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="text-muted-foreground line-clamp-2">{exerciseCraftBlurb(ex)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </details>

      <LibraryDetailSheet
        exercise={detailExercise}
        open={!!detailId}
        onOpenChange={(open) => !open && setDetailId(null)}
        onSelectExercise={(id) => setDetailId(id)}
        neighborIds={filtered.map((e) => e.id)}
        onHidden={() => {
          if (detailId) {
            setPickedIds((prev) => prev.filter((id) => id !== detailId));
          }
          bumpHide();
        }}
      />

      {pickMode && (
        <div
          className="house-pick-bar"
          role="region"
          aria-label={t('libraryPickBar', { defaultValue: 'Session pick bar' })}
          data-testid="library-pick-bar"
        >
          <div className="house-pick-bar-row">
            <p className="house-kicker">
              {t('libraryPickedCount', {
                count: pickedIds.length,
                max: LIBRARY_PICK_MAX,
                defaultValue: `${pickedIds.length} / ${LIBRARY_PICK_MAX} selected`,
              })}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="house-btn house-btn-ghost min-h-[44px] tap-target"
                onClick={() => setPickedIds([])}
              >
                {t('libraryClearPick', { defaultValue: 'Clear' })}
              </button>
              <button
                type="button"
                className="house-btn house-btn-primary primary-action min-h-[44px] tap-target"
                onClick={trainPicked}
              >
                {activeWorkout
                  ? t('libraryAddPickedToSession', {
                      count: pickedIds.length,
                      defaultValue: `Add ${pickedIds.length} to session`,
                    })
                  : t('libraryTrainPicked', {
                      count: pickedIds.length,
                      defaultValue: `Train selected (${pickedIds.length})`,
                    })}
              </button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={mergeOpen} onOpenChange={(open) => !open && setMergeOpen(false)}>
        <DialogContent
          className="mw-house house-overlay-panel max-w-lg max-h-[85vh] overflow-y-auto"
          data-testid="library-merge-dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {t('historyMergeTitle', { defaultValue: 'Merge duplicate exercises' })}
            </DialogTitle>
            <DialogDescription>
              {t('historyMergeDesc', {
                defaultValue:
                  'If you logged the same movement under two names, pick which name to keep. This cannot be undone.',
              })}
            </DialogDescription>
          </DialogHeader>
          {mergeOpen ? (
            <HistoryMergeExercises
              history={workoutHistory}
              live={activeWorkout?.exercises ?? null}
              saved={savedWorkouts}
              onConfirm={(sourceId, keeperId) => {
                const decision = decideMergeExercises({
                  sourceId,
                  keeperId,
                  knownIds: knownIdsForMerge({
                    history: workoutHistory,
                    live: activeWorkout?.exercises ?? null,
                    saved: savedWorkouts,
                  }),
                });
                if (decision.kind !== 'needs-confirm') return;
                if (applyMergedExercises(sourceId, keeperId)) setMergeOpen(false);
              }}
              onCancel={() => setMergeOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </PillarPageShell>
  );
}
