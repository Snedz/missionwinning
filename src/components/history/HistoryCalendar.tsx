'use client';

/**
 * A month of training, marking only what happened.
 *
 * The vocabulary and the reasoning behind it live in
 * [`monthGrid.ts`](../../lib/history/monthGrid.ts) — read that first. In short:
 * ink fill = trained, a small ink rule = logged something else, 2px poster
 * outline = today, and everything else is blank paper. **No day is ever marked
 * missed**, because a month of red ✕ would be both shaming and untrue: only one
 * coach plan is persisted and it is overwritten every Monday, so what an athlete
 * *meant* to do in March cannot be recovered.
 *
 * Colour is never the only carrier (WCAG 1.4.1): a trained day is an ink fill
 * *and* a dumbbell glyph, today is an outline *and* an `aria-current`, and every
 * cell has a full text label for screen readers.
 *
 * Weekday initials and the month name come from `i18n.language`, not the browser
 * locale. It was the only formatter in the repo that did: `.242` swept the
 * other 42 sites onto `useLocaleFormat()` and deleted `utils.formatDate`, whose
 * `undefined` first argument silently meant *ask the browser*. Monday-first,
 * matching `startOfLocalWeek` and every other week in the app.
 *
 * Month they own: a day is a button. Tap lists that day's live History
 * rows. Session count is a fact, not a fire count. Tombs stay out.
 * Start-from fold does not hide a mark. Viewed `monthKey` is lifted so
 * Save this month (`.1029`) writes the month on screen.
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react';
import type { CompletedWorkoutLog } from '@/types';
import { localDateKeyFromIso, shiftLocalMonth, formatLocalMonthKey } from '@/lib/time/localDate';
import { buildMonthGrid, trainedDayKeys, type MonthDay } from '@/lib/history/monthGrid';
import { monthLiveFacts } from '@/lib/history/monthTheyOwn';
import { cn } from '@/lib/utils';

type Props = {
  history: CompletedWorkoutLog[];
  /** Local date keys with a non-training signal — food, check-in, activity, win. */
  loggedKeys?: ReadonlySet<string>;
  /** Local `YYYY-MM-DD` currently opened on History. */
  selectedKey?: string;
  /** Tap a date — parent lists that day's live rows. */
  onSelectDate?: (key: string) => void;
  /** Local `YYYY-MM` currently shown — owned by History so the month file matches the screen. */
  monthKey: string;
  onMonthKeyChange: (key: string) => void;
};

function DayCell({
  day,
  label,
  selected,
  onSelect,
}: {
  day: MonthDay;
  label: string;
  selected: boolean;
  onSelect: (key: string) => void;
}) {
  const trained = day.mark === 'trained';
  return (
    <button
      type="button"
      data-testid="history-month-day"
      data-date={day.key}
      aria-pressed={selected}
      aria-current={day.isToday ? 'date' : undefined}
      aria-label={`${day.key} — ${label}`}
      onClick={() => onSelect(day.key)}
      className={cn(
        'flex aspect-square min-h-[44px] flex-col items-center justify-center border-2 text-[13px] tabular-nums',
        'border-transparent',
        trained && 'bg-foreground text-background',
        day.mark === 'logged' && 'bg-card',
        selected && !day.isToday && 'border-foreground',
        // Drawn last so it still reads on a filled cell.
        day.isToday && 'border-[hsl(var(--accent-poster))]',
        /*
         * Future days are muted, **not faded**. The first draft used
         * `text-muted-foreground/50`, which axe measured at 2.42:1 (#9e9d9d on
         * paper) — the same alpha-on-a-contrast-token defect `.240` fixed three
         * times in one wave and `.127` before it. `--muted-foreground` at full
         * strength is 8.4:1 and reads as quieter than ink on its own.
         */
        day.isFuture ? 'text-muted-foreground' : 'text-foreground'
      )}
    >
      <span className={cn('font-semibold', trained && 'text-background')}>{day.day}</span>
      {/* The glyph, not the fill, is what a colour-blind or low-vision reader
          gets — the fill alone would make WCAG 1.4.1 the only thing carrying it. */}
      {trained && <Dumbbell className="mt-0.5 h-3 w-3" aria-hidden />}
      {day.mark === 'logged' && <span className="mt-1 h-0.5 w-3 bg-foreground" aria-hidden />}
    </button>
  );
}

