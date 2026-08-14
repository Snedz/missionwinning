'use client';

import { useTranslation } from 'react-i18next';
import type { GarageMessage } from '@/lib/social/types';

function formatClock(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function MessageList({ messages }: { messages: readonly GarageMessage[] }) {
  const { t } = useTranslation();
  if (messages.length === 0) {
    return (
      <p className="px-4 py-8 text-sm text-muted-foreground">
        {t('serverEmpty', { defaultValue: 'No messages yet. They stay on this device.' })}
      </p>
    );
  }
  return (
    <ul className="space-y-3 px-4 py-4">
      {messages.map((m) => (
        <li key={m.id} className="border-t-2 border-border pt-3 first:border-t-0 first:pt-0">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-extrabold">{m.authorCallSign}</span>
            <time className="text-xs tabular-nums text-muted-foreground" dateTime={m.createdAt}>
              {formatClock(m.createdAt)}
            </time>
          </div>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm">{m.body}</p>
        </li>
      ))}
    </ul>
  );
}
