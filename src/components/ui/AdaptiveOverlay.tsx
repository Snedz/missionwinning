'use client';

/**
 * Size-class adaptive overlay — compact = bottom sheet, md+ = centered dialog.
 * See docs/ADAPTIVE_LAYOUT.md
 */

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AdaptiveOverlaySize = 'sm' | 'md' | 'lg';

type Props = {
  open: boolean;
  onClose: () => void;
  /** Accessible dialog title (also used for aria-labelledby when titleId not set). */
  title?: ReactNode;
  /** Optional eyebrow above title */
  eyebrow?: ReactNode;
  children: ReactNode;
  /** Panel max width: sm=max-w-md, md=max-w-xl (default), lg=max-w-3xl */
  size?: AdaptiveOverlaySize;
  /** Extra classes on the panel */
  className?: string;
  /** Extra classes on the body scroll region */
  bodyClassName?: string;
  /** Hide the default header chrome (caller supplies title inside children) */
  hideHeader?: boolean;
  /** z-index layer */
  zClassName?: string;
  /** Optional id for aria-labelledby when providing custom header */
  titleId?: string;
  /** Ref to first focusable control (optional; defaults to close button) */
  initialFocusRef?: RefObject<HTMLElement | null>;
};

const SIZE_MAX: Record<AdaptiveOverlaySize, string> = {
  sm: 'md:max-w-md',
  md: 'md:max-w-xl xl:max-w-2xl',
  lg: 'md:max-w-2xl xl:max-w-3xl',
};

export function AdaptiveOverlay({
  open,
  onClose,
  title,
  eyebrow,
  children,
  size = 'md',
  className,
  bodyClassName,
  hideHeader = false,
  zClassName = 'z-[60]',
  titleId: titleIdProp,
  initialFocusRef,
}: Props) {
  const autoId = useId();
  const titleId = titleIdProp ?? autoId;
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current =
      typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;
    const focusTimer = window.setTimeout(() => {
      const target = initialFocusRef?.current ?? closeRef.current;
      target?.focus();
    }, 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [open, onClose, initialFocusRef]);

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 flex justify-center',
        zClassName,
        /* Compact: bottom sheet. md+: centered dialog. */
        'items-end md:items-center md:p-6'
      )}
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={hideHeader && !title ? undefined : titleId}
        className={cn(
          'relative w-full max-h-[88vh] overflow-hidden flex flex-col',
          'border border-border/60 bg-card shadow-2xl',
          /* Compact sheet chrome */
          'rounded-t-2xl pb-[env(safe-area-inset-bottom)]',
          'animate-in slide-in-from-bottom duration-200',
          /* Medium+ dialog chrome */
          'md:rounded-2xl md:pb-0 md:max-h-[85vh]',
          'md:animate-in md:fade-in md:zoom-in-95 md:slide-in-from-bottom-0',
          SIZE_MAX[size],
          className
        )}
      >
        {!hideHeader && (
          <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-border/40 bg-card/95 backdrop-blur px-5 py-4">
            <div className="min-w-0">
              {eyebrow ? (
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">
                  {eyebrow}
                </div>
              ) : null}
              {title != null ? (
                <h2 id={titleId} className="text-lg font-semibold truncate">
                  {title}
                </h2>
              ) : (
                <span id={titleId} className="sr-only">
                  Dialog
                </span>
              )}
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className={cn('flex-1 overflow-y-auto', bodyClassName)}>{children}</div>
      </div>
    </div>
  );
}
