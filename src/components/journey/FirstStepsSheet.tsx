'use client';

/**
 * The first-steps list in full — one ruled row per step.
 *
 * Each row carries a line of **why**, which is the part a bare checklist leaves
 * out and the reason this is a sheet rather than five more chips on Today. "Try
 * a mobility flow" is a chore; "five minutes on the days you do not train is
 * what keeps the streak reachable" is a reason to tap it.
 *
 * A done row is not a link. There is nothing to go and do, and a chevron that
 * navigates to a finished task reads as "do it again".
 */

import Link from 'next/link';
import { Check, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import { MeterBar } from '@/components/ui/MeterBar';
import type { FirstStep, FirstStepsProgress } from '@/lib/journey/firstSteps';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  onClose: () => void;
  steps: FirstStep[];
  progress: FirstStepsProgress;
};

function StepBox({ done }: { done: boolean }) {
  return (
    <span
      className={cn(
        'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border-2',
        done ? 'border-foreground bg-foreground' : 'border-border bg-transparent'
      )}
      aria-hidden
    >
      {done && <Check className="h-3.5 w-3.5 text-background" strokeWidth={3} />}
    </span>
  );
}

export function FirstStepsSheet({ open, onClose, steps, progress }: Props) {
  const { t } = useTranslation();

  return (
    <AdaptiveOverlay
      open={open}
      onClose={onClose}
      eyebrow={t('firstStepsEyebrow', { defaultValue: 'Your first steps' })}
      title={t('firstStepsSheetTitle', { defaultValue: 'Get to know the app' })}
      // The body has no padding of its own — every caller supplies it. Without
      // this the rows run to the panel edge while the header stays inset, and
      // the "1 / 6" readout clips at the right.
      bodyClassName="p-4"
    >
      <div className="space-y-4">
        <MeterBar
          label={t('firstStepsProgressLabel', { defaultValue: 'Progress' })}
          value={progress.done}
          max={progress.total}
          segments={progress.total}
          size="sm"
          className="min-h-[44px] tap-target"
          readout={`${progress.done} / ${progress.total}`}
        />

        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {t('firstStepsSheetIntro', {
            defaultValue:
              'None of these are required — the logger and your weekly plan work without any of them. They are the parts of the app most people never find.',
          })}
        </p>

        {/* Full-bleed rules inside a padded body: the 2px lines span the panel
            the way a ruled list should, while the text stays on the header's
            left edge. */}
        <ul className="-mx-4 border-t-2 border-border">
          {steps.map((step) => {
            const title = t(step.titleKey, { defaultValue: step.title });
            const why = t(step.whyKey, { defaultValue: step.why });

            const body = (
              <>
                <StepBox done={step.done} />
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block text-[15px] font-semibold leading-snug',
                      step.done && 'text-muted-foreground line-through'
                    )}
                  >
                    {title}
                  </span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground">
                    {why}
                  </span>
                </span>
                {!step.done && (
                  <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
                )}
              </>
            );

            return (
              <li key={step.key} className="border-b-2 border-border">
                {step.done ? (
                  <div className="flex min-h-[44px] items-start gap-3 px-4 py-3.5">{body}</div>
                ) : (
                  <Link
                    href={step.href}
                    onClick={onClose}
                    className="flex min-h-[44px] items-start gap-3 px-4 py-3.5 transition-colors hover:bg-muted"
                  >
                    {body}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </AdaptiveOverlay>
  );
}
