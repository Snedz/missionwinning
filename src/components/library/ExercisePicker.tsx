'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EXERCISES } from '@/data/exercises';
import { DEFAULT_LIBRARY_FILTERS, filterExercises } from '@/lib/libraryFilters';
import type { Exercise } from '@/types';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  onChange: (exerciseId: string) => void;
  /** Limit candidates (e.g. swap suggestions). Defaults to full catalog. */
  exercises?: Exercise[];
  placeholder?: string;
  className?: string;
  /** Override the list's height cap — a sheet gives it the whole body. */
  listClassName?: string;
  id?: string;
};

/** Searchable exercise list — replaces 200+ item Select dropdowns. */
export function ExercisePicker({
  value,
  onChange,
  exercises = EXERCISES,
  placeholder,
  className,
  listClassName,
  id,
}: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () =>
      filterExercises(exercises, {
        ...DEFAULT_LIBRARY_FILTERS,
        query,
      }).slice(0, 40),
    [exercises, query]
  );

  const selected = exercises.find((e) => e.id === value) ?? EXERCISES.find((e) => e.id === value);

  return (
    <div className={cn('flex-1 min-w-0 space-y-2', className)}>
      <input
        id={id}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={
          placeholder ??
          t('exercisePickerSearch', { defaultValue: 'Search exercises…' })
        }
        aria-label={
          placeholder ??
          t('exercisePickerSearch', { defaultValue: 'Search exercises…' })
        }
        className="w-full  border-2 border-border bg-background px-3 py-2.5 min-h-[44px] text-sm"
        autoComplete="off"
      />
      {selected && !query && (
        <p className="text-xs text-muted-foreground">
          {t('exercisePickerSelected', {
            name: selected.name,
            defaultValue: `Selected: ${selected.name}`,
          })}
        </p>
      )}
      {(query.trim().length > 0 || !selected) && (
        <div
          className={cn(
            'overflow-y-auto border-2 border-border divide-y divide-border',
            listClassName ?? 'max-h-48'
          )}
          role="listbox"
          aria-label={t('exercisePickerList', { defaultValue: 'Exercise matches' })}
          tabIndex={0}
        >
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              {t('exercisePickerEmpty', { defaultValue: 'No matches' })}
            </p>
          ) : (
            filtered.map((ex) => (
              <button
                key={ex.id}
                type="button"
                role="option"
                aria-selected={value === ex.id}
                className={cn(
                  'w-full min-h-[56px] px-3 py-2.5 text-start text-sm hover:bg-card',
                  value === ex.id && 'bg-accent-100 text-primary'
                )}
                onClick={() => {
                  onChange(ex.id);
                  setQuery('');
                }}
              >
                <span className="font-semibold">{ex.name}</span>
                <span className="block text-[11px] text-muted-foreground">
                  {[ex.muscleGroups.slice(0, 2).join(' · '), ex.equipment]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
