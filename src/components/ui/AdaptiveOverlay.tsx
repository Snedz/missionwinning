'use client';

/**
 * Size-class adaptive overlay — compact = bottom sheet, md+ = centered dialog.
 * Portaled to document.body so AppLayout overflow does not clip the sheet.
 * See docs/ADAPTIVE_LAYOUT.md
 */

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
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
  /**
   * Pinned footer region — the sheet's one primary action, held out of the
   * scroll so it stays reachable however long the body runs. Sits inside the
   * panel, so the panel's safe-area padding lifts it clear of the home
   * indicator.
   */
  footer?: ReactNode;
  /** Hide the default header chrome (caller supplies title inside children) */
  hideHeader?: boolean;
  /** z-index layer — default above MobileNav (z-50) and consent banner (z-60) */
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
  footer,
  hideHeader = false,
  zClassName = 'z-[70]',
  titleId: titleIdProp,
  initialFocusRef,
}: Props) {
  const autoId = useId();
  const titleId = titleIdProp ?? autoId;
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current =
      typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

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
      document.body.style.overflow = prevOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [open, onClose, initialFocusRef]);

  if (!open || !mounted) return null;

  /**
   * House leftover: header + close transfer only when the caller already
   * marked the panel `.mw-house`. The portaled root also carries `mw-house`
   * so tokens do not drop on document.body. Every other AdaptiveOverlay
   * stays field-manual.
   */
  const isHouse = /\bmw-house\b/.test(className ?? '');

  const overlay = (
    <div
        className={cn(
          'fixed inset-0 flex justify-center',
          zClassName,
          /* Compact: bottom sheet. md+: centered dialog. */
          'items-end md:items-center md:p-6',
          isHouse && 'mw-house'
        )}
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-foreground/50"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={hideHeader && !title ? undefined : titleId}
        className={cn(
          'relative w-full max-h-[min(88vh,100dvh)] overflow-hidden flex flex-col',
          'animate-in slide-in-from-bottom duration-[250ms] ease-[cubic-bezier(.22,1,.36,1)]',
          'md:animate-in md:fade-in md:zoom-in-95 md:slide-in-from-bottom-0 md:max-h-[85vh]',
          SIZE_MAX[size],
          isHouse
            ? 'house-overlay-panel'
            : [
                'bg-card',
                /* Compact sheet chrome. The 2px ink rule is the whole top edge —
                   it is what says "sheet" now that the drag pill is gone, and it
                   reads at arm's length where a 30%-alpha pill did not. */
                'border-t-2 border-foreground pb-[env(safe-area-inset-bottom)]',
                'md:border-2 md:pb-0',
              ],
          className
        )}
      >
        {!hideHeader && (
          <div
            className={cn(
              'sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3',
              isHouse
                ? 'house-overlay-head'
                : 'border-b-2 border-border bg-card p-4'
            )}
          >
            <div className="min-w-0">
              {eyebrow ? (
                <div
                  className={
                    isHouse
                      ? 'house-overlay-kicker'
                      : 'mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground'
                  }
                >
                  {eyebrow}
                </div>
              ) : null}
              {title != null ? (
                <h2
                  id={titleId}
                  className={
                    isHouse
                      ? 'house-overlay-title'
                      : 'truncate text-[22px] font-extrabold leading-tight tracking-[-0.01em]'
                  }
                >
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
              className={
                isHouse
                  ? 'house-btn house-btn-ghost house-overlay-close'
                  : 'flex h-11 w-11 shrink-0 items-center justify-center border-2 border-border transition-colors hover:bg-muted'
              }
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {/*
          tabIndex so the sheet body stays keyboard-reachable when it scrolls
          (axe scrollable-region-focusable). role=region names the landmark;
          eslint still flags tabIndex on non-widget roles.
        */}
        <div
          className={cn('flex-1 overflow-y-auto overscroll-contain', bodyClassName)}
          role="region"
          aria-label="Dialog content"
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- scrollable-region-focusable
          tabIndex={0}
        >
          {children}
        </div>
        {footer ? (
          <div
            className={
              isHouse
                ? 'house-overlay-foot'
                : 'shrink-0 border-t-2 border-border bg-card p-4'
            }
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
