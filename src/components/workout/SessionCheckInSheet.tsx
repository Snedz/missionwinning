'use client';

/**
 * Pre-session readiness check-in — once per day on /active.
 * Skippable; writes mw_mind_checkins; never auto-trims volume.
 */

import { localDateKey } from '@/lib/time/localDate';
import { useEffect, useId, useRef, useState, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import {
  getTodayCheckIn,
  isTodayCheckInComplete,
  upsertTodayPartial,
  type MindCheckIn,
} from '@/lib/mindCheckIns';
import { track } from '@/lib/analytics';
import { readWorkoutHistoryFromStorage } from '@/lib/workout/workoutPersistLite';
import { shouldOfferSessionCheckInDecision } from '@/lib/workout/sessionCheckInOffer';

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
        <span className="house-lede tabular-nums">{value}/5</span>
      </div>
      {/*
        One 2px-ruled strip with 1px internal divisions, filling left to right.
        It was five separate `bg-muted` buttons — `#eae9e9` on a `bg-card`
        `#eae9e9` sheet ground, which is 1.01:1: four of the five did not exist
        until you tapped one. MeterBar's own comment documents this exact trap.
        A tag or a fill inside a sheet needs a rule, not a tint.
      */}
      <div
        className="house-checkin-scale"
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
            /* `.241` — ink fill, not red, matching `DailyCheckIn`'s scale. The
               two are the same control implemented twice (`.178`, recorded not
               fixed: extracting it is a refactor, painting one of them a
               different colour from the other is a defect). Save is house-btn. */
            className={`house-checkin-tick min-h-[44px] tap-target ${
              value >= n ? 'is-on' : ''
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] house-lede">
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
      className="mw-house house-checkin"
      titleId={titleId}
      eyebrow={t('sessionCheckInEyebrow', { defaultValue: 'Before you train' })}
      title={t('sessionCheckInTitle', { defaultValue: 'How do you feel?' })}
      initialFocusRef={firstControlRef}
      bodyClassName="p-5 space-y-4"
      footer={
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="house-btn min-h-[52px] w-full tap-target"
            onClick={save}
          >
            {t('sessionCheckInSave', { defaultValue: 'Save & continue' })}
          </button>
          <button
            type="button"
            className="house-btn house-btn-ghost min-h-[52px] w-full tap-target"
            onClick={skip}
          >
            {t('sessionCheckInSkip', { defaultValue: 'Not now' })}
          </button>
        </div>
      }
    >
      <p className="house-lede text-sm">
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

/**
 * True when the session sheet should open.
 * W1 / pure rule: [`shouldOfferSessionCheckInDecision`](../../lib/workout/sessionCheckInOffer.ts).
 */
export function shouldOfferSessionCheckIn(): boolean {
  if (typeof window === 'undefined') return false;
  let skippedForToday = false;
  try {
    skippedForToday = sessionStorage.getItem('mw_session_checkin_skipped') === todayKey();
  } catch {
    /* private mode */
  }
  return shouldOfferSessionCheckInDecision({
    completedHistoryLength: readWorkoutHistoryFromStorage().length,
    skippedForToday,
    todayCheckInComplete: isTodayCheckInComplete(),
  });
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
