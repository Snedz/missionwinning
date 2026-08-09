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
 *
 * It is no longer the only way in. `.243` put the same checklist in the More
 * sheet, because dismissing here writes a flag nothing clears: both dismissal
 * and completion used to end with the sheet unreachable for good.
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
import { useWorkoutStore } from '@/store/workoutStore';

export function FirstStepsCard({ state }: { state: JourneyState }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { dismissed, ready, dismiss } = useDismissed(FIRST_STEPS_DISMISS_KEY);
  const completedSessions = useWorkoutStore((s) => s.workoutHistory.length);

  const steps = getFirstSteps(state, { completedSessions });
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
          {/* Field manual: eyebrow → title; dismiss stays quiet below. */}
          <p className="eyebrow text-muted-foreground">
            {t('firstStepsEyebrow', { defaultValue: 'Your first steps' })}
          </p>
          <h2 id="first-steps-heading" className="mt-0.5 text-[17px] font-extrabold leading-snug text-foreground">
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
          className="min-h-[44px] tap-target"
          readout={`${progress.done} / ${progress.total}`}
        />
      </div>

      {/* Dismiss under its own rule, at a full tap target. The card is optional
          by design — nothing here gates anything — so the exit is a plain
          labelled control, not a 24px × in a corner.

          `.243` — the label says where it goes. This flag is never cleared, and
          until the More sheet carried the checklist that made Dismiss a one-way
          door out of onboarding; the word alone gave no reason to expect
          otherwise. Now it moves rather than deletes, so it says so. */}
      <div className="border-t-2 border-border">
        <button
          type="button"
          onClick={dismiss}
          className="min-h-[44px] w-full px-4 text-left text-xs text-muted-foreground underline-offset-2 transition-colors hover:bg-muted hover:text-foreground hover:underline"
        >
          {t('firstStepsDismissToMore', { defaultValue: 'Hide from Today — keep it under More' })}
        </button>
      </div>

      <FirstStepsSheet open={open} onClose={() => setOpen(false)} steps={steps} progress={progress} />
    </section>
  );
}
