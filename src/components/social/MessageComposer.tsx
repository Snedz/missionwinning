'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { MAX_MESSAGE_BODY } from '@/lib/social/types';

export function MessageComposer({
  channelName,
  onSend,
}: {
  channelName: string;
  onSend: (body: string) => void;
}) {
  const { t } = useTranslation();
  const [body, setBody] = useState('');
  const canSend = body.trim().length > 0;

  const submit = () => {
    const next = body.trim();
    if (!next) return;
    onSend(next);
    setBody('');
  };

  return (
    <form
      className="border-t-2 border-border p-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <label className="sr-only" htmlFor="garage-message">
        {t('serverComposerPlaceholder', { channel: channelName, defaultValue: 'Message {{channel}}' })}
      </label>
      <textarea
        id="garage-message"
        value={body}
        maxLength={MAX_MESSAGE_BODY}
        rows={2}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' || e.shiftKey) return;
          const coarse =
            typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
          if (coarse) return;
          e.preventDefault();
          submit();
        }}
        placeholder={t('serverComposerPlaceholder', {
          channel: channelName,
          defaultValue: 'Message {{channel}}',
        })}
        className="min-h-[44px] w-full resize-none rounded-none border-2 border-input bg-card px-3 py-2 text-sm"
      />
      <div className="mt-2 flex justify-end">
        <Button type="submit" disabled={!canSend} className="primary-action min-h-[44px] px-6">
          {t('serverSend', { defaultValue: 'Send' })}
        </Button>
      </div>
    </form>
  );
}
