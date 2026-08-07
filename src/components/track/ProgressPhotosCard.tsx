'use client';

import { localDateKey } from '@/lib/time/localDate';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Download, Images } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileDropZone } from '@/components/ui/FileDropZone';
import {
  addProgressPhoto,
  comparePair,
  deleteProgressPhoto,
  downscaleImageFile,
  getProgressPhoto,
  listProgressPhotos,
  type ProgressPhotoMeta,
  type ProgressPose,
} from '@/lib/progressPhotos';
import { track } from '@/lib/analytics';
import { PhotoCompare } from '@/components/track/PhotoCompare';

export function ProgressPhotosCard() {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<ProgressPhotoMeta[]>([]);
  const [pose, setPose] = useState<ProgressPose>('front');
  const [busy, setBusy] = useState(false);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [compare, setCompare] = useState<{
    earliest: ProgressPhotoMeta | null;
    latest: ProgressPhotoMeta | null;
  } | null>(null);

  const refresh = useCallback(async () => {
    try {
      const list = await listProgressPhotos();
      setPhotos(list);
      const pair = await comparePair(pose);
      setCompare(pair);
    } catch {
      setPhotos([]);
    }
  }, [pose]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;
    const next: Record<string, string> = {};
    (async () => {
      for (const p of photos.slice(0, 12)) {
        try {
          const full = await getProgressPhoto(p.id);
          if (full?.blob && !cancelled) {
            next[p.id] = URL.createObjectURL(full.blob);
          }
        } catch {
          /* skip */
        }
      }
      if (!cancelled) {
        setUrls((prev) => {
          Object.values(prev).forEach((u) => URL.revokeObjectURL(u));
          return next;
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [photos]);

  const onFiles = async (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith('image/')) return;
    setBusy(true);
    try {
      const blob = await downscaleImageFile(file, 1600);
      await addProgressPhoto({
        blob,
        date: localDateKey(),
        pose,
      });
      track('progress_photo_added', { pose });
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const download = async (id: string) => {
    const full = await getProgressPhoto(id);
    if (!full) return;
    const url = URL.createObjectURL(full.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mw-${full.pose}-${full.date}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="content-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Images className="h-4 w-4 text-primary" aria-hidden />
          {t('progressPhotosTitle', { defaultValue: 'Progress photos' })}
        </CardTitle>
        <CardDescription className="space-y-1">
          <span className="block font-medium text-primary">
            {t('progressPhotosPrivacy', {
              defaultValue: 'Photos never leave this device.',
            })}
          </span>
          <span className="block">
            {t('progressPhotosLead', {
              defaultValue:
                'Stored in browser IndexedDB only — not uploaded, not in JSON backup.',
            })}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1">
          {(['front', 'side', 'back'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPose(p)}
              className={`px-2.5 py-1 text-[11px] border capitalize ${
                pose === p
                  ? 'border-primary bg-muted text-primary'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <FileDropZone
          accept="image/*"
          multiple={false}
          disabled={busy}
          onFiles={(f) => void onFiles(f)}
          className="min-h-[100px]"
        >
          <div className="flex flex-col items-center gap-2 py-4 text-sm text-muted-foreground">
            <Camera className="h-6 w-6" aria-hidden />
            {busy
              ? t('progressPhotosSaving', { defaultValue: 'Saving…' })
              : t('progressPhotosDrop', { defaultValue: 'Drop or tap to add a photo' })}
          </div>
        </FileDropZone>

        {compare?.earliest && compare?.latest && compare.earliest.id !== compare.latest.id ? (
          <PhotoCompare
            earliestId={compare.earliest.id}
            latestId={compare.latest.id}
            pose={pose}
          />
        ) : null}

        {photos.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            {t('progressPhotosEmpty', { defaultValue: 'No photos yet.' })}
          </p>
        ) : (
          <ul className="grid grid-cols-3 gap-2">
            {photos.slice(0, 9).map((p) => (
              <li key={p.id} className="relative aspect-[3/4]  overflow-hidden border-2 border-border bg-muted">
                {urls[p.id] ? (
                  <img src={urls[p.id]} alt="" className="h-full w-full object-cover" />
                ) : null}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-card px-1 py-0.5 text-[9px] text-white">
                  <span>{p.date}</span>
                  <button type="button" onClick={() => void download(p.id)} aria-label="Download">
                    <Download className="h-3 w-3" />
                  </button>
                </div>
                <button
                  type="button"
                  className="absolute top-1 right-1 rounded bg-card px-1 text-[9px] text-white"
                  onClick={() => void deleteProgressPhoto(p.id).then(refresh)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
