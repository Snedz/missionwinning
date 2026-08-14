'use client';

/**
 * Cinematic-scale log-a-set still for the www surface.
 * Same engine as LogToPlanHero / /active — not a restyle of the signed-in logger.
 */

import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  suggestNextSetTarget,
  type NextSetTarget,
  type SetSnapshot,
} from '@/lib/workout/nextSetTargets';
import { weightUnitLabel, type UnitsPref } from '@/lib/units';

const LAST_SESSION: SetSnapshot[] = [
  { reps: 12, weight: 80 },
  { reps: 12, weight: 80 },
  { reps: 12, weight: 80 },
];

const PLANNED_SETS = 3;
const UNITS: UnitsPref = 'metric';
const UNIT = weightUnitLabel(UNITS);

function fmt(target: NextSetTarget): string {
  return `${target.reps} × ${target.weight} ${UNIT}`;
}

type Props = {
  doneHref?: string;
  doneLabel?: string;
};

export function CinematicLogger({ doneHref = '/private', doneLabel }: Props) {
  const { t } = useTranslation();
  const [logged, setLogged] = useState<SetSnapshot[]>([]);

  const todayTarget = useMemo(
    () => suggestNextSetTarget(LAST_SESSION, 0, UNITS),
    []
  );
  const nextTarget = useMemo(
    () => (logged.length ? suggestNextSetTarget(logged, 0, UNITS) : null),
    [logged]
  );

  const done = logged.length >= PLANNED_SETS;

  const logSet = useCallback(() => {
    if (!todayTarget || done) return;
    setLogged((prev) => [...prev, { reps: todayTarget.reps, weight: todayTarget.weight }]);
  }, [todayTarget, done]);

  if (!todayTarget) return null;

  return (
    <div className="www-cine-logger">
      <div className="www-cine-logger-head">
        <p className="eyebrow">TARGET · Squat</p>
        <p className="www-cine-count">
          {logged.length}/{PLANNED_SETS}
        </p>
      </div>
      <div className="www-cine-legend" aria-hidden>
        <span>Set</span>
        <span>Target</span>
        <span />
      </div>
      {Array.from({ length: PLANNED_SETS }, (_, i) => {
        const set = logged[i];
        const isNext = i === logged.length && !done;
        return (
          <div
            key={i}
            className={[
              'www-cine-setrow',
              set ? 'is-done' : isNext ? 'is-next' : 'is-wait',
            ].join(' ')}
          >
            <span className="www-cine-n">{String(i + 1).padStart(2, '0')}</span>
            <span className="www-cine-load">{fmt(todayTarget)}</span>
            <span className="www-cine-n">{set ? 'logged' : ''}</span>
          </div>
        );
      })}
      <p className="www-cine-why" aria-live="polite">
        {done && nextTarget
          ? `${t('heroDemoNextSession', { defaultValue: 'Next session' })} ${fmt(nextTarget)} — ${t(
              'heroDemoNextWhy',
              { defaultValue: 'one more rep than today, because you finished all three sets.' }
            )}`
          : t('heroDemoWhyToday', {
              defaultValue:
                'Last squat session you finished 3 × 12 at 80 kg, so today asks for more load.',
            })}
      </p>
      {done ? (
        <a className="www-cine-ghost" href={doneHref}>
          {doneLabel ?? t('gateEyebrow', { defaultValue: 'Alpha' })}
        </a>
      ) : (
        <button type="button" className="primary-action" onClick={logSet}>
          {t('heroDemoLog', { defaultValue: 'Log set' })} · {fmt(todayTarget)}
        </button>
      )}
      <p className="www-cine-demo">
        {t('heroDemoLabel', { defaultValue: 'Demo · same engine as the app' })}
      </p>
    </div>
  );
}

/** SSR / no-JS geometry — first set active, LOG SET present. */
export function CinematicLoggerFallback() {
  return (
    <div className="www-cine-logger" aria-hidden>
      <div className="www-cine-logger-head">
        <p className="eyebrow">TARGET · Squat</p>
        <p className="www-cine-count">0/3</p>
      </div>
      <div className="www-cine-legend" aria-hidden>
        <span>Set</span>
        <span>Target</span>
        <span />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className={`www-cine-setrow ${i === 0 ? 'is-next' : 'is-wait'}`}>
          <span className="www-cine-n">{String(i + 1).padStart(2, '0')}</span>
          <span className="www-cine-load">8 × 82.5 kg</span>
          <span className="www-cine-n" />
        </div>
      ))}
      <p className="www-cine-why">
        Last squat session you finished 3 × 12 at 80 kg, so today asks for more load.
      </p>
      <div className="primary-action">Log set · 8 × 82.5 kg</div>
      <p className="www-cine-demo">Demo · same engine as the app</p>
    </div>
  );
}
