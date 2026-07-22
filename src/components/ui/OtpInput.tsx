'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react';
import { cn } from '@/lib/utils';
import { otpSlots, sanitizeOtpDigits } from '@/lib/otpInput';

export type OtpInputStatus = 'idle' | 'error' | 'success';

export type OtpInputHandle = {
  focusFirst: () => void;
};

type Props = {
  value: string;
  onChange: (next: string) => void;
  length?: number;
  disabled?: boolean;
  status?: OtpInputStatus;
  autoFocus?: boolean;
  onComplete?: (code: string) => void;
  id?: string;
  'aria-label'?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
  className?: string;
};

/**
 * N visual slots backed by one digit string.
 * Paste / SMS autofill / type / backspace all mutate that single value.
 */
export const OtpInput = forwardRef<OtpInputHandle, Props>(function OtpInput(
  {
    value,
    onChange,
    length = 6,
    disabled = false,
    status = 'idle',
    autoFocus = false,
    onComplete,
    id,
    'aria-label': ariaLabel = 'One-time code',
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy,
    className,
  },
  ref
) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const completedRef = useRef<string | null>(null);
  const locked = disabled || status === 'success';
  const slots = otpSlots(value, length);

  useImperativeHandle(ref, () => ({
    focusFirst: () => {
      inputRefs.current[0]?.focus();
      inputRefs.current[0]?.select();
    },
  }));

  useEffect(() => {
    if (autoFocus && !locked) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus, locked]);

  useEffect(() => {
    if (value.length === length) {
      if (completedRef.current === value) return;
      completedRef.current = value;
      onComplete?.(value);
    } else {
      completedRef.current = null;
    }
  }, [value, length, onComplete]);

  useEffect(() => {
    if (status !== 'error') return;
    const t = window.setTimeout(() => {
      inputRefs.current[0]?.focus();
      inputRefs.current[0]?.select();
    }, 350);
    return () => window.clearTimeout(t);
  }, [status]);

  const focusAt = (index: number) => {
    const clamped = Math.max(0, Math.min(length - 1, index));
    inputRefs.current[clamped]?.focus();
    inputRefs.current[clamped]?.select();
  };

  /** Replace digit at index (empty string clears that slot). */
  const writeAt = (index: number, digit: string) => {
    const chars = otpSlots(value, length);
    chars[index] = digit;
    onChange(sanitizeOtpDigits(chars.join(''), length));
  };

  const handleChange = (index: number, raw: string) => {
    if (locked) return;
    const digits = sanitizeOtpDigits(raw, length);
    if (digits.length === 0) {
      writeAt(index, '');
      return;
    }
    if (digits.length > 1) {
      const before = sanitizeOtpDigits(value.slice(0, index), index);
      const merged = sanitizeOtpDigits(before + digits, length);
      onChange(merged);
      focusAt(Math.min(merged.length, length - 1));
      return;
    }
    writeAt(index, digits);
    if (index < length - 1) focusAt(index + 1);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (locked) return;
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (slots[index]) {
        writeAt(index, '');
      } else if (index > 0) {
        writeAt(index - 1, '');
        focusAt(index - 1);
      }
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusAt(index - 1);
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    if (locked) return;
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const before = sanitizeOtpDigits(value.slice(0, index), index);
    const merged = sanitizeOtpDigits(before + pasted, length);
    onChange(merged);
    focusAt(Math.min(Math.max(merged.length - 1, 0), length - 1));
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={cn(
        'flex gap-2 justify-center',
        status === 'error' && 'animate-otp-shake',
        className
      )}
    >
      {slots.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          id={i === 0 ? id : undefined}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          value={digit}
          disabled={locked}
          readOnly={status === 'success'}
          aria-label={`${ariaLabel}, digit ${i + 1} of ${length}`}
          aria-invalid={ariaInvalid ?? status === 'error'}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          onFocus={(e) => e.target.select()}
          className={cn(
            'h-12 w-10 sm:w-11 rounded-md border bg-background text-center font-mono text-lg tabular-nums',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            'disabled:cursor-not-allowed disabled:opacity-80',
            status === 'success'
              ? 'border-emerald-500/70 bg-emerald-500/15 text-emerald-200'
              : status === 'error'
                ? 'border-red-500/60'
                : 'border-border'
          )}
        />
      ))}
    </div>
  );
});
