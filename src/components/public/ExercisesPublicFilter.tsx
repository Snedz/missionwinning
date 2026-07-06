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
import type { ProgramTag } from '@/types';
import { cn } from '@/lib/utils';

const EQUIP_CHIPS = ['', 'bodyweight', 'dumbbell', 'barbell', 'cable', 'band', 'kettlebell'] as const;
const TAG_CHIPS: (ProgramTag | '')[] = ['', 'strength', 'hypertrophy', 'conditioning', 'corrective'];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-3 py-1 text-xs transition-colors',
        active
          ? 'border-primary bg-primary/15 text-primary'
          : 'border-border/60 text-muted-foreground hover:bg-muted/50'
      )}
    >
      {children}
    </button>
  );
}

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

  const muscleChips = useMemo(
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
      <div className="sticky top-0 z-10 -mx-1 space-y-3 bg-background/95 backdrop-blur-sm py-3 mb-6">
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
          {muscleChips.map((m) => (
            <Chip key={m || 'all'} active={filters.muscle === m} onClick={() => setFilter('muscle', m)}>
              {m || 'All muscles'}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {EQUIP_CHIPS.map((e) => (
            <Chip
              key={e || 'all-e'}
              active={filters.equipment === e}
              onClick={() => setFilter('equipment', e)}
            >
              {e || 'All equipment'}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TAG_CHIPS.map((tag) => (
            <Chip key={tag || 'all-t'} active={filters.tag === tag} onClick={() => setFilter('tag', tag)}>
              {tag ? PROGRAM_TAG_LABELS[tag] : 'All goals'}
            </Chip>
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
