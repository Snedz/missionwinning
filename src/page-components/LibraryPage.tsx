'use client';
/**
 * Page: /library — exercise catalog
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dumbbell, Search, SlidersHorizontal, X } from 'lucide-react';
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
  uniqueMuscleGroups,
  type LibraryFilterState,
} from '@/lib/libraryFilters';
import { usePremium } from '@/hooks/usePremium';
import type { ProgramTag } from '@/types';

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
  const { premium } = usePremium();
  const [filters, setFilters] = useState<LibraryFilterState>({ ...DEFAULT_LIBRARY_FILTERS });
  const [detailId, setDetailId] = useState<string | null>(null);
  const [catalogRevision, setCatalogRevision] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [muscleQuery, setMuscleQuery] = useState('');

  useEffect(() => {
    void ensureFullExerciseCatalog().then(() => setCatalogRevision((n) => n + 1));
  }, []);

  const allMuscles = useMemo(
    () => uniqueMuscleGroups(EXERCISES),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- in-place catalog extension
    [catalogRevision]
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
  };

  const activeFilterCount = [filters.equipment, filters.tag, filters.level, filters.muscle].filter(
    Boolean
  ).length;

  const clearFilters = () => setFilters({ ...DEFAULT_LIBRARY_FILTERS, query: filters.query });

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

      <div className="sticky top-0 z-10 -mx-1 space-y-2 bg-background/95 backdrop-blur-sm py-2">
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
              <span className="tabular-nums text-emerald-400">({activeFilterCount})</span>
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
            <button
              type="button"
              className="text-xs text-muted-foreground underline"
              onClick={clearFilters}
            >
              {t('libraryClearFilters', { defaultValue: 'Clear filters' })}
            </button>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          {t('libraryShowingCount', {
            shown: filtered.length,
            total: EXERCISES.length,
            defaultValue: `Showing ${filtered.length} of ${EXERCISES.length}`,
          })}
        </p>
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
              <Button variant="fitness" className="flex-1" onClick={() => setFiltersOpen(false)}>
                {t('libraryApplyFilters', { defaultValue: 'Done' })}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ex) => (
          <Card
            key={ex.id}
            className="content-card pressable-card cursor-pointer"
            onClick={() => setDetailId(ex.id)}
            onKeyDown={(e) => e.key === 'Enter' && setDetailId(ex.id)}
            role="button"
            tabIndex={0}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{ex.name}</CardTitle>
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
                {ex.cues ||
                  t('libraryCuesComing', {
                    defaultValue: 'Form cues coming soon for this movement.',
                  })}
              </p>
              <Button variant="ghost" size="sm" className="mt-2 w-full text-xs">
                {t('libraryViewDetails', { defaultValue: 'View details →' })}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={Dumbbell}
          title={t('libraryNoResultsTitle', { defaultValue: 'No matches' })}
          description={t('libraryNoResults', {
            defaultValue:
              'No exercises match these filters. Try clearing equipment or muscle filters.',
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
      />
    </PillarPageShell>
  );
}
