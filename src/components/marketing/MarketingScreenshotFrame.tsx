'use client';

import { useTranslation } from 'react-i18next';

export type MarketingScreenshotVariant = 'today' | 'train' | 'fuel';

type Props = {
  variant: MarketingScreenshotVariant;
  titleKey: string;
  descKey: string;
  assetPath: string;
};

const VARIANT_HEADER: Record<MarketingScreenshotVariant, string> = {
  today: 'landingMockupToday',
  train: 'landingScreenTrainHeader',
  fuel: 'landingScreenFuelHeader',
};

/** Phone-frame marketing preview — CSS UI with linked static SVG asset. */
export function MarketingScreenshotFrame({ variant, titleKey, descKey, assetPath }: Props) {
  const { t } = useTranslation();

  return (
    <figure className="flex flex-col gap-3">
      <div className="relative mx-auto w-full max-w-[220px]">
        <div
          className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-emerald-500/15 to-teal-500/5 blur-xl pointer-events-none"
          aria-hidden
        />
        <div className="relative rounded-[1.75rem] border border-border/80 bg-card shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-muted/30 text-[10px]">
            <span className="font-semibold text-emerald-400">{t(VARIANT_HEADER[variant])}</span>
            <span className="text-muted-foreground">MW</span>
          </div>
          <div className="p-3 space-y-2 min-h-[280px] bg-gradient-to-b from-background to-muted/20">
            {variant === 'today' && (
              <>
                <div className="grid grid-cols-3 gap-1.5">
                  {['82', '45', '78'].map((n, i) => (
                    <div key={i} className="rounded-lg border border-border/50 p-2 text-center">
                      <div className="text-[9px] text-muted-foreground mb-1">
                        {i === 0 ? 'Ready' : i === 1 ? 'Strain' : 'Recov'}
                      </div>
                      <div className="text-sm font-bold text-emerald-400 tabular-nums">{n}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-2">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-muted-foreground">{t('landingMockupMissionScore')}</span>
                    <span className="font-bold text-emerald-400">78</span>
                  </div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[78%] bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full" />
                  </div>
                </div>
                <div className="rounded-lg bg-emerald-600/90 text-center py-2 text-[11px] font-semibold text-white">
                  {t('landingMockupPrimaryCta')}
                </div>
              </>
            )}
            {variant === 'train' && (
              <>
                <div className="text-[11px] font-semibold">Squat · 5×5</div>
                {[1, 2, 3].map((set) => (
                  <div
                    key={set}
                    className="flex items-center justify-between rounded-lg border border-border/50 px-2 py-1.5 text-[10px]"
                  >
                    <span className="text-muted-foreground">Set {set}</span>
                    <span className="font-medium tabular-nums">100 kg × 5</span>
                    <span className="text-emerald-400">✓</span>
                  </div>
                ))}
                <div className="rounded-lg border border-dashed border-emerald-500/40 py-2 text-center text-[10px] text-emerald-400">
                  + Add set
                </div>
              </>
            )}
            {variant === 'fuel' && (
              <>
                <div className="grid grid-cols-3 gap-1 text-center text-[9px]">
                  {[
                    ['P', '142g'],
                    ['C', '180g'],
                    ['F', '58g'],
                  ].map(([label, val]) => (
                    <div key={label} className="rounded-lg border border-border/50 p-1.5">
                      <div className="text-muted-foreground">{label}</div>
                      <div className="font-bold text-sm">{val}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5 pt-1">
                  {['High-protein bowl', 'Water +2 cups'].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 rounded-lg bg-muted/30 px-2 py-1.5 text-[10px]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="h-1 w-16 mx-auto mb-1.5 rounded-full bg-border/80" aria-hidden />
        </div>
      </div>
      <figcaption className="text-center px-2">
        <div className="font-semibold text-sm">{t(titleKey)}</div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t(descKey)}</p>
        <a
          href={assetPath}
          className="inline-block mt-2 text-[10px] text-emerald-400/80 hover:text-emerald-400 tap-target"
          download
        >
          {t('landingScreenDownloadAsset')}
        </a>
      </figcaption>
    </figure>
  );
}
