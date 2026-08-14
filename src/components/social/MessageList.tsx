'use client';

import { useTranslation } from 'react-i18next';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import type { GarageMessage } from '@/lib/social/types';

export function MessageList({ messages }: { messages: readonly GarageMessage[] }) {
  const { t } = useTranslation();
  const fmt = useLocaleFormat();
  if (messages.length === 0) {
    return (
      <p className="px-4 py-8 text-sm text-muted-foreground">
        {t('serverEmpty', { defaultValue: 'No messages yet. They stay on this device.' })}
      </p>
    );
  }
  return (
    <ul className="space-y-3 px-4 py-4">
      {messages.map((m) => {
        const body =
          m.kind === 'nudge' ? t('serverNudgeLine', { defaultValue: 'Nudge' }) : m.body;
        const mission = m.authorMissionId?.trim();
        return (
          <li key={m.id} className="border-t-2 border-border pt-3 first:border-t-0 first:pt-0">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-extrabold">
                {m.authorCallSign}
                {mission ? (
                  <span className="ms-2 font-semibold tabular-nums text-muted-foreground">{mission}</span>
                ) : null}
              </span>
              <time className="text-xs tabular-nums text-muted-foreground" dateTime={m.createdAt}>
                {fmt.time(m.createdAt, { hour: 'numeric', minute: '2-digit' })}
              </time>
            </div>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm">{body}</p>
          </li>
        );
      })}
    </ul>
  );
}
