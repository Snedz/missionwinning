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

import { useEffect, useMemo, useState } from 'react';
import { Volume2, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { WindDownOptIn } from '@/components/workout/WindDownOptIn';
import type { Debrief } from '@/lib/coach/debrief';
import { track } from '@/lib/analytics';
import { upsertTodayPartial } from '@/lib/mindCheckIns';
import { speakableDebriefText } from '@/lib/speech/speakableLines';
import { speak, speechSupport, stopSpeaking } from '@/lib/speech/speak';

type Props = {
  debrief: Debrief;
  /**
   * The athlete's journal fragments — their own words, rendered FIRST and verbatim
   * (`composeSessionEntry` already attributed exercise notes). The entry reads as
   * theirs, augmented; never the machine's, decorated. Absent → plain debrief.
   */
  fragments?: string[];
};

/**
 * Map the tapped chip onto the check-in the coach already reads, so the answer
 * changes the next session rather than only being counted. `harder` is the athlete
 * telling us the dose was too high — the same signal a low energy rating carries.
 */
const CHIP_EFFECT: Record<string, { energy?: number } | undefined> = {
  harder: { energy: 2 },
  exact: undefined,
  easy: { energy: 5 },
};

const REPLY_KEY: Record<string, string> = {
  harder: 'debriefReplyHarder',
  exact: 'debriefReplyExact',
  easy: 'debriefReplyEasy',
};

const REPLY_DEFAULT: Record<string, string> = {
  harder: 'Harder than expected',
  exact: 'Exactly what I wanted',
  easy: 'Too easy',
};

export function SessionDebriefCard({ debrief, fragments }: Props) {
  const { t } = useTranslation();
  const [answered, setAnswered] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);

  // On-device speech: the coach reads the lines the rules engine already composed
  // and `reentryTone` already tested. No network, no key, no LLM in this path.
  const spokenText = useMemo(() => speakableDebriefText(debrief), [debrief]);
  const canSpeak = speechSupport() === 'ready' && spokenText.length > 0;

  // Leaving a page mid-sentence should stop the voice, not talk over the next screen.
  useEffect(() => () => stopSpeaking(), []);

  const toggleSpeech = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    const started = speak(spokenText, { onEnd: () => setSpeaking(false) });
    setSpeaking(started);
    if (started) track('debrief_spoken', { zone: debrief.zone });
  };

  const answer = (chip: string) => {
    setAnswered(chip);
    track('debrief_answered', { reply: chip, zone: debrief.zone });
    const effect = CHIP_EFFECT[chip];
    if (effect) upsertTodayPartial(effect);
  };

  const statements = debrief.lines.filter((l) => l.kind !== 'question');
  const question = debrief.lines.find((l) => l.kind === 'question');

  return (
    <section
      className="border-t border-border pt-4"
      aria-label={t('debriefSectionLabel', { defaultValue: 'Session debrief' })}
    >
      {fragments && fragments.length > 0 ? (
        <ul
          className="mb-3 space-y-1.5 border-l-2 border-poster pl-3"
          aria-label={t('debriefFieldNotesLabel', { defaultValue: 'Your field notes' })}
        >
          {fragments.map((fragment, i) => (
            <li key={i} className="text-sm italic text-foreground">
              {fragment}
            </li>
          ))}
        </ul>
      ) : null}

      {canSpeak ? (
        <button
          type="button"
          onClick={toggleSpeech}
          aria-label={
            speaking
              ? t('debriefStopAria', { defaultValue: 'Stop reading the debrief' })
              : t('debriefListenAria', { defaultValue: 'Read the debrief aloud' })
          }
          className="mb-3 inline-flex min-h-[44px] items-center gap-2 border border-input px-3 py-2 text-xs font-medium"
        >
          {speaking ? <Square className="h-3 w-3" aria-hidden /> : <Volume2 className="h-3 w-3" aria-hidden />}
          {speaking
            ? t('debriefStop', { defaultValue: 'Stop' })
            : t('debriefListen', { defaultValue: 'Listen' })}
        </button>
      ) : null}

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
          <p className="text-sm">
            {t('debriefDoseQuestion', {
              defaultValue: 'Did that run hotter than planned, or was it the work you wanted?',
            })}
          </p>
          {answered ? (
            <p className="mt-2 text-xs text-muted-foreground" role="status">
              {t('debriefNoted', {
                defaultValue: 'Noted — next session will account for that.',
              })}
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
                  {t(REPLY_KEY[chip] ?? chip, {
                    defaultValue: REPLY_DEFAULT[chip] ?? chip,
                  })}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Honest by the time it renders: handleComplete saved the entry before
          opening this sheet. Points at the journal without adding a second CTA. */}
      <p className="mt-4 text-xs text-muted-foreground" role="status">
        {t('debriefSavedJournal', {
          defaultValue: 'Saved to your journal — edit any time from History.',
        })}
      </p>

      {/* Only after a session that actually ran hot — that is when "evenings like
          this" means something. A steady session gets no ask. */}
      {debrief.zone === 'high' ? <WindDownOptIn /> : null}
    </section>
  );
}
