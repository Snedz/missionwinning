/**
 * Crew board + founder gate. 0/6 → 6/6 is real state.
 * Vote stays locked until that seat's charter is signed.
 * Gate holds send / delete / publish / promote. No undo after a signature.
 */

import { GATE_KINDS, SEAT_HINTS, SEAT_IDS, SEED_HOLDS, seatHint, type GateKind, type SeatId } from './seats';

export type { GateKind, SeatId };

export type SeatVote = 'aye' | 'nay';

export type Seat = {
  id: SeatId;
  name: string;
  owns: string;
  stops: string;
  assigned: boolean;
  ownsSet: boolean;
  stopsSet: boolean;
  signed: boolean;
  vote: SeatVote | null;
};

export type GateItem = {
  id: string;
  kind: GateKind;
  title: string;
  held: boolean;
  signed: boolean;
};

export type CaseNote = {
  at: number;
  actor: string;
  text: string;
};

export type CrewState = {
  startedAt: number;
  selectedId: SeatId;
  seats: Seat[];
  held: GateItem[];
  notes: CaseNote[];
  founderSigned: boolean;
};

export type CrewAction =
  | { type: 'select'; id: SeatId }
  | { type: 'assign'; id: SeatId }
  | { type: 'defineOwns'; id: SeatId; owns: string }
  | { type: 'defineStops'; id: SeatId; stops: string }
  | { type: 'signRole'; id: SeatId }
  | { type: 'vote'; id: SeatId; vote: SeatVote }
  | { type: 'signFounder' }
  | { type: 'signGate'; itemId: string }
  | { type: 'hold'; kind: GateKind; title: string }
  | { type: 'reset' };

const NOTE_CAP = 40;

function emptySeat(id: SeatId): Seat {
  const hint = seatHint(id);
  return {
    id,
    name: hint.name,
    owns: '',
    stops: '',
    assigned: false,
    ownsSet: false,
    stopsSet: false,
    signed: false,
    vote: null,
  };
}

function seedHolds(): GateItem[] {
  return SEED_HOLDS.map((h) => ({
    id: h.id,
    kind: h.kind,
    title: h.title,
    held: true,
    signed: false,
  }));
}

export function emptyCrewState(now = Date.now()): CrewState {
  return {
    startedAt: now,
    selectedId: 'scout',
    seats: SEAT_IDS.map(emptySeat),
    held: seedHolds(),
    founderSigned: false,
    notes: [
      {
        at: now,
        actor: 'CHIEF',
        text: 'nothing goes out without a charter and a signature',
      },
    ],
  };
}

function isSeatId(value: unknown): value is SeatId {
  return typeof value === 'string' && (SEAT_IDS as readonly string[]).includes(value);
}

function isGateKind(value: unknown): value is GateKind {
  return typeof value === 'string' && (GATE_KINDS as readonly string[]).includes(value);
}

function note(state: CrewState, at: number, actor: string, text: string): CrewState {
  return {
    ...state,
    notes: [{ at, actor, text }, ...state.notes].slice(0, NOTE_CAP),
  };
}

export function signedCount(state: CrewState): number {
  return state.seats.filter((s) => s.signed).length;
}

export function heldCount(state: CrewState): number {
  return state.held.filter((h) => h.held && !h.signed).length;
}

export function voteLocked(seat: Seat): boolean {
  return !seat.signed;
}

export function canDefineOwns(seat: Seat): boolean {
  return seat.assigned && !seat.signed;
}

export function canDefineStops(seat: Seat): boolean {
  return seat.assigned && seat.ownsSet && !seat.signed;
}

export function canSignRole(seat: Seat): boolean {
  return seat.assigned && seat.ownsSet && seat.stopsSet && !seat.signed;
}

export function canVote(seat: Seat): boolean {
  return seat.signed;
}

export function allChartersSigned(state: CrewState): boolean {
  return signedCount(state) === SEAT_IDS.length;
}

export function canSignFounder(state: CrewState): boolean {
  return allChartersSigned(state) && !state.founderSigned;
}

export function gateUnlocked(state: CrewState): boolean {
  return state.founderSigned && allChartersSigned(state);
}

export function selectedSeat(state: CrewState): Seat {
  return state.seats.find((s) => s.id === state.selectedId) ?? state.seats[0];
}

function patchSeat(state: CrewState, id: SeatId, next: Seat): CrewState {
  return {
    ...state,
    seats: state.seats.map((s) => (s.id === id ? next : s)),
  };
}

