export type LoadUnit = 'kg' | 'lb';

export type LoadJumpInput = {
  proposed: number;
  lastLogged: number | null;
  unit: LoadUnit;
};

export type LoadJumpResult = {
  weight: number | null;
  capped: boolean;
  reason: string;
};

export const MAX_JUMP_KG = 5;
export const MAX_JUMP_LB = 10;

export function maxJumpForUnit(unit: LoadUnit): number {
  return unit === 'kg' ? MAX_JUMP_KG : MAX_JUMP_LB;
}

export function capLoadJump(input: LoadJumpInput): LoadJumpResult {
  const { proposed, lastLogged, unit } = input;

  // 1. invalid proposed
  if (!Number.isFinite(proposed) || proposed < 0) {
    return { weight: null, capped: false, reason: 'invalid proposed' };
  }

  // 2. no last logged
  if (lastLogged === null) {
    return { weight: null, capped: false, reason: 'no last logged weight' };
  }

  // 3. invalid last logged
  if (!Number.isFinite(lastLogged) || lastLogged < 0) {
    return { weight: null, capped: false, reason: 'invalid last logged' };
  }

  // 4. within or below last (decreases and holds are never capped up)
  if (proposed <= lastLogged) {
    return { weight: proposed, capped: false, reason: 'within or below last' };
  }

  // 5. cap if jump exceeds max
  const maxJump = maxJumpForUnit(unit);
  if (proposed - lastLogged > maxJump) {
    return {
      weight: lastLogged + maxJump,
      capped: true,
      reason: 'capped to max jump',
    };
  }

  // 6. within max jump
  return { weight: proposed, capped: false, reason: 'within max jump' };
}
