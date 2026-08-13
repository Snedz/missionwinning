'use client';

/**
 * The one line that turns a Coach claim into a checkable statement.
 *
 * Every Coach surface that can be on screen renders this: either the fact the
 * plan is standing on — *"From your log: Bench Press 60 kg × 5 · 12 Aug"* — or
 * the admission that there isn't one yet. See
 * [logCitation.ts](../../lib/coach/logCitation.ts) for why (survey clarity
 * 2.56/5, "coach output has no log-derived labels").
 *
 * It reads the persist blob directly rather than the Zustand store, because two
 * of its four mount sites are on the Today cold path, which is deliberately
 * store-free. The read happens in an effect: on the server there is no
 * localStorage, and rendering a citation during hydration that the server could
 * not produce is a hydration mismatch. So the first frame shows nothing at all
 * rather than a wrong or unbacked line — the one thing this component must never
 * do is assert provenance it has not checked.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  COACH_CITATION_COPY,
  coachCitationFact,
  coachLogCitationFromStorage,
  type CoachLogCitation,
} from '@/lib/coach/logCitation';
import { useUnits } from '@/hooks/useUnits';
import { weightUnitLabel } from '@/lib/units';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  /**
   * Louder treatment for the two surfaces where the citation *is* the argument
   * (the Coach page header and the no-plan empty state).
   */
  emphasis?: boolean;
};

export function CoachLogCite({ className, emphasis = false }: Props) {
  const { t, i18n } = useTranslation();
  const units = useUnits();
  const [citation, setCitation] = useState<CoachLogCitation | null>(null);

  /*
   * Read on mount only. There is no `mw-workout-logged` event to subscribe to,
   * and inventing a listener for an event nobody dispatches would be a
   * subscription that can never fire — logging happens on `/active`, so every
   * Coach surface remounts on the way back.
   */
  useEffect(() => {
    setCitation(coachLogCitationFromStorage());
  }, []);

  if (!citation) return null;

  const base = cn(
    'tabular-nums',
    emphasis ? 'text-sm text-foreground' : 'text-[11px] text-muted-foreground',
    className
  );

  if (citation.kind === 'no-logs') {
    return (
      <p className={base} data-mw-coach-cite="no-logs">
        {t('coachCiteNoLogs', { defaultValue: COACH_CITATION_COPY.noLogs })}
      </p>
    );
  }

  const fact = coachCitationFact(citation, i18n.language, weightUnitLabel(units));
  if (!fact) return null;

  return (
    <p className={base} data-mw-coach-cite={citation.kind}>
      {t('coachCiteFromLog', { fact, defaultValue: COACH_CITATION_COPY.fromLog })}
    </p>
  );
}
