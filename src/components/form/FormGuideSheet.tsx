'use client';

import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { FormGuide } from '@/types/formGuide';
import { cn } from '@/lib/utils';

interface FormGuideSheetProps {
  exerciseName: string;
  guide: FormGuide;
  open: boolean;
  onClose: () => void;
}

export function FormGuideSheet({ exerciseName, guide, open, onClose }: FormGuideSheetProps) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close form guide"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full sm:max-w-md max-h-[85vh] overflow-y-auto',
          'rounded-t-2xl sm:rounded-2xl border border-border/60',
          'bg-card shadow-2xl animate-in slide-in-from-bottom duration-200',
          guide.militaryStyle && 'border-amber-700/40'
        )}
        role="dialog"
        aria-labelledby="form-guide-title"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-border/40 bg-card/95 backdrop-blur px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{t('formGuideTitle', { defaultValue: 'Form guide' })}</p>
            <h2 id="form-guide-title" className="text-lg font-semibold">{exerciseName}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-[17px] leading-relaxed">
          {guide.readyPosition && (
            <section>
              <h3 className={cn(
                'text-sm font-semibold uppercase tracking-wide mb-2',
                guide.militaryStyle ? 'text-amber-500/90' : 'text-emerald-400'
              )}>
                {guide.militaryStyle ? 'Ready position' : guide.readyPosition}
              </h3>
              {!guide.militaryStyle && (
                <p className="text-muted-foreground text-base">{guide.readyPosition}</p>
              )}
            </section>
          )}

          <GuideSection title={t('setup', { defaultValue: 'Setup' })} items={guide.setup} />
          <GuideSection title={t('execute', { defaultValue: 'Execute' })} items={guide.execute} />
          {guide.commonErrors && guide.commonErrors.length > 0 && (
            <GuideSection title={t('avoid', { defaultValue: 'Avoid' })} items={guide.commonErrors} variant="error" />
          )}
          {guide.breathing && (
            <section className="rounded-xl bg-muted/40 px-4 py-3">
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">{t('breath', { defaultValue: 'Breath' })}</h3>
              <p>{guide.breathing}</p>
            </section>
          )}
        </div>

        <div className="sticky bottom-0 border-t border-border/40 bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[17px] transition-colors"
          >
          {t('gotItStartSet', { defaultValue: 'Got it — start set' })}
          </button>
        </div>
      </div>
    </div>
  );
}

function GuideSection({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant?: 'error';
}) {
  return (
    <section>
      <h3 className={cn(
        'text-sm font-semibold uppercase tracking-wide mb-2',
        variant === 'error' ? 'text-red-400/90' : 'text-foreground'
      )}>
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-base">
            <span className="text-emerald-500 shrink-0">{variant === 'error' ? '✗' : '·'}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
