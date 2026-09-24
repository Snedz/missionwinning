'use client';

/**
 * Optional one-line note on the Victory receipt (`.1114`).
 * Local. Empty is valid. Never required to leave the receipt.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { normalizeVictoryDiaryLine, VICTORY_DIARY_MAX } from '@/lib/workout/victoryDiaryLine';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function VictoryDiaryLine({ value, onChange }: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(value);
  }, [focused, value]);

  return (
    <label className="block space-y-1" data-testid="victory-diary">
      <span className="house-lede">
        {t('victoryDiaryLabel', { defaultValue: 'Note' })}
      </span>
      <input
        type="text"
        value={draft}
        maxLength={VICTORY_DIARY_MAX}
        required={false}
        aria-required={false}
        data-testid="victory-diary-line"
        placeholder={t('victoryDiaryPlaceholder', {
          defaultValue: 'One line. Optional.',
        })}
        className="house-field min-h-[44px] w-full tap-target"
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          const next = normalizeVictoryDiaryLine(draft);
          setDraft(next);
          if (next !== value) onChange(next);
        }}
        onChange={(e) => {
          const raw = e.target.value.replace(/[\r\n]+/g, ' ').slice(0, VICTORY_DIARY_MAX);
          setDraft(raw);
        }}
      />
    </label>
  );
}
