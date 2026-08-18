'use client';

/**
 * Summary pin grid — 0–4 paper cards. Not poster-red; Start lives in the dock.
 * Session pin starts/resumes. Fuel / Coach are doors. Edit persists the list.
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { SummaryPin, SummaryPinId } from '@/lib/today/summaryPins';
import {
  SUMMARY_PIN_CATALOG,
  clampSummaryPins,
  toggleSummaryPinId,
} from '@/lib/today/summaryPins';

export function TodaySummaryPins({
  pins,
  selectedIds,
  editing,
  onEdit,
  onDone,
  onChangeIds,
  onSessionPin,
}: {
  pins: SummaryPin[];
  selectedIds: readonly SummaryPinId[];
  editing: boolean;
  onEdit: () => void;
  onDone: () => void;
  onChangeIds: (ids: SummaryPinId[]) => void;
  onSessionPin: () => void;
}) {
  const { t } = useTranslation();
  const shown = clampSummaryPins(pins);

  const labelFor = (id: SummaryPinId) =>
    id === 'session'
      ? t('todayPinSession', { defaultValue: 'Session' })
      : id === 'fuel'
        ? t('navFuel', { defaultValue: 'Fuel' })
        : t('navCoach', { defaultValue: 'Coach' });

  return (
    <section data-testid="today-pinned">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {t('todayPinned', { defaultValue: 'Pinned' })}
        </h2>
        {editing ? (
          <button
            type="button"
            className="min-h-[44px] px-2 text-sm font-semibold text-foreground"
            onClick={onDone}
          >
            {t('todayPinsDone', { defaultValue: 'Done' })}
          </button>
        ) : (
          <button
            type="button"
            className="min-h-[44px] px-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
            onClick={onEdit}
            data-testid="today-pins-edit"
          >
            {t('todayPinsEdit', { defaultValue: 'Edit' })}
          </button>
        )}
      </div>

      {editing ? (
        <ul className="border-2 border-border" data-testid="today-pins-catalog">
          {SUMMARY_PIN_CATALOG.map((id) => {
            const on = selectedIds.includes(id);
            return (
              <li key={id} className="border-t border-border first:border-t-0">
                <button
                  type="button"
                  className="flex min-h-[52px] w-full items-center justify-between gap-3 px-3 text-left text-sm font-semibold"
                  aria-pressed={on}
                  onClick={() => onChangeIds(toggleSummaryPinId(selectedIds, id))}
                >
                  <span>{labelFor(id)}</span>
                  <span className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                    {on
                      ? t('todayPinOn', { defaultValue: 'Pinned' })
                      : t('todayPinOff', { defaultValue: 'Off' })}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : shown.length === 0 ? null : (
        <ul className="grid grid-cols-2 gap-2" data-testid="today-summary-pins">
          {shown.map((pin) => {
            const title =
              pin.kind === 'fuel'
                ? t('navFuel', { defaultValue: 'Fuel' })
                : pin.kind === 'coach'
                  ? t('navCoach', { defaultValue: 'Coach' })
                  : pin.sessionName ??
                    (pin.kind === 'resume'
                      ? t('resumeWorkout', { defaultValue: 'Resume workout' })
                      : t('todayStartWorkout', { defaultValue: "Start Today's Workout" }));
            const line =
              pin.kind === 'fuel'
                ? t('todayPinFuelKicker', { defaultValue: 'Log food' })
                : pin.kind === 'coach'
                  ? t('todayPinCoachKicker', { defaultValue: 'This week' })
                  : pin.kind === 'resume' && pin.sessionName
                    ? t('resumeWorkout', { defaultValue: 'Resume workout' })
                    : pin.kind === 'last'
                      ? t('todayRepeatLastKicker', { defaultValue: 'Train' })
                      : pin.kind === 'start'
                        ? t('todayPinStartKicker', { defaultValue: "Today's session" })
                        : null;

            const body = (
              <>
                {line ? (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    {line}
                  </p>
                ) : null}
                <p className="mt-1 truncate text-[15px] font-semibold text-foreground">{title}</p>
              </>
            );

            const cardClass =
              'block min-h-[72px] w-full border-2 border-border bg-background px-3 py-2.5 text-left';

            if (pin.href) {
              return (
                <li key={pin.id}>
                  <Link href={pin.href} className={cardClass} data-testid="today-summary-pin">
                    {body}
                  </Link>
                </li>
              );
            }

            return (
              <li key={pin.id}>
                <button
                  type="button"
                  className={cardClass}
                  data-testid="today-summary-pin"
                  onClick={onSessionPin}
                >
                  {body}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
