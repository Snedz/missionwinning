'use client';

/**
 * The homepage signature: the visitor logs a session and watches the next one change.
 *
 * Two rules made this what it is:
 *
 * 1. **It runs the real engine.** Every number comes from `suggestNextSetTarget` — the
 *    same double-progression function `/active` calls. Nothing is hardcoded, which is
 *    what the previous hero demo did (`readiness: 72`, `'Set 1 · Squat'`). With no users
 *    to quote, the only honest proof is the product doing the thing in front of you.
 * 2. **The visitor performs the claim.** "Plans from your logs" is an assertion until
 *    someone taps Log and sees the next session answer for it.
 *
 * The loop it demonstrates, accurately: this session's targets come from the matching
 * sets of the last one; what you log today sets what you are asked for next time.
 *
 * Labelled a demo, because it is one — brand guidelines forbid implying otherwise.
 */

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check } from 'lucide-react';
import {
  suggestNextSetTarget,
  type NextSetTarget,
  type SetSnapshot,
} from '@/lib/workout/nextSetTargets';
import { weightUnitLabel, type UnitsPref } from '@/lib/units';

/** Last session: every working set finished at the top of the range. */
const LAST_SESSION: SetSnapshot[] = [
  { reps: 12, weight: 80 },
  { reps: 12, weight: 80 },
  { reps: 12, weight: 80 },
];

const PLANNED_SETS = 3;
/** Cold visitors have no stored preference, so the demo speaks metric. */
const UNITS: UnitsPref = 'metric';
const UNIT = weightUnitLabel(UNITS);

type Props = {
  /** Rendered before hydration and when JS is off. */
  staticFallback?: React.ReactNode;
};

function fmt(target: NextSetTarget): string {
  return `${target.reps} × ${target.weight} ${UNIT}`;
}

export function LogToPlanHero({ staticFallback }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const [logged, setLogged] = useState<SetSnapshot[]>([]);

  /** This session, derived from the last one. All three sets hit 12 → engine adds load. */
  const todayTarget = useMemo(
    () => suggestNextSetTarget(LAST_SESSION, 0, UNITS),
    []
  );

  /** Next session, derived from what the visitor just logged. */
  const nextTarget = useMemo(
    () => (logged.length ? suggestNextSetTarget(logged, 0, UNITS) : null),
    [logged]
  );

  const done = logged.length >= PLANNED_SETS;

  const logSet = useCallback(() => {
    if (!todayTarget || done) return;
    setLogged((prev) => [...prev, { reps: todayTarget.reps, weight: todayTarget.weight }]);
  }, [todayTarget, done]);

  const reset = useCallback(() => setLogged([]), []);

  if (!todayTarget) return <>{staticFallback ?? null}</>;

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-4 sm:p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <p className="eyebrow">{t('heroDemoExercise', { defaultValue: 'Squat · today' })}</p>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] tabular-nums text-muted-foreground/70">
          {logged.length}/{PLANNED_SETS}
        </p>
      </div>

      {/* Completed rows carry brass — earned, per brand guidelines. Emerald marks what's next. */}
      <ul className="space-y-1.5">
        {Array.from({ length: PLANNED_SETS }, (_, i) => {
          const set = logged[i];
          const isNext = i === logged.length && !done;
          return (
            <li
              key={i}
              className={[
                'flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-200',
                set
                  ? 'border-brass/30 bg-brass/[0.06]'
                  : isNext
                    ? 'border-primary/40 bg-primary/[0.04]'
                    : 'border-border/40',
              ].join(' ')}
            >
              <span className="w-4 shrink-0 font-mono text-xs tabular-nums text-muted-foreground/70">
                {i + 1}
              </span>
              <span
                className={`font-mono text-sm tabular-nums ${
                  set || isNext ? 'text-foreground' : 'text-muted-foreground/50'
                }`}
              >
                {fmt(todayTarget)}
              </span>
              {set ? <Check className="ms-auto h-4 w-4 shrink-0 text-brass" aria-hidden /> : null}
            </li>
          );
        })}
      </ul>

      {/* The payoff. Before: why today asks for this. After: what it changed. */}
      <div
        className="mt-4 min-h-[3.5rem] rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5"
        aria-live="polite"
      >
        {done && nextTarget ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.18em] text-primary">
              {t('heroDemoNextSession', { defaultValue: 'Next session' })}
            </span>{' '}
            <span className="font-mono tabular-nums text-foreground">{fmt(nextTarget)}</span>
            {' — '}
            {t('heroDemoNextWhy', {
              defaultValue: 'one more rep than today, because you finished all three sets.',
            })}
          </p>
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t('heroDemoWhyToday', {
              defaultValue:
                'Last squat session you finished 3 × 12 at 80 kg, so today asks for more load.',
            })}
          </p>
        )}
      </div>

      {done ? (
        <div className="mt-4 space-y-2">
          {/* Deliberately not `.primary-action` — the hero and the closing band own the
              two emerald CTAs on this page, and a third would dilute both. */}
          <button
            type="button"
            className="tap-target flex w-full items-center justify-center gap-2 rounded-xl border border-primary/50 bg-primary/10 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-primary/20"
            onClick={() => router.push('/welcome')}
          >
            {t('heroDemoStart', { defaultValue: 'Do this with your own numbers' })}
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={reset}
            className="tap-target w-full text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {t('heroDemoReplay', { defaultValue: 'Replay' })}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={logSet}
          className="tap-target mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-primary/15 active:scale-[0.99]"
        >
          {t('heroDemoLog', { defaultValue: 'Log set' })}{' '}
          <span className="font-mono tabular-nums text-muted-foreground">{fmt(todayTarget)}</span>
        </button>
      )}

      <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
        {t('heroDemoLabel', { defaultValue: 'Demo · same engine as the app' })}
      </p>
    </div>
  );
}

/** SSR / no-JS shell. Same geometry so hydration causes no layout shift. */
export function LogToPlanHeroFallback() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-4 sm:p-5" aria-hidden>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <p className="eyebrow">Squat · today</p>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] tabular-nums text-muted-foreground/70">
          0/3
        </p>
      </div>
      <ul className="space-y-1.5">
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
              i === 0 ? 'border-primary/40 bg-primary/[0.04]' : 'border-border/40'
            }`}
          >
            <span className="w-4 shrink-0 font-mono text-xs tabular-nums text-muted-foreground/70">
              {i + 1}
            </span>
            <span
              className={`font-mono text-sm tabular-nums ${
                i === 0 ? 'text-foreground' : 'text-muted-foreground/50'
              }`}
            >
              8 × 82.5 kg
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 min-h-[3.5rem] rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Last squat session you finished 3 × 12 at 80 kg, so today asks for more load.
        </p>
      </div>
      <div className="tap-target mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 py-3 text-sm font-semibold text-foreground">
        Log set <span className="font-mono tabular-nums text-muted-foreground">8 × 82.5 kg</span>
      </div>
      <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
        Demo · same engine as the app
      </p>
    </div>
  );
}
