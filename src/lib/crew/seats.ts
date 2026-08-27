/**
 * Six seats. Owns and stops are charter labels from the board clip —
 * structure only. Never an engine. Never live medical data.
 */

export const SEAT_IDS = ['scout', 'chem', 'tox', 'vitals', 'scribe', 'chief'] as const;
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
    owns: 'the literature, the shortlist',
    stops: 'never ranks a candidate',
  },
  {
    id: 'chem',
    name: 'Chem',
    owns: 'the safety panel, docking stores',
    stops: 'never calls one safe',
  },
  {
    id: 'tox',
    name: 'Tox',
    owns: 'the safety panel, off-target flags',
    stops: 'never calls a dose',
  },
  {
    id: 'vitals',
    name: 'Vitals',
    owns: 'vitals around the clock',
    stops: 'never okays the plan',
  },
  {
    id: 'scribe',
    name: 'Scribe',
    owns: 'evidence, raw data, protocol',
    stops: 'never signs the result',
  },
  {
    id: 'chief',
    name: 'Chief',
    owns: 'the protocol, the plan, the sign-off',
    stops: 'never goes without you',
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
