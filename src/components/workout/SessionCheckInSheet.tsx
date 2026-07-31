'use client';

/**
 * Pre-session readiness check-in — once per day on /active.
 * Skippable; writes mw_mind_checkins; never auto-trims volume.
 */

import { localDateKey } from '@/lib/time/localDate';
import { useEffect, useId, useRef, useState, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import {
  getTodayCheckIn,
  isTodayCheckInComplete,
  upsertTodayPartial,
  type MindCheckIn,
} from '@/lib/mindCheckIns';
import { track } from '@/lib/analytics';
import { readWorkoutHistoryFromStorage } from '@/lib/workout/workoutPersistLite';

type Props = {
  open: boolean;
  onDismiss: (result: {
    completed: boolean;
    checkIn: MindCheckIn | null;
  }) => void;
};

function QuickRow({
  label,
  value,
  onChange,
  lowHint,
  highHint,
  firstButtonRef,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  lowHint: string;
  highHint: string;
  firstButtonRef?: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-semibold">{label}</span>
        <span className="text-muted-foreground tabular-nums">{value}/5</span>
      </div>
      {/*
        One 2px-ruled strip with 1px internal divisions, filling left to right.
        It was five separate `bg-muted` buttons — `#eae9e9` on a `bg-card`
        `#eae9e9` sheet ground, which is 1.01:1: four of the five did not exist
        until you tapped one. MeterBar's own comment documents this exact trap.
        A tag or a fill inside a sheet needs a rule, not a tint.
      */}
      <div
        className="flex border-2 border-border divide-x divide-border"
        role="group"
        aria-label={label}
      >
        {[1, 2, 3, 4, 5].map((n, i) => (
          <button
            key={n}
            ref={i === 0 ? firstButtonRef : undefined}
            type="button"
            onClick={() => onChange(n)}
            aria-pressed={value >= n}
            className={`flex-1 min-h-[44px] tap-target text-sm font-semibold tabular-nums transition-colors ${
              value >= n
                ? 'bg-primary-fill text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{lowHint}</span>
        <span>{highHint}</span>
      </div>
    </div>
  );
}

export function SessionCheckInSheet({ open, onDismiss }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const firstControlRef = useRef<HTMLButtonElement | null>(null);
  const [soreness, setSoreness] = useState(3);
  const [sleep, setSleep] = useState(3);
  const [motivation, setMotivation] = useState(3);

  const skip = () => {
    track('readiness_checkin_completed', { adjusted: false });
    onDismiss({ completed: false, checkIn: getTodayCheckIn() });
  };

  const save = () => {
    const checkIn = upsertTodayPartial({
      soreness,
      sleep,
      energy: motivation,
    });
    track('readiness_checkin_completed', { adjusted: true });
    onDismiss({ completed: true, checkIn });
  };

  useEffect(() => {
    if (!open) return;
    const existing = getTodayCheckIn();
    if (existing) {
      setSoreness(existing.soreness ?? 3);
      setSleep(existing.sleep);
      setMotivation(existing.energy);
    }
  }, [open]);

  return (
    <AdaptiveOverlay
      open={open}
      onClose={skip}
      size="sm"
      titleId={titleId}
      eyebrow={t('sessionCheckInEyebrow', { defaultValue: 'Before you train' })}
      title={t('sessionCheckInTitle', { defaultValue: 'How do you feel?' })}
      initialFocusRef={firstControlRef}
      bodyClassName="p-5 space-y-4"
      footer={
        /* Pinned, and Skip keeps its full height. The sheet is skippable by
           design; a shrunken escape route is a dark pattern. */
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="fitness"
            className="w-full min-h-[52px] tap-target"
            onClick={save}
          >
            {t('sessionCheckInSave', { defaultValue: 'Save & continue' })}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full min-h-[52px] border-2 border-foreground tap-target"
            onClick={skip}
          >
            {t('sessionCheckInSkip', { defaultValue: 'Not now' })}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-muted-foreground leading-relaxed -mt-1">
        {t('sessionCheckInLead', {
          defaultValue:
            'Three quick ratings. We adjust readiness — we never cut your sets without asking.',
        })}
      </p>

      <QuickRow
        label={t('sessionCheckInSoreness', { defaultValue: 'Soreness' })}
        value={soreness}
        onChange={setSoreness}
        lowHint={t('sessionCheckInFresh', { defaultValue: 'Fresh' })}
        highHint={t('sessionCheckInBeaten', { defaultValue: 'Beaten up' })}
        firstButtonRef={firstControlRef}
      />
      <QuickRow
        label={t('sessionCheckInSleep', { defaultValue: 'Sleep last night' })}
        value={sleep}
        onChange={setSleep}
        lowHint={t('sessionCheckInPoor', { defaultValue: 'Poor' })}
        highHint={t('sessionCheckInGreat', { defaultValue: 'Great' })}
      />
      <QuickRow
        label={t('sessionCheckInMotivation', { defaultValue: 'Motivation' })}
        value={motivation}
        onChange={setMotivation}
        lowHint={t('sessionCheckInLow', { defaultValue: 'Low' })}
        highHint={t('sessionCheckInFired', { defaultValue: 'Fired up' })}
      />

    </AdaptiveOverlay>
  );
}

/** True when the session sheet should open (no complete check-in today). */
export function shouldOfferSessionCheckIn(): boolean {
  if (typeof window === 'undefined') return false;
  // W1: never block the first mission with a Mind questionnaire.
  if (readWorkoutHistoryFromStorage().length < 1) return false;
  try {
    if (sessionStorage.getItem('mw_session_checkin_skipped') === todayKey()) return false;
  } catch {
    /* private mode */
  }
  return !isTodayCheckInComplete();
}

function todayKey(): string {
  return localDateKey();
}

export function markSessionCheckInSkipped(): void {
  try {
    sessionStorage.setItem('mw_session_checkin_skipped', todayKey());
  } catch {
    /* noop */
  }
}
