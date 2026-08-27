'use client';

/**
 * WEEK door on Today. One line + a link to /coach.
 * Not the week strip. Not a second Start. Not a feed.
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadPlan } from '@/lib/coach/storage';
import { currentWeekStart } from '@/lib/coach/splitPlanner';
import { peekCoachToday } from '@/lib/coach/peekCoachToday';

type DoorState = { kind: 'empty' } | { kind: 'ready'; name: string | null };

function readDoor(): DoorState {
  const plan = loadPlan();
  if (!plan || plan.weekStart !== currentWeekStart()) return { kind: 'empty' };
  if (!plan.sessions.length) return { kind: 'empty' };
  return {
    kind: 'ready',
    name: peekCoachToday()?.name?.trim() || null,
  };
}

export function TodayWeekDoor() {
  const { t } = useTranslation();
  const [state, setState] = useState<DoorState>({ kind: 'empty' });

  useEffect(() => {
    setState(readDoor());
    const refresh = () => setState(readDoor());
    window.addEventListener('mw-coach-plan-changed', refresh);
    window.addEventListener('mw-journey-event', refresh);
    return () => {
      window.removeEventListener('mw-coach-plan-changed', refresh);
      window.removeEventListener('mw-journey-event', refresh);
    };
  }, []);

  const line =
    state.kind === 'ready'
      ? state.name ||
        t('todayWeekDoorReady', { defaultValue: "This week's plan is ready" })
      : t('todayWeekDoorEmpty', {
          defaultValue: 'Generate this week from your logs',
        });

  return (
    <section data-testid="today-week-door" className="border-2 border-border bg-card">
      <Link
        href="/coach"
        className="flex min-h-[44px] items-center justify-between gap-3 px-4 py-3"
      >
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {t('navGroupWeek', { defaultValue: 'Week' })}
          </p>
          <p className="mt-0.5 truncate text-[15px] font-semibold leading-snug text-foreground">
            {line}
          </p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-primary">
          {t('todayWeekDoorOpen', { defaultValue: 'Open week' })}
        </span>
      </Link>
    </section>
  );
}
