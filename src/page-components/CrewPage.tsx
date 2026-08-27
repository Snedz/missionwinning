'use client';
/**
 * Page: /crew — signed-in crew board + founder gate.
 * More only. Not Today. Not a rail icon. Not /server.
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  allChartersSigned,
  canSignFounder,
  crewDayNumber,
  gateUnlocked,
  heldCount,
  localClock,
  nextUnsigned,
  signedCount,
  type CrewAction,
  type CrewState,
  type Seat,
} from '@/lib/crew/machine';
import { seatHint } from '@/lib/crew/seats';
import { dispatchCrew, loadCrewState, resetCrewBoard } from '@/lib/crew/persist';
import '@/components/crew/crew.css';

function charterOf(seat: Seat) {
  const hint = seatHint(seat.id);
  return {
    owns: seat.owns.trim() || hint.owns,
    stops: seat.stops.trim() || hint.stops,
  };
}

function SeatCard({
  seat,
  next,
  onSign,
}: {
  seat: Seat;
  next: boolean;
  onSign: () => void;
}) {
  const { t } = useTranslation();
  const charter = charterOf(seat);
  return (
    <article className={`crew-seat${seat.signed ? ' is-signed' : ''}${next ? ' is-on' : ''}`} data-testid={`crew-seat-${seat.id}`}>
      <div className="crew-seat-top">
        <h3>
          <span className={`crew-go${seat.signed ? ' is-on' : ''}`} data-testid={`crew-go-${seat.id}`} aria-hidden />
          {seat.name}
        </h3>
        {seat.signed ? (
          <span className="crew-check" data-testid={`crew-check-${seat.id}`}>
            {t('crewSignedCheck', { defaultValue: 'SIGNED ✓' })}
          </span>
        ) : (
          <span className="crew-pill is-live">{t('crewUnsigned', { defaultValue: 'UNSIGNED' })}</span>
        )}
      </div>
      <p className="crew-line">
        <strong>{t('crewOwns', { defaultValue: 'Owns' })}</strong>
        {charter.owns}
      </p>
      <p className="crew-line">
        <strong>{t('crewStops', { defaultValue: 'Stops' })}</strong>
        {charter.stops}
      </p>
      {seat.signed ? (
        <span className="crew-pill">{t('crewVotesOpen', { defaultValue: 'VOTES OPEN' })}</span>
      ) : next ? (
        <button type="button" className="house-btn house-btn-primary" onClick={onSign} data-testid="crew-sign-next">
          {t('crewSignRole', { defaultValue: 'Sign role' })}
        </button>
      ) : (
        <span className="crew-pill">{t('crewVoteLocked', { defaultValue: 'VOTE LOCKED' })}</span>
      )}
    </article>
  );
}

export function CrewPage() {
  const { t } = useTranslation();
  const [state, setState] = useState<CrewState | null>(null);
  const [clock, setClock] = useState(() => localClock());

  useEffect(() => {
    setState(loadCrewState());
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setClock(localClock()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  const run = (action: CrewAction) => {
    setState((prev) => (prev ? dispatchCrew(prev, action) : prev));
  };

  const signed = state ? signedCount(state) : 0;
  const held = state ? heldCount(state) : 0;
  const day = state ? crewDayNumber(state.startedAt) : 1;
  const next = state ? nextUnsigned(state) : null;
  const voteLine = useMemo(() => {
    if (!state) return '';
    if (signed === 0) return t('crewVotesLocked', { defaultValue: 'NO CHARTER — NO VOTE' });
    if (allChartersSigned(state)) return t('crewVotesOpen', { defaultValue: 'VOTES OPEN' });
    return t('crewVotesPartial', { n: signed, defaultValue: `VOTES ${signed}/6 OPEN` });
  }, [state, signed, t]);

  if (!state) {
    return <div className="crew-room" aria-busy="true" />;
  }

  return (
    <div className="crew-room" data-testid="crew-room">
      <div className="crew-strip" data-testid="crew-strip">
        <span className="crew-pill">{t('crewBrand', { defaultValue: 'House' })}</span>
        <span className="crew-pill">{t('crewRoom', { defaultValue: 'Crew' })}</span>
        {canSignFounder(state) ? (
          <span className="crew-pill is-hot" data-testid="crew-gate-on-you">
            {t('crewGateOnYou', { defaultValue: 'GATE IS ON YOU' })}
          </span>
        ) : state.founderSigned ? (
          <span className="crew-pill is-go" data-testid="crew-gate-signed">
            {t('crewGateSigned', { defaultValue: 'GATE SIGNED' })}
          </span>
        ) : (
          <span className="crew-pill" data-testid="crew-gate-locked">
            {t('crewGateLocked', { defaultValue: 'GATE LOCKED' })}
          </span>
        )}
        <span className="crew-pill is-line">{t('crewGateMark', { defaultValue: 'GATE @founder' })}</span>
        <span className="crew-pill">{t('crewDay', { n: day, defaultValue: `DAY ${day}` })}</span>
        <span className="crew-pill">{t('crewHeld', { n: held, defaultValue: `HELD ${held}` })}</span>
        <span className="crew-pill">{t('crewCrew', { defaultValue: 'CREW 6' })}</span>
        <span className="crew-pill">{clock}</span>
        <span className="crew-pill is-line" data-testid="crew-charter-count">
          {t('crewCharters', { n: signed, defaultValue: `CHARTERS ${signed}/6` })}
        </span>
        <span className="crew-pill">{voteLine}</span>
        <button
          type="button"
          className="house-btn house-btn-ghost"
          onClick={() => setState(resetCrewBoard())}
          data-testid="crew-reset"
        >
          {t('crewReset', { defaultValue: 'Reset board' })}
        </button>
      </div>

      <div className="crew-body">
        <div className="crew-board" data-testid="crew-board">
          {state.seats.map((row) => (
            <SeatCard key={row.id} seat={row} next={next?.id === row.id} onSign={() => run({ type: 'signNext' })} />
          ))}
        </div>

        <aside className="crew-side">
          <section>
            <p className="crew-kicker">
              {t('crewCharterPills', { defaultValue: 'Charters' })} · {signed}/6
            </p>
            <div className="crew-pills">
              {state.seats.map((row) => (
                <span key={row.id} className={`crew-pill${row.signed ? ' is-go' : ''}`}>
                  {row.name}
                </span>
              ))}
            </div>
          </section>

          <section>
            <p className="crew-kicker">{t('crewNotes', { defaultValue: 'Case notes' })}</p>
            <div className="crew-notes" data-testid="crew-notes">
              {state.notes.map((n) => (
                <p key={`${n.at}-${n.text}`} className="crew-note">
                  <span>
                    {localClock(new Date(n.at))} {n.actor}
                  </span>
                  {n.text}
                </p>
              ))}
            </div>
          </section>

          <section className="crew-gate" data-testid="crew-gate">
            <p className="crew-kicker">{t('crewGate', { defaultValue: 'Founder gate' })}</p>
            <h2>
              {canSignFounder(state)
                ? t('crewGateOnYou', { defaultValue: 'GATE IS ON YOU' })
                : gateUnlocked(state)
                  ? t('crewGateSigned', { defaultValue: 'GATE SIGNED' })
                  : t('crewGateLocked', { defaultValue: 'GATE LOCKED' })}
            </h2>
            <p className="crew-line">{t('crewIrreversible', { defaultValue: 'send · delete · publish · promote' })}</p>
            {canSignFounder(state) ? (
              <div className="crew-canvas" data-testid="crew-signature-canvas">
                <p className="crew-kicker">{t('crewYourSignature', { defaultValue: 'YOUR SIGNATURE' })}</p>
                <button
                  type="button"
                  className="house-btn house-btn-primary"
                  onClick={() => run({ type: 'signFounder' })}
                  data-testid="crew-sign-founder"
                >
                  {t('crewSignFounder', { defaultValue: 'Sign the gate' })}
                </button>
              </div>
            ) : gateUnlocked(state) ? (
              <p className="crew-check" data-testid="crew-canvas-signed">
                {t('crewSigned', { defaultValue: 'SIGNED' })}
              </p>
            ) : (
              <p className="crew-line" data-testid="crew-charters-first">
                {t('crewChartersFirst', { n: signed, defaultValue: `CHARTERS FIRST — ${signed}/6` })}
              </p>
            )}
            <p className="crew-kicker" style={{ marginTop: 12 }}>
              {t('crewNeedSign', { n: held, defaultValue: `${held} NEED YOUR SIGNATURE` })}
            </p>
            {state.held.map((item) => (
              <div key={item.id} className="crew-hold" data-testid={`crew-hold-${item.kind}`}>
                <div className="crew-hold-top">
                  <strong>
                    {item.kind} · {item.title}
                  </strong>
                  {item.signed ? (
                    <span className="crew-check">{t('crewSignedHold', { defaultValue: 'Signed' })}</span>
                  ) : (
                    <button
                      type="button"
                      className="house-btn house-btn-primary"
                      disabled={!gateUnlocked(state)}
                      onClick={() => run({ type: 'signGate', itemId: item.id })}
                      data-testid={`crew-sign-hold-${item.id}`}
                    >
                      {t('crewSignHold', { defaultValue: 'Sign' })}
                    </button>
                  )}
                </div>
                <div className="crew-meter" aria-hidden>
                  <span style={{ width: item.signed ? '100%' : '62%' }} />
                </div>
                <span className="crew-pill">
                  {t('crewReversible', { defaultValue: 'Reversible?' })} {t('crewNo', { defaultValue: 'No' })}
                </span>
              </div>
            ))}
            <p className="crew-warn">{t('crewNoUndo', { defaultValue: 'NO UNDO — a signature does not reverse' })}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
