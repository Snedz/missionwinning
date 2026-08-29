'use client';

/**
 * Train ear — Cue me + rest-end / set-progress speech.
 * Isolated from Active first paint so `/active` never imports `@/lib/speech`.
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2 } from 'lucide-react';
import { speak, speechSupport, stopSpeaking } from '@/lib/speech/speak';
import {
  shouldSpeakOnRestEnd,
  speakableNextCue,
  speakableSetProgress,
  type NextCueInput,
} from '@/lib/speech/speakableLines';

type Props = {
  restTimerActive: boolean;
  nextCue: NextCueInput | null;
  completedSets: number;
  totalSets: number;
  logPulse: number;
};

export function ActiveTrainCues({
  restTimerActive,
  nextCue,
  completedSets,
  totalSets,
  logPulse,
}: Props) {
  const { t } = useTranslation();
  const [cueMe, setCueMe] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const cueMeRef = useRef(false);
  const nextLineRef = useRef('');
  const prevRestActive = useRef(false);
  const lastLogPulse = useRef(0);

  cueMeRef.current = cueMe;
  nextLineRef.current = speakableNextCue(nextCue);

  useEffect(() => {
    setCanSpeak(speechSupport() === 'ready');
  }, []);

  useEffect(() => {
    if (shouldSpeakOnRestEnd(prevRestActive.current, restTimerActive, cueMeRef.current)) {
      const line = nextLineRef.current;
      if (line) speak(line);
    }
    prevRestActive.current = restTimerActive;
  }, [restTimerActive]);

  useEffect(() => {
    if (logPulse === 0 || logPulse === lastLogPulse.current) return;
    lastLogPulse.current = logPulse;
    if (!cueMeRef.current) return;
    const line = speakableSetProgress({
      completed: completedSets,
      target: totalSets,
    });
    if (line) speak(line);
  }, [logPulse, completedSets, totalSets]);

  useEffect(() => () => stopSpeaking(), []);

  if (!canSpeak) return null;

  return (
    <button
      type="button"
      data-testid="active-cue-me"
      className="house-btn house-btn-ghost min-h-[44px] w-full justify-start tap-target"
      onClick={() => {
        setCueMe((on) => {
          const nextOn = !on;
          if (!nextOn) {
            stopSpeaking();
            return false;
          }
          const line = nextLineRef.current;
          if (line) speak(line);
          return true;
        });
      }}
      aria-pressed={cueMe}
      aria-label={
        cueMe
          ? t('activeCueMeOnAria', { defaultValue: 'Stop spoken set directions' })
          : t('activeCueMeAria', { defaultValue: 'Speak next-set directions' })
      }
    >
      <Volume2 className="h-4 w-4 me-1" aria-hidden />
      <span>
        {cueMe
          ? t('activeCueMeOn', { defaultValue: 'Cues on' })
          : t('activeCueMe', { defaultValue: 'Cue me' })}
      </span>
    </button>
  );
}
