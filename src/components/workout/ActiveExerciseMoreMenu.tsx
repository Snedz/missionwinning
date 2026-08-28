'use client';

/**
 * Overflow menu for one ActiveExerciseCard (Ask / Superset / Note / Swap / e1RM hide / Remove).
 * HoldToConfirm stays outside `role=menu` (aria-busy is not a menuitem).
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { MoreVertical } from 'lucide-react';
import { HoldToConfirmButton } from '@/components/ui/HoldToConfirmButton';
import {
  shouldShowSupersetLinkMenuitem,
  shouldShowExerciseSwapMenuitem,
} from '@/lib/workout/activeWorkoutHelpers';
import { SESSION_E1RM_COPY } from '@/lib/workout/sessionE1rm';
import {
  hideExerciseNow,
  isExerciseHidden,
  loadHiddenExerciseIds,
  unhideExerciseNow,
} from '@/lib/workout/hideExercise';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseId: string;
  hasNextExercise: boolean;
  nextInThisGroup: boolean;
  supersetted: boolean;
  hasCompletedSet: boolean;
  skippedThisSession?: boolean;
  swapOptionCount: number;
  onToggleSuperset: () => void;
  onUnlinkSuperset: () => void;
  onToggleNote: () => void;
  onToggleSwap: () => void;
  onToggleE1rm: () => void;
  e1rmVisible: boolean;
  onSkip: () => void;
  onRemove: () => void;
};

export function ActiveExerciseMoreMenu({
  open,
  onOpenChange,
  exerciseId,
  hasNextExercise,
  nextInThisGroup,
  supersetted,
  hasCompletedSet,
  skippedThisSession = false,
  swapOptionCount,
  onToggleSuperset,
  onUnlinkSuperset,
  onToggleNote,
  onToggleSwap,
  onToggleE1rm,
  e1rmVisible,
  onSkip,
  onRemove,
}: Props) {
  const { t } = useTranslation();
  const hidden = isExerciseHidden(exerciseId, loadHiddenExerciseIds());

  return (
    <div className="relative">
      <button
        type="button"
        className="house-btn house-btn-ghost min-h-[44px] min-w-[44px] tap-target"
        data-testid="active-exercise-more"
        aria-label={t('activeExerciseMore', { defaultValue: 'More actions' })}
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        <MoreVertical className="h-5 w-5" />
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label={t('activeCloseMenu', { defaultValue: 'Close menu' })}
            onClick={() => onOpenChange(false)}
          />
          <div className="house-card house-exercise-more absolute end-0 top-full z-50 mt-1 min-w-[11rem]">
            <div role="menu">
              <Link
                href={`/coach?ask=${encodeURIComponent(exerciseId)}`}
                role="menuitem"
                className="house-btn house-btn-ghost min-h-[44px] w-full justify-start tap-target"
                onClick={() => onOpenChange(false)}
              >
                {t('activeAskAboutForm', { defaultValue: 'Ask about form' })}
              </Link>
              {shouldShowSupersetLinkMenuitem(hasNextExercise, nextInThisGroup) && (
                <button
                  type="button"
                  role="menuitem"
                  className="house-btn house-btn-ghost min-h-[44px] w-full justify-start tap-target"
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
                  className="house-btn house-btn-ghost min-h-[44px] w-full justify-start tap-target"
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
                className="house-btn house-btn-ghost min-h-[44px] w-full justify-start tap-target"
                onClick={() => {
                  onToggleNote();
                  onOpenChange(false);
                }}
              >
                {t('activeNote', { defaultValue: 'Note' })}
              </button>
              {shouldShowExerciseSwapMenuitem(
                hasCompletedSet,
                swapOptionCount,
                skippedThisSession
              ) && (
                <button
                  type="button"
                  role="menuitem"
                  className="house-btn house-btn-ghost min-h-[44px] w-full justify-start tap-target"
                  onClick={() => {
                    onToggleSwap();
                    onOpenChange(false);
                  }}
                >
                  {t('activeSwap', { defaultValue: 'Swap' })}
                </button>
              )}
              <button
                type="button"
                role="menuitem"
                className="house-btn house-btn-ghost min-h-[44px] w-full justify-start tap-target"
                onClick={() => {
                  onToggleE1rm();
                  onOpenChange(false);
                }}
              >
                {e1rmVisible
                  ? t('activeE1rmHide', { defaultValue: SESSION_E1RM_COPY.hide })
                  : t('activeE1rmShow', { defaultValue: SESSION_E1RM_COPY.show })}
              </button>
              <button
                type="button"
                role="menuitem"
                data-testid="active-hide-from-library"
                className="house-btn house-btn-ghost min-h-[44px] w-full justify-start tap-target"
                onClick={() => {
                  if (hidden) unhideExerciseNow(exerciseId);
                  else hideExerciseNow(exerciseId, { live: [{ exerciseId }] });
                  onOpenChange(false);
                }}
              >
                {hidden
                  ? t('libraryUnhide', { defaultValue: 'Unhide' })
                  : t('libraryHideFromLibrary', { defaultValue: 'Hide from library' })}
              </button>
            </div>
            <div className="house-exercise-more-foot space-y-1">
              {!skippedThisSession && (
                <HoldToConfirmButton
                  chrome="house"
                  className="w-full justify-start"
                  label={t('activeSkipThisExerciseHold', {
                    defaultValue: 'Skip this exercise — this session',
                  })}
                  onConfirm={() => {
                    onOpenChange(false);
                    onSkip();
                  }}
                />
              )}
              <HoldToConfirmButton
                chrome="house"
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
