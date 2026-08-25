'use client';

/**
 * Optional pinned reminder on the open lift — returns next session (`.996`).
 * Not History. Not our cues. Not the workout jot.
 */

import { type Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { EXERCISE_PIN_MAX } from '@/lib/workout/exercisePin';

type Props = {
  value: string;
  onChange: (pin: string) => void;
  inputRef?: Ref<HTMLInputElement>;
};

export function ExercisePinnedNoteField({ value, onChange, inputRef }: Props) {
  const { t } = useTranslation();

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      maxLength={EXERCISE_PIN_MAX}
      data-testid="exercise-pin"
      aria-label={t('activePinnedNote', { defaultValue: 'Pin' })}
      placeholder={t('activePinnedNotePlaceholder', {
        defaultValue: 'Pin — "45 degree incline"…',
      })}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border-2 border-border bg-background px-3 py-2.5 min-h-[44px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
    />
  );
}
