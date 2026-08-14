'use client';

import { useTranslation } from 'react-i18next';
import { MessageComposer } from '@/components/social/MessageComposer';
import { MessageList } from '@/components/social/MessageList';
import type { GarageMessage } from '@/lib/social/types';

export function ChatWindow({
  roomName,
  messages,
  onSend,
  onNudge,
}: {
  roomName: string;
  messages: readonly GarageMessage[];
  onSend: (body: string) => void;
  onNudge: () => void;
}) {
  const { t } = useTranslation();
  return (
    <section className="flex min-h-[40vh] flex-col" aria-label={t('serverWindowLabel', { defaultValue: 'Chat' })}>
      <header className="flex min-h-[44px] items-center justify-between gap-3 border-b-2 border-neutral-900 bg-neutral-900 px-3 text-neutral-100">
        <h2 className="text-sm font-extrabold tracking-wide">{roomName}</h2>
        <button
          type="button"
          onClick={onNudge}
          className="min-h-[44px] px-2 text-xs font-semibold text-neutral-100 underline-offset-2 hover:underline"
        >
          {t('serverNudge', { defaultValue: 'Nudge' })}
        </button>
      </header>
      <div className="flex-1 overflow-y-auto bg-background">
        <MessageList messages={messages} />
      </div>
      <MessageComposer channelName={roomName} onSend={onSend} />
    </section>
  );
}
