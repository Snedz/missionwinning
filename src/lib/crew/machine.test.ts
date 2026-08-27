import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  allChartersSigned,
  applyCrew,
  canSignRole,
  canVote,
  crewDayNumber,
  emptyCrewState,
  heldCount,
  localClock,
  parseCrewState,
  signedCount,
  voteLocked,
} from './machine';
import { SEAT_IDS, SEED_HOLDS } from './seats';

function signSeat(state: ReturnType<typeof emptyCrewState>, id: (typeof SEAT_IDS)[number], now: number) {
  let next = applyCrew(state, { type: 'assign', id }, now);
  const seat = next.seats.find((s) => s.id === id)!;
  next = applyCrew(next, { type: 'defineOwns', id, owns: seat.owns }, now + 1);
  next = applyCrew(next, { type: 'defineStops', id, stops: seat.stops }, now + 2);
  return applyCrew(next, { type: 'signRole', id }, now + 3);
}

test('fresh board is 0/6 with four held gate items', () => {
  const state = emptyCrewState(1_700_000_000_000);
  assert.equal(signedCount(state), 0);
  assert.equal(allChartersSigned(state), false);
  assert.equal(heldCount(state), 4);
  assert.deepEqual(
    state.held.map((h) => h.kind),
    SEED_HOLDS.map((h) => h.kind)
  );
  for (const seat of state.seats) {
    assert.equal(voteLocked(seat), true);
    assert.equal(canVote(seat), false);
    assert.equal(seat.signed, false);
  }
});

test('chief flow is assign → owns → stops → sign → vote', () => {
  const t0 = 1_700_000_000_000;
  let state = emptyCrewState(t0);
  assert.equal(applyCrew(state, { type: 'defineOwns', id: 'scout', owns: 'x' }, t0), state);
  assert.equal(applyCrew(state, { type: 'signRole', id: 'scout' }, t0), state);
  assert.equal(applyCrew(state, { type: 'vote', id: 'scout', vote: 'aye' }, t0), state);

  state = applyCrew(state, { type: 'assign', id: 'scout' }, t0);
  assert.equal(state.seats[0].assigned, true);
  assert.ok(state.seats[0].owns.length > 0);
  assert.equal(state.seats[0].ownsSet, false);
  assert.equal(canSignRole(state.seats[0]), false);

  state = applyCrew(state, { type: 'defineOwns', id: 'scout', owns: '  the shortlist  ' }, t0 + 1);
  assert.equal(state.seats[0].owns, 'the shortlist');
  assert.equal(state.seats[0].ownsSet, true);
  assert.equal(applyCrew(state, { type: 'signRole', id: 'scout' }, t0 + 2), state);

  state = applyCrew(state, { type: 'defineStops', id: 'scout', stops: 'never invents traction' }, t0 + 3);
  assert.equal(state.seats[0].stopsSet, true);
  assert.equal(canSignRole(state.seats[0]), true);

  state = applyCrew(state, { type: 'signRole', id: 'scout' }, t0 + 4);
  assert.equal(signedCount(state), 1);
  assert.equal(voteLocked(state.seats[0]), false);
  assert.equal(canVote(state.seats[0]), true);

  const locked = applyCrew(state, { type: 'vote', id: 'chem', vote: 'aye' }, t0 + 5);
  assert.equal(locked.seats[1].vote, null);

  state = applyCrew(state, { type: 'vote', id: 'scout', vote: 'aye' }, t0 + 6);
  assert.equal(state.seats[0].vote, 'aye');
});

test('6/6 signed unlocks every seat vote', () => {
  let state = emptyCrewState(10);
  for (const id of SEAT_IDS) state = signSeat(state, id, 20);
  assert.equal(signedCount(state), 6);
  assert.equal(allChartersSigned(state), true);
  for (const seat of state.seats) {
    assert.equal(voteLocked(seat), false);
    const voted = applyCrew(state, { type: 'vote', id: seat.id, vote: 'nay' }, 99);
    assert.equal(voted.seats.find((s) => s.id === seat.id)?.vote, 'nay');
  }
});

test('founder canvas stays locked until 6/6; holds stay blocked until that signature', () => {
  let state = emptyCrewState(50);
  const send = state.held.find((h) => h.kind === 'send')!;
  assert.equal(send.held, true);
  assert.equal(applyCrew(state, { type: 'signFounder' }, 51), state);
  assert.equal(applyCrew(state, { type: 'signGate', itemId: send.id }, 51), state);

  for (const id of SEAT_IDS) state = signSeat(state, id, 60);
  assert.equal(signedCount(state), 6);
  assert.equal(state.founderSigned, false);
  assert.equal(applyCrew(state, { type: 'signGate', itemId: send.id }, 70), state);

  state = applyCrew(state, { type: 'signFounder' }, 71);
  assert.equal(state.founderSigned, true);
  assert.equal(applyCrew(state, { type: 'signFounder' }, 72), state);

  state = applyCrew(state, { type: 'signGate', itemId: send.id }, 73);
  const signed = state.held.find((h) => h.id === send.id)!;
  assert.equal(signed.signed, true);
  assert.equal(signed.held, false);
  assert.equal(heldCount(state), 3);
  const again = applyCrew(state, { type: 'signGate', itemId: send.id }, 74);
  assert.equal(again, state);
});

test('hold adds another ops item; junk kinds are ignored', () => {
  const state = emptyCrewState(80);
  const held = applyCrew(state, { type: 'hold', kind: 'promote', title: 'Promote www again' }, 81);
  assert.equal(heldCount(held), 5);
  assert.equal(applyCrew(state, { type: 'hold', kind: 'promote', title: '   ' }, 82), state);
  assert.equal(
    applyCrew(state, { type: 'hold', kind: 'explode' as never, title: 'nope' }, 83),
    state
  );
});

test('parse repairs a signed seat that skipped owns/stops and never invents a vote', () => {
  const parsed = parseCrewState(
    {
      startedAt: 9,
      selectedId: 'scribe',
      seats: [{ id: 'scout', signed: true, vote: 'aye' }],
      founderSigned: true,
      held: [{ id: 'x', kind: 'send', title: 'Send the list email', held: true, signed: true }],
      notes: [{ at: 1, actor: 'CHIEF', text: 'ok' }],
    },
    10
  );
  const scout = parsed.seats.find((s) => s.id === 'scout')!;
  assert.equal(scout.signed, false);
  assert.equal(scout.vote, null);
  assert.equal(parsed.held[0].signed, true);
  assert.equal(parsed.held[0].held, false);
  assert.equal(parsed.founderSigned, false);
});

test('local clock and day number do not use toISOString', () => {
  const src = [
    readFileSync(fileURLToPath(new URL('./machine.ts', import.meta.url)), 'utf8'),
    readFileSync(fileURLToPath(new URL('./persist.ts', import.meta.url)), 'utf8'),
  ]
    .join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '');
  assert.doesNotMatch(src, /toISOString/);
  assert.equal(localClock(new Date(2026, 7, 27, 3, 8)), '03:08');
  assert.equal(crewDayNumber(Date.UTC(2026, 7, 27, 12), new Date(2026, 7, 27, 18)), 1);
  assert.ok(crewDayNumber(Date.now() - 3 * 86_400_000) >= 3);
});
