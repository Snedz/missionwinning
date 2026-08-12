'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import { FilterChip } from '@/components/ui/FilterChip';
import type { ProgramTag } from '@/types';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';

const EQUIP_CHIPS = ['', 'bodyweight', 'dumbbell', 'barbell', 'cable', 'band', 'kettlebell'] as const;
const TAG_CHIPS: (ProgramTag | '')[] = ['', 'strength', 'hypertrophy', 'conditioning', 'corrective'];

type Props = {
  /** Awaited server-side catalog size — avoids flashing the base ~126 count before lazy splice. */
  catalogTotal: number;
};

export function ExercisesPublicFilter({ catalogTotal }: Props) {
  const fmt = useLocaleFormat();
  const [filters, setFilters] = useState<LibraryFilterState>({ ...DEFAULT_LIBRARY_FILTERS });
  const [catalogRevision, setCatalogRevision] = useState(0);

  useEffect(() => {
    void ensureFullExerciseCatalog().then(() => setCatalogRevision((n) => n + 1));
  }, []);

  const muscleFilterChips = useMemo(
    () => ['', ...uniqueMuscleGroups(EXERCISES, fmt.lang).slice(0, 10)],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- in-place catalog extension
    [catalogRevision, fmt.lang]
  );
  const filtered = useMemo(
    () => filterExercises(EXERCISES, filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- in-place catalog extension
    [filters, catalogRevision]
  );

  const totalCount = catalogRevision > 0 ? EXERCISES.length : catalogTotal;

  const setFilter = <K extends keyof LibraryFilterState>(key: K, value: LibraryFilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <div className="sticky top-0 z-10 -mx-1 space-y-3 border-b-2 border-border bg-background py-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name or muscle..."
            value={filters.query}
            onChange={(e) => setFilter('query', e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {muscleFilterChips.map((m) => (
            <FilterChip key={m || 'all'} active={filters.muscle === m} onClick={() => setFilter('muscle', m)}>
              {m || 'All muscles'}
            </FilterChip>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PATTERN_FILTER_CHIPS.map((p) => (
            <FilterChip
              key={p || 'all-p'}
              active={filters.pattern === p}
              onClick={() => setFilter('pattern', p)}
            >
              {p ? PATTERN_FILTER_LABELS[p] : 'All patterns'}
            </FilterChip>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {EQUIP_CHIPS.map((e) => (
            <FilterChip
              key={e || 'all-e'}
              active={filters.equipment === e}
              onClick={() => setFilter('equipment', e)}
            >
              {e || 'All equipment'}
            </FilterChip>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TAG_CHIPS.map((tag) => (
            <FilterChip key={tag || 'all-t'} active={filters.tag === tag} onClick={() => setFilter('tag', tag)}>
              {tag ? PROGRAM_TAG_LABELS[tag] : 'All goals'}
            </FilterChip>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {totalCount}
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ex, idx) => {
          const pattern = inferFormPattern(ex.id, ex);
          const hasForm = !!getFormGuideOrCues(ex.id, { exercise: ex })?.mediaUrl;
          return (
            <li key={ex.id}>
              <Link
                href={`/exercises/${ex.id}`}
                className="content-card pressable-card flex h-full flex-col gap-2 px-4 py-3 text-sm"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[10px] tracking-wider text-muted-foreground tabular-nums">
                    {String(idx + 1).padStart(3, '0')}
                  </span>
                  <span className="font-mono text-[10px] tracking-wider text-primary uppercase">
                    {hasForm ? (
                      <span
                        className="me-1.5 inline-block h-1.5 w-1.5 bg-primary align-middle"
                        aria-hidden
                      />
                    ) : null}
                    {pattern ? PATTERN_FILTER_LABELS[pattern] : 'Move'}
                  </span>
                </div>
                <span className="font-medium text-foreground">{ex.name}</span>
                <span className="text-xs text-muted-foreground">
                  {ex.muscleGroups.join(' · ')}
                  {ex.equipment ? ` · ${ex.equipment}` : ''}
                </span>
                <span className="line-clamp-2 text-xs text-muted-foreground">
                  {exerciseCraftBlurb(ex)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
