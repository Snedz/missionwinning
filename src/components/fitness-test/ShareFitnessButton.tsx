'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { shareText } from '@/lib/shareFitnessMission';
import { track } from '@/lib/analytics';

type Props = {
  text: string;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  labelKey?: string;
  defaultLabel?: string;
};

export function ShareFitnessButton({
  text,
  variant = 'outline',
  className,
  labelKey = 'shareFitness',
  defaultLabel = 'Share',
}: Props) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'idle' | 'copied' | 'shared'>('idle');

  const onShare = async () => {
    const result = await shareText(text);
    track('mission_shared', { surface: 'fitness', method: result });
    if (result === 'shared') setStatus('shared');
    else if (result === 'copied') setStatus('copied');
    setTimeout(() => setStatus('idle'), 2500);
  };

  const label =
    status === 'copied'
      ? t('shareCopied', { defaultValue: 'Copied' })
      : status === 'shared'
        ? t('shareSent', { defaultValue: 'Shared' })
        : t(labelKey, { defaultValue: defaultLabel });

  return (
    <Button type="button" variant={variant} className={cn("min-h-[44px] tap-target", className)} onClick={() => void onShare()}>
      <Share2 className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}
