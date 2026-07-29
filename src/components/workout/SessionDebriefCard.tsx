'use client';

/**
 * The session debrief inside the victory sheet.
 *
 * Presentation only — every sentence comes from `buildDebrief`, which is pure and
 * tested for tone. Nothing is composed here, because a string assembled in a
 * component is a string no test will ever check.
 *
 * The reply chips are the point of the closing question: an answer the athlete taps
 * is signal the next plan can use, where an answer they have to type is one they
 * will not give.
 */

import { useState } from 'react';
import type { Debrief } from '@/lib/coach/debrief';
import { track } from '@/lib/analytics';
import { upsertTodayPartial } from '@/lib/mindCheckIns';

type Props = {
  debrief: Debrief;
};

/**
 * Map the tapped chip onto the check-in the coach already reads, so the answer
 * changes the next session rather than only being counted. "Harder than expected"
 * is the athlete telling us the dose was too high — the same signal a low energy
 * rating carries.
 */
const CHIP_EFFECT: Record<string, { energy?: number } | undefined> = {
  'Harder than expected': { energy: 2 },
  'Exactly what I wanted': undefined,
  'Too easy': { energy: 5 },
};

export function SessionDebriefCard({ debrief }: Props) {
  const [answered, setAnswered] = useState<string | null>(null);

  const answer = (chip: string) => {
    setAnswered(chip);
    track('debrief_answered', { reply: chip, zone: debrief.zone });
    const effect = CHIP_EFFECT[chip];
    if (effect) upsertTodayPartial(effect);
  };

  const statements = debrief.lines.filter((l) => l.kind !== 'question');
  const question = debrief.lines.find((l) => l.kind === 'question');

  return (
    <section className="border-t border-border pt-4" aria-label="Session debrief">
      <ul className="space-y-2">
        {statements.map((line, i) => (
          <li
            key={`${line.kind}-${i}`}
            className={
              line.kind === 'record'
                ? 'text-sm font-semibold text-poster'
                : 'text-sm text-muted-foreground'
            }
          >
            {line.text}
          </li>
        ))}
      </ul>

      {question ? (
        <div className="mt-4">
          <p className="text-sm">{question.text}</p>
          {answered ? (
            <p className="mt-2 text-xs text-muted-foreground" role="status">
              Noted — next session will account for that.
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {debrief.replies.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => answer(chip)}
                  className="min-h-[44px] border border-input px-3 py-2 text-xs"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
