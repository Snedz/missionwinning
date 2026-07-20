'use client';

/**
 * Pre-session readiness check-in — once per day on /active.
 * Skippable; writes mw_mind_checkins; never auto-trims volume.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  getTodayCheckIn,
  isTodayCheckInComplete,
  upsertTodayPartial,
  type MindCheckIn,
} from '@/lib/mindCheckIns';
import { track } from '@/lib/analytics';

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
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  lowHint: string;
  highHint: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground tabular-nums">{value}/5</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 min-h-[44px] rounded-md text-sm font-medium transition-colors ${
              value >= n
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
  const [soreness, setSoreness] = useState(3);
  const [sleep, setSleep] = useState(3);
  const [motivation, setMotivation] = useState(3);

  useEffect(() => {
    if (!open) return;
    const existing = getTodayCheckIn();
    if (existing) {
      setSoreness(existing.soreness ?? 3);
      setSleep(existing.sleep);
      setMotivation(existing.energy);
    }
  }, [open]);

  if (!open) return null;

  const save = () => {
    const checkIn = upsertTodayPartial({
      soreness,
      sleep,
      energy: motivation, // motivation → energy field
    });
    track('readiness_checkin_completed', { adjusted: true });
    onDismiss({ completed: true, checkIn });
  };

  const skip = () => {
    track('readiness_checkin_completed', { adjusted: false });
    onDismiss({ completed: false, checkIn: getTodayCheckIn() });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-checkin-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl space-y-4">
        <div>
          <p className="eyebrow text-[hsl(var(--status-info))] mb-1">
            {t('sessionCheckInEyebrow', { defaultValue: 'Pre-session' })}
          </p>
          <h2 id="session-checkin-title" className="text-lg font-semibold text-foreground">
            {t('sessionCheckInTitle', { defaultValue: 'How do you feel?' })}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {t('sessionCheckInLead', {
              defaultValue:
                'Three quick ratings. We nudge readiness (never auto-cut your sets without a tap).',
            })}
          </p>
        </div>

        <QuickRow
          label={t('sessionCheckInSoreness', { defaultValue: 'Soreness' })}
          value={soreness}
          onChange={setSoreness}
          lowHint={t('sessionCheckInFresh', { defaultValue: 'Fresh' })}
          highHint={t('sessionCheckInBeaten', { defaultValue: 'Beaten up' })}
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

        <div className="flex flex-col gap-2 pt-1">
          <Button type="button" variant="fitness" className="w-full min-h-[44px]" onClick={save}>
            {t('sessionCheckInSave', { defaultValue: 'Save & continue' })}
          </Button>
          <Button type="button" variant="ghost" className="w-full min-h-[44px]" onClick={skip}>
            {t('sessionCheckInSkip', { defaultValue: 'Not now' })}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** True when the session sheet should open (no complete check-in today). */
export function shouldOfferSessionCheckIn(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (sessionStorage.getItem('mw_session_checkin_skipped') === todayKey()) return false;
  } catch {
    /* private mode */
  }
  return !isTodayCheckInComplete();
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function markSessionCheckInSkipped(): void {
  try {
    sessionStorage.setItem('mw_session_checkin_skipped', todayKey());
  } catch {
    /* noop */
  }
}
