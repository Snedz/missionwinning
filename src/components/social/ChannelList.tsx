'use client';

import { Hash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { ServerChannel } from '@/lib/social/types';

const CHANNEL_KEYS: Record<string, string> = {
  train: 'serverChannelTrain',
  garage: 'serverChannelGarage',
  'off-topic': 'serverChannelOffTopic',
};

export function ChannelList({
  channels,
  activeId,
  onSelect,
}: {
  channels: readonly ServerChannel[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <nav aria-label={t('serverChannelsLabel', { defaultValue: 'Channels' })}>
      <p className="eyebrow px-3 pb-2">{t('serverChannelsLabel', { defaultValue: 'Channels' })}</p>
      <ul className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {channels.map((ch) => {
          const label = t(CHANNEL_KEYS[ch.slug] ?? ch.name, { defaultValue: ch.name });
          const active = ch.id === activeId;
          return (
            <li key={ch.id}>
              <button
                type="button"
                onClick={() => onSelect(ch.id)}
                className={cn(
                  'flex min-h-[44px] w-full items-center gap-2 px-3 text-start text-sm font-semibold',
                  active && 'is-active-row'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Hash className="size-4 shrink-0" aria-hidden />
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
