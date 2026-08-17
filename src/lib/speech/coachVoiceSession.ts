/**
 * Mission Coach live voice — the signed-in + online mode.
 *
 * Meta AI when connected is a conversation: listen → think → speak → listen.
 * Offline / unentitled is not that product. Speech stays presentation of the
 * same `/api/coach/chat` words.
 */

/** Today / deep-link into the signed-in talk surface. */
export const COACH_LIVE_HASH = 'coach-live';
export const COACH_LIVE_HREF = `/coach#${COACH_LIVE_HASH}`;

export type CoachVoiceAccess = 'live' | 'offline' | 'locked';

export type CoachVoicePhase = 'ready' | 'listening' | 'thinking' | 'speaking';

export type CoachVoiceEvent =
  | 'start'
  | 'heard'
  | 'empty'
  | 'reply'
  | 'spoken'
  | 'interrupt'
  | 'end'
  | 'fail';

export function coachVoiceAccess(input: {
  online: boolean;
  entitled: boolean;
}): CoachVoiceAccess {
  if (!input.online) return 'offline';
  if (!input.entitled) return 'locked';
  return 'live';
}

/** After the coach finishes speaking, keep the conversation open (Meta loop). */
export function coachVoiceReopensListen(
  phase: CoachVoicePhase,
  event: CoachVoiceEvent
): boolean {
  return phase === 'speaking' && event === 'spoken';
}

/** Deep-link from Today Talk — scroll and focus the Talk control. */
export function shouldFocusLiveTalk(hash: string): boolean {
  return hash.replace(/^#/, '') === COACH_LIVE_HASH;
}

/**
 * Still in session and they said nothing — listen again, like Meta staying on.
 * Cap retries so a dead mic cannot loop.
 */
export function coachVoiceEmptyRetry(inSession: boolean, emptyCount: number, max = 2): boolean {
  return inSession && emptyCount >= 0 && emptyCount < max;
}

export function nextCoachVoicePhase(
  phase: CoachVoicePhase,
  event: CoachVoiceEvent
): CoachVoicePhase {
  if (event === 'end' || event === 'fail') return 'ready';

  switch (phase) {
    case 'ready':
      if (event === 'start' || event === 'interrupt') return 'listening';
      return phase;
    case 'listening':
      if (event === 'heard') return 'thinking';
      if (event === 'empty' || event === 'interrupt') return 'ready';
      return phase;
    case 'thinking':
      if (event === 'reply') return 'speaking';
      if (event === 'interrupt') return 'listening';
      return phase;
    case 'speaking':
      if (event === 'spoken' || event === 'interrupt') return 'listening';
      return phase;
  }
}
