/**
 * On-device progress photos — IndexedDB only (never uploaded).
 * DB: mw-photos / store: photos
 */

export type ProgressPose = 'front' | 'side' | 'back';

export type ProgressPhotoMeta = {
  id: string;
  date: string;
  pose: ProgressPose;
  note?: string;
  createdAt: string;
};

export type ProgressPhoto = ProgressPhotoMeta & {
  blob: Blob;
};

const DB_NAME = 'mw-photos';
const STORE = 'photos';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('indexedDB_unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error('idb_open_failed'));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('idb_tx_failed'));
    tx.onabort = () => reject(tx.error ?? new Error('idb_tx_aborted'));
  });
}

export function newPhotoId(): string {
  return `pp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Downscale image file to JPEG ≤ maxEdge px via canvas. */
export async function downscaleImageFile(
  file: Blob,
  maxEdge = 1600,
  quality = 0.85
): Promise<Blob> {
  if (typeof createImageBitmap === 'undefined' || typeof document === 'undefined') {
    return file;
  }
  const bmp = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxEdge / Math.max(bmp.width, bmp.height));
    const w = Math.max(1, Math.round(bmp.width * scale));
    const h = Math.max(1, Math.round(bmp.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob((b) => res(b), 'image/jpeg', quality)
    );
    return blob ?? file;
  } finally {
    bmp.close();
  }
}

export async function addProgressPhoto(input: {
  blob: Blob;
  date: string;
  pose: ProgressPose;
  note?: string;
  id?: string;
}): Promise<ProgressPhotoMeta> {
  const meta: ProgressPhotoMeta = {
    id: input.id ?? newPhotoId(),
    date: input.date.slice(0, 10),
    pose: input.pose,
    note: input.note?.trim().slice(0, 200) || undefined,
    createdAt: new Date().toISOString(),
  };
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put({ ...meta, blob: input.blob });
    await txDone(tx);
  } finally {
    db.close();
  }
  return meta;
}

export async function listProgressPhotos(): Promise<ProgressPhotoMeta[]> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const rows = await new Promise<Array<ProgressPhotoMeta & { blob?: Blob }>>((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as Array<ProgressPhotoMeta & { blob?: Blob }>) ?? []);
      req.onerror = () => reject(req.error);
    });
    await txDone(tx);
    return rows
      .map(({ blob: _b, ...meta }) => meta)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  } finally {
    db.close();
  }
}

export async function getProgressPhoto(id: string): Promise<ProgressPhoto | null> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, 'readonly');
    const row = await new Promise<(ProgressPhotoMeta & { blob: Blob }) | undefined>((resolve, reject) => {
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve(req.result as (ProgressPhotoMeta & { blob: Blob }) | undefined);
      req.onerror = () => reject(req.error);
    });
    await txDone(tx);
    if (!row?.blob) return null;
    return row;
  } finally {
    db.close();
  }
}

export async function deleteProgressPhoto(id: string): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    await txDone(tx);
  } finally {
    db.close();
  }
}

/** Earliest and latest for pose (or any if pose omitted). */
export async function comparePair(
  pose?: ProgressPose
): Promise<{ earliest: ProgressPhotoMeta | null; latest: ProgressPhotoMeta | null }> {
  let list = await listProgressPhotos();
  if (pose) list = list.filter((p) => p.pose === pose);
  if (!list.length) return { earliest: null, latest: null };
  const chronological = [...list].sort(
    (a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt)
  );
  return {
    earliest: chronological[0] ?? null,
    latest: chronological[chronological.length - 1] ?? null,
  };
}
