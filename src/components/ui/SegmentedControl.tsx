'use client';

/**
 * One segmented control, finally used.
 *
 * `.240` — `.seg` / `.seg-opt` have been in `index.css` since the rebrand with
 * **zero call sites**, while three screens each hand-rolled the same row:
 * `HistoryPage` (Sessions / Journal), `FuelLogSheet` (meal picker), and the
 * Radix `ui/tabs.tsx` used by Calculators, Bundle and Builder. Two of the three
 * drew the selected segment as a **red fill**, which spends the screen's one
 * do-this-now colour on a tab — a tab is a place, not an action.
 *
 * The selected state is `.is-active-tab`'s: tint ground, 2px poster rule on the
 * top edge. That is what `MobileNav` already draws, so the app now answers
 * "which one am I on" the same way everywhere.
 *
 * Roving `tablist` semantics come from real buttons with `role="tab"`, so arrow
 * keys and screen-reader grouping are the platform's rather than reimplemented.
 * 44px minimum height is enforced by `.seg-opt`, not by callers remembering.
 */

import { useRef, type ComponentType } from 'react';
import { cn } from '@/lib/utils';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** Optional leading glyph. Decorative — the label is the accessible name. */
  icon?: ComponentType<{ className?: string }>;
}

type Props<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Required — a tablist with no name is a group a screen reader cannot announce. */
  ariaLabel: string;
  /** Stretch options to fill the row. Off by default: a two-option filter reads better inline. */
  fill?: boolean;
  className?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  fill = false,
  className,
}: Props<T>) {
  const ref = useRef<HTMLDivElement>(null);

  /**
   * Arrow keys move between tabs — the browser gives this for radios but not for
   * a button tablist, and WAI-ARIA expects it.
   *
   * The handler sits on the **tabs**, not the tablist. A roving-tabindex
   * tablist is deliberately not focusable itself (only the selected tab is), so
   * a key handler on the container is one that can never fire from the keyboard
   * — which is what `jsx-a11y/interactive-supports-focus` is pointing at.
   */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const i = options.findIndex((o) => o.value === value);
    const at = (i + delta + options.length) % options.length;
    const next = options[at];
    if (!next) return;
    onChange(next.value);
    ref.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[at]?.focus();
  };

  return (
    <div
      ref={ref}
      role="tablist"
      aria-label={ariaLabel}
      className={cn('seg', fill && 'flex w-full', className)}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          tabIndex={o.value === value ? 0 : -1}
          onClick={() => onChange(o.value)}
          onKeyDown={onKeyDown}
          className={cn('seg-opt justify-center', fill && 'flex-1')}
        >
          {o.icon && <o.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />}
          {o.label}
        </button>
      ))}
    </div>
  );
}
