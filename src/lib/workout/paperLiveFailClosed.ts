export type LiveEvidence = {
  liveLabelAuthorized: boolean | null | undefined;
  reviewerPass: boolean | null | undefined;
  scopeMatches: boolean | null | undefined;
  decisionFinal: boolean | null | undefined;
};

export type FailReason =
  | 'live_label_absent'
  | 'reviewer_absent'
  | 'scope_absent'
  | 'decision_absent'
  | 'live_label_false'
  | 'reviewer_false'
  | 'scope_false'
  | 'decision_false';

export function failReasons(e: LiveEvidence): FailReason[] {
  const reasons: FailReason[] = [];

  // liveLabelAuthorized
  if (e.liveLabelAuthorized === null || e.liveLabelAuthorized === undefined) {
    reasons.push('live_label_absent');
  } else if (e.liveLabelAuthorized === false) {
    reasons.push('live_label_false');
  }

  // reviewerPass
  if (e.reviewerPass === null || e.reviewerPass === undefined) {
    reasons.push('reviewer_absent');
  } else if (e.reviewerPass === false) {
    reasons.push('reviewer_false');
  }

  // scopeMatches
  if (e.scopeMatches === null || e.scopeMatches === undefined) {
    reasons.push('scope_absent');
  } else if (e.scopeMatches === false) {
    reasons.push('scope_false');
  }

  // decisionFinal
  if (e.decisionFinal === null || e.decisionFinal === undefined) {
    reasons.push('decision_absent');
  } else if (e.decisionFinal === false) {
    reasons.push('decision_false');
  }

  return reasons;
}

export function isAuthorized(e: LiveEvidence): boolean {
  return failReasons(e).length === 0;
}

export function carryForwardAllowed(
  priorOk: boolean,
  scopeChanged: boolean,
  decisionChanged: boolean,
): boolean {
  return priorOk === true && scopeChanged === false && decisionChanged === false;
}