export function HistoryCalendar({
  history,
  loggedKeys,
  selectedKey,
  onSelectDate,
  monthKey,
  onMonthKeyChange,
}: Props) {
  const { t, i18n } = useTranslation();
  const facts = useMemo(() => monthLiveFacts(history), [history]);

  const grid = useMemo(() => {
    const trained = trainedDayKeys(history, localDateKeyFromIso);
    const built = buildMonthGrid({
      monthKey,
      trainedKeys: new Set(trained.keys()),
      loggedKeys: loggedKeys ?? new Set<string>(),
    });
    return {
      ...built,
      days: built.days.map((d) => ({
        ...d,
        sessions: facts.get(d.key)?.sessions ?? 0,
      })),
    };
  }, [facts, history, loggedKeys, monthKey]);

  const monthLabel = useMemo(
    () => formatLocalMonthKey(monthKey, i18n.language),
    [monthKey, i18n.language]
  );

  /*
   * Weekday initials derived, not hardcoded. `WeekStrip` and `Skeleton` each
   * carry their own English array (`['Mon','Tue',…]`, `['M','T',…]`), which is
   * two spellings of the same fact that are wrong in fourteen languages. 2026-06-01
   * is a Monday, so it is a stable anchor for a Monday-first header row.
   */
  const weekdayInitials = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        new Date(2026, 5, 1 + i).toLocaleDateString(i18n.language, { weekday: 'narrow' })
      ),
    [i18n.language]
  );

  const dayLabel = (d: MonthDay) => {
    if (d.mark === 'trained') return t('historyCalTrained', { defaultValue: 'Trained' });
    if (d.mark === 'logged') return t('historyCalLogged', { defaultValue: 'Logged activity' });
    return t('historyCalNothing', { defaultValue: 'Nothing logged' });
  };

  return (
    <section aria-label={t('historyCalendarLabel', { defaultValue: 'Training calendar' })}>
      <div className="flex items-center justify-between border-b-2 border-border pb-2">
        <h3 className="text-[15px] font-extrabold uppercase tracking-[0.04em]">{monthLabel}</h3>
        <div className="flex">
          {/* `rtl:rotate-180` — under `dir="rtl"` the grid reverses, so a chevron
              that still points left would send the reader the wrong way. */}
          <button
            type="button"
            onClick={() => onMonthKeyChange(shiftLocalMonth(monthKey, -1))}
            aria-label={t('historyCalPrev', { defaultValue: 'Previous month' })}
            className="flex h-11 w-11 items-center justify-center border-2 border-border text-foreground transition-colors hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onMonthKeyChange(shiftLocalMonth(monthKey, 1))}
            aria-label={t('historyCalNext', { defaultValue: 'Next month' })}
            className="-ms-0.5 flex h-11 w-11 items-center justify-center border-2 border-border text-foreground transition-colors hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1" aria-hidden>
        {weekdayInitials.map((w, i) => (
          <span
            key={i}
            className="text-center text-[11px] font-semibold uppercase text-muted-foreground"
          >
            {w}
          </span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: grid.leadingBlanks }, (_, i) => (
          <div key={`blank-${i}`} aria-hidden />
        ))}
        {grid.days.map((d) => (
          <DayCell
            key={d.key}
            day={d}
            selected={selectedKey === d.key}
            onSelect={(key) => onSelectDate?.(key)}
            label={`${d.key} — ${dayLabel(d)}`}
          />
        ))}
      </div>

      <p className="mt-4 border-t-2 border-border pt-3 text-[13px] text-muted-foreground">
        {t('historyCalSummary', {
          trained: grid.trainedDays,
          logged: grid.loggedDays,
          defaultValue: `${grid.trainedDays} training days · ${grid.loggedDays} other logged days`,
        })}
      </p>

      {grid.trainedDays === 0 ? (
        <p
          data-testid="history-month-empty"
          className="mt-2 text-[13px] text-muted-foreground"
        >
          {t('historyMonthEmpty', { defaultValue: 'Nothing logged this month.' })}
        </p>
      ) : null}

      {/*
        Storage limits are not behaviour. Nutrition prunes at 90 days and mind
        check-ins cap at 90 entries, so an old month shows fewer "logged" days
        than the athlete actually had — saying so is the difference between a
        record and a misleading one.
      */}
      {grid.beyondRetention && (
        <p className="mt-2 text-[13px] text-muted-foreground">
          {t('historyCalRetention', {
            defaultValue:
              'Workouts are kept forever. Meals and check-ins older than about three months are cleared from this device, so this month may show fewer of those than you logged.',
          })}
        </p>
      )}
    </section>
  );
}
