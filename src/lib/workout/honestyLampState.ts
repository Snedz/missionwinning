export type HonestyLamp = 'WARMUP' | 'DRILL' | 'SYNC' | 'PATH' | 'REVIEW' | 'WINDOW' | 'FUEL';
export type LampState = 'PASS' | 'HOLD' | 'IN' | 'WIN' | 'UNKNOWN' | 'UNREAD';

export const LAMPS: readonly HonestyLamp[] = ['WARMUP', 'DRILL', 'SYNC', 'PATH', 'REVIEW', 'WINDOW', 'FUEL'];

export function allowedStates(lamp: HonestyLamp): readonly LampState[] {
  if (lamp === 'REVIEW') {
    return ['UNREAD', 'PASS', 'HOLD', 'UNKNOWN'];
  }
  if (lamp === 'WINDOW') {
    return ['IN', 'HOLD', 'UNKNOWN', 'PASS'];
  }
  return ['PASS', 'HOLD', 'IN', 'WIN', 'UNKNOWN'];
}

export function isAllowed(lamp: HonestyLamp, state: LampState): boolean {
  return allowedStates(lamp).includes(state);
}

export type TransitionEvent = 'fresh_evidence' | 'unreachable_source' | 'side_check_ok' | 'empty_critic';

function canTransitionFrom(event: TransitionEvent, from: LampState): boolean {
  if (event === 'empty_critic') {
    // Rule 1: only applies to REVIEW (handled in nextState)
    return true;
  }
  if (event === 'unreachable_source') {
    return from === 'PASS' || from === 'HOLD' || from === 'IN';
  }
  if (event === 'fresh_evidence') {
    return from === 'UNREAD' || from === 'UNKNOWN' || from === 'HOLD' || from === 'IN';
  }
  // side_check_ok can never change state
  return false;
}

export function nextState(lamp: HonestyLamp, from: LampState, event: TransitionEvent): LampState | null {
  // Rule 4: side_check_ok never changes state
  if (event === 'side_check_ok') {
    return null;
  }

  // Rule 1: empty_critic on REVIEW -> UNREAD
  if (event === 'empty_critic') {
    if (lamp !== 'REVIEW') {
      return null;
    }
    const newState: LampState = 'UNREAD';
    if (allowedStates(lamp).includes(newState)) {
      return newState;
    }
    return null;
  }

  // Rule 2: unreachable_source -> UNKNOWN (from PASS/HOLD/IN only)
  if (event === 'unreachable_source') {
    if (from === 'UNKNOWN' || from === 'UNREAD') {
      // From UNKNOWN/UNREAD stays that state
      return from;
    }
    if (!canTransitionFrom(event, from)) {
      return null;
    }
    const newState: LampState = 'UNKNOWN';
    if (allowedStates(lamp).includes(newState)) {
      return newState;
    }
    return null;
  }

  // Rule 3: fresh_evidence -> PASS (from UNREAD, UNKNOWN, HOLD, IN only; never from WIN)
  if (event === 'fresh_evidence') {
    if (from === 'WIN') {
      return null;
    }
    if (!canTransitionFrom(event, from)) {
      return null;
    }
    const newState: LampState = 'PASS';
    if (allowedStates(lamp).includes(newState)) {
      return newState;
    }
    return null;
  }

  return null;
}

export function stripToken(lamp: HonestyLamp, state: LampState): string {
  return `${lamp}=${state}`;
}
