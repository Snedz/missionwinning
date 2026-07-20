'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import type { WeekRecap } from '@/lib/weekRecap';
import { buildWeeklyDebrief, type WeeklyDebrief } from '@/lib/weeklyDebrief';
import { loadCheckIns } from '@/lib/mindCheckIns';
import { loadBodyMetrics } from '@/lib/bodyMetrics';
import { useWorkoutStore } from '@/store/workoutStore';
import { track } from '@/lib/analytics';

type Props = {
  recap: WeekRecap;
  /** Force full debrief layout (dev / QA). */
  forceFull?: boolean;
};

/** End-of-week debrief + mid-week pulse — retention surface. */
export function TodayWeekRecapCard({ recap, forceFull }: Props) {
  const { t } = useTranslation();
  const history = useWorkoutStore((s) => s.workoutHistory);
  const [expanded, setExpanded] = useState(false);
  const [viewed, setViewed] = useState(false);

  const debrief: WeeklyDebrief = useMemo(() => {
    return buildWeeklyDebrief({
      history,
      checkIns: typeof window !== 'undefined' ? loadCheckIns() : [],
      bodyMetrics: typeof window !== 'undefined' ? loadBodyMetrics() : [],
    });
  }, [history, recap.weekStart, recap.sessions]);

  const full = forceFull || debrief.isFullDebrief;

  useEffect(() => {
    if (full && !viewed) {
      track('weekly_debrief_viewed');
      setViewed(true);
    }
  }, [full, viewed]);

  if (!recap.hasActivity && !recap.isWeekEnd && !full) return null;

  if (!full) {
    return (
      <section className="content-card border-brass/25 bg-brass/5 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brass/15 text-brass">
            <CalendarDays className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="eyebrow-honor">
              {t('todayWeekRecapTitle', { defaultValue: 'This week' })}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('todayWeekRecapBody', {
                sessions: recap.sessions,
                sets: recap.totalSets,
                streak: recap.streak,
                defaultValue: recap.hasActivity
                  ? `${recap.sessions} sessions · ${recap.totalSets} sets · ${recap.streak}-day streak`
                  : 'No sessions yet this week — Just Go keeps the path alive.',
              })}
            </p>
          </div>
        </div>
        <Links />
      </section>
    );
  }

  const focusText = t(debrief.focusKey, {
    ...(debrief.focusParams ?? {}),
    defaultValue: focusDefault(debrief.focusKey, debrief.focusParams?.group),
  });

  return (
    <section className="content-card border-brass/30 bg-gradient-to-br from-brass/10 via-card to-background p-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brass/15 text-brass">
          <CalendarDays className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="eyebrow-honor">
            {t('debriefTitle', { defaultValue: 'Mission Debrief' })}
          </p>
          <p className="text-sm text-foreground font-medium mt-0.5">{focusText}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <PillarStat
          eyebrow={t('debriefTrain', { defaultValue: 'Train' })}
          body={`${debrief.train.sessions} sess · ${debrief.train.sets} sets`}
        />
        <PillarStat
          eyebrow={t('debriefFuel', { defaultValue: 'Fuel' })}
          body={`${debrief.fuel.proteinDays} protein days`}
        />
        <PillarStat
          eyebrow={t('debriefMoveMind', { defaultValue: 'Move / Mind' })}
          body={`${debrief.moveMind.flows} flows · ${debrief.moveMind.sessions} check-ins`}
        />
        <PillarStat
          eyebrow={t('debriefBody', { defaultValue: 'Body' })}
          body={
            debrief.body?.weightDelta != null
              ? `${debrief.body.weightDelta > 0 ? '+' : ''}${debrief.body.weightDelta} kg`
              : t('debriefBodyNone', { defaultValue: 'No weight logged' })
          }
        />
      </div>

      {debrief.train.prs > 0 ? (
        <p className="text-xs text-brass font-medium">
          {t('debriefPrs', {
            count: debrief.train.prs,
            defaultValue: `${debrief.train.prs} PR marks this week`,
          })}
        </p>
      ) : null}

      <button
        type="button"
        className="flex items-center gap-1 text-xs text-primary"
        onClick={() => setExpanded((e) => !e)}
      >
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {expanded
          ? t('debriefCollapse', { defaultValue: 'Less' })
          : t('debriefExpand', { defaultValue: 'Details' })}
      </button>

      {expanded ? (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('debriefDetails', {
            volume: Math.round(debrief.train.volume),
            defaultValue: `Training volume ~${Math.round(debrief.train.volume)}. Focus next week on the note above — honest, not automatic.`,
          })}
        </p>
      ) : null}

      <Links />
    </section>
  );
}

function PillarStat({ eyebrow, body }: { eyebrow: string; body: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-background/40 p-2.5">
      <div className="eyebrow text-[9px] text-muted-foreground mb-0.5">{eyebrow}</div>
      <div className="tabular-nums text-foreground font-medium">{body}</div>
    </div>
  );
}

function Links() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/coach"
        className="text-xs font-medium text-primary hover:underline underline-offset-4"
      >
        {t('todayWeekRecapCoach', { defaultValue: 'Open AI weekly plan' })}
      </Link>
      <span className="text-muted-foreground text-xs">·</span>
      <Link
        href="/history"
        className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
      >
        {t('todayWeekRecapHistory', { defaultValue: 'History' })}
      </Link>
      <span className="text-muted-foreground text-xs">·</span>
      <Link
        href="/track"
        className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
      >
        {t('debriefTrackLink', { defaultValue: 'Body metrics' })}
      </Link>
    </div>
  );
}

function focusDefault(key: string, group?: string): string {
  switch (key) {
    case 'debriefFocusGetOneSession':
      return 'Priority: get one quality session logged this week.';
    case 'debriefFocusUndertrained':
      return `Priority: hit ${group ?? 'undertrained'} next — longest rest group.`;
    case 'debriefFocusDeloadWatch':
      return 'High streak — watch strain; consider an easier day.';
    case 'debriefFocusFuelProtein':
      return 'Training is on — lock protein logging more days.';
    default:
      return 'Keep the consistency you earned.';
  }
}
