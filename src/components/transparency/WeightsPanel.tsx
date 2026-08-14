'use client';

import { useTranslation } from 'react-i18next';
import type { WeightRow } from '@/lib/transparency/types';

type Props = {
  boosts: WeightRow[];
  clubPlannedBoosts: WeightRow[];
  penalties: WeightRow[];
  liveSource: string;
  clubSource: string;
};

function WeightList({
  heading,
  headingClass,
  rows,
  valueClass,
}: {
  heading: string;
  headingClass: string;
  rows: WeightRow[];
  valueClass: string;
}) {
  return (
    <section>
      <h3 className={headingClass}>{heading}</h3>
      <ul className="divide-y divide-neutral-700">
        {rows.map((row) => (
          <li key={row.id} className="flex items-baseline justify-between gap-4 py-2.5">
            <span className="text-sm text-neutral-100">{row.label}</span>
            <span className={`shrink-0 text-sm font-semibold tabular-nums ${valueClass}`}>
              {row.display}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Dark tabular BOOSTS / PENALTIES — ink panel tokens, no second chrome. */
export function WeightsPanel({
  boosts,
  clubPlannedBoosts,
  penalties,
  liveSource,
  clubSource,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="border-2 border-neutral-900 bg-neutral-900 px-4 py-5 text-neutral-100">
      <p className="text-xs uppercase tracking-wide text-neutral-400">
        {t('hoodKicker')}
      </p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-100">
        {t('hoodTitle')}
      </h2>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <WeightList
            heading={t('hoodBoosts')}
            headingClass="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-100"
            rows={boosts}
            valueClass="text-neutral-100"
          />
          <WeightList
            heading={t('hoodBoostsPlanned')}
            headingClass="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400"
            rows={clubPlannedBoosts}
            valueClass="text-neutral-400"
          />
        </div>
        <WeightList
          heading={t('hoodPenalties')}
          headingClass="mb-2 text-xs font-semibold uppercase tracking-wide text-accent-400"
          rows={penalties}
          valueClass="text-accent-400"
        />
      </div>

      <p className="mt-6 border-t border-neutral-700 pt-3 text-xs text-neutral-400">
        {liveSource}
      </p>
      <p className="mt-1 text-xs text-neutral-500">{clubSource}</p>
    </div>
  );
}
