'use client';

/**
 * "Your first steps" — the resumable half of onboarding.
 *
 * Replaces `BetaWelcomeBanner`, which said the same thing in prose ("Finish
 * I-Day, log one workout from Today, then open Mission Coach") and could not
 * say how far along you were, because it had no idea. Three static chips that
 * looked identical on day one and day ninety.
 *
 * Everything here is **read**, never written. `detectBasicMilestones` has
 * computed all of it since the journey engine shipped; four of the six then
 * displayed nowhere. See [`firstSteps.ts`](../../lib/journey/firstSteps.ts) for
 * why completing them still gates nothing.
 *
 * The card retires itself when every step is done — a checklist that stays on
 * the screen after it is finished is a permanent `+1` on a budgeted screen.
 */

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MeterBar } from '@/components/ui/MeterBar';
import { FirstStepsSheet } from '@/components/journey/FirstStepsSheet';
import { getFirstSteps, summarizeFirstSteps } from '@/lib/journey/firstSteps';
import { useDismissed } from '@/hooks/useDismissed';
import { FIRST_STEPS_DISMISS_KEY } from '@/lib/today/firstStepsDismissed';
import type { JourneyState } from '@/lib/missionJourney';

export function FirstStepsCard({ state }: { state: JourneyState }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { dismissed, ready, dismiss } = useDismissed(FIRST_STEPS_DISMISS_KEY);

  const steps = getFirstSteps(state);
  const progress = summarizeFirstSteps(steps);

  // `ready` gates the first paint — the shell declares this block from the same
  // key, so rendering before the device is read flashes a card about to retract.
  if (!ready || dismissed || progress.complete) return null;

  return (
    <section className="border-2 border-border bg-card" aria-labelledby="first-steps-heading">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {t('firstStepsEyebrow', { defaultValue: 'Your first steps' })}
          </p>
          <h2 id="first-steps-heading" className="mt-0.5 text-[17px] font-extrabold leading-snug">
            {progress.next
              ? t(progress.next.titleKey, { defaultValue: progress.next.title })
              : t('firstStepsEyebrow', { defaultValue: 'Your first steps' })}
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            {progress.next ? t(progress.next.whyKey, { defaultValue: progress.next.why }) : ''}
          </p>
        </div>
        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
      </button>

      <div className="px-4 pb-4">
        <MeterBar
          label={t('firstStepsProgressLabel', { defaultValue: 'Progress' })}
          value={progress.done}
          max={progress.total}
          segments={progress.total}
          size="sm"
          readout={`${progress.done} / ${progress.total}`}
        />
      </div>

      {/* Dismiss under its own rule, at a full tap target. The card is optional
          by design — nothing here gates anything — so the exit is a plain
          labelled control, not a 24px × in a corner. */}
      <div className="border-t-2 border-border">
        <button
          type="button"
          onClick={dismiss}
          className="min-h-[44px] w-full px-4 text-left text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {t('firstStepsDismiss', { defaultValue: 'Dismiss' })}
        </button>
      </div>

      <FirstStepsSheet open={open} onClose={() => setOpen(false)} steps={steps} progress={progress} />
    </section>
  );
}
