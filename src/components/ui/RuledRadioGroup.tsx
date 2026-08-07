'use client';

/**
 * A choice as ruled rows rather than a `<select>`.
 *
 * I-Day asked its three questions through native selects — a 44px control that
 * shows one option and hides the rest behind an OS wheel. On the screen whose
 * whole job is "tell us what you have so we can pick a session", the options
 * are the content, and a picker that hides them makes the step feel like a form
 * to survive rather than a question to answer.
 *
 * Native `<input type="radio">` under the hood, visually replaced: keyboard
 * arrow-key navigation, group semantics and screen-reader announcement all come
 * free, where a `role="radio"` div would have to reimplement them.
 */

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RuledRadioOption = {
  value: string;
  label: string;
};

type Props = {
  name: string;
  legend: string;
  value: string;
  options: RuledRadioOption[];
  onChange: (value: string) => void;
  className?: string;
};

export function RuledRadioGroup({
  name,
  legend,
  value,
  options,
  onChange,
  className,
}: Props) {
  return (
    <fieldset className={cn('space-y-2', className)}>
      <legend className="mb-2 text-sm text-muted-foreground">{legend}</legend>
      {/*
        Two designs, one DOM. Compact stacks 52px ruled rows — a thumb target
        on the screen where the options *are* the content. The desktop handoff
        draws the same choice as wrapping chips, which is what a 1440px window
        should spend a row on rather than three full-width bars.

        Done in CSS, not `useIsCompact`: the markup is identical either way, so
        there is nothing to branch and no second tree to keep in step.
      */}
      <div className="space-y-2 md:flex md:flex-wrap md:gap-2 md:space-y-0">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                'flex min-h-[52px] cursor-pointer items-center gap-3 border-2 px-4 text-[15px] transition-colors',
                'md:min-h-0 md:w-auto md:py-2.5 md:text-sm md:font-semibold',
                selected
                  ? // Selected is a filled chip on desktop. `--primary-fill`,
                    // not poster: white on #ec3013 is 4.19:1 and this label is
                    // 14px, so poster would fail AA — the same split `.141`
                    // made for Today's field.
                    'border-[hsl(var(--accent-poster))] bg-muted font-semibold text-primary ' +
                    'md:border-[hsl(var(--primary-fill))] md:bg-primary-fill md:text-primary-foreground'
                  : 'border-border hover:bg-muted'
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span className="flex-1 md:flex-none">{option.label}</span>
              {/* The tick reads a full-width row; on a chip the fill already
                  says "selected", and the mock's chips carry no icon. */}
              {selected ? <Check className="h-5 w-5 shrink-0 md:hidden" aria-hidden /> : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
