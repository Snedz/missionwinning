/** Pure helpers for hold-to-confirm destructive actions. */

export const DEFAULT_HOLD_MS = 300;
export const KEYBOARD_ARM_MS = 2000;

/** Progress 0–1 for elapsed hold time. */
export function holdProgress(elapsedMs: number, holdMs = DEFAULT_HOLD_MS): number {
  if (holdMs <= 0) return 1;
  return Math.min(1, Math.max(0, elapsedMs / holdMs));
}

export function holdComplete(elapsedMs: number, holdMs = DEFAULT_HOLD_MS): boolean {
  return holdProgress(elapsedMs, holdMs) >= 1;
}

export type KeyboardArmState = {
  armed: boolean;
  armedAt: number | null;
};

export function createKeyboardArmState(): KeyboardArmState {
  return { armed: false, armedAt: null };
}

/** First activation arms; second within window confirms. */
export function reduceKeyboardArm(
  state: KeyboardArmState,
  nowMs: number,
  armWindowMs = KEYBOARD_ARM_MS
): { next: KeyboardArmState; confirmed: boolean } {
  if (!state.armed || state.armedAt == null) {
    return { next: { armed: true, armedAt: nowMs }, confirmed: false };
  }
  if (nowMs - state.armedAt <= armWindowMs) {
    return { next: createKeyboardArmState(), confirmed: true };
  }
  return { next: { armed: true, armedAt: nowMs }, confirmed: false };
}

export function clearKeyboardArm(_state: KeyboardArmState): KeyboardArmState {
  return createKeyboardArmState();
}
