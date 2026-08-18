'use client';

/**
 * Premium coach chat transcript log (.448).
 */

import type { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export type CoachChatTurn = { role: 'user' | 'coach'; content: string };

type Props = {
  turns: CoachChatTurn[];
  sending: boolean;
  logRef: RefObject<HTMLDivElement | null>;
};

export function CoachChatTranscript({ turns, sending, logRef }: Props) {
  const { t } = useTranslation();

  return (
    <div
      ref={logRef}
      role="log"
      aria-live="polite"
      className="max-h-56 overflow-y-auto space-y-2 border-2 border-border p-3 text-sm"
    >
      {turns.length === 0 ? (
        <p className="text-muted-foreground text-xs">
          {t('coachChatPlaceholder', {
            defaultValue: 'Ask about today’s session, form, or recovery…',
          })}
        </p>
      ) : null}
      {turns.map((turn, i) => (
        <div
          key={`${turn.role}-${i}`}
          className={cn(
            'rounded-none px-2 py-1.5 whitespace-pre-wrap',
            turn.role === 'user'
              ? 'border-2 border-primary bg-tint ml-4'
              : 'border-2 border-border bg-card mr-4'
          )}
        >
          {turn.content}
          {sending && turn.role === 'coach' && i === turns.length - 1 ? (
            <span
              className="inline-block w-1.5 h-3.5 ms-0.5 align-middle bg-primary animate-pulse"
              aria-hidden
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
