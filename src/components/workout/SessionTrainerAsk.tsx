'use client';

/**
 * Ask the AI personal trainer about the open set (.1115).
 * The set line stays visible. A dark seat returns that same line.
 */

import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { SetKind, SetRowType } from '@/types';

export type TrainerAskFacts = {
  exerciseName: string;
  setNumber: number;
  setCount: number;
  reps: number;
  weight: number;
  unitLabel: string;
  kind?: SetKind;
  rowType: SetRowType;
  durationSeconds?: number;
  hardCount: number;
  bodyweightLabel?: string;
  historyLine?: string;
};

export function SessionTrainerAsk({
  facts,
  rulesLine,
}: {
  facts: TrainerAskFacts;
  rulesLine: string;
}) {
  const { t } = useTranslation();
  const [question, setQuestion] = useState('');
  const [reply, setReply] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onAsk(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    try {
      const res = await fetch('/api/coach/trainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...facts,
          question: question.trim() || undefined,
        }),
      });
      if (!res.ok) {
        setReply(rulesLine);
        setSource('rules');
        return;
      }
      const data = (await res.json()) as { text?: unknown; source?: unknown };
      if (typeof data.text === 'string' && data.text.trim()) {
        setReply(data.text);
        setSource(typeof data.source === 'string' ? data.source : 'rules');
      } else {
        setReply(rulesLine);
        setSource('rules');
      }
    } catch {
      setReply(rulesLine);
      setSource('rules');
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="house-trainer-ask" data-testid="trainer-ask" onSubmit={onAsk}>
      <label className="house-trainer-label" htmlFor="trainer-ask-q">
        {t('trainerAskLabel', { defaultValue: 'AI personal trainer' })}
      </label>
      <input
        id="trainer-ask-q"
        className="house-field"
        data-testid="trainer-ask-input"
        value={question}
        maxLength={280}
        autoComplete="off"
        placeholder={t('trainerAskPlaceholder', { defaultValue: 'Ask about this set' })}
        onChange={(event) => setQuestion(event.target.value)}
        disabled={pending}
      />
      <button
        type="submit"
        className="house-btn house-btn-ghost"
        data-testid="trainer-ask-submit"
        disabled={pending}
      >
        {pending
          ? t('trainerAskPending', { defaultValue: 'Asking…' })
          : t('trainerAskSubmit', { defaultValue: 'Ask' })}
      </button>
      {reply ? (
        <p
          className="house-lede house-session-coach"
          data-testid="trainer-reply"
          data-source={source ?? 'rules'}
        >
          {reply}
        </p>
      ) : null}
    </form>
  );
}
