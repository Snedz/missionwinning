'use client';

/**
 * Hold-to-confirm destructive control.
 * Release early → nothing fires. The ring is the confirmation.
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';
import {
  DEFAULT_HOLD_MS,
  KEYBOARD_ARM_MS,
  clearKeyboardArm,
  createKeyboardArmState,
  holdComplete,
  holdProgress,
  reduceKeyboardArm,
  type KeyboardArmState,
} from '@/lib/holdToConfirm';

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>;

export type HoldToConfirmButtonProps = {
  /** Full verb phrase — the warning. e.g. "Discard workout" */
  label: string;
  onConfirm: () => void;
  holdMs?: number;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
  /** Icon-only compact control (uses label for aria). */
  icon?: ReactNode;
  /** Extra aria hint; defaults include hold instruction. */
  holdHint?: string;
  /** Signed-in house leftover — skips field-manual button variants. */
  chrome?: 'house';
  'data-testid'?: string;
};

export function HoldToConfirmButton({
  label,
  onConfirm,
  holdMs = DEFAULT_HOLD_MS,
  variant = 'destructive',
  size = 'default',
  disabled = false,
  className,
  icon,
  holdHint,
  chrome,
  'data-testid': dataTestId,
}: HoldToConfirmButtonProps) {
  const { t } = useTranslation();
  const reactId = useId();
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [armed, setArmed] = useState(false);
  const armRef = useRef<KeyboardArmState>(createKeyboardArmState());
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const firedRef = useRef(false);
  const onConfirmRef = useRef(onConfirm);
  onConfirmRef.current = onConfirm;

  const hint =
    holdHint ??
    (armed
      ? t('holdConfirmAgain', { defaultValue: 'Press again to confirm' })
      : t('holdConfirmHint', {
          ms: holdMs,
          defaultValue: `Hold ${holdMs}ms to confirm. Release early to cancel.`,
        }));

  const stopHold = useCallback((completed: boolean) => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const started = startRef.current;
    startRef.current = null;
    setHolding(false);
    setProgress(0);

    if (
      completed &&
      started != null &&
      !firedRef.current &&
      holdComplete(performance.now() - started, holdMs)
    ) {
      firedRef.current = true;
      onConfirmRef.current();
      queueMicrotask(() => {
        firedRef.current = false;
      });
    }
  }, [holdMs]);

  const tick = useCallback(() => {
    if (startRef.current == null) return;
    const elapsed = performance.now() - startRef.current;
    const p = holdProgress(elapsed, holdMs);
    setProgress(p);
    if (p >= 1) {
      stopHold(true);
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [holdMs, stopHold]);

  const beginHold = useCallback(() => {
    if (disabled || firedRef.current) return;
    startRef.current = performance.now();
    setHolding(true);
    setProgress(0);
    rafRef.current = requestAnimationFrame(tick);
  }, [disabled, tick]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (!armed) return;
    const t = window.setTimeout(() => {
      armRef.current = clearKeyboardArm(armRef.current);
      setArmed(false);
    }, KEYBOARD_ARM_MS);
    return () => clearTimeout(t);
  }, [armed]);

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    beginHold();
  };

  const onPointerEnd = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    stopHold(false);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    const { next, confirmed } = reduceKeyboardArm(armRef.current, performance.now());
    armRef.current = next;
    setArmed(next.armed);
    if (confirmed) {
      setArmed(false);
      onConfirmRef.current();
    }
  };

  const ringStyle = {
    background: `conic-gradient(hsl(var(--destructive)) ${progress * 360}deg, transparent 0)`,
  };

  return (
    <button
      type="button"
      id={reactId}
      disabled={disabled}
      data-testid={dataTestId}
      aria-label={`${label}. ${hint}`}
      aria-pressed={holding || armed}
      aria-busy={holding}
      className={cn(
        chrome === 'house'
          ? 'house-btn min-h-[44px] tap-target'
          : buttonVariants({ variant, size: icon ? 'icon' : size }),
        'relative isolate select-none touch-none',
        icon && 'shrink-0',
        armed && 'ring-2 ring-destructive',
        className
      )}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onPointerLeave={(e) => {
        if (holding) onPointerEnd(e);
      }}
      onBlur={() => {
        stopHold(false);
        armRef.current = clearKeyboardArm(armRef.current);
        setArmed(false);
      }}
      onKeyDown={onKeyDown}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 rounded-[inherit]',
          !holding && 'opacity-0'
        )}
        style={holding ? ringStyle : undefined}
      />
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-[2px] rounded-[inherit]',
          chrome === 'house'
            ? 'bg-[var(--house-chip)]'
            : variant === 'destructive'
              ? 'bg-destructive'
              : 'bg-background'
        )}
      />
      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {icon ?? label}
        {armed && !icon ? (
          <span
            className={
              chrome === 'house' ? 'house-set-kicker' : 'text-[10px] uppercase tracking-wide'
            }
          >
            again
          </span>
        ) : null}
      </span>
    </button>
  );
}
