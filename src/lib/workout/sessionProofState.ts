export type ProofState = 'open' | 'claimed' | 'done' | 'refused';

export type LoggedSetProof = {
  exerciseId: string;
  sets: number;
  dateSource: string;
};

export type ProofEvent =
  | { type: 'claim' }
  | { type: 'finish'; proof: LoggedSetProof | null }
  | { type: 'refuse'; reason: string }
  | { type: 'reset' };

export type ProofApply = { state: ProofState; reason?: string };

function isValidProof(proof: LoggedSetProof | null): boolean {
  if (!proof) return false;
  return (
    proof.exerciseId.length > 0 &&
    Number.isInteger(proof.sets) &&
    proof.sets >= 1 &&
    proof.dateSource.length > 0
  );
}

export function applyProofEvent(state: ProofState, event: ProofEvent): ProofApply {
  switch (event.type) {
    case 'reset':
      return { state: 'open' };

    case 'claim':
      if (state === 'open') {
        return { state: 'claimed' };
      }
      return { state, reason: 'invalid claim' };

    case 'refuse':
      if (state === 'open' || state === 'claimed') {
        return { state: 'refused', reason: event.reason };
      }
      return { state, reason: 'invalid refuse' };

    case 'finish':
      if (state !== 'claimed') {
        return { state, reason: 'invalid finish' };
      }
      if (isValidProof(event.proof)) {
        return { state: 'done' };
      }
      return { state: 'refused', reason: 'missing logged-set proof' };

    default:
      return { state };
  }
}
