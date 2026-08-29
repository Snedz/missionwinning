'use client';

/**
 * Short 1–2 garage stand-ins. Shared by the logger Swap sheet and Coach session line.
 */

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { Exercise } from '@/types';

type Props = {
  options: Exercise[];
  onChoose: (id: string) => void;
  /** Pending pick — confirm still happens in the Train sheet footer (`.959`). */
  selectedId?: string;
};

export function GarageSwapList({ options, onChoose, selectedId }: Props) {
  const { t } = useTranslation();

  return (
    <div className="mw-house space-y-3" data-testid="garage-swap-list">
      <p className="text-sm text-muted-foreground">
        {t('activeSwapGarageLead', {
          defaultValue: 'Same pattern. Floor, chair, or a bar you already have.',
        })}
      </p>
      <ul className="space-y-2">
        {options.map((ex) => (
          <li key={ex.id}>
            <button
              type="button"
              data-testid="garage-swap-option"
              data-swap-id={ex.id}
              className={cn(
                'house-btn house-btn-ghost house-swap-option min-h-[44px] w-full tap-target',
                selectedId === ex.id && 'is-on'
              )}
              onClick={() => onChoose(ex.id)}
            >
              <span className="font-semibold">{ex.name}</span>
              {ex.cues ? (
                <span className="text-xs text-muted-foreground">{ex.cues}</span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
