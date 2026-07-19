'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { track } from '@/lib/analytics';
import type { PlanSession } from '@/lib/coach/types';
import { EXERCISES, ensureFullExerciseCatalog, getExerciseById } from '@/data/exercises';
import { cn } from '@/lib/utils';

type Turn = { role: 'user' | 'coach'; content: string };

type Props = {
  premium: boolean;
  readiness: number;
  strain: number;
  recovery: number;
  todaySession: PlanSession | null;
  /** From /coach?ask= — form Q&A deep link. */
  askExerciseId?: string;
  className?: string;
};

export function CoachChatPanel({
  premium,
  readiness,
  strain,
  recovery,
  todaySession,
  askExerciseId,
  className,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(Boolean(askExerciseId));
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [offline, setOffline] = useState(false);
  const [exerciseId, setExerciseId] = useState<string | undefined>(askExerciseId);
  const logRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackedOpen = useRef(false);
  const askBooted = useRef(false);

  useEffect(() => {
    if (open && !trackedOpen.current) {
      trackedOpen.current = true;
      track('coach_chat_opened', {
        locked: !premium,
        surface: askExerciseId ? 'active' : 'coach',
        grounded: Boolean(askExerciseId),
      });
    }
  }, [open, premium, askExerciseId]);

  useEffect(() => {
    if (!askExerciseId || askBooted.current) return;
    askBooted.current = true;
    let cancelled = false;
    void (async () => {
      await ensureFullExerciseCatalog();
      if (cancelled) return;
      const ex = getExerciseById(askExerciseId) ?? EXERCISES.find((e) => e.id === askExerciseId);
      const name = ex?.name ?? askExerciseId;
      setExerciseId(askExerciseId);
      setOpen(true);
      setInput(
        t('coachChatAskFormPrefill', {
          name,
          defaultValue: `How should I perform ${name} with good form?`,
        })
      );
      rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    })();
    return () => {
      cancelled = true;
    };
  }, [askExerciseId, t]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns]);

  if (!premium) {
    return (
      <div ref={rootRef}>
      <Card className={cn('card-elevated border-brass/25', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {t('coachChatLockedTitle', { defaultValue: 'Coach chat is Super Bundle' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t('coachChatLockedDesc', {
              defaultValue:
                'Chat with your coach about form, fuel, and recovery. Free core keeps the plan and offline adjustments.',
            })}
          </p>
          <Button asChild variant="fitness" size="sm" className="min-h-[44px]">
            <Link href="/bundle">{t('coachUnlockBundle', { defaultValue: 'Unlock Super Bundle' })}</Link>
          </Button>
        </CardContent>
      </Card>
      </div>
    );
  }

  const send = async () => {
    const message = input.trim();
    if (!message || sending || offline) return;
    setSending(true);
    setInput('');
    const prior = turns;
    const nextTurns: Turn[] = [...prior, { role: 'user', content: message }];
    setTurns(nextTurns);

    const context = {
      readiness,
      strain,
      recovery,
      trainDays14: 0,
      exerciseId,
      todaySession: todaySession
        ? {
            name: todaySession.name,
            kind: todaySession.kind,
            estMinutes: todaySession.estMinutes,
            exercises: todaySession.exercises.slice(0, 12).map((e) => ({
              id: e.exerciseId,
              name: EXERCISES.find((x) => x.id === e.exerciseId)?.name ?? e.exerciseId,
            })),
          }
        : undefined,
    };

    try {
      const res = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          turns: prior.slice(-12),
          context,
        }),
      });
      if (res.status === 503) {
        setOffline(true);
        setTurns(prior);
        return;
      }
      if (!res.ok) {
        setTurns([
          ...nextTurns,
          {
            role: 'coach',
            content: t('coachChatOffline', {
              defaultValue: 'Coach voice offline — your plan and adjustments still work.',
            }),
          },
        ]);
        return;
      }
      const data = (await res.json()) as {
        message: string;
        actionLabel?: string;
        actionPath?: string;
      };
      track('coach_chat_message_sent', {
        turn: nextTurns.length,
        grounded: Boolean(exerciseId),
      });
      const coachText = data.actionLabel
        ? `${data.message}\n→ ${data.actionLabel}${data.actionPath ? ` (${data.actionPath})` : ''}`
        : data.message;
      setTurns([...nextTurns, { role: 'coach', content: coachText }]);
    } catch {
      setTurns(prior);
    } finally {
      setSending(false);
    }
  };

  return (
    <div ref={rootRef}>
    <Card className={cn('content-card', className)}>
      <CardHeader className="pb-2">
        <button
          type="button"
          className="flex w-full items-center justify-between text-left min-h-[44px]"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <CardTitle className="text-base">
            {t('coachChatOpen', { defaultValue: 'Ask your coach' })}
          </CardTitle>
          <span className="text-xs text-muted-foreground">{open ? '−' : '+'}</span>
        </button>
      </CardHeader>
      {open ? (
        <CardContent className="space-y-3">
          {offline ? (
            <p className="text-sm text-status-warn" role="status">
              {t('coachChatOffline', {
                defaultValue: 'Coach voice offline — your plan and adjustments still work.',
              })}
            </p>
          ) : null}
          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            className="max-h-56 overflow-y-auto space-y-2 rounded-lg border border-border/40 p-3 text-sm"
          >
            {turns.length === 0 ? (
              <p className="text-muted-foreground text-xs">
                {t('coachChatPlaceholder', {
                  defaultValue: "Ask about today's session, form, or recovery…",
                })}
              </p>
            ) : null}
            {turns.map((turn, i) => (
              <div
                key={`${turn.role}-${i}`}
                className={cn(
                  'rounded-md px-2 py-1.5',
                  turn.role === 'user' ? 'bg-primary/10 ml-4' : 'bg-muted/40 mr-4'
                )}
              >
                {turn.content}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <label className="sr-only" htmlFor="coach-chat-input">
              {t('coachChatTitle', { defaultValue: 'Ask your coach' })}
            </label>
            <input
              id="coach-chat-input"
              type="text"
              className="flex-1 min-h-[44px] rounded-md border border-border bg-background px-3 text-sm"
              value={input}
              disabled={offline || sending}
              placeholder={t('coachChatPlaceholder', {
                defaultValue: "Ask about today's session, form, or recovery…",
              })}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void send();
              }}
            />
            <Button
              type="button"
              variant="fitness"
              className="min-h-[44px] min-w-[44px]"
              disabled={offline || sending || !input.trim()}
              onClick={() => void send()}
            >
              {t('coachChatSend', { defaultValue: 'Send' })}
            </Button>
          </div>
        </CardContent>
      ) : null}
    </Card>
    </div>
  );
}
