'use client';

import { useRef, useState, type DragEvent, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { fileMatchesAccept } from '@/lib/fileUploadUi';

type Props = {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
  onReject?: (files: File[]) => void;
  /** Capture attribute for camera inputs (e.g. environment). */
  capture?: boolean | 'user' | 'environment';
  idleLabel?: ReactNode;
  activeLabel?: ReactNode;
  className?: string;
  children?: ReactNode;
  inputId?: string;
  'aria-label'?: string;
};

/**
 * Drop zone with three active signals: border, glow, copy shift.
 */
export function FileDropZone({
  accept,
  multiple = false,
  disabled = false,
  onFiles,
  onReject,
  capture,
  idleLabel,
  activeLabel,
  className,
  children,
  inputId,
  'aria-label': ariaLabel = 'File upload drop zone',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragDepth, setDragDepth] = useState(0);
  const active = dragDepth > 0 && !disabled;

  const takeFiles = (list: FileList | File[] | null) => {
    if (!list || disabled) return;
    const all = Array.from(list);
    if (all.length === 0) return;
    const accepted = all.filter((f) => fileMatchesAccept(f, accept));
    const rejected = all.filter((f) => !fileMatchesAccept(f, accept));
    if (rejected.length) onReject?.(rejected);
    if (accepted.length) onFiles(multiple ? accepted : accepted.slice(0, 1));
  };

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setDragDepth((d) => d + 1);
  };

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragDepth((d) => Math.max(0, d - 1));
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragDepth(0);
    takeFiles(e.dataTransfer.files);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      onClick={() => {
        if (!disabled) inputRef.current?.click();
      }}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        'w-full rounded-xl border-2 border-dashed transition-all duration-200 outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        /*
         * `.221` — the active state was a 28px red glow plus `scale-[1.01]`:
         * `shadow-[0_0_0_1px_…,0_0_28px_-4px_hsl(var(--primary)/0.45)]`. That is
         * the pre-rebrand glow idiom recoloured, and `.131` retired glows
         * outright ("glows/gradients/shadows retired"); `.136`'s ship note even
         * claims blur and shadow reached zero. It survived because nothing
         * checks components — see `scripts/check-design-system.mjs`.
         *
         * Drag-over now reads the way every other active surface in the app
         * does: the accent border thickens to the poster red over the same
         * tinted fill. No elevation, no transform.
         */
        active
          ? 'border-[hsl(var(--accent-poster))] bg-primary/10'
          : 'border-border/70 bg-muted/20 hover:border-primary/40 hover:bg-muted/35',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        !disabled && 'cursor-pointer',
        className
      )}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        capture={capture === true ? 'environment' : capture || undefined}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          takeFiles(e.target.files);
          e.target.value = '';
        }}
      />
      {children ?? (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground min-h-[7rem]">
          {active
            ? (activeLabel ?? (
                <span className="text-sm font-medium text-primary py-10">Drop to upload</span>
              ))
            : (idleLabel ?? (
                <span className="text-sm font-medium text-foreground py-10">
                  Drop files here or click to browse
                </span>
              ))}
        </div>
      )}
    </div>
  );
}
