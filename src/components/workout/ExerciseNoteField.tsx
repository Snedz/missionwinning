'use client';

/**
 * One-line per-exercise diary on the active log — after the set rows.
 * Prefill is store-time; this field only writes what they type or clear.
 */

import { type Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { EXERCISE_NOTE_MAX } from '@/lib/workout/exerciseNote';

type Props = {
  value: string;
  onChange: (note: string) => void;
  inputRef?: Ref<HTMLInputElement>;
};

export function ExerciseNoteField({ value, onChange, inputRef }: Props) {
  const { t } = useTranslation();

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      maxLength={EXERCISE_NOTE_MAX}
      data-testid="exercise-note"
      aria-label={t('activeNote', { defaultValue: 'Note' })}
      placeholder={t('activeNotePlaceholder', {
        defaultValue: 'Note — "machine 3, seat 4", "left knee tight"…',
      })}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border-2 border-border bg-background px-3 py-2.5 min-h-[44px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
    />
  );
}
