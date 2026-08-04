'use client';

/**
 * Coach chat — premium. Free users get form cues (?ask=) + soft Bundle tip,
 * never a brass paywall above the free weekly plan.
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { track } from '@/lib/analytics';
import type { PlanSession } from '@/lib/coach/types';
import { EXERCISES, ensureFullExerciseCatalog, getExerciseById } from '@/data/exercises';
import { cn } from '@/lib/utils';
import { CoachFreeFormAskPanel } from '@/components/coach/CoachFreeFormAskPanel';
import { CoachSoftBundleChatTip } from '@/components/coach/CoachSoftBundleChatTip';
import { CoachChatTranscript } from '@/components/coach/CoachChatTranscript';
import { CoachChatComposer } from '@/components/coach/CoachChatComposer';
import {
  buildCoachChatRequestContext,
  coachChatCopyForStatus,
  isCoachChatAbortError,
  readCoachChatStream,
} from '@/lib/coach/coachChatClient';

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
  const [open, setOpen] = useState(Boolean(askExerciseId) && premium);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [offline, setOffline] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [exerciseId, setExerciseId] = useState<string | undefined>(askExerciseId);
  const logRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackedOpen = useRef(false);
  const askBooted = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (open && !trackedOpen.current && premium) {
      trackedOpen.current = true;
      track('coach_chat_opened', {
        locked: false,
        surface: askExerciseId ? 'active' : 'coach',
        grounded: Boolean(askExerciseId),
      });
    }
  }, [open, premium, askExerciseId]);

  useEffect(() => {
    if (!premium || !askExerciseId || askBooted.current) return;
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
  }, [askExerciseId, premium, t]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns]);

  if (!premium) {
    if (askExerciseId) {
      return <CoachFreeFormAskPanel askExerciseId={askExerciseId} className={className} />;
    }
    return <CoachSoftBundleChatTip className={className} />;
  }

  const failWithUserKept = (message: string, prior: Turn[], coachContent: string, markOffline = false) => {
    if (markOffline) setOffline(true);
    setSendError(coachContent);
    setTurns([...prior, { role: 'user', content: message }, { role: 'coach', content: coachContent }]);
  };

  const send = async () => {
    const message = input.trim();
    if (!message || sending) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSendError(
        t('coachChatBrowserOffline', {
          defaultValue: 'You appear offline — reconnect and try again.',
        })
      );
      return;
    }
    setSending(true);
    setSendError(null);
    setOffline(false);
    setInput('');
    const prior = turns;
    setTurns([...prior, { role: 'user', content: message }, { role: 'coach', content: '' }]);

    const context = buildCoachChatRequestContext({
      readiness,
      strain,
      recovery,
      exerciseId,
      todaySession,
      resolveExerciseName: (id) => EXERCISES.find((x) => x.id === id)?.name ?? id,
    });

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const res = await fetch('/api/coach/chat', {
        method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/plain',
          },
        body: JSON.stringify({
          message,
          turns: prior.slice(-12),
          context,
          stream: true,
          // Metering identity for anonymous athletes — counts, never content.
          deviceId: (await import('@/lib/coach/storage')).getOrCreateDeviceId(),
        }),
        signal: ac.signal,
      });
      if (!res.ok || !res.body) {
        const copy = coachChatCopyForStatus(res.status);
        failWithUserKept(
          message,
          prior,
          t(copy.key, { defaultValue: copy.defaultValue }),
          Boolean(copy.markOffline)
        );
        return;
      }

      track('coach_chat_message_sent', {
        turn: prior.length + 1,
        grounded: Boolean(exerciseId),
      });

      const streamResult = await readCoachChatStream(res.body, (snapshot) => {
        setTurns([...prior, { role: 'user', content: message }, { role: 'coach', content: snapshot }]);
      });
      if (streamResult.kind === 'stream_error') {
        failWithUserKept(
          message,
          prior,
          t(streamResult.error.copy.key, {
            defaultValue: streamResult.error.copy.defaultValue,
          }),
          Boolean(streamResult.error.copy.markOffline)
        );
        return;
      }
      if (streamResult.kind === 'empty') {
        const copy = coachChatCopyForStatus(0);
        failWithUserKept(
          message,
          prior,
          t(copy.key, { defaultValue: copy.defaultValue })
        );
      }
    } catch (err) {
      if (isCoachChatAbortError(err)) {
        setTurns([...prior, { role: 'user', content: message }]);
        setSendError(t('coachChatStopped', { defaultValue: 'Stopped.' }));
        return;
      }
      const copy = coachChatCopyForStatus(0);
      failWithUserKept(
        message,
        prior,
        t(copy.key, { defaultValue: copy.defaultValue })
      );
    } finally {
      setSending(false);
    }
  };

  const stopStreaming = () => {
    abortRef.current?.abort();
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
          <CardContent className="space-y-3" aria-busy={sending}>
            {offline || sendError ? (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-primary flex-1" role="status">
                  {sendError ||
                    t('coachChatOffline', {
                      defaultValue: 'Coach voice offline — your plan and adjustments still work.',
                    })}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="min-h-[44px]"
                  onClick={() => {
                    setOffline(false);
                    setSendError(null);
                  }}
                >
                  {t('retry', { defaultValue: 'Try again' })}
                </Button>
              </div>
            ) : null}
            <CoachChatTranscript turns={turns} sending={sending} logRef={logRef} />
            <CoachChatComposer
              input={input}
              sending={sending}
              onInputChange={setInput}
              onSend={() => void send()}
              onStop={stopStreaming}
            />
          </CardContent>
        ) : null}
      </Card>
    </div>
  );
}
