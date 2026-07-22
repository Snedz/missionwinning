'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getProgressPhoto, type ProgressPose } from '@/lib/progressPhotos';

type Props = {
  earliestId: string;
  latestId: string;
  pose: ProgressPose;
};

export function PhotoCompare({ earliestId, latestId, pose }: Props) {
  const { t } = useTranslation();
  const [left, setLeft] = useState<string | null>(null);
  const [right, setRight] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let lUrl: string | null = null;
    let rUrl: string | null = null;
    (async () => {
      const [a, b] = await Promise.all([getProgressPhoto(earliestId), getProgressPhoto(latestId)]);
      if (cancelled) return;
      if (a?.blob) {
        lUrl = URL.createObjectURL(a.blob);
        setLeft(lUrl);
      }
      if (b?.blob) {
        rUrl = URL.createObjectURL(b.blob);
        setRight(rUrl);
      }
    })();
    return () => {
      cancelled = true;
      if (lUrl) URL.revokeObjectURL(lUrl);
      if (rUrl) URL.revokeObjectURL(rUrl);
    };
  }, [earliestId, latestId]);

  if (!left || !right) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-foreground capitalize">
        {t('progressCompare', { defaultValue: 'Compare' })} · {pose}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <figure className="space-y-1">
          <img src={left} alt="" className="aspect-[3/4] w-full rounded-lg object-cover border border-border/50" />
          <figcaption className="text-[10px] text-muted-foreground text-center">
            {t('progressEarlier', { defaultValue: 'Earlier' })}
          </figcaption>
        </figure>
        <figure className="space-y-1">
          <img src={right} alt="" className="aspect-[3/4] w-full rounded-lg object-cover border border-border/50" />
          <figcaption className="text-[10px] text-muted-foreground text-center">
            {t('progressLatest', { defaultValue: 'Latest' })}
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