export function applyCrew(state: CrewState, action: CrewAction, now = Date.now()): CrewState {
  if (action.type === 'reset') return emptyCrewState(now);

  if (action.type === 'select') {
    if (!isSeatId(action.id)) return state;
    return { ...state, selectedId: action.id };
  }

  if (action.type === 'assign') {
    const seat = state.seats.find((s) => s.id === action.id);
    if (!seat || seat.assigned || seat.signed) return state;
    const hint = seatHint(seat.id);
    const next = {
      ...seat,
      assigned: true,
      owns: hint.owns,
      stops: hint.stops,
    };
    return note(patchSeat(state, seat.id, next), now, 'CHIEF', `assigned ${seat.name}`);
  }

  if (action.type === 'defineOwns') {
    const seat = state.seats.find((s) => s.id === action.id);
    if (!seat || !canDefineOwns(seat)) return state;
    const owns = action.owns.trim();
    if (!owns) return state;
    const next = { ...seat, owns, ownsSet: true };
    return note(patchSeat(state, seat.id, next), now, 'CHIEF', `set owns on ${seat.name}`);
  }

  if (action.type === 'defineStops') {
    const seat = state.seats.find((s) => s.id === action.id);
    if (!seat || !canDefineStops(seat)) return state;
    const stops = action.stops.trim();
    if (!stops) return state;
    const next = { ...seat, stops, stopsSet: true };
    return note(patchSeat(state, seat.id, next), now, 'CHIEF', `set stops on ${seat.name}`);
  }

  if (action.type === 'signRole') {
    const seat = state.seats.find((s) => s.id === action.id);
    if (!seat || !canSignRole(seat)) return state;
    const next = { ...seat, signed: true };
    return note(patchSeat(state, seat.id, next), now, 'CHIEF', `signed ${seat.name} — vote unlocked`);
  }

  if (action.type === 'vote') {
    const seat = state.seats.find((s) => s.id === action.id);
    if (!seat || !canVote(seat)) return state;
    if (action.vote !== 'aye' && action.vote !== 'nay') return state;
    if (seat.vote === action.vote) return state;
    const next = { ...seat, vote: action.vote };
    return note(patchSeat(state, seat.id, next), now, seat.name.toUpperCase(), `vote ${action.vote}`);
  }

  if (action.type === 'signFounder') {
    if (!canSignFounder(state)) return state;
    return note({ ...state, founderSigned: true }, now, 'FOUNDER', 'gate signed — no undo');
  }

  if (action.type === 'signGate') {
    const item = state.held.find((h) => h.id === action.itemId);
    if (!gateUnlocked(state) || !item || !item.held || item.signed) return state;
    return note(
      {
        ...state,
        held: state.held.map((h) =>
          h.id === item.id ? { ...h, held: false, signed: true } : h
        ),
      },
      now,
      'FOUNDER',
      `signed ${item.kind} — no undo`
    );
  }

  if (action.type === 'hold') {
    if (!isGateKind(action.kind)) return state;
    const title = action.title.trim();
    if (!title) return state;
    const id = `hold-${action.kind}-${now}`;
    const item: GateItem = { id, kind: action.kind, title, held: true, signed: false };
    return note({ ...state, held: [item, ...state.held] }, now, 'GATE', `holding ${action.kind}: ${title}`);
  }

  return state;
}

export function parseCrewState(raw: unknown, now = Date.now()): CrewState {
  const fresh = emptyCrewState(now);
  if (!raw || typeof raw !== 'object') return fresh;
  const obj = raw as Partial<CrewState>;
  const startedAt = typeof obj.startedAt === 'number' && Number.isFinite(obj.startedAt) ? obj.startedAt : now;
  const selectedId = isSeatId(obj.selectedId) ? obj.selectedId : 'scout';
  const byId = new Map<string, Seat>();
  if (Array.isArray(obj.seats)) {
    for (const row of obj.seats) {
      if (!row || typeof row !== 'object') continue;
      if (!isSeatId(row.id)) continue;
      const hint = seatHint(row.id);
      byId.set(row.id, {
        id: row.id,
        name: hint.name,
        owns: typeof row.owns === 'string' ? row.owns : '',
        stops: typeof row.stops === 'string' ? row.stops : '',
        assigned: row.assigned === true,
        ownsSet: row.ownsSet === true,
        stopsSet: row.stopsSet === true,
        signed: row.signed === true,
        vote: row.vote === 'aye' || row.vote === 'nay' ? row.vote : null,
      });
    }
  }
  const seats = SEAT_IDS.map((id) => byId.get(id) ?? emptySeat(id)).map((seat) => {
    if (seat.signed && (!seat.assigned || !seat.ownsSet || !seat.stopsSet)) {
      return { ...seat, signed: false, vote: null };
    }
    if (!seat.signed) return { ...seat, vote: null };
    return seat;
  });
  const held: GateItem[] = [];
  const seen = new Set<string>();
  if (Array.isArray(obj.held)) {
    for (const row of obj.held) {
      if (!row || typeof row !== 'object') continue;
      if (typeof row.id !== 'string' || !row.id || seen.has(row.id)) continue;
      if (!isGateKind(row.kind)) continue;
      if (typeof row.title !== 'string' || !row.title.trim()) continue;
      seen.add(row.id);
      const signed = row.signed === true;
      held.push({
        id: row.id,
        kind: row.kind,
        title: row.title.trim(),
        held: signed ? false : row.held !== false,
        signed,
      });
    }
  }
  const notes: CaseNote[] = [];
  if (Array.isArray(obj.notes)) {
    for (const row of obj.notes) {
      if (!row || typeof row !== 'object') continue;
      if (typeof row.at !== 'number' || !Number.isFinite(row.at)) continue;
      if (typeof row.actor !== 'string' || !row.actor.trim()) continue;
      if (typeof row.text !== 'string' || !row.text.trim()) continue;
      notes.push({ at: row.at, actor: row.actor.trim(), text: row.text.trim() });
      if (notes.length >= NOTE_CAP) break;
    }
  }
  const next: CrewState = {
    startedAt,
    selectedId,
    seats,
    held: held.length > 0 ? held : seedHolds(),
    notes: notes.length > 0 ? notes : fresh.notes,
    founderSigned: false,
  };
  next.founderSigned = obj.founderSigned === true && allChartersSigned(next);
  return next;
}

/** Local clock HH:MM — local fields only. */
export function localClock(now: Date = new Date()): string {
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/** Day 1 on the start local date. Uses local fields only. */
export function crewDayNumber(startedAt: number, now: Date = new Date()): number {
  const start = new Date(startedAt);
  const a = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(1, Math.floor((b - a) / 86_400_000) + 1);
}

export { SEAT_HINTS, SEAT_IDS, SEED_HOLDS };
