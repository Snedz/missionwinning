/** Shared helpers for upload UX (size labels, ETA, ids). */

let uploadSeq = 0;

export function createUploadId(): string {
  uploadSeq += 1;
  return `up-${Date.now().toString(36)}-${uploadSeq}`;
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}

/** Short type label from MIME or extension (JPEG, CSV, JSON). */
export function fileTypeLabel(file: Pick<File, 'name' | 'type'>): string {
  const mime = (file.type || '').toLowerCase();
  if (mime === 'image/jpeg' || mime === 'image/jpg') return 'JPEG';
  if (mime === 'image/png') return 'PNG';
  if (mime === 'image/webp') return 'WebP';
  if (mime === 'image/gif') return 'GIF';
  if (mime === 'image/heic' || mime === 'image/heif') return 'HEIC';
  if (mime === 'application/json' || mime === 'text/json') return 'JSON';
  if (mime === 'text/csv' || mime === 'application/csv') return 'CSV';
  if (mime.startsWith('text/')) return 'TXT';
  if (mime.startsWith('image/')) return mime.slice(6).toUpperCase() || 'Image';

  const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : '';
  if (ext === 'jpg' || ext === 'jpeg') return 'JPEG';
  if (ext === 'png') return 'PNG';
  if (ext === 'webp') return 'WebP';
  if (ext === 'json') return 'JSON';
  if (ext === 'csv') return 'CSV';
  if (ext) return ext.toUpperCase();
  return 'File';
}

/**
 * ETA from average throughput. Returns null until ≥200ms elapsed and some bytes loaded.
 */
export function estimateRemainingMs(
  loaded: number,
  total: number,
  startedAt: number,
  now = Date.now()
): number | null {
  if (total <= 0 || loaded <= 0) return null;
  if (loaded >= total) return 0;
  const elapsed = now - startedAt;
  if (elapsed < 200) return null;
  const rate = loaded / elapsed;
  if (rate <= 0) return null;
  return Math.round((total - loaded) / rate);
}

export function formatEta(ms: number | null): string {
  if (ms == null) return '';
  if (ms <= 0) return 'Done';
  const sec = Math.ceil(ms / 1000);
  if (sec < 60) return `~${sec}s left`;
  const min = Math.ceil(sec / 60);
  return `~${min}m left`;
}

/** Match accept attribute tokens against a File (e.g. image/*, .json, text/csv). */
export function fileMatchesAccept(
  file: Pick<File, 'name' | 'type'>,
  accept: string | undefined
): boolean {
  if (!accept || accept.trim() === '' || accept === '*') return true;
  const tokens = accept.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return tokens.some((token) => {
    if (token.startsWith('.')) return name.endsWith(token);
    if (token.endsWith('/*')) {
      const prefix = token.slice(0, -1); // "image/"
      return type.startsWith(prefix);
    }
    return type === token;
  });
}
