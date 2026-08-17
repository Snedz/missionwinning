'use client';

/**
 * Signed-in + online coach voice — Meta-style conversation, not a mic on a form.
 * Same `/api/coach/chat` path as typed chat. Audio is never posted to us.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CoachSoftBundleChatTip } from '@/components/coach/CoachSoftBundleChatTip';
import type { PlanSession } from '@/lib/coach/types';
import {
  buildCoachChatRequestContext,
  coachChatCopyForStatus,
  isCoachChatAbortError,
  postCoachChatMessage,
  type CoachChatTurn,
} from '@/lib/coach/coachChatClient';
import { getOrCreateDeviceId, loadPlan } from '@/lib/coach/storage';
import { loadBands } from '@/lib/coach/load';
import { readWorkoutHistoryFromStorage } from '@/lib/workout/workoutPersistLite';
import { EXERCISES } from '@/data/exercises';
import {
  getSpeechRecognitionCtor,
  heardTranscriptFromResult,
  listenSupport,
  type RecognitionLike,
} from '@/lib/speech/listen';
import { speak, stopSpeaking } from '@/lib/speech/speak';
import { speakableChatReply } from '@/lib/speech/speakableLines';
import {
  COACH_LIVE_HASH,
  coachVoiceAccess,
  coachVoiceEmptyRetry,
  coachVoiceReopensListen,
  nextCoachVoicePhase,
  shouldFocusLiveTalk,
  type CoachVoicePhase,
} from '@/lib/speech/coachVoiceSession';
import { cn } from '@/lib/utils';
import { track } from '@/lib/analytics';

type Props = {
  entitled: boolean;
  readiness: number;
  strain: number;
  recovery: number;
  todaySession: PlanSession | null;
  className?: string;
};

export function CoachLiveVoice({
  entitled,
  readiness,
  strain,
  recovery,
  todaySession,
  className,
}: Props) {
  const { t, i18n } = useTranslation();
  const [online, setOnline] = useState(true);
  const [phase, setPhase] = useState<CoachVoicePhase>('ready');
  const [inSession, setInSession] = useState(false);
  const [turns, setTurns] = useState<CoachChatTurn[]>([]);
  const [heard, setHeard] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [canListen, setCanListen] = useState(false);

  const recRef = useRef<RecognitionLike | null>(null);
  const ignoreEndRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const inSessionRef = useRef(false);
  const phaseRef = useRef<CoachVoicePhase>('ready');
  const turnsRef = useRef<CoachChatTurn[]>([]);
  const heardLiveRef = useRef('');
  const beginListenRef = useRef<() => void>(() => {});
  const talkRef = useRef<HTMLButtonElement>(null);
  const emptyCountRef = useRef(0);

  inSessionRef.current = inSession;
  phaseRef.current = phase;
  turnsRef.current = turns;

  const access = coachVoiceAccess({ online, entitled });

  useEffect(() => {
    const sync = () => setOnline(typeof navigator === 'undefined' ? true : navigator.onLine);
    sync();
    setCanListen(listenSupport() === 'ready');
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!shouldFocusLiveTalk(window.location.hash)) return;
    document.getElementById(COACH_LIVE_HASH)?.scrollIntoView({ block: 'start' });
    talkRef.current?.focus();
  }, [canListen]);

  const stopRec = useCallback((ignoreEnd = true) => {
    ignoreEndRef.current = ignoreEnd;
    recRef.current?.abort();
    recRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      stopRec(true);
      abortRef.current?.abort();
      stopSpeaking();
    };
  }, [stopRec]);

  const apply = (event: Parameters<typeof nextCoachVoicePhase>[1]) => {
    const from = phaseRef.current;
    const next = nextCoachVoicePhase(from, event);
    phaseRef.current = next;
    setPhase(next);
    return { from, next, reopen: coachVoiceReopensListen(from, event) };
  };

  const sendHeard = useCallback(
    async (message: string) => {
      apply('heard');
      setError(null);
      const prior = turnsRef.current;
      setTurns([...prior, { role: 'user', content: message }, { role: 'coach', content: '' }]);

      const history = readWorkoutHistoryFromStorage();
      const context = buildCoachChatRequestContext({
        readiness,
        strain,
        recovery,
        todaySession,
        resolveExerciseName: (id) => EXERCISES.find((x) => x.id === id)?.name ?? id,
        history,
        plan: loadPlan(),
        loadZone: loadBands(history).zone,
      });

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const result = await postCoachChatMessage({
          message,
          turns: prior,
          context,
          deviceId: getOrCreateDeviceId(),
          signal: ac.signal,
          onPartial: (snapshot) => {
            setTurns([
              ...prior,
              { role: 'user', content: message },
              { role: 'coach', content: snapshot },
            ]);
          },
        });

        if (result.kind === 'http') {
          const copy = coachChatCopyForStatus(result.status);
          const line = t(copy.key, { defaultValue: copy.defaultValue });
          setError(line);
          apply('fail');
          setInSession(false);
          inSessionRef.current = false;
          return;
        }
        if (result.kind === 'stream_error') {
          const line = t(result.error.copy.key, {
            defaultValue: result.error.copy.defaultValue,
          });
          setError(line);
          apply('fail');
          setInSession(false);
          inSessionRef.current = false;
          return;
        }
        if (result.kind === 'empty') {
          apply('fail');
          return;
        }

        track('coach_chat_message_sent', { turn: prior.length + 1, grounded: false, live: true });
        apply('reply');
        const spoken = speakableChatReply(result.text);
        if (!spoken) {
          apply('spoken');
          if (inSessionRef.current) queueMicrotask(() => beginListenRef.current());
          return;
        }
        const started = speak(spoken, {
          onEnd: () => {
            const step = apply('spoken');
            if (step.reopen && inSessionRef.current) beginListenRef.current();
          },
        });
        if (!started) {
          const step = apply('spoken');
          if (step.reopen && inSessionRef.current) beginListenRef.current();
        }
      } catch (err) {
        if (isCoachChatAbortError(err)) {
          apply('fail');
          return;
        }
        apply('fail');
      }
    },
    [readiness, recovery, strain, t, todaySession]
  );

  const beginListen = useCallback(() => {
    if (!inSessionRef.current) return;
    if (access !== 'live') return;
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      apply('fail');
      return;
    }
    stopSpeaking();
    stopRec(true);
    heardLiveRef.current = '';
    setHeard('');
    ignoreEndRef.current = false;
    const rec = new Ctor();
    rec.lang = i18n.resolvedLanguage || i18n.language || 'en';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (ev) => {
      const line = heardTranscriptFromResult(ev);
      heardLiveRef.current = line;
      if (line) setHeard(line);
    };
    rec.onerror = () => {
      recRef.current = null;
      if (ignoreEndRef.current) return;
      apply('empty');
    };
    rec.onend = () => {
      recRef.current = null;
      if (ignoreEndRef.current) {
        ignoreEndRef.current = false;
        return;
      }
      const line = heardLiveRef.current.trim();
      if (line) {
        emptyCountRef.current = 0;
        void sendHeard(line);
        return;
      }
      if (coachVoiceEmptyRetry(inSessionRef.current, emptyCountRef.current)) {
        emptyCountRef.current += 1;
        queueMicrotask(() => beginListenRef.current());
        return;
      }
      apply('empty');
    };
    recRef.current = rec;
    try {
      rec.start();
      apply('start');
    } catch {
      apply('fail');
    }
  }, [access, i18n.language, i18n.resolvedLanguage, sendHeard, stopRec]);

  beginListenRef.current = beginListen;

  const endSession = () => {
    inSessionRef.current = false;
    setInSession(false);
    emptyCountRef.current = 0;
    stopRec(true);
    abortRef.current?.abort();
    stopSpeaking();
    apply('end');
  };

  const onPrimary = () => {
    if (access !== 'live') return;
    if (phase === 'listening') {
      stopRec(false);
      return;
    }
    if (phase === 'thinking') {
      abortRef.current?.abort();
      apply('interrupt');
      beginListen();
      return;
    }
    if (phase === 'speaking') {
      stopSpeaking();
      apply('interrupt');
      beginListen();
      return;
    }
    inSessionRef.current = true;
    setInSession(true);
    setError(null);
    emptyCountRef.current = 0;
    beginListen();
  };

  if (access === 'locked') {
    return <CoachSoftBundleChatTip className={className} />;
  }

  const status =
    access === 'offline'
      ? t('coachLiveOffline', {
          defaultValue: 'You’re offline — reconnect to talk. Your week still works.',
        })
      : phase === 'listening'
        ? t('coachLiveListening', { defaultValue: 'Listening…' })
        : phase === 'thinking'
          ? t('coachLiveThinking', { defaultValue: 'Thinking…' })
          : phase === 'speaking'
            ? t('coachLiveSpeaking', { defaultValue: 'Speaking…' })
            : t('coachLiveReady', { defaultValue: 'Tap to talk. I’ll answer out loud.' });

  const lastCoach = [...turns].reverse().find((turn) => turn.role === 'coach' && turn.content.trim());

  return (
    <section
      id="coach-live"
      data-testid="coach-live-voice"
      className={cn('border-2 border-border bg-card p-4 space-y-3', className)}
      aria-busy={phase === 'thinking'}
    >
      <p className="eyebrow text-primary">{t('coachLiveTitle', { defaultValue: 'Talk to your coach' })}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {t('coachLiveLead', {
          defaultValue: 'Signed in and online — speak, then hear the answer. Same coach as chat.',
        })}
      </p>
      <p className="text-base font-semibold text-foreground" role="status">
        {error ?? status}
      </p>
      {heard ? (
        <p className="text-sm text-muted-foreground" data-testid="coach-live-heard">
          {heard}
        </p>
      ) : null}
      {lastCoach && phase !== 'listening' ? (
        <p className="text-sm leading-relaxed text-foreground" data-testid="coach-live-reply">
          {lastCoach.content}
        </p>
      ) : null}

      {access === 'live' && !canListen ? (
        <p className="text-sm text-muted-foreground">
          {t('coachLiveNoMic', {
            defaultValue: 'This browser cannot hear you — type in chat below.',
          })}
        </p>
      ) : null}

      {access === 'live' && canListen ? (
        <div className="flex gap-2">
          <button
            type="button"
            ref={talkRef}
            className={cn(
              'primary-action min-h-[72px] flex-1 text-[19px]',
              phase === 'listening' && 'bg-primary-fill'
            )}
            data-testid="coach-live-talk"
            aria-pressed={phase === 'listening'}
            aria-label={
              phase === 'listening'
                ? t('coachLiveListeningAria', { defaultValue: 'Stop listening' })
                : t('coachLiveTalkAria', { defaultValue: 'Start talking to your coach' })
            }
            onClick={onPrimary}
          >
            <Mic className="h-5 w-5 shrink-0" aria-hidden />
            <span className="flex-1 text-start">
              {phase === 'listening'
                ? t('coachLiveListening', { defaultValue: 'Listening…' })
                : t('coachLiveTalk', { defaultValue: 'Talk' })}
            </span>
          </button>
          {inSession ? (
            <Button
              type="button"
              variant="outline"
              className="min-h-[72px] min-w-[72px] px-4"
              data-testid="coach-live-end"
              aria-label={t('coachLiveEndAria', { defaultValue: 'End the voice conversation' })}
              onClick={endSession}
            >
              {t('coachLiveEnd', { defaultValue: 'End' })}
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
