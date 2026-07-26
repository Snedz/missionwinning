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
      <div className="space-y-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                'flex min-h-[52px] cursor-pointer items-center gap-3 border-2 px-4 text-[15px] transition-colors',
                selected
                  ? 'border-[hsl(var(--accent-poster))] bg-accent-100 font-semibold text-primary'
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
              <span className="flex-1">{option.label}</span>
              {selected ? <Check className="h-5 w-5 shrink-0" aria-hidden /> : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
