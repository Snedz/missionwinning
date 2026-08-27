'use client';
/**
 * Page: /crew — signed-in crew board + founder gate.
 * More only. Not Today. Not a rail icon. Not /server.
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  allChartersSigned,
  canDefineOwns,
  canDefineStops,
  canSignFounder,
  canSignRole,
  canVote,
  crewDayNumber,
  gateUnlocked,
  heldCount,
  localClock,
  selectedSeat,
  signedCount,
  voteLocked,
  type CrewAction,
  type CrewState,
  type Seat,
} from '@/lib/crew/machine';
import { dispatchCrew, loadCrewState, resetCrewBoard } from '@/lib/crew/persist';
import '@/components/crew/crew.css';

const BAR_H = [40, 70, 55, 88, 30, 62];

function SeatCard({
  seat,
  on,
  signedN,
  onSelect,
}: {
  seat: Seat;
  on: boolean;
  signedN: number;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className={`crew-seat${on ? ' is-on' : ''}`}
      onClick={onSelect}
      data-testid={`crew-seat-${seat.id}`}
    >
      <div className="crew-seat-top">
        <h3>
          <span className={`crew-go${seat.signed ? ' is-on' : ''}`} aria-hidden />
          {seat.name}
        </h3>
        <span className={`crew-pill${seat.signed ? '' : ' is-live'}`}>
          {seat.signed
            ? t('crewSignedCheck', { defaultValue: 'SIGNED ✓' })
            : t('crewUnsigned', { defaultValue: 'UNSIGNED' })}
        </span>
      </div>
      <p className="crew-line">
        <strong>{t('crewOwns', { defaultValue: 'Owns' })}</strong>
        {seat.owns || '—'}
      </p>
      <p className="crew-line">
        <strong>{t('crewStops', { defaultValue: 'Stops' })}</strong>
        {seat.stops || '—'}
      </p>
      <div className="crew-bars" aria-hidden>
        {BAR_H.map((h, i) => (
          <span
            key={i}
            className={`crew-bar${seat.signed ? ' is-on' : i < signedN ? ' is-live' : ''}`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <span className="crew-pill">
        {voteLocked(seat)
          ? t('crewVoteLocked', { defaultValue: 'VOTE LOCKED' })
          : seat.vote
            ? seat.vote.toUpperCase()
            : t('crewVotesOpen', { defaultValue: 'VOTES OPEN' })}
      </span>
    </button>
  );
}

export function CrewPage() {
  const { t } = useTranslation();
  const [state, setState] = useState<CrewState | null>(null);
  const [ownsDraft, setOwnsDraft] = useState('');
  const [stopsDraft, setStopsDraft] = useState('');
  const [clock, setClock] = useState(() => localClock());

  useEffect(() => {
    const next = loadCrewState();
    setState(next);
    const seat = selectedSeat(next);
    setOwnsDraft(seat.owns);
    setStopsDraft(seat.stops);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setClock(localClock()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  const seat = state ? selectedSeat(state) : null;

  const selectedId = seat?.id;
  const selectedOwns = seat?.owns;
  const selectedStops = seat?.stops;
  useEffect(() => {
    if (selectedOwns === undefined || selectedStops === undefined) return;
    setOwnsDraft(selectedOwns);
    setStopsDraft(selectedStops);
  }, [selectedId, selectedOwns, selectedStops]);

  const run = (action: CrewAction) => {
    setState((prev) => (prev ? dispatchCrew(prev, action) : prev));
  };

  const signed = state ? signedCount(state) : 0;
  const held = state ? heldCount(state) : 0;
  const day = state ? crewDayNumber(state.startedAt) : 1;
  const votesOpen = state ? state.seats.filter((s) => !voteLocked(s)).length : 0;
  const voteLine = useMemo(() => {
    if (!state) return '';
    if (signed === 0) return t('crewVotesLocked', { defaultValue: 'NO CHARTER — NO VOTE' });
    if (allChartersSigned(state)) return t('crewVotesOpen', { defaultValue: 'VOTES OPEN' });
    return t('crewVotesPartial', { n: votesOpen, defaultValue: `VOTES ${votesOpen}/6 OPEN` });
  }, [state, signed, t, votesOpen]);

  if (!state || !seat) {
    return <div className="crew-room" aria-busy="true" />;
  }

  return (
    <div className="crew-room" data-testid="crew-room">
      <div className="crew-strip" data-testid="crew-strip">
        <span className="crew-pill">{t('crewBrand', { defaultValue: 'House' })}</span>
        <span className="crew-pill">{t('crewRoom', { defaultValue: 'Crew' })}</span>
        {state && canSignFounder(state) ? (
          <span className="crew-pill is-hot" data-testid="crew-gate-on-you">
            {t('crewGateOnYou', { defaultValue: 'GATE IS ON YOU' })}
          </span>
        ) : state?.founderSigned ? (
          <span className="crew-pill" data-testid="crew-gate-signed">
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
        <div>
          <div className="crew-board" data-testid="crew-board">
            {state.seats.map((row) => (
              <SeatCard
                key={row.id}
                seat={row}
                on={row.id === seat.id}
                signedN={signed}
                onSelect={() => run({ type: 'select', id: row.id })}
              />
            ))}
          </div>

          <div className="crew-editor" style={{ marginTop: 12 }} data-testid="crew-editor">
            <p className="crew-kicker">{t('crewSelectSeat', { defaultValue: 'Seat' })}</p>
            <h2>{seat.name}</h2>
            <p className="crew-line">{t('crewFlow', { defaultValue: 'assign → owns → stops → sign → vote' })}</p>
            <div className="crew-fields">
              <label>
                {t('crewOwns', { defaultValue: 'Owns' })}
                <input
                  value={ownsDraft}
                  onChange={(e) => setOwnsDraft(e.target.value)}
                  placeholder={t('crewOwnsPh', { defaultValue: 'one line this seat owns' })}
                  disabled={!canDefineOwns(seat)}
                />
              </label>
              <label>
                {t('crewStops', { defaultValue: 'Stops' })}
                <input
                  value={stopsDraft}
                  onChange={(e) => setStopsDraft(e.target.value)}
                  placeholder={t('crewStopsPh', { defaultValue: 'hard stopline' })}
                  disabled={!canDefineStops(seat)}
                />
              </label>
            </div>
            <div className="crew-actions">
              <button
                type="button"
                className="house-btn"
                disabled={seat.assigned}
                onClick={() => run({ type: 'assign', id: seat.id })}
                data-testid="crew-assign"
              >
                {t('crewAssign', { defaultValue: 'Assign charter' })}
              </button>
              <button
                type="button"
                className="house-btn"
                disabled={!canDefineOwns(seat)}
                onClick={() => run({ type: 'defineOwns', id: seat.id, owns: ownsDraft })}
                data-testid="crew-set-owns"
              >
                {t('crewSetOwns', { defaultValue: 'Set owns' })}
              </button>
              <button
                type="button"
                className="house-btn"
                disabled={!canDefineStops(seat)}
                onClick={() => run({ type: 'defineStops', id: seat.id, stops: stopsDraft })}
                data-testid="crew-set-stops"
              >
                {t('crewSetStops', { defaultValue: 'Set stops' })}
              </button>
              <button
                type="button"
                className="house-btn house-btn-primary"
                disabled={!canSignRole(seat)}
                onClick={() => run({ type: 'signRole', id: seat.id })}
                data-testid="crew-sign-role"
              >
                {t('crewSignRole', { defaultValue: 'Sign role' })}
              </button>
              <button
                type="button"
                className="house-btn"
                disabled={!canVote(seat)}
                onClick={() => run({ type: 'vote', id: seat.id, vote: 'aye' })}
                data-testid="crew-vote-aye"
              >
                {t('crewVoteAye', { defaultValue: 'Aye' })}
              </button>
              <button
                type="button"
                className="house-btn"
                disabled={!canVote(seat)}
                onClick={() => run({ type: 'vote', id: seat.id, vote: 'nay' })}
              >
                {t('crewVoteNay', { defaultValue: 'Nay' })}
              </button>
            </div>
          </div>
        </div>

        <aside className="crew-side">
          <section>
            <p className="crew-kicker">{t('crewAgents', { defaultValue: 'Crew' })}</p>
            {state.seats.map((row) => (
              <div key={row.id} className="crew-agent">
                <span>{row.name}</span>
                <span className={`crew-dot${row.signed ? ' is-on' : ''}`} aria-hidden />
                <span className="crew-pill">{row.signed ? t('crewSigned', { defaultValue: 'SIGNED' }) : t('crewUnsigned', { defaultValue: 'UNSIGNED' })}</span>
              </div>
            ))}
          </section>

          <section>
            <p className="crew-kicker">
              {t('crewCharterPills', { defaultValue: 'Charters' })} · {signed}/6
            </p>
            <div className="crew-pills">
              {state.seats.map((row) => (
                <span key={row.id} className={`crew-pill${row.signed ? ' is-hot' : ''}`}>
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
              <p className="crew-pill" data-testid="crew-canvas-signed">
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
                    <span className="crew-pill">{t('crewSignedHold', { defaultValue: 'Signed' })}</span>
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
