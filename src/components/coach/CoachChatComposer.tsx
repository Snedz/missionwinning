'use client';

/**
 * Premium coach chat input + send/stop (.448).
 */

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

type Props = {
  input: string;
  sending: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
};

export function CoachChatComposer({
  input,
  sending,
  onInputChange,
  onSend,
  onStop,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2">
      <label className="sr-only" htmlFor="coach-chat-input">
        {t('coachChatTitle', { defaultValue: 'Ask your coach' })}
      </label>
      <input
        id="coach-chat-input"
        type="text"
        className="flex-1 min-h-[44px] rounded-none border border-border bg-background px-3 text-sm"
        value={input}
        disabled={sending}
        placeholder={t('coachChatPlaceholder', {
          defaultValue: 'Ask about today’s session, form, or recovery…',
        })}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSend();
        }}
      />
      {sending ? (
        <Button
          type="button"
          variant="outline"
          className="min-h-[44px] min-w-[44px]"
          onClick={onStop}
        >
          {t('coachChatStop', { defaultValue: 'Stop' })}
        </Button>
      ) : (
        <Button
          type="button"
          variant="default"
          className="min-h-[44px] min-w-[44px]"
          disabled={!input.trim()}
          onClick={onSend}
        >
          {t('coachChatSend', { defaultValue: 'Send' })}
        </Button>
      )}
    </div>
  );
}
