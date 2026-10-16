export type BlockedState = 'stub' | 'blocked' | 'queued';

export type BlockedAction = 'offline-save' | 'duplicate-tap' | 'truncated-review' | 'unknown';

export type BlockedCopy = {
  state: BlockedState;
  title: string;
  detail: string;
  nextStep: string;
};

export const SUCCESS_WORDS: readonly string[] = [
  'saved',
  'done',
  'success',
  'complete',
  'synced',
];

function titleStartsWithSuccessWord(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return SUCCESS_WORDS.some((word) => lowerTitle.startsWith(word));
}

export function blockedActionCopy(action: BlockedAction, state: BlockedState): BlockedCopy {
  // stub wins over everything except duplicate-tap (which always uses its own row)
  if (state === 'stub' && action !== 'duplicate-tap') {
    return {
      state,
      title: 'Not available yet',
      detail: "This action isn't built yet, so nothing happened.",
      nextStep: 'Use the manual option for now.',
    };
  }

  // duplicate-tap takes precedence over action
  if (action === 'duplicate-tap') {
    return {
      state,
      title: 'Already logged once',
      detail: 'That tap repeated a set you just logged, so it was ignored.',
      nextStep: 'Edit the existing set if the numbers are wrong.',
    };
  }

  // truncated-review
  if (action === 'truncated-review') {
    return {
      state,
      title: 'Review incomplete',
      detail: 'Only part of this session could be read, so it isn\'t marked reviewed.',
      nextStep: 'Open the session again to finish the review.',
    };
  }

  // offline-save
  if (action === 'offline-save') {
    if (state === 'queued') {
      return {
        state,
        title: 'Not synced yet',
        detail: 'Your set is stored on this phone and waiting for a connection.',
        nextStep: 'It will sync when you\'re back online. Keep logging.',
      };
    }
    // blocked
    return {
      state,
      title: "Couldn't store this set",
      detail: 'This phone refused the write, so the set was not kept.',
      nextStep: 'Re-enter the set, or free up storage and try again.',
    };
  }

  // unknown action or any other case
  return {
    state,
    title: 'Action held',
    detail: 'This action didn\'t go through.',
    nextStep: 'Try again, or report a problem.',
  };
}

export function claimsSuccess(text: string): boolean {
  const lowerText = text.toLowerCase();
  return SUCCESS_WORDS.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
}

export function isHonestBlockedCopy(c: BlockedCopy): boolean {
  if (!c.nextStep || c.nextStep.trim() === '') {
    return false;
  }
  if (titleStartsWithSuccessWord(c.title)) {
    return false;
  }
  return true;
}
