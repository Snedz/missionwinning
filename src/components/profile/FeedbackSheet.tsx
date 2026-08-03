'use client';

/**
 * One question, over whatever you were doing.
 *
 * `.215` — on `AdaptiveOverlay` rather than a route, because navigating to
 * `/feedback` costs the athlete their place. Someone reporting that the timer
 * jumped is mid-session; sending them to a separate page to say so is asking
 * them to abandon the thing they are complaining about.
 *
 * Email is **optional**, and the copy says what that costs rather than nagging.
 * The product's whole thesis is "no account required to log"; requiring an
 * address to report a bug is the same barrier in a smaller place.
 *
 * Delivery reuses the outbox path `.179` built — `enqueueFeedback` — so a note
 * written in a basement gym queues, retries, dedupes, and shows up on the
 * offline screen as "Feedback note" without a line of new transport code.
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { enqueueFeedback } from '@/lib/sync/feedbackSync';
import {
  MAX_NOTE_CHARS,
  canSendNote,
  composeFeedbackNote,
  remainingChars,
} from '@/lib/feedbackNote';
import { APP_BUILD_LABEL } from '@/lib/buildInfo';
import { previousScreen, readScreenTrail } from '@/lib/screenTrail';

type Props = {
  open: boolean;
  onClose: () => void;
  /** Route this was opened from — attached to the note. */
  screen: string;
};

export function FeedbackSheet({ open, onClose, screen }: Props) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Snapshotted on open rather than read during render: `sessionStorage` is not
   * there on the server, and a value that differs between the server pass and
   * the first client pass is a hydration mismatch. Nothing navigates while the
   * sheet is open, so one read at open time is also the correct read at send.
   */
  const [from, setFrom] = useState<string | null>(null);
  useEffect(() => {
    if (open) setFrom(previousScreen(readScreenTrail(), screen));
  }, [open, screen]);

  const left = remainingChars(text);
  const canSend = canSendNote(text);
  const routes = from ? `${screen}, ${from}` : screen;

  const send = () => {
    const at = new Date().toISOString();
    enqueueFeedback(
      composeFeedbackNote({
        text,
        email,
        screen,
        previousScreen: from,
        buildLabel: APP_BUILD_LABEL,
        online: typeof navigator === 'undefined' ? true : navigator.onLine,
      }),
      at
    );
    setSent(true);
  };

  const close = () => {
    onClose();
    // Reset after the panel is gone so the athlete never watches their own note
    // being cleared — and so reopening is a fresh sheet, not a stale draft.
    setTimeout(() => {
      setText('');
      setEmail('');
      setSent(false);
    }, 200);
  };

  return (
    <AdaptiveOverlay
      open={open}
      onClose={close}
      size="sm"
      eyebrow={t('feedbackSheetEyebrow', { defaultValue: 'Beta' })}
      title={
        sent
          ? t('feedbackSheetSentTitle', { defaultValue: 'Got it' })
          : t('feedbackSheetTitle', { defaultValue: 'What got in your way?' })
      }
      initialFocusRef={textRef}
      footer={
        sent ? (
          <Button variant="outline" className="min-h-[44px] w-full" onClick={close}>
            {t('feedbackSheetDone', { defaultValue: 'Close' })}
          </Button>
        ) : (
          <Button
            variant="default"
            className="min-h-[44px] w-full"
            disabled={!canSend}
            onClick={send}
          >
            {t('feedbackSheetSend', { defaultValue: 'Send' })}
          </Button>
        )
      }
    >
      {sent ? (
        <div className="space-y-3 text-sm">
          <p className="text-foreground leading-relaxed">
            {t('feedbackSheetSentBody', {
              defaultValue:
                'Queued. It sends when you have a connection — you can close the app.',
            })}
          </p>
          {!email && (
            <p className="text-muted-foreground leading-relaxed">
              {t('feedbackSheetSentAnon', {
                defaultValue: 'No email, so there is no way to reply — but it was read.',
              })}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="mw-feedback-text" className="sr-only">
              {t('feedbackSheetTitle', { defaultValue: 'What got in your way?' })}
            </label>
            <textarea
              id="mw-feedback-text"
              ref={textRef}
              value={text}
              maxLength={MAX_NOTE_CHARS}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('feedbackSheetPlaceholder', {
                defaultValue: 'What broke, what confused you, or what you wish it did.',
              })}
              className="w-full min-h-[120px] border-2 border-border bg-background px-3 py-2 text-sm leading-relaxed"
            />
            {/* Counted down, never trimmed after the fact: the column caps at
                2000 and the route slices silently, so a long note would lose
                its tail without saying so. */}
            <p
              className={`mt-1 text-xs tabular-nums ${
                left < 100 ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {t('feedbackSheetRemaining', {
                left,
                defaultValue: `${left} characters left`,
              })}
            </p>
          </div>

          <div>
            <label htmlFor="mw-feedback-email" className="text-sm">
              {t('feedbackSheetEmailLabel', { defaultValue: 'Email (optional)' })}
            </label>
            <input
              id="mw-feedback-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 min-h-[44px] border-2 border-border bg-background px-3 text-sm"
            />
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {t('feedbackSheetEmailHelp', {
                defaultValue: 'Only so we can reply. Leave it blank and send anyway.',
              })}
            </p>
          </div>

          {/* Stated, not hidden. The note carries two routes and a build label;
              an athlete who would rather not send that deserves to know before
              they press Send, not after. */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('feedbackSheetContext', {
              screens: routes,
              defaultValue: `Sent with your app version and where you have been (${routes}), so we can find it.`,
            })}
          </p>
        </div>
      )}
    </AdaptiveOverlay>
  );
}
