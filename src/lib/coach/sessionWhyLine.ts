/**
 * One-line session “why” for Today/Coach — Wave 8 steal (coach-platform clarity)
 * without a programming app black-box tone. Pure; copy defaults in English for tests.
 */

export type SessionWhyInput = {
  /** Coach session kind */
  kind?: string | null;
  /** Muscle / focus groups on the session */
  focusGroups?: string[];
  /** First exercise whyKey if any (i18n key — not resolved here) */
  leadWhyKey?: string | null;
  /** Descriptive load band zone from loadBands — never predictive */
  loadZone?: 'high' | 'steady' | 'light' | 'unknown' | null;
};

export type SessionWhyLine = {
  /** Stable key for i18n */
  messageKey: string;
  /** English default for t(..., { defaultValue }) */
  defaultValue: string;
  /** Interpolation params */
  params?: Record<string, string | number>;
};

function focusLabel(groups: string[] | undefined): string {
  const g = (groups ?? []).filter(Boolean);
  if (g.length === 0) return '';
  if (g.length === 1) return g[0]!;
  if (g.length === 2) return `${g[0]} & ${g[1]}`;
  return `${g[0]}, ${g[1]} +`;
}

/**
 * Build at most one honest why line. Null when nothing true to say.
 */
export function buildSessionWhyLine(input: SessionWhyInput): SessionWhyLine | null {
  const kind = (input.kind ?? '').toLowerCase();
  const focus = focusLabel(input.focusGroups);
  const zone =
    input.loadZone === 'high' || input.loadZone === 'light' || input.loadZone === 'steady'
      ? input.loadZone
      : null;

  if (kind === 'recovery') {
    return {
      messageKey: 'coachSessionWhyRecovery',
      defaultValue: focus
        ? `Recovery emphasis${focus ? ` · ${focus}` : ''} — keep quality high, strain low.`
        : 'Recovery emphasis — keep quality high, strain low.',
      params: focus ? { focus } : undefined,
    };
  }

  if (kind === 'conditioning') {
    return {
      messageKey: 'coachSessionWhyConditioning',
      defaultValue: 'Conditioning day — engine work that still respects your logs.',
    };
  }

  // Strength / default — lead with focus, then optional load context
  if (focus) {
    if (zone === 'high') {
      return {
        messageKey: 'coachSessionWhyStrengthHighLoad',
        defaultValue: `${focus} focus — your recent week is heavier than your month; stay crisp, don’t chase fatigue.`,
        params: { focus },
      };
    }
    if (zone === 'light') {
      return {
        messageKey: 'coachSessionWhyStrengthLightLoad',
        defaultValue: `${focus} focus — recent week is lighter than your month; room to train with intent.`,
        params: { focus },
      };
    }
    return {
      messageKey: 'coachSessionWhyStrength',
      defaultValue: `${focus} focus — built from your logs and gear, not a wearable.`,
      params: { focus },
    };
  }

  if (zone === 'high') {
    return {
      messageKey: 'coachSessionWhyHighLoad',
      defaultValue: 'Recent week is heavier than your month — prioritize clean reps over adding load.',
    };
  }

  if (zone === 'light') {
    return {
      messageKey: 'coachSessionWhyLightLoad',
      defaultValue: 'Recent week is lighter than your month — good window to train with intent.',
    };
  }

  // leadWhyKey alone is not enough without resolving i18n — skip rather than show a raw key
  return null;
}
