/**
 * Six product/ops seats. Owns and stops are Mission Winning work —
 * never chemistry, never a clinic, never a body.
 */

export const SEAT_IDS = ['scout', 'desk', 'logger', 'week', 'scribe', 'chief'] as const;
export type SeatId = (typeof SEAT_IDS)[number];

export type SeatHint = {
  id: SeatId;
  name: string;
  owns: string;
  stops: string;
};

export const SEAT_HINTS: readonly SeatHint[] = [
  {
    id: 'scout',
    name: 'Scout',
    owns: 'the literature and the shortlist',
    stops: 'never invents traction',
  },
  {
    id: 'desk',
    name: 'Desk',
    owns: 'Today first paint',
    stops: 'never puts chat on /log',
  },
  {
    id: 'logger',
    name: 'Logger',
    owns: 'the Train logger and the first set',
    stops: 'never gates a set',
  },
  {
    id: 'week',
    name: 'Week',
    owns: 'the weekly plan from logs',
    stops: 'never reads standing',
  },
  {
    id: 'scribe',
    name: 'Scribe',
    owns: 'evidence and case notes',
    stops: 'never writes competitor names',
  },
  {
    id: 'chief',
    name: 'Chief',
    owns: 'charters and the founder gate',
    stops: 'never does the work',
  },
];

export function seatHint(id: SeatId): SeatHint {
  const hit = SEAT_HINTS.find((s) => s.id === id);
  if (!hit) throw new Error(`unknown seat ${id}`);
  return hit;
}

export const GATE_KINDS = ['send', 'delete', 'publish', 'promote'] as const;
export type GateKind = (typeof GATE_KINDS)[number];

export type SeedHold = {
  id: string;
  kind: GateKind;
  title: string;
};

/** Held at first paint. Ops only — signing does not send, delete, publish, or promote. */
export const SEED_HOLDS: readonly SeedHold[] = [
  { id: 'hold-send', kind: 'send', title: 'Send the list email' },
  { id: 'hold-delete', kind: 'delete', title: 'Delete a history session' },
  { id: 'hold-publish', kind: 'publish', title: "Publish this week's plan" },
  { id: 'hold-promote', kind: 'promote', title: 'Promote www' },
];
