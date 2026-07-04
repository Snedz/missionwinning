'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dumbbell, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { LibraryDetailSheet } from '@/components/library/LibraryDetailSheet';
import { EmptyState } from '@/components/ui/EmptyState';
import { EXERCISES } from '@/data/exercises';
import { PROGRAM_TAG_LABELS } from '@/data/exerciseEnrichment';
import {
  filterExercises,
  uniqueMuscleGroups,
  type LibraryFilterState,
} from '@/lib/libraryFilters';
import { usePremium } from '@/hooks/usePremium';
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

const TAG_LABELS: Record<string, string> = {
  '': 'libraryTagAll',
  strength: 'libraryTagStrength',
  hypertrophy: 'libraryTagHypertrophy',
  conditioning: 'libraryTagConditioning',
  corrective: 'libraryTagCorrective',
};

function FilterChip({
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
        'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'border-primary bg-primary/15 text-primary'
          : 'border-border/60 text-muted-foreground hover:bg-muted/50'
      )}
    >
      {children}
    </button>
  );
}

export function LibraryPage() {
  const { t } = useTranslation();
  const { premium } = usePremium();
  const [filters, setFilters] = useState<LibraryFilterState>({
    query: '',
    equipment: '',
    tag: '',
    level: '',
    muscle: '',
  });
  const [detailId, setDetailId] = useState<string | null>(null);

  const muscleChips = useMemo(() => ['', ...uniqueMuscleGroups(EXERCISES).slice(0, 12)], []);
  const filtered = useMemo(() => filterExercises(EXERCISES, filters), [filters]);
  const detailExercise = detailId ? EXERCISES.find((e) => e.id === detailId) ?? null : null;

  const setFilter = <K extends keyof LibraryFilterState>(key: K, value: LibraryFilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <PillarPageShell
      icon={Dumbbell}
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

      <div className="sticky top-0 z-10 -mx-1 space-y-3 bg-background/95 backdrop-blur-sm py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('librarySearchPlaceholder', { defaultValue: 'Search name or muscle...' })}
            value={filters.query}
            onChange={(e) => setFilter('query', e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground self-center shrink-0">
            {t('libraryFilterMuscle', { defaultValue: 'Muscle' })}
          </span>
          {muscleChips.map((m) => (
            <FilterChip
              key={m || 'all-muscle'}
              active={filters.muscle === m}
              onClick={() => setFilter('muscle', m)}
            >
              {m || t('libraryEquipAll', { defaultValue: 'All' })}
            </FilterChip>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground self-center shrink-0">
            {t('libraryFilterEquipment', { defaultValue: 'Equipment' })}
          </span>
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

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground self-center shrink-0">
            {t('libraryFilterLevel', { defaultValue: 'Level' })}
          </span>
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

        <p className="text-xs text-muted-foreground">
          {t('libraryShowingCount', {
            shown: filtered.length,
            total: EXERCISES.length,
            defaultValue: `Showing ${filtered.length} of ${EXERCISES.length}`,
          })}
        </p>
      </div>

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
          onAction={() =>
            setFilters({ query: '', equipment: '', tag: '', level: '', muscle: '' })
          }
        />
      )}

      <LibraryDetailSheet
        exercise={detailExercise}
        open={!!detailId}
        onOpenChange={(open) => !open && setDetailId(null)}
      />
    </PillarPageShell>
  );
}
