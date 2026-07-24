'use client';

import { useTranslation } from 'react-i18next';
import type { WinScoreBreakdown } from '@/lib/score';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { isFreeBeta } from '@/lib/freeBeta';

const PILLAR_META: {
  key: keyof WinScoreBreakdown['pillars'];
  labelKey: string;
  href: string;
  max: number;
}[] = [
  { key: 'train', labelKey: 'todayPillarTrain', href: '/active', max: 40 },
  { key: 'fuel', labelKey: 'todayPillarFuel', href: '/nutrition', max: 15 },
  { key: 'move', labelKey: 'todayPillarMove', href: '/move', max: 12 },
  { key: 'mind', labelKey: 'todayPillarMind', href: '/mind', max: 12 },
  { key: 'track', labelKey: 'todayPillarTrack', href: '/track', max: 11 },
  { key: 'learn', labelKey: 'todayPillarLearn', href: '/learn', max: 10 },
];

export function PillarScoreBreakdown({ breakdown }: { breakdown: WinScoreBreakdown }) {
  const { t } = useTranslation();
  const freeBeta = isFreeBeta();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="cursor-help text-start underline decoration-dotted underline-offset-2 hover:text-foreground"
            >
              {t('todayPillarScoreByPillar', { defaultValue: 'How your week adds up' })}
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs normal-case tracking-normal">
            {t('todayMissionScoreTip', {
              defaultValue:
                'Training counts most. Fuel, move, mind, track, and learn add smaller pieces when you log them.',
            })}
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {PILLAR_META.map(({ key, labelKey, href, max }) => {
          const val = breakdown.pillars[key];
          const pct = Math.min(100, Math.round((val / max) * 100));
          return (
            <a
              key={key}
              href={href}
              className="block p-3 rounded-xl border border-border/50 bg-card/40 hover:border-border transition-colors"
            >
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{t(labelKey, { defaultValue: key })}</span>
                <span className="text-muted-foreground">{val}/{max}</span>
              </div>
              <div className="h-1.5 bg-muted rounded overflow-hidden">
                <div className="h-full bg-primary rounded" style={{ width: `${pct}%` }} />
              </div>
            </a>
          );
        })}
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {t('todayPillarScoreFoot', {
          defaultValue: freeBeta
            ? 'Training carries most of the score. Other tools add a little when you use them — nothing is paywalled in open beta.'
            : 'Training carries most of the score. Other tools add a little when you use them. Logger stays free forever.',
        })}
      </p>
    </div>
  );
}
