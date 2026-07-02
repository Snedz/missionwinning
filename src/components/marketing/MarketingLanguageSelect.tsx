'use client';

import { TIER1_LANGS } from '@/i18n/coreLocales';
import { TIER2_LANGS } from '@/i18n/tier2Locales';
import { MEA_LANGS } from '@/i18n/meaLocales';
import i18n from '@/i18n';

const LANG_OPTIONS = [...TIER1_LANGS, ...TIER2_LANGS, ...MEA_LANGS];

export function MarketingLanguageSelect({ className }: { className?: string }) {
  return (
    <select
      className={
        className ??
        'tap-target rounded-lg border border-border/60 bg-background/80 px-2 py-2 text-xs text-foreground'
      }
      value={i18n.language.split('-')[0]}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      aria-label={i18n.t('changeLanguage', { defaultValue: 'Change language' })}
    >
      {LANG_OPTIONS.map((code) => (
        <option key={code} value={code}>
          {code.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
