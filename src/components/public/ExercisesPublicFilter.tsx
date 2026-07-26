'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { EXERCISES, ensureFullExerciseCatalog } from '@/data/exercises';
import { PROGRAM_TAG_LABELS } from '@/data/exerciseEnrichment';
import {
  filterExercises,
  uniqueMuscleGroups,
  type LibraryFilterState,
} from '@/lib/libraryFilters';
import { FilterChip } from '@/components/ui/FilterChip';
import type { ProgramTag } from '@/types';

const EQUIP_CHIPS = ['', 'bodyweight', 'dumbbell', 'barbell', 'cable', 'band', 'kettlebell'] as const;
const TAG_CHIPS: (ProgramTag | '')[] = ['', 'strength', 'hypertrophy', 'conditioning', 'corrective'];

export function ExercisesPublicFilter() {
  const [filters, setFilters] = useState<LibraryFilterState>({
    query: '',
    equipment: '',
    tag: '',
    level: '',
    muscle: '',
  });
  const [catalogRevision, setCatalogRevision] = useState(0);

  useEffect(() => {
    void ensureFullExerciseCatalog().then(() => setCatalogRevision((n) => n + 1));
  }, []);

  const muscleFilterChips = useMemo(
    () => ['', ...uniqueMuscleGroups(EXERCISES).slice(0, 10)],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- in-place catalog extension
    [catalogRevision]
  );
  const filtered = useMemo(
    () => filterExercises(EXERCISES, filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- in-place catalog extension
    [filters, catalogRevision]
  );

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
          Showing {filtered.length} of {EXERCISES.length}
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {filtered.map((ex) => (
          <li key={ex.id}>
            <Link
              href={`/exercises/${ex.id}`}
              className="content-card pressable-card block px-4 py-3 text-sm"
            >
              <span className="font-medium">{ex.name}</span>
              <span className="text-muted-foreground ml-2">· {ex.muscleGroups.join(', ')}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
