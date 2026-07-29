/**
 * What the coach says out loud — and, more importantly, what it never says.
 *
 * The `.173` doctrine holds exactly: **rules are the source, speech is only
 * presentation.** Every line spoken here was composed by `coach/debrief.ts` and has
 * already passed `reentryTone`'s assertions across every debrief line. Nothing is
 * generated for the ear that was not already true on the screen, so a listener and a
 * reader get the same facts — and the tone tests that guard the text guard the audio
 * for free. An LLM is not in this path at all; Phase 0 of voice costs nothing and
 * works offline.
 *
 * Two kinds are deliberately withheld:
 *
 * - **`question`** — the debrief ends by asking how the session felt, and its answer
 *   is a *tap* on a reply chip that writes today's check-in. Speaking a question the
 *   voice cannot hear the answer to invites the athlete to talk to a wall.
 * - **`action`** — a next-step instruction is something to *see* when deciding what
 *   to do next, not something to hear once and half-remember mid-rack. It stays on
 *   screen where it can be re-read.
 *
 * Order is the debrief's own order, not a re-ranking: effort, then any record, then
 * the load band, then a plateau, then readiness. That is the sequence the tone tests
 * were written against, and re-sorting for the ear would silently escape them.
 */

import type { Debrief, DebriefLineKind } from '@/lib/coach/debrief';

/** Spoken, in this order. Anything absent from this list is screen-only by design. */
export const SPOKEN_KINDS: DebriefLineKind[] = [
  'effort',
  'record',
  'band',
  'plateau',
  'readiness',
];

/** Never spoken — see the module header for why each one is withheld. */
export const SILENT_KINDS: DebriefLineKind[] = ['question', 'action'];

/**
 * The debrief as a list of utterances, in speaking order.
 *
 * Returns `[]` when there is nothing sayable rather than a filler sentence: a session
 * the engines have nothing true to say about gets silence, which is the same refusal
 * the debrief already makes on screen.
 */
export function speakableDebriefLines(debrief: Debrief | null | undefined): string[] {
  if (!debrief) return [];
  const byKind = new Map<DebriefLineKind, string[]>();
  for (const line of debrief.lines) {
    const text = line.text.trim();
    if (!text) continue;
    const list = byKind.get(line.kind) ?? [];
    list.push(text);
    byKind.set(line.kind, list);
  }
  return SPOKEN_KINDS.flatMap((kind) => byKind.get(kind) ?? []);
}

/**
 * One utterance for a speech synthesiser.
 *
 * Joined with a full stop and a space so a TTS engine pauses between facts instead of
 * running "700 kg moved in 76 minutes your last week is running heavier" together.
 * Lines that already end in terminal punctuation are not double-stopped.
 */
export function joinForSpeech(lines: string[]): string {
  return lines
    .map((l) => (/[.!?]$/.test(l) ? l : `${l}.`))
    .join(' ')
    .trim();
}

export function speakableDebriefText(debrief: Debrief | null | undefined): string {
  return joinForSpeech(speakableDebriefLines(debrief));
}
