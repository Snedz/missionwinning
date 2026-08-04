'use client';
/**
 * Page: /library — exercise catalog
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { Check, Dumbbell, Search, SlidersHorizontal, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { LibraryDetailSheet } from '@/components/library/LibraryDetailSheet';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterChip } from '@/components/ui/FilterChip';
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
import { getFormGuideOrCues } from '@/lib/formGuides';
import { exerciseCraftBlurb } from '@/lib/exerciseCraftBlurb';
import {
  LIBRARY_PICK_MAX,
  sessionNameFromLibraryPick,
  templatesFromLibraryPick,
  toggleLibraryPick,
} from '@/lib/librarySessionPick';
import { usePremium } from '@/hooks/usePremium';
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
  const { premium } = usePremium();
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const addExerciseToActive = useWorkoutStore((s) => s.addExerciseToActive);
  const [filters, setFilters] = useState<LibraryFilterState>({ ...DEFAULT_LIBRARY_FILTERS });
  const [detailId, setDetailId] = useState<string | null>(null);
  const [catalogRevision, setCatalogRevision] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [muscleQuery, setMuscleQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(48);
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

  const filtered = useMemo(
    () => filterExercises(EXERCISES, filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- in-place catalog extension
    [filters, catalogRevision]
  );
  const detailExercise = detailId ? EXERCISES.find((e) => e.id === detailId) ?? null : null;

  const setFilter = <K extends keyof LibraryFilterState>(key: K, value: LibraryFilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setVisibleCount(48);
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
    setVisibleCount(48);
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
      subtitle={t('librarySubtitle', {
        count: EXERCISES.length,
        defaultValue: `${EXERCISES.length}+ movements with cues and alternatives. Bodyweight and minimal equipment prioritized.`,
      })}
    >
      <p className="text-muted-foreground text-sm">
        <Link href="/log" className="underline">
          {t('libraryTodayHub', { defaultValue: 'Today Hub' })}
        </Link>
        {' · '}
        <Link href="/builder" className="underline">
          {t('libraryProgramTemplates', { defaultValue: 'Program templates' })}
        </Link>
        {premium
          ? t('libraryPremiumUnlocked', { defaultValue: ' — full library unlocked.' })
          : t('libraryFreeCatalog', { defaultValue: ' — free core includes the full catalog.' })}
      </p>

      <div className="sticky top-0 z-10 -mx-1 space-y-2 border-b-2 border-border bg-background py-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('librarySearchPlaceholder', { defaultValue: 'Search name or muscle...' })}
              value={filters.query}
              onChange={(e) => setFilter('query', e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0 min-h-[44px] gap-1.5"
            onClick={() => setFiltersOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t('libraryFilters', { defaultValue: 'Filters' })}
            {activeFilterCount > 0 && (
              <span className="tabular-nums text-primary">({activeFilterCount})</span>
            )}
          </Button>
        </div>

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            {filters.muscle && (
              <FilterChip active onClick={() => setFilter('muscle', '')}>
                {filters.muscle} <X className="inline h-3 w-3 ms-0.5" />
              </FilterChip>
            )}
            {filters.equipment && (
              <FilterChip active onClick={() => setFilter('equipment', '')}>
                {t(EQUIP_LABELS[filters.equipment] ?? 'libraryEquipAll')}{' '}
                <X className="inline h-3 w-3 ms-0.5" />
              </FilterChip>
            )}
            {filters.level && (
              <FilterChip active onClick={() => setFilter('level', '')}>
                {t(LEVEL_LABELS[filters.level] ?? 'libraryLevelAll')}{' '}
                <X className="inline h-3 w-3 ms-0.5" />
              </FilterChip>
            )}
            {filters.tag && (
              <FilterChip active onClick={() => setFilter('tag', '')}>
                {PROGRAM_TAG_LABELS[filters.tag]} <X className="inline h-3 w-3 ms-0.5" />
              </FilterChip>
            )}
            {filters.pattern && (
              <FilterChip active onClick={() => setFilter('pattern', '')}>
                {PATTERN_FILTER_LABELS[filters.pattern]}{' '}
                <X className="inline h-3 w-3 ms-0.5" />
              </FilterChip>
            )}
            <button
              type="button"
              className="text-xs text-muted-foreground underline"
              onClick={clearFilters}
            >
              {t('libraryClearFilters', { defaultValue: 'Clear filters' })}
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {t('libraryShowingCount', {
              shown: filtered.length,
              total: EXERCISES.length,
              defaultValue: `Showing ${filtered.length} of ${EXERCISES.length}`,
            })}
          </p>
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {t('libraryPickHint', {
              defaultValue: 'Tap ✓ to build a session · open card for form',
            })}
          </p>
        </div>
      </div>

      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('libraryFilters', { defaultValue: 'Filters' })}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {t('libraryFilterMuscle', { defaultValue: 'Muscle' })}
              </p>
              <Input
                type="search"
                value={muscleQuery}
                onChange={(e) => setMuscleQuery(e.target.value)}
                placeholder={t('libraryMuscleSearch', { defaultValue: 'Search muscles…' })}
              />
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                <FilterChip active={!filters.muscle} onClick={() => setFilter('muscle', '')}>
                  {t('libraryEquipAll', { defaultValue: 'All' })}
                </FilterChip>
                {muscleOptions.map((m) => (
                  <FilterChip
                    key={m}
                    active={filters.muscle === m}
                    onClick={() => setFilter('muscle', m)}
                  >
                    {m}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {t('libraryFilterPattern', { defaultValue: 'Pattern' })}
              </p>
              <div className="flex flex-wrap gap-2">
                {PATTERN_FILTER_CHIPS.map((p) => (
                  <FilterChip
                    key={p || 'all-pattern'}
                    active={filters.pattern === p}
                    onClick={() => setFilter('pattern', p)}
                  >
                    {p
                      ? PATTERN_FILTER_LABELS[p]
                      : t('libraryPatternAll', { defaultValue: 'All' })}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {t('libraryFilterEquipment', { defaultValue: 'Equipment' })}
              </p>
              <div className="flex flex-wrap gap-2">
                {EQUIP_CHIPS.map((e) => (
                  <FilterChip
                    key={e || 'all-equip'}
                    active={filters.equipment === e}
                    onClick={() => setFilter('equipment', e)}
                  >
                    {t(EQUIP_LABELS[e])}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {t('libraryFilterLevel', { defaultValue: 'Level' })}
              </p>
              <div className="flex flex-wrap gap-2">
                {LEVEL_CHIPS.map((l) => (
                  <FilterChip
                    key={l || 'all-level'}
                    active={filters.level === l}
                    onClick={() => setFilter('level', l)}
                  >
                    {t(LEVEL_LABELS[l])}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {t('libraryFilterTag', { defaultValue: 'Goal' })}
              </p>
              <div className="flex flex-wrap gap-2">
                {TAG_CHIPS.map((tag) => (
                  <FilterChip
                    key={tag || 'all-tag'}
                    active={filters.tag === tag}
                    onClick={() => setFilter('tag', tag)}
                  >
                    {tag ? PROGRAM_TAG_LABELS[tag] : t('libraryTagAll', { defaultValue: 'All' })}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={clearFilters}>
                {t('libraryClearFilters', { defaultValue: 'Clear filters' })}
              </Button>
              <Button variant="default" className="flex-1" onClick={() => setFiltersOpen(false)}>
                {t('libraryApplyFilters', { defaultValue: 'Done' })}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleExercises.map((ex, idx) => {
          /*
            Craft-index card (GrokFilm-style metadata at a glance):
            mono pattern label · form-diagram reel-dot · level · tags.
            No nested interactive roles — real Button inside is the keyboard stop.
          */
          const pattern = inferFormPattern(ex.id, ex);
          const guideMedia = getFormGuideOrCues(ex.id, { exercise: ex });
          const hasForm = !!guideMedia?.mediaUrl;
          const posterUrl =
            guideMedia?.mediaPosterUrl ??
            (guideMedia?.mediaType === 'image' &&
            guideMedia.mediaUrl &&
            !guideMedia.mediaUrl.endsWith('.svg')
              ? guideMedia.mediaUrl
              : undefined);
          const isPicked = pickedIds.includes(ex.id);
          return (
          <Card
            key={ex.id}
            className={cn(
              'content-card pressable-card cursor-pointer overflow-hidden',
              isPicked && 'border-primary ring-1 ring-primary'
            )}
            onClick={() => setDetailId(ex.id)}
          >
            {posterUrl ? (
              <div className="border-b-2 border-border bg-background">
                {/* Form Index still under /public — plain img is intentional. */}
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
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] tracking-wider text-primary uppercase">
                    {hasForm ? (
                      <span className="me-1.5 inline-block h-1.5 w-1.5 bg-primary align-middle" aria-hidden />
                    ) : null}
                    {pattern ? PATTERN_FILTER_LABELS[pattern] : t('libraryPatternUnknown', { defaultValue: 'Move' })}
                  </span>
                  <button
                    type="button"
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center border-2 border-border',
                      isPicked
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'bg-background text-muted-foreground hover:border-primary'
                    )}
                    aria-pressed={isPicked}
                    aria-label={
                      isPicked
                        ? t('libraryUnpick', { name: ex.name, defaultValue: `Remove ${ex.name} from session` })
                        : t('libraryPick', { name: ex.name, defaultValue: `Add ${ex.name} to session` })
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePick(ex.id);
                    }}
                  >
                    <Check className="h-4 w-4" aria-hidden />
                  </button>
                </div>
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
              <p className="text-muted-foreground line-clamp-2">
                {exerciseCraftBlurb(ex)}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full text-xs"
                aria-label={t('libraryViewDetailsFor', {
                  name: ex.name,
                  defaultValue: `View details for ${ex.name}`,
                })}
                onClick={(e) => {
                  e.stopPropagation();
                  setDetailId(ex.id);
                }}
              >
                {t('libraryViewDetails', { defaultValue: 'View details →' })}
              </Button>
            </CardContent>
          </Card>
          );
        })}
      </div>

      {filtered.length > visibleCount ? (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-[44px]"
            onClick={() => setVisibleCount((n) => n + 48)}
          >
            {t('libraryLoadMore', {
              remaining: filtered.length - visibleCount,
              defaultValue: `Load more (${filtered.length - visibleCount} left)`,
            })}
          </Button>
        </div>
      ) : null}

      {filtered.length === 0 && (
        <EmptyState
          icon={Dumbbell}
          title={t('libraryNoResultsTitle', { defaultValue: 'Nothing matches' })}
          description={t('libraryNoResults', {
            defaultValue: 'Clear equipment or muscle filters to see the full library again.',
          })}
          actionLabel={t('libraryClearFilters', { defaultValue: 'Clear filters' })}
          onAction={() => setFilters({ ...DEFAULT_LIBRARY_FILTERS })}
        />
      )}

      <LibraryDetailSheet
        exercise={detailExercise}
        open={!!detailId}
        onOpenChange={(open) => !open && setDetailId(null)}
        onSelectExercise={(id) => setDetailId(id)}
        neighborIds={filtered.map((e) => e.id)}
      />

      {pickMode && (
        <div
          className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-border bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          role="region"
          aria-label={t('libraryPickBar', { defaultValue: 'Session pick bar' })}
        >
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {t('libraryPickedCount', {
                count: pickedIds.length,
                max: LIBRARY_PICK_MAX,
                defaultValue: `${pickedIds.length} / ${LIBRARY_PICK_MAX} selected`,
              })}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="min-h-[44px] border-2"
                onClick={() => setPickedIds([])}
              >
                {t('libraryClearPick', { defaultValue: 'Clear' })}
              </Button>
              <Button
                type="button"
                variant="default"
                className="min-h-[44px]"
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
              </Button>
            </div>
          </div>
        </div>
      )}
    </PillarPageShell>
  );
}
