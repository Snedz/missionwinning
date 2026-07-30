'use client';

/**
 * The behavior strip — twelve questions, each with its receipt one tap away.
 *
 * Everything here is optional. The four core ratings above it still define a
 * "complete" check-in, and the pre-session sheet never shows this at all: an
 * athlete standing at a barbell should not be asked how much coffee they drank.
 *
 * The info button is not decoration. Showing the evidence tier — including the
 * C on late meals, which says outright that the research is unsettled — is the
 * feature. A journal that grades its own questions is one an athlete can trust
 * about the strong ones.
 */

import { useState } from 'react';
import { Info } from 'lucide-react';
import {
  behaviorById,
  MAX_SERVINGS,
  type BehaviorEntry,
  type BehaviorId,
  type EvidenceTier,
} from '@/lib/behaviors';

type Props = {
  value: BehaviorEntry;
  onChange: (next: BehaviorEntry) => void;
};

const TIER_LABEL: Record<EvidenceTier, string> = {
  A: 'Strong evidence',
  B: 'Moderate evidence',
  C: 'Emerging evidence',
};

/** Quarter-hour options, 24h — the resolution self-report can honestly support. */
const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const h = Math.floor(i / 4);
  const m = (i % 4) * 15;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
});

function Receipt({ tier, text }: { tier: EvidenceTier; text: string }) {
  return (
    <div className="mt-2 border-l-2 border-border pl-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {TIER_LABEL[tier]}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

export function BehaviorStrip({ value, onChange }: Props) {
  const [openReceipt, setOpenReceipt] = useState<string | null>(null);
  const set = (patch: Partial<BehaviorEntry>) => onChange({ ...value, ...patch });

  const row = (id: string, label: string, tier: EvidenceTier, receipt: string, control: React.ReactNode) => (
    <div key={id} className="border-b border-border py-2 last:border-b-0">
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 text-sm">{label}</span>
        {control}
        <button
          type="button"
          onClick={() => setOpenReceipt(openReceipt === id ? null : id)}
          aria-label={`Why we track ${label}`}
          aria-expanded={openReceipt === id}
          className="flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground"
        >
          <Info className="h-4 w-4" aria-hidden />
        </button>
      </div>
      {openReceipt === id ? <Receipt tier={tier} text={receipt} /> : null}
    </div>
  );

  const toggle = (on: boolean | undefined, onPick: (v: boolean) => void, label: string) => (
    <div className="flex shrink-0 gap-1" role="group" aria-label={label}>
      {[
        ['No', false],
        ['Yes', true],
      ].map(([text, v]) => (
        <button
          key={String(v)}
          type="button"
          aria-pressed={on === v}
          onClick={() => onPick(v as boolean)}
          className={
            on === v
              ? 'min-h-[44px] border-2 border-transparent bg-primary-fill px-3 text-xs font-semibold text-primary-foreground'
              : 'min-h-[44px] border-2 border-border px-3 text-xs font-semibold text-muted-foreground'
          }
        >
          {text}
        </button>
      ))}
    </div>
  );

  const stepper = (n: number | undefined, onPick: (v: number) => void, label: string) => (
    <div className="flex shrink-0 items-center gap-1" role="group" aria-label={label}>
      <button
        type="button"
        aria-label={`Fewer ${label}`}
        onClick={() => onPick(Math.max(0, (n ?? 0) - 1))}
        className="min-h-[44px] w-11 border-2 border-border text-sm font-semibold"
      >
        −
      </button>
      <span className="min-w-[2.5rem] text-center text-sm font-semibold tabular-nums">
        {n ?? '—'}
      </span>
      <button
        type="button"
        aria-label={`More ${label}`}
        onClick={() => onPick(Math.min(MAX_SERVINGS, (n ?? 0) + 1))}
        className="min-h-[44px] w-11 border-2 border-border text-sm font-semibold"
      >
        +
      </button>
    </div>
  );

  const timeSelect = (v: string | undefined, onPick: (s: string) => void, label: string) => (
    <select
      aria-label={label}
      value={v ?? ''}
      onChange={(e) => onPick(e.target.value)}
      className="min-h-[44px] shrink-0 border-2 border-border bg-background px-2 text-sm tabular-nums"
    >
      <option value="">—</option>
      {TIME_OPTIONS.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );

  // Non-null sugar over the shared lookup, not a second one: every id below is
  // a literal from `BehaviorId`, so a miss is a compile-time impossibility.
  // This file used to run its own `BEHAVIORS.find` — the `.178` two-definitions
  // shape, and the reason `behaviorById` had no callers.
  const def = (id: BehaviorId) => behaviorById(id)!;

  return (
    <section aria-label="Behavior journal" className="border-2 border-border px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Behaviors — all optional
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
        Stays on this device. Tap the info icon on any row to see what the research actually says.
      </p>
      <div className="mt-2">
        {row(
          'bedTime',
          def('bedTime').labelDefault,
          def('bedTime').tier,
          def('bedTime').receiptDefault,
          timeSelect(value.bedTime, (s) => set({ bedTime: s || undefined }), 'In bed around')
        )}
        {row(
          'wakeTime',
          def('wakeTime').labelDefault,
          def('wakeTime').tier,
          def('wakeTime').receiptDefault,
          timeSelect(value.wakeTime, (s) => set({ wakeTime: s || undefined }), 'Up around')
        )}
        {row(
          'caffeine',
          def('caffeine').labelDefault,
          def('caffeine').tier,
          def('caffeine').receiptDefault,
          stepper(value.caffeineServings, (n) => set({ caffeineServings: n }), 'caffeine servings')
        )}
        {value.caffeineServings ? (
          <div className="border-b border-border py-2 ps-4">
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 text-sm text-muted-foreground">Last serving</span>
              {timeSelect(
                value.caffeineLastAt,
                (s) => set({ caffeineLastAt: s || undefined }),
                'Last caffeine serving'
              )}
            </div>
          </div>
        ) : null}
        {row(
          'alcohol',
          def('alcohol').labelDefault,
          def('alcohol').tier,
          def('alcohol').receiptDefault,
          stepper(value.alcoholServings, (n) => set({ alcoholServings: n }), 'alcoholic drinks')
        )}
        {(
          [
            ['proteinHit', 'proteinHit'],
            ['creatine', 'creatine'],
            ['hydration', 'hydration'],
            ['screenInBed', 'screenInBed'],
            ['lateMeal', 'lateMeal'],
            ['restDay', 'restDay'],
          ] as const
        ).map(([id, key]) =>
          row(
            id,
            def(id).labelDefault,
            def(id).tier,
            def(id).receiptDefault,
            toggle(value[key], (v) => set({ [key]: v } as Partial<BehaviorEntry>), def(id).labelDefault)
          )
        )}
      </div>
    </section>
  );
}
