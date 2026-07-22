'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createUploadId, estimateRemainingMs } from '@/lib/fileUploadUi';

export type FileUploadItemStatus = 'queued' | 'uploading' | 'processing' | 'success' | 'error';

export type FileUploadQueueItem = {
  id: string;
  file: File;
  previewUrl: string | null;
  progress: number;
  etaMs: number | null;
  status: FileUploadItemStatus;
  error: string | null;
  message: string | null;
};

export type FileProcessHelpers = {
  onProgress: (percent: number, meta?: { status?: FileUploadItemStatus; message?: string }) => void;
  signal: AbortSignal;
};

type ProcessFn = (file: File, helpers: FileProcessHelpers) => Promise<void>;

type Options = {
  process: ProcessFn;
  /** Create object URL for image previews */
  previewImages?: boolean;
  autoStart?: boolean;
};

/**
 * Per-file upload queue — isolated progress/retry; one failure never blocks siblings.
 */
export function useFileUploadQueue({ process, previewImages = true, autoStart = true }: Options) {
  const [items, setItems] = useState<FileUploadQueueItem[]>([]);
  const processRef = useRef(process);
  processRef.current = process;
  const controllers = useRef(new Map<string, AbortController>());
  const startedAt = useRef(new Map<string, number>());

  const patch = useCallback((id: string, partial: Partial<FileUploadQueueItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...partial } : it)));
  }, []);

  const runItem = useCallback(
    async (id: string, file: File) => {
      controllers.current.get(id)?.abort();
      const ac = new AbortController();
      controllers.current.set(id, ac);
      startedAt.current.set(id, Date.now());
      patch(id, { status: 'uploading', progress: 0, etaMs: null, error: null, message: null });

      try {
        await processRef.current(file, {
          signal: ac.signal,
          onProgress: (percent, meta) => {
            const start = startedAt.current.get(id) ?? Date.now();
            const clamped = Math.max(0, Math.min(100, percent));
            const eta =
              meta?.status === 'processing'
                ? null
                : estimateRemainingMs(clamped, 100, start);
            patch(id, {
              progress: clamped,
              etaMs: eta,
              status: meta?.status ?? (clamped >= 100 ? 'processing' : 'uploading'),
              message: meta?.message ?? null,
            });
          },
        });
        if (ac.signal.aborted) return;
        patch(id, { status: 'success', progress: 100, etaMs: 0, error: null, message: null });
      } catch (err: unknown) {
        if (ac.signal.aborted) return;
        const msg = err instanceof Error ? err.message : 'Upload failed.';
        patch(id, { status: 'error', error: msg, etaMs: null });
      }
    },
    [patch]
  );

  const addFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      const next: FileUploadQueueItem[] = files.map((file) => ({
        id: createUploadId(),
        file,
        previewUrl:
          previewImages && file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        progress: 0,
        etaMs: null,
        status: 'queued' as const,
        error: null,
        message: null,
      }));
      setItems((prev) => [...prev, ...next]);
      if (autoStart) {
        for (const item of next) {
          void runItem(item.id, item.file);
        }
      }
      return next.map((n) => n.id);
    },
    [autoStart, previewImages, runItem]
  );

  const retry = useCallback((id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) void runItem(id, item.file);
      return prev;
    });
  }, [runItem]);

  const remove = useCallback((id: string) => {
    controllers.current.get(id)?.abort();
    controllers.current.delete(id);
    startedAt.current.delete(id);
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clear = useCallback(() => {
    for (const [, ac] of controllers.current) ac.abort();
    controllers.current.clear();
    startedAt.current.clear();
    setItems((prev) => {
      for (const it of prev) {
        if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
      }
      return [];
    });
  }, []);

  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    const acMap = controllers.current;
    return () => {
      for (const [, ac] of acMap) ac.abort();
      for (const it of itemsRef.current) {
        if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
      }
    };
  }, []);

  return { items, addFiles, retry, remove, clear, patch };
}
