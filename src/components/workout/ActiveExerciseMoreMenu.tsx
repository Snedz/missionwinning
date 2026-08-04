'use client';

/**
 * Overflow menu for one ActiveExerciseCard (Ask / Superset / Note / Swap / Remove).
 * HoldToConfirm stays outside `role=menu` (aria-busy is not a menuitem).
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HoldToConfirmButton } from '@/components/ui/HoldToConfirmButton';
import {
  shouldShowSupersetLinkMenuitem,
  shouldShowExerciseSwapMenuitem,
} from '@/lib/workout/activeWorkoutHelpers';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseId: string;
  hasNextExercise: boolean;
  supersetted: boolean;
  hasCompletedSet: boolean;
  onToggleSuperset: () => void;
  onUnlinkSuperset: () => void;
  onToggleNote: () => void;
  onToggleSwap: () => void;
  onRemove: () => void;
};

export function ActiveExerciseMoreMenu({
  open,
  onOpenChange,
  exerciseId,
  hasNextExercise,
  supersetted,
  hasCompletedSet,
  onToggleSuperset,
  onUnlinkSuperset,
  onToggleNote,
  onToggleSwap,
  onRemove,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-11 w-11 tap-target"
        aria-label={t('activeExerciseMore', { defaultValue: 'More actions' })}
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        <MoreVertical className="h-5 w-5" />
      </Button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label={t('activeCloseMenu', { defaultValue: 'Close menu' })}
            onClick={() => onOpenChange(false)}
          />
          <div className="absolute end-0 top-full z-50 mt-1 min-w-[11rem] border-2 border-border bg-card p-1">
            <div role="menu">
              <Link
                href={`/coach?ask=${encodeURIComponent(exerciseId)}`}
                role="menuitem"
                className="flex min-h-[44px] items-center px-3 text-sm hover:bg-accent-100"
                onClick={() => onOpenChange(false)}
              >
                {t('activeAskAboutForm', { defaultValue: 'Ask about form' })}
              </Link>
              {shouldShowSupersetLinkMenuitem(hasNextExercise, supersetted) && (
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full min-h-[44px] items-center px-3 text-sm hover:bg-accent-100 text-start"
                  onClick={() => {
                    onToggleSuperset();
                    onOpenChange(false);
                  }}
                >
                  {t('activeSupersetLink', { defaultValue: 'Superset w/ next' })}
                </button>
              )}
              {supersetted && (
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full min-h-[44px] items-center px-3 text-sm hover:bg-accent-100 text-start"
                  onClick={() => {
                    onUnlinkSuperset();
                    onOpenChange(false);
                  }}
                >
                  {t('activeSupersetUnlink', { defaultValue: 'Unlink superset' })}
                </button>
              )}
              <button
                type="button"
                role="menuitem"
                className="flex w-full min-h-[44px] items-center px-3 text-sm hover:bg-accent-100 text-start"
                onClick={() => {
                  onToggleNote();
                  onOpenChange(false);
                }}
              >
                {t('activeNote', { defaultValue: 'Note' })}
              </button>
              {shouldShowExerciseSwapMenuitem(hasCompletedSet) && (
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full min-h-[44px] items-center px-3 text-sm hover:bg-accent-100 text-start"
                  onClick={() => {
                    onToggleSwap();
                    onOpenChange(false);
                  }}
                >
                  {t('activeSwap', { defaultValue: 'Swap' })}
                </button>
              )}
            </div>
            <div className="border-t border-border px-1 pt-1">
              <HoldToConfirmButton
                size="sm"
                className="w-full justify-start"
                label={
                  hasCompletedSet
                    ? t('activeRemoveExerciseLogged', {
                        defaultValue: 'Remove exercise — discards logged sets',
                      })
                    : t('activeRemoveExercise', { defaultValue: 'Remove exercise' })
                }
                onConfirm={() => {
                  onOpenChange(false);
                  onRemove();
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
