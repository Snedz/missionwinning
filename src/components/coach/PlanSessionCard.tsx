'use client';
/**
 * Single coach session with exercises.
 * See: src/components/coach/INDEX.md
 */

import { PlanExerciseLine } from '@/components/coach/PlanExerciseLine';
import { useStartCoachSession } from '@/hooks/useStartCoachSession';
import { useTranslation } from 'react-i18next';
import type { PlanSession } from '@/lib/coach/types';
import {
  buildSessionRationale,
  type SessionRationaleHints,
} from '@/lib/coach/sessionRationale';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import { cn } from '@/lib/utils';

type Props = {
  session: PlanSession;
  className?: string;
  /** Marks the card for today — 2px ink top rule (no elevation). */
  isToday?: boolean;
  /**
   * D12 — filled Start only on the one boss session (today, or next upcoming
   * when today is rest). Other days stay ghost so `/coach` is not a farm.
   */
  isPrimaryStart?: boolean;
  /** Today’s not-done session only — opens adjust flow. */
  onAdjust?: () => void;
  /** Garage swap on a planned line — does not regenerate the week. */
  onSwapExercise?: (fromExerciseId: string, toExerciseId: string) => void;
  /**
   * Optional log-derived hints already computed upstream (history length, load band).
   * Never invent metrics here — only pass what CoachContext / loadBands already have.
   * Session rationale paints only on the boss Start card (`.699` / F-012).
   */
  rationaleHints?: SessionRationaleHints;
};

export function PlanSessionCard({
  session,
  className,
  isToday,
  isPrimaryStart,
  onAdjust,
  onSwapExercise,
  rationaleHints,
}: Props) {
  const { t } = useTranslation();
  const startCoachSession = useStartCoachSession();
  const units = useUnits();
  const unit = weightUnitLabel(units);
  const primary = isPrimaryStart ?? isToday;
  // Boss session only — keep other cards quiet; never force onto Train/Today.
  const sessionRationale =
    primary && session.status !== 'done' && session.status !== 'missed'
      ? buildSessionRationale(session, rationaleHints)
      : null;

  const start = () => {
    startCoachSession(session, { from: 'coach' });
  };

  return (
    <div
      className={cn(
        'house-card house-session',
        // Done is the surface fill; the amber border was a status hue in a
        // one-colour system. Today is the only marked treatment: a 2px ink
        // top rule — no shadow (house has none).
        session.status === 'done' && 'is-done',
        isToday && 'is-today',
        /*
         * `.240` — de-emphasised by border, never by opacity.
         *
         * `opacity-60` dims the *text* along with the container: axe measured
         * #747372 on #eeeded (4.04:1) and #8c8b8b on #eeeded (2.9:1) here, both
         * serious. `.127` fixed exactly this in `WeekStrip` — "missed days
         * de-emphasised by border not opacity, because dimming the container
         * also dims the day label past 4.5:1" — and this file was missed in
         * that pass. A missed session still has to be readable; it is behind
         * you, not hidden from you (Horizon W criterion 4).
         *
         * `.256` reached the same conclusion from the other lane and measured
         * the muscle badges at **2.97:1** (`#8a8888` on `#eeebeb`, 10px) — a
         * third pair of numbers for one defect. It landed second, so `.240`'s
         * treatment stands, and `dashed` is the better of the two: a plain 2px
         * border is what every other card on this grid already draws, so it
         * said "missed" in a language the screen was using for "normal".
         *
         * What `.256` keeps is the part neither border does — the status word
         * below. Both fixes were still visual-only; opacity and a border are
         * equally nothing to a screen reader, and `WeekStrip` had said it in
         * words the whole time.
         */
        session.status === 'missed' && 'is-missed',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="house-session-name">{session.name}</p>
          <p className="house-lede">
            {t('coachEstMinutes', {
              defaultValue: '{{minutes}} min',
              minutes: session.estMinutes,
            })}
          </p>
        </div>
        {session.status === 'swapped' && (
          <p className="house-kicker">
            {t('coachSessionSwapped', { defaultValue: 'Adapted' })}
          </p>
        )}
        {/*
          The status was carried by opacity alone, which is nothing at all to a
          screen reader — "missed" was visual-only on the card, while
          `WeekStrip` has said it in words (`coachSessionMissed`) since it was
          written. Same key, so this costs no translation.
        */}
        {session.status === 'missed' && (
          <p className="house-kicker">
            {t('coachSessionMissed', { defaultValue: 'Missed' })}
          </p>
        )}
      </div>
      <div className="house-session-groups">
        {session.focusGroups.slice(0, 4).map((mg) => (
          <span key={mg} className="house-state">
            {mg}
          </span>
        ))}
      </div>
      {sessionRationale ? (
        /*
         * Quiet inset on the boss card — ink primary edge (not poster) so it
         * does not compete with Start. No eyebrow: the input label alone
         * carries the log cite (Design polish on `.699`). Empty history is
         * one compact line (F-025), not three invented labels.
         */
        <div
          className="house-session-rationale space-y-1.5 border-s-[3px] border-s-primary"
          data-testid="coach-session-rationale"
          data-rationale-kind={sessionRationale.kind}
        >
          {sessionRationale.kind === 'session-empty' ? (
            <p className="house-lede">
              {t(sessionRationale.compactKey, {
                defaultValue: sessionRationale.compactDefault,
              })}
            </p>
          ) : (
            <>
              <p className="house-lede">
                <span className="house-session-rationale-label">
                  {t('coachRationaleInputLabel', { defaultValue: 'From your logs' })}
                  {': '}
                </span>
                {t(sessionRationale.inputKey, {
                  ...sessionRationale.inputParams,
                  defaultValue: sessionRationale.inputDefault,
                })}
              </p>
              <p className="house-lede">
                <span className="house-session-rationale-label">
                  {t('coachRationaleRuleLabel', { defaultValue: 'Rule applied' })}
                  {': '}
                </span>
                {t(sessionRationale.ruleKey, {
                  defaultValue: sessionRationale.ruleDefault,
                })}
              </p>
              <p className="house-lede">
                <span className="house-session-rationale-label">
                  {t('coachRationaleEffectLabel', { defaultValue: 'Expected effect' })}
                  {': '}
                </span>
                {t(sessionRationale.effectKey, {
                  ...sessionRationale.effectParams,
                  defaultValue: sessionRationale.effectDefault,
                })}
              </p>
            </>
          )}
        </div>
      ) : null}
      <ul className="house-session-lifts">
        {session.exercises.map((ex) => (
          <PlanExerciseLine
            key={ex.exerciseId}
            ex={ex}
            unit={unit}
            onSwap={
              onSwapExercise
                ? (toId) => onSwapExercise(ex.exerciseId, toId)
                : undefined
            }
          />
        ))}
      </ul>
      {session.status !== 'done' && (
        <div className="house-session-actions">
          {/*
            D12 — one filled Start on the week grid: only today.
            Other days stay ghost so `/coach` is not a farm of
            primary fills (was cap 4 = every card + Regenerate).
          */}
          <button
            type="button"
            className={
              primary
                ? 'house-btn house-btn-primary primary-action min-h-[44px] w-full tap-target'
                : 'house-btn house-btn-ghost min-h-[44px] w-full tap-target'
            }
            onClick={start}
          >
            {t('coachStartSession', { defaultValue: 'Start this session' })}
          </button>
          {onAdjust ? (
            <button
              type="button"
              className="house-btn house-btn-ghost min-h-[44px] w-full tap-target"
              onClick={onAdjust}
            >
              {t('coachAdjustToday', { defaultValue: 'Adjust today' })}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
