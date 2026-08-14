'use client';

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { lastMessageForChannel } from '@/lib/social/store';
import type { MissionServerState, PresenceStatus, ServerChannel } from '@/lib/social/types';

const CHANNEL_KEYS: Record<string, string> = {
  train: 'serverChannelTrain',
  garage: 'serverChannelGarage',
  'off-topic': 'serverChannelOffTopic',
};

const PRESENCE_KEYS: Record<PresenceStatus, string> = {
  available: 'serverPresenceAvailable',
  away: 'serverPresenceAway',
  offline: 'serverPresenceOffline',
};

export function BuddyList({
  state,
  activeId,
  onSelect,
}: {
  state: MissionServerState;
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <nav aria-label={t('serverRoomsLabel', { defaultValue: 'Rooms' })}>
      <p className="eyebrow px-3 pb-2">{t('serverRoomsLabel', { defaultValue: 'Rooms' })}</p>
      <ul className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {state.server.channels.map((ch: ServerChannel) => {
          const label = t(CHANNEL_KEYS[ch.slug] ?? ch.name, { defaultValue: ch.name });
          const active = ch.id === activeId;
          const last = lastMessageForChannel(state, ch.id);
          const preview =
            last?.kind === 'nudge'
              ? t('serverNudgeLine', { defaultValue: 'Nudge' })
              : last?.body;
          return (
            <li key={ch.id}>
              <button
                type="button"
                onClick={() => onSelect(ch.id)}
                className={cn(
                  'flex min-h-[44px] w-full flex-col items-start justify-center px-3 py-2 text-start',
                  active && 'is-active-row'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span className="text-sm font-semibold">{label}</span>
                {preview ? (
                  <span className="max-w-full truncate text-xs text-muted-foreground">{preview}</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 border-t-2 border-border px-3 pt-3">
        <p className="text-sm font-semibold">{t('serverMemberSelf', { defaultValue: 'You' })}</p>
        <p className="pt-1 text-xs text-muted-foreground">
          {t(PRESENCE_KEYS[state.presence], { defaultValue: state.presence })}
        </p>
      </div>
    </nav>
  );
}
